import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ADMIN_TOKEN_COOKIE } from "./constants";

export interface AdminSessionUser {
  id: string;
  email: string;
  role: string;
}

export async function getAdminToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ADMIN_TOKEN_COOKIE)?.value;
}

/**
 * The real session check for every protected admin page -- verifies the
 * token against the backend's GET /admin/me (not just checking that a
 * cookie is present) and redirects to /{locale}/admin/login if there's no
 * session or the backend rejects it (missing, malformed, expired,
 * tampered). Middleware also redirects on cookie *absence* for a
 * zero-latency common case, but this call is what actually enforces it --
 * the backend's JWT verification remains the real security boundary
 * either way.
 */
export async function requireAdminSession(): Promise<{ token: string; user: AdminSessionUser }> {
  const locale = await getLocale();
  const token = await getAdminToken();
  if (!token) {
    redirect(`/${locale}/admin/login`);
  }

  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const res = await fetch(`${base}/admin/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect(`/${locale}/admin/login`);
  }

  const user = (await res.json()) as AdminSessionUser;
  return { token, user };
}
