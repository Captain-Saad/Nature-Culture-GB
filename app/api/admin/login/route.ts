import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS } from "@/lib/admin/constants";

/**
 * Backend-for-frontend proxy: the browser never talks to the backend
 * directly for auth. This route calls POST /admin/login server-to-server
 * (no CORS involved) and, on success, sets the JWT as an httpOnly cookie
 * scoped to this app's own origin -- so it's readable server-side here
 * (Server Components, middleware) but never exposed to client-side JS,
 * unlike storing it in localStorage.
 */
export async function POST(request: NextRequest) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "Server misconfigured: NEXT_PUBLIC_API_URL is not set" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${apiBase}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("Admin login proxy failed to reach the backend:", err);
    return NextResponse.json({ error: "Unable to reach the server. Please try again." }, { status: 502 });
  }

  const data = await backendRes.json().catch(() => ({}) as Record<string, unknown>);

  if (!backendRes.ok || typeof data.token !== "string") {
    return NextResponse.json(
      { error: typeof data.error === "string" ? data.error : "Invalid email or password" },
      { status: backendRes.status || 401 }
    );
  }

  // Base the Secure flag on the actual request's protocol, not NODE_ENV:
  // `next build && next start` sets NODE_ENV=production even when served
  // over plain HTTP (e.g. local testing, or a staging box without TLS
  // yet), and a Secure cookie is silently dropped by real browsers over
  // HTTP -- it would look exactly like login "not working" with the
  // browser giving no visible error. x-forwarded-proto covers the normal
  // case of Next.js sitting behind an HTTPS-terminating proxy.
  const isHttps =
    request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";

  const response = NextResponse.json({ ok: true, user: data.user });
  response.cookies.set(ADMIN_TOKEN_COOKIE, data.token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
