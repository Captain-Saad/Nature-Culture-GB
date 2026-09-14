import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { ADMIN_TOKEN_COOKIE } from "./lib/admin/constants";

const intlMiddleware = createMiddleware(routing);

function isAdminPath(pathname: string) {
  return /^\/[a-z]{2}\/admin(\/|$)/.test(pathname);
}

function isAdminLoginPath(pathname: string) {
  return /^\/[a-z]{2}\/admin\/login\/?$/.test(pathname);
}

/**
 * Fast, cookie-presence-only check ahead of next-intl's routing -- this
 * is purely so an unauthenticated visitor never sees so much as a flash
 * of a protected page before redirecting (a real edge check, not a
 * client-side effect). It is NOT the actual auth boundary: the *validity*
 * of the token (not just its presence) is verified server-side on every
 * protected page via requireAdminSession() -> GET /admin/me, and the
 * backend's own JWT middleware is the real security enforcement either
 * way. A stale/expired cookie that passes this check still gets rejected
 * there.
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname) && !isAdminLoginPath(pathname)) {
    const hasToken = request.cookies.has(ADMIN_TOKEN_COOKIE);
    if (!hasToken) {
      const locale = pathname.split("/")[1] || routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
