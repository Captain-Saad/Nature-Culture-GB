/**
 * Server-only helper for calling the backend's protected /admin/* API
 * with a bearer token. Every admin page runs this server-side (Server
 * Components / Route Handlers) -- the backend URL and the token never
 * reach the browser.
 */
export async function adminFetch<T>(path: string, token: string): Promise<T | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    console.error("NEXT_PUBLIC_API_URL is not configured.");
    return null;
  }

  try {
    const res = await fetch(`${base}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error(`adminFetch(${path}) failed:`, err);
    return null;
  }
}
