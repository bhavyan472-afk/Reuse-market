import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ListingGrid } from "@/components/listings/listing-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getSavedListings } from "@/lib/queries";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Saved items", robots: { index: false } };

export default async function SavedPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/saved");
  const listings = await getSavedListings(user.id);

  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Wishlist"
        title="Saved items"
        description={listings.length ? `${listings.length} ${listings.length === 1 ? "item" : "items"} you're keeping an eye on.` : undefined}
      />
      {listings.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Tap the heart on any listing to keep it here for later."
          action={{ label: "Browse the marketplace", href: "/marketplace" }}
        />
      ) : (
        <ListingGrid listings={listings} />
      )}
    </div>
  );
}
