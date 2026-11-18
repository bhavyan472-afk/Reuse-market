import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listings/listing-form";
import { PageHeader } from "@/components/shared/page-header";
import { getProfile, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sell an item", robots: { index: false } };

export default async function SellPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/sell");
  const profile = await getProfile(user.id);

  const savedLocation =
    profile && profile.lat !== null && profile.lng !== null && profile.location_address && profile.city
      ? { address: profile.location_address, city: profile.city, lat: profile.lat, lng: profile.lng }
      : null;

  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <PageHeader
        eyebrow="New listing"
        title="Give something a second life"
        description="Listing is free. Add a few photos, a fair price and where to meet — buyers will message you directly."
      />
      <ListingForm
        userId={user.id}
        mode="create"
        defaultValues={{ title: "", description: "", price: Number.NaN, images: [], location: savedLocation }}
      />
    </div>
  );
}
