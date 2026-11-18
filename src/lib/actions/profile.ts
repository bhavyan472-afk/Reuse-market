"use server";

import { revalidatePath } from "next/cache";
import { STORAGE_BUCKET } from "@/lib/env";
import { normalizePhone, sanitizeText } from "@/lib/sanitize";
import { isOwnedPath, storagePathFromUrl } from "@/lib/storage";
import { createClient, getUser } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { failure, friendlyDbError, fromZodError, success, type ActionResult } from "./result";

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return failure("Please sign in to update your profile.");

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const v = parsed.data;

  const supabase = await createClient();
  const { data: current } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();

  // Avatars must be either unchanged, removed, or a fresh upload into the user's own folder.
  let avatarUrl = v.avatarUrl;
  if (avatarUrl && avatarUrl !== current?.avatar_url) {
    const path = storagePathFromUrl(avatarUrl);
    if (!path || !isOwnedPath(path, user.id)) {
      return failure("The avatar could not be verified. Please upload it again.", { avatarUrl: "Invalid image" });
    }
  }
  if (avatarUrl === "") avatarUrl = null;

  const fullName = sanitizeText(v.fullName);
  if (fullName.length < 2) return failure("Please fix the highlighted fields.", { fullName: "Enter your name" });

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: v.phone ? normalizePhone(v.phone) : null,
      college: sanitizeText(v.college) || null,
      bio: sanitizeText(v.bio, { multiline: true }) || null,
      avatar_url: avatarUrl,
      location_address: v.location ? sanitizeText(v.location.address) : null,
      city: v.location ? sanitizeText(v.location.city) : null,
      lat: v.location?.lat ?? null,
      lng: v.location?.lng ?? null,
    })
    .eq("id", user.id);
  if (error) return failure(friendlyDbError(error, "Could not save your profile. Please try again."));

  // Clean up the previous avatar file if it was ours and has been replaced.
  const oldPath = storagePathFromUrl(current?.avatar_url);
  if (oldPath && current?.avatar_url !== avatarUrl && isOwnedPath(oldPath, user.id)) {
    await supabase.storage.from(STORAGE_BUCKET).remove([oldPath]);
  }

  revalidatePath("/", "layout");
  return success(undefined);
}
