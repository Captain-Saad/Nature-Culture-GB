// Deliberately import-free (no next/headers, no next/navigation) so this
// is safe to import from both Edge Middleware and Server Components/Route
// Handlers without pulling either runtime's APIs into the other.
export const ADMIN_TOKEN_COOKIE = "admin_token";

// Must track the backend's JWT expiry (src/lib/jwt.ts's `expiresIn: "12h"`
// in /backend) -- the cookie shouldn't outlive the token it holds.
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
