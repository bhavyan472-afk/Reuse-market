"use server";

import { revalidatePath } from "next/cache";
import { STORAGE_BUCKET } from "@/lib/env";
import { sanitizeText } from "@/lib/sanitize";
import { isOwnedPath, publicImageUrl } from "@/lib/storage";
import { createClient, getUser } from "@/lib/supabase/server";
import type { ListingStatus } from "@/lib/supabase/database.types";
import { listingSchema, uuidSchema, type ListingFormValues, type ListingImageInput } from "@/lib/validations";
import { failure, friendlyDbError, fromZodError, success, type ActionResult } from "./result";

const SIGN_IN = "Please sign in to continue.";

function revalidateListingPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath("/saved");
  if (id) revalidatePath(`/listings/${id}`);
}

function cleanListing(data: ReturnType<typeof listingSchema.parse>) {
  const loc = data.location!;
  return {
    title: sanitizeText(data.title),
    description: sanitizeText(data.description, { multiline: true }),
    category: data.category,
    price: data.price,
    condition: data.condition,
    address: sanitizeText(loc.address),
    city: sanitizeText(loc.city),
    lat: loc.lat,
    lng: loc.lng,
  };
}

function validateCleaned(fields: ReturnType<typeof cleanListing>): Record<string, string> | null {
  const errs: Record<string, string> = {};
  if (fields.title.length < 3) errs.title = "Title must be at least 3 characters";
  if (fields.description.length < 10) errs.description = "Describe the item in at least 10 characters";
  if (fields.address.length < 2) errs.location = "Choose a location";
  if (fields.city.length < 1) errs.location = "City is required";
  return Object.keys(errs).length ? errs : null;
}

export async function createListing(input: ListingFormValues): Promise<ActionResult<{ id: string }>> {
  const user = await getUser();
  if (!user) return failure(SIGN_IN);

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  const fields = cleanListing(parsed.data);
  const fieldErrs = validateCleaned(fields);
  if (fieldErrs) return failure("Please fix the highlighted fields.", fieldErrs);

  // Every image of a new listing must be an upload into the user's own folder.
  const images: { url: string; storage_path: string }[] = [];
  for (const img of parsed.data.images) {
    if (!img.path || !isOwnedPath(img.path, user.id)) {
      return failure("One of the photos could not be verified. Please re-upload it.", { images: "Invalid photo" });
    }
    images.push({ url: publicImageUrl(img.path), storage_path: img.path });
  }

  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({ ...fields, seller_id: user.id })
    .select("id")
    .single();
  if (error || !listing) return failure(friendlyDbError(error, "Could not create the listing. Please try again."));

  const { error: imgError } = await supabase
    .from("listing_images")
    .insert(images.map((img, position) => ({ ...img, listing_id: listing.id, position })));
  if (imgError) {
    await supabase.from("listings").delete().eq("id", listing.id);
    return failure(friendlyDbError(imgError, "Could not save the photos. Please try again."));
  }

  revalidateListingPaths(listing.id);
  return success({ id: listing.id });
}

