import type { CartItem } from "./types";
import { postToApi } from "@/lib/postToApi";

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
  const result = await postToApi<{ id: string }>("/trip-leads", input);
  return result.ok ? { ok: true, id: result.data.id } : result;
}
