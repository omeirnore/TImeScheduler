export const SESSION_COOKIE_NAME = "ts_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}
