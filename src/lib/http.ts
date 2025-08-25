import { headers } from "next/headers";

/**
 * Descobre a base URL correta (local, Vercel, etc).
 */
export async function getBaseUrl() {
  const h = await headers();

  const proto = h.get("x-forwarded-proto") ?? "http";
  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    "localhost:3000";

  return `${proto}://${host}`;
}
