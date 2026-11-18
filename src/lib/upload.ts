"use client";

import imageCompression from "browser-image-compression";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/constants";
import { STORAGE_BUCKET } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `${file.name}: only JPG, PNG or WebP images are allowed.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name} is larger than 5 MB. Please choose a smaller photo.`;
  return null;
}

/** Compress client-side (≤ ~1 MB, ≤ 1600 px, WebP) and upload into the user's own storage folder. */
export async function compressAndUpload(
  file: File,
  userId: string,
  folder: "listings" | "avatars",
  onProgress?: (pct: number) => void,
): Promise<{ path: string; url: string }> {
  const compressed = await imageCompression(file, {
    maxSizeMB: folder === "avatars" ? 0.3 : 1,
    maxWidthOrHeight: folder === "avatars" ? 512 : 1600,
    fileType: "image/webp",
    initialQuality: 0.85,
    useWebWorker: true,
    onProgress,
  });
  if (compressed.size > MAX_IMAGE_BYTES) throw new Error("This image is still larger than 5 MB after compression.");

  const path = `${userId}/${folder}/${crypto.randomUUID()}.webp`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, compressed, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    if (/row-level security|unauthorized|jwt/i.test(error.message)) throw new Error("Your session expired. Please sign in again.");
    if (/bucket not found/i.test(error.message)) throw new Error("Storage bucket missing — run the SQL migration (see README).");
    throw new Error("Upload failed. Check your connection and try again.");
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function removeUploadedFile(path: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}
