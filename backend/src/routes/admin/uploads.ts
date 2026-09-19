import { Router } from "express";
import multer from "multer";
import fsp from "node:fs/promises";
import { z } from "zod";
import {
  uploadMiddleware,
  verifyUploadedFile,
  deleteUploadedFile,
  mediaKindFor,
  UPLOAD_URL_PREFIX,
  IMAGE_MAX_BYTES,
  VIDEO_MAX_BYTES,
  ALLOWED_MIME_TYPES,
} from "../../lib/uploads";

/**
 * Admin media uploads. Mounted under /admin *after* requireAdminAuth (see
 * ./index.ts), so both routes here require a valid admin JWT -- there is no
 * public path to writing or deleting a file on disk.
 */
const router = Router();

const deleteBodySchema = z.object({
  url: z.string().trim().min(1),
});

/** GET /admin/uploads/limits -- lets the admin UI show accurate limits. */
router.get("/limits", (_req, res) => {
  res.json({
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    imageMaxBytes: IMAGE_MAX_BYTES,
    videoMaxBytes: VIDEO_MAX_BYTES,
  });
});

/**
 * POST /admin/uploads -- multipart/form-data, one file under the "file" key.
 * Returns { url, type, size } where url is the relative "/uploads/<name>"
 * path to store in a gallery array.
 */
router.post("/", (req, res) => {
  uploadMiddleware(req, res, async (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({
          error: `File is too large. Images must be ${Math.round(IMAGE_MAX_BYTES / 1048576)}MB or smaller, videos ${Math.round(VIDEO_MAX_BYTES / 1048576)}MB or smaller.`,
        });
        return;
      }
      res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file provided. Send one file under the 'file' field." });
      return;
    }

    const verdict = await verifyUploadedFile(file);
    if (!verdict.ok) {
      // Reject *and* remove: a file that failed validation must not be left
      // on disk where its URL could still be guessed.
      await fsp.unlink(file.path).catch(() => {});
      res.status(400).json({ error: verdict.error ?? "Invalid file" });
      return;
    }

    res.status(201).json({
      url: `${UPLOAD_URL_PREFIX}/${file.filename}`,
      type: mediaKindFor(file.mimetype),
      size: file.size,
    });
  });
});

/**
 * DELETE /admin/uploads -- removes a previously uploaded file from disk.
 * Takes the stored url in the body rather than a path param so the
 * "/uploads/x.jpg" value can be passed through verbatim without encoding.
 */
router.delete("/", async (req, res) => {
  const parsed = deleteBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { url } = parsed.data;
  if (!url.startsWith(`${UPLOAD_URL_PREFIX}/`)) {
    // External URLs aren't ours to delete -- removing it from the gallery
    // array is the caller's whole job in that case.
    res.status(400).json({ error: "Only uploaded files (/uploads/…) can be deleted." });
    return;
  }

  const deleted = await deleteUploadedFile(url);
  if (!deleted) {
    res.status(404).json({ error: "File not found." });
    return;
  }

  res.status(204).send();
});

export default router;
