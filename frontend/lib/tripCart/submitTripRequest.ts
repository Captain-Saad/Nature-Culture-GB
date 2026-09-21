import type { CartItem } from "./types";

export interface TripRequestInput {
  name: string;
  contact: string;
  email?: string;
  preferredDates?: string;
  travelers?: number;
  notes?: string;
  cartItems: CartItem[];
}

export type TripRequestResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * POSTs a checkout submission to the backend. Runs client-side (the
 * checkout page is fully interactive), so this hits NEXT_PUBLIC_API_URL
 * directly rather than going through a server action.
 */
export async function submitTripRequest(input: TripRequestInput): Promise<TripRequestResult> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return { ok: false, error: "The site isn't configured to submit trip requests right now." };
  }

  try {
    const res = await fetch(`${base}/trip-leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { ok: false, error: body?.error ?? `Request failed (HTTP ${res.status}).` };
    }

    const data = (await res.json()) as { id: string };
    return { ok: true, id: data.id };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}
