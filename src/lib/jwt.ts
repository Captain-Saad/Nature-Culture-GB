import jwt from "jsonwebtoken";

export interface AdminTokenPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Refuses to run with the placeholder value shipped in .env.example --
 * a real secret must be set before the admin API can issue or verify
 * tokens, so an operator can't accidentally deploy with it unchanged.
 */
function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "change-me-to-a-long-random-string") {
    throw new Error(
      "JWT_SECRET is not configured (or is still the .env.example placeholder). " +
        "Set a real random value in .env before using admin auth."
    );
  }
  return secret;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "12h" });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, getSecret()) as AdminTokenPayload;
}
