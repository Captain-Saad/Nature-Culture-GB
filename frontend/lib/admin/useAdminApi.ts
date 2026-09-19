"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";

interface AdminApiResult<T> {
  data: T | null;
  error: string | null;
}

interface ZodFlattenedError {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
}

/**
 * The backend's admin CRUD validation failures come back as
 * { error: "Invalid input", details: <Zod's .flatten()> }. Turns that
 * into one readable line ("region: Invalid option; lat: Expected number")
 * instead of just the generic "Invalid input".
 */
function formatApiError(body: unknown, status: number): string {
  if (!body || typeof body !== "object") return `Request failed (${status})`;

  const { error, details } = body as { error?: string; details?: ZodFlattenedError };
  const fieldErrors = details?.fieldErrors;

  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    const parts = Object.entries(fieldErrors)
      .filter(([, messages]) => messages && messages.length > 0)
      .map(([field, messages]) => `${field}: ${messages![0]}`);
    if (parts.length > 0) return parts.join("; ");
  }

  return error ?? `Request failed (${status})`;
}

/**
 * The client-side counterpart to requireAdminSession() (which covers
 * Server Components): every admin CRUD component calls the backend
 * through this hook, which goes through the /api/admin/[...path] proxy
 * (see that route for why -- the JWT is httpOnly and unreadable from
 * client JS). A 401 from the backend -- expired/invalid session, caught
 * here rather than on next page load -- redirects to /admin/login,
 * mirroring what requireAdminSession() does server-side.
 */
export function useAdminApi() {
  const router = useRouter();

  const request = useCallback(
    async <T,>(path: string, options?: RequestInit): Promise<AdminApiResult<T>> => {
      // FormData must set its own Content-Type so the browser can generate
      // the multipart boundary -- forcing application/json here would make
      // every file upload unparseable on the backend.
      const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;

      let res: Response;
      try {
        res = await fetch(`/api/admin/${path}`, {
          ...options,
          headers: isFormData
            ? { ...(options?.headers ?? {}) }
            : { "Content-Type": "application/json", ...(options?.headers ?? {}) },
        });
      } catch {
        return { data: null, error: "Network error. Please check your connection and try again." };
      }

      if (res.status === 401) {
        router.push("/admin/login");
        return { data: null, error: "Session expired." };
      }

      if (res.status === 204) {
        return { data: null, error: null };
      }

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        return { data: null, error: formatApiError(body, res.status) };
      }

      return { data: body as T, error: null };
    },
    [router]
  );

  return { request };
}
