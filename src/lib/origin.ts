import "server-only";
import { headers } from "next/headers";
import { env } from "@/lib/env";

/** Public origin of the current request (works on Vercel preview URLs too). */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return env.siteUrl;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
