import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { z } from "zod";

/**
 * Local-disk media storage for admin uploads.
 *
 * Files land in backend/uploads/ and are served read-only at /uploads/<name>
 * (see src/app.ts). Rows store the *relative* path ("/uploads/abc.mp4"), never
 * an absolute URL: the same DB then works behind localhost:4100 in dev and a
 * real domain in production, and the frontend prefixes NEXT_PUBLIC_API_URL at
 * render time (see frontend/lib/utils/media.ts). Externally hosted URLs that
 * predate uploads (picsum/unsplash seeds) still validate as absolute URLs, so
 * both kinds coexist in the same gallery array.
 */

export const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
export const UPLOAD_URL_PREFIX = "/uploads";

const MB = 1024 * 1024;

export const IMAGE_MAX_BYTES = 5 * MB;
export const VIDEO_MAX_BYTES = 30 * MB;

interface AllowedType {
  kind: "image" | "video";
  ext: string;
  maxBytes: number;
  /** Leading bytes that must be present for the file to really be this type. */
  magic: (buf: Buffer) => boolean;
}

/**
 * mimetype alone is attacker-controlled (it's just a header in the multipart
 * body), so every accepted file is also checked against its real leading
 * bytes below -- a .mp4 rename of an .exe fails the magic check even though
 * the browser happily labels it video/mp4.
 */
const ALLOWED_TYPES: Record<string, AllowedType> = {
  "image/jpeg": {
    kind: "image",
    ext: ".jpg",
    maxBytes: IMAGE_MAX_BYTES,
    magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  "image/png": {
    kind: "image",
    ext: ".png",
    maxBytes: IMAGE_MAX_BYTES,
    magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  "image/webp": {
    kind: "image",
    ext: ".webp",
    maxBytes: IMAGE_MAX_BYTES,
    magic: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  "video/mp4": {
    kind: "video",
    ext: ".mp4",
    maxBytes: VIDEO_MAX_BYTES,
    // ISO base media format: bytes 4-8 are the "ftyp" box type. The preceding
    // 4 bytes are that box's length, which varies, hence the offset.
    magic: (b) => b.subarray(4, 8).toString("ascii") === "ftyp",
  },
};

export const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_TYPES);

export function mediaKindFor(mimetype: string): "image" | "video" | null {
  return ALLOWED_TYPES[mimetype]?.kind ?? null;
}

/** Ensures backend/uploads/ exists before multer tries to write into it. */
export function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Never reuse the client's filename: it can carry path separators, null
    // bytes, or collide with an existing file.
    const ext = ALLOWED_TYPES[file.mimetype]?.ext ?? "";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  // The ceiling for *any* file. The per-kind limit (5MB images / 30MB video)
  // is enforced after the write, once the real type is known -- multer can't
  // vary fileSize by mimetype on its own.
  limits: { fileSize: VIDEO_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
}).single("file");

interface VerifyResult {
  ok: boolean;
  error?: string;
}

/**
 * Post-write validation: the declared mimetype must match the file's actual
 * leading bytes, and the file must be within its own kind's size limit. The
 * caller deletes the file when this fails.
 */
export async function verifyUploadedFile(file: Express.Multer.File): Promise<VerifyResult> {
  const allowed = ALLOWED_TYPES[file.mimetype];
  if (!allowed) return { ok: false, error: `Unsupported file type: ${file.mimetype}` };

  if (file.size > allowed.maxBytes) {
    const limitMb = Math.round(allowed.maxBytes / MB);
    return { ok: false, error: `${allowed.kind === "video" ? "Videos" : "Images"} must be ${limitMb}MB or smaller.` };
  }

  let handle;
  try {
    handle = await fsp.open(file.path, "r");
    const buf = Buffer.alloc(12);
    await handle.read(buf, 0, 12, 0);
    if (!allowed.magic(buf)) {
      return { ok: false, error: `File contents do not match its declared type (${file.mimetype}).` };
    }
  } catch {
    return { ok: false, error: "Could not read the uploaded file." };
  } finally {
    await handle?.close();
  }

  return { ok: true };
}

/** Best-effort cleanup; a missing file is not an error worth surfacing. */
export async function deleteUploadedFile(storedUrl: string): Promise<boolean> {
  const absolute = resolveStoredUpload(storedUrl);
  if (!absolute) return false;
  try {
    await fsp.unlink(absolute);
    return true;
  } catch {
    return false;
  }
}

/**
 * Maps a stored "/uploads/<name>" value to a path on disk, or null if the
 * value isn't a local upload at all (an external URL) or tries to escape the
 * upload directory via traversal.
 */
export function resolveStoredUpload(storedUrl: string): string | null {
  if (!storedUrl.startsWith(`${UPLOAD_URL_PREFIX}/`)) return null;

  const name = storedUrl.slice(UPLOAD_URL_PREFIX.length + 1);
  if (!name || name.includes("/") || name.includes("\\") || name.includes("\0")) return null;

  const absolute = path.resolve(UPLOAD_DIR, name);
  // Belt-and-braces against traversal: the resolved path must still sit
  // inside UPLOAD_DIR even if the checks above are one day relaxed.
  if (path.dirname(absolute) !== UPLOAD_DIR) return null;

  return absolute;
}

/**
 * A gallery entry: either an externally hosted absolute URL (the existing
 * seed data) or a locally uploaded file. Replaces the bare z.string().url()
 * the admin validators used before uploads existed.
 */
export const mediaUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => {
      if (value.startsWith(`${UPLOAD_URL_PREFIX}/`)) return resolveStoredUpload(value) !== null;
      return z.string().url().safeParse(value).success;
    },
    { message: "Must be an absolute URL or an uploaded file path (/uploads/…)" }
  );
