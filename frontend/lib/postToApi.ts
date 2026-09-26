export type PostResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * POSTs JSON to a public backend endpoint from the browser. Never throws:
 * network failures and non-2xx responses come back as { ok: false } with the
 * most useful message the API gave (a moderation `reason`, then `error`).
 */
export async function postToApi<T = unknown>(path: string, body: unknown): Promise<PostResult<T>> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return { ok: false, error: "The site isn't configured to send forms right now." };
  }

  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 429) {
        return { ok: false, error: "Too many submissions — please wait a few minutes and try again." };
      }
      return { ok: false, error: json?.reason ?? json?.error ?? `Request failed (HTTP ${res.status}).` };
    }
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}