export async function updateListing(id: string, input: ListingFormValues): Promise<ActionResult<{ id: string }>> {
  const user = await getUser();
  if (!user) return failure(SIGN_IN);
  if (!uuidSchema.safeParse(id).success) return failure("Listing not found.");

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const fields = cleanListing(parsed.data);
  const fieldErrs = validateCleaned(fields);
  if (fieldErrs) return failure("Please fix the highlighted fields.", fieldErrs);

  const supabase = await createClient();
  const { data: listing } = await supabase.from("listings").select("id, seller_id").eq("id", id).maybeSingle();
  if (!listing) return failure("Listing not found.");
  if (listing.seller_id !== user.id) return failure("You can only edit your own listings.");

  const { data: existing, error: exErr } = await supabase
    .from("listing_images")
    .select("url, storage_path, position")
    .eq("listing_id", id)
    .order("position");
  if (exErr) return failure(friendlyDbError(exErr, "Could not load the current photos."));
  const existingByUrl = new Map((existing ?? []).map((r) => [r.url, r]));

  const nextImages: { url: string; storage_path: string | null }[] = [];
  for (const img of parsed.data.images as ListingImageInput[]) {
    const known = existingByUrl.get(img.url);
    if (known) {
      nextImages.push({ url: known.url, storage_path: known.storage_path });
    } else if (img.path && isOwnedPath(img.path, user.id)) {
      nextImages.push({ url: publicImageUrl(img.path), storage_path: img.path });
    } else {
      return failure("One of the photos could not be verified. Please re-upload it.", { images: "Invalid photo" });
    }
  }
  const keptUrls = new Set(nextImages.map((i) => i.url));
  const removed = (existing ?? []).filter((r) => !keptUrls.has(r.url));

  const { error: upErr } = await supabase.from("listings").update(fields).eq("id", id).eq("seller_id", user.id);
  if (upErr) return failure(friendlyDbError(upErr, "Could not save your changes. Please try again."));

  // Replace the image set atomically-enough: delete then re-insert in the new order, restoring on failure.
  const { error: delErr } = await supabase.from("listing_images").delete().eq("listing_id", id);
  if (delErr) return failure(friendlyDbError(delErr, "Could not update the photos."));
  const { error: insErr } = await supabase
    .from("listing_images")
    .insert(nextImages.map((img, position) => ({ ...img, listing_id: id, position })));
  if (insErr) {
    if (existing?.length) {
      await supabase.from("listing_images").insert(existing.map((r) => ({ ...r, listing_id: id })));
    }
    return failure(friendlyDbError(insErr, "Could not update the photos. Please try again."));
  }

  const removedPaths = removed.map((r) => r.storage_path).filter((p): p is string => !!p && isOwnedPath(p, user.id));
  if (removedPaths.length) await supabase.storage.from(STORAGE_BUCKET).remove(removedPaths);

  revalidateListingPaths(id);
  return success({ id });
}

export async function deleteListing(id: string): Promise<ActionResult<{ removedFiles: number }>> {
  const user = await getUser();
  if (!user) return failure(SIGN_IN);
  if (!uuidSchema.safeParse(id).success) return failure("Listing not found.");

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id, listing_images(storage_path)")
    .eq("id", id)
    .maybeSingle();
  if (!listing) return failure("Listing not found.");
  if (listing.seller_id !== user.id) return failure("You can only delete your own listings.");

  const paths = listing.listing_images
    .map((i) => i.storage_path)
    .filter((p): p is string => !!p && isOwnedPath(p, user.id));

  const { data: deleted, error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id");
  if (error || !deleted?.length) return failure(friendlyDbError(error, "Could not delete the listing. Please try again."));

  let removedFiles = 0;
  if (paths.length) {
    const { data: removed } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
    removedFiles = removed?.length ?? 0;
  }

  revalidateListingPaths(id);
  return success({ removedFiles });
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<ActionResult<{ status: ListingStatus }>> {
  const user = await getUser();
  if (!user) return failure(SIGN_IN);
  if (!uuidSchema.safeParse(id).success) return failure("Listing not found.");
  if (status !== "available" && status !== "sold") return failure("Invalid status.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("status")
    .maybeSingle();
  if (error) return failure(friendlyDbError(error, "Could not update the status."));
  if (!data) return failure("You can only update your own listings.");

  revalidateListingPaths(id);
  return success({ status: data.status });
}

/** Remove an uploaded-but-unsaved file (e.g. the user removed it from the form). */
export async function discardUpload(path: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return failure(SIGN_IN);
  if (!isOwnedPath(path, user.id)) return failure("Invalid file.");
  const supabase = await createClient();
  // Never delete a file that is still attached to a listing.
  const { data: inUse } = await supabase.from("listing_images").select("id").eq("storage_path", path).limit(1);
  if (inUse?.length) return success(undefined);
  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  return success(undefined);
}
