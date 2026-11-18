"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validations";
import { failure, friendlyDbError, success, type ActionResult } from "./result";

export async function toggleFavorite(listingId: string): Promise<ActionResult<{ saved: boolean }>> {
  const user = await getUser();
  if (!user) return failure("Please sign in to save items.");
  if (!uuidSchema.safeParse(listingId).success) return failure("Listing not found.");

  const supabase = await createClient();
  const { data: existing, error: readErr } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();
  if (readErr) return failure(friendlyDbError(readErr, "Could not update your wishlist."));

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) return failure(friendlyDbError(error, "Could not update your wishlist."));
    revalidatePath("/saved");
    return success({ saved: false });
  }

  const { error } = await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
  if (error && error.code !== "23505") return failure(friendlyDbError(error, "Could not update your wishlist."));
  revalidatePath("/saved");
  return success({ saved: true });
}
