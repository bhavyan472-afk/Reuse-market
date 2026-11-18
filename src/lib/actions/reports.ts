"use server";

import { sanitizeText } from "@/lib/sanitize";
import { createClient, getUser } from "@/lib/supabase/server";
import { reportSchema, type ReportInput } from "@/lib/validations";
import { failure, friendlyDbError, fromZodError, success, type ActionResult } from "./result";

export async function reportListing(input: ReportInput): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return failure("Please sign in to report a listing.");

  const parsed = reportSchema.safeParse({ ...input, details: sanitizeText(input.details ?? "", { multiline: true }) });
  if (!parsed.success) return fromZodError(parsed.error);

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", parsed.data.listingId)
    .maybeSingle();
  if (!listing) return failure("Listing not found.");
  if (listing.seller_id === user.id) return failure("You can't report your own listing.");

  const { error } = await supabase.from("reports").insert({
    listing_id: parsed.data.listingId,
    reporter_id: user.id,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
  });
  if (error?.code === "23505") return failure("You've already reported this listing. Our team will review it.");
  if (error) return failure(friendlyDbError(error, "Could not submit the report. Please try again."));
  return success(undefined);
}
