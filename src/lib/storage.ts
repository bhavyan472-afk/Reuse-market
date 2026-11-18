import { env, STORAGE_BUCKET } from "@/lib/env";

const PUBLIC_PREFIX = () => `${env.supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/`;

export function publicImageUrl(path: string): string {
  return `${PUBLIC_PREFIX()}${path.split("/").map(encodeURIComponent).join("/")}`;
}

/** Returns the storage path if `url` is a public URL inside our bucket, else null. */
export function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const prefix = PUBLIC_PREFIX();
  if (!url.startsWith(prefix)) return null;
  return url
    .slice(prefix.length)
    .split("?")[0]
    .split("/")
    .map((s) => decodeURIComponent(s))
    .join("/");
}

/** A storage path is "owned" by a user when it lives in their top-level folder. */
export function isOwnedPath(path: string, userId: string): boolean {
  return path.startsWith(`${userId}/`) && !path.includes("..") && path.length <= 500;
}
