import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin/constants";

/**
 * Generic authenticated proxy for every /admin/* backend call EXCEPT
 * login/logout (those are their own routes, since they're what sets/
 * clears the cookie in the first place). The JWT lives in an httpOnly
 * cookie specifically so client-side JS can never read it -- which means
 * client components can't attach it as a Bearer header themselves. This
 * route is what makes that work: it runs server-side, reads the cookie,
 * and forwards the request to the real backend with the token attached.
 *
 * Next.js resolves the static app/api/admin/login and .../logout routes
 * ahead of this catch-all for those exact paths, so there's no conflict.
 */
async function proxy(request: NextRequest, path: string[]) {
  const store = await cookies();
  const token = store.get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    return NextResponse.json({ error: "Server misconfigured: NEXT_PUBLIC_API_URL is not set" }, { status: 500 });
  }

  const targetUrl = `${apiBase}/admin/${path.join("/")}${request.nextUrl.search}`;

  const init: RequestInit = {
    method: request.method,
    headers: { Authorization: `Bearer ${token}` },
  };

  if (!["GET", "DELETE", "HEAD"].includes(request.method)) {
    const body = await request.text();
    if (body) {
      init.body = body;
      init.headers = { ...init.headers, "Content-Type": "application/json" };
    }
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, init);
  } catch (err) {
    console.error(`Admin API proxy failed to reach ${targetUrl}:`, err);
    return NextResponse.json({ error: "Unable to reach the server. Please try again." }, { status: 502 });
  }

  if (backendRes.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await backendRes.text();
  return new NextResponse(text, {
    status: backendRes.status,
    headers: { "Content-Type": backendRes.headers.get("Content-Type") ?? "application/json" },
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
export async function POST(request: NextRequest, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
