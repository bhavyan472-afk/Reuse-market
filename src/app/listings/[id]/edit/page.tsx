import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ListingForm } from "@/components/listings/listing-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getListing } from "@/lib/queries";
import { storagePathFromUrl } from "@/lib/storage";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit listing", robots: { index: false } };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect(`/login?next=/listings/${id}/edit`);

  const listing = await getListing(id);
  if (!listing) notFound();

  if (listing.seller_id !== user.id) {
    return (
      <div className="container-page max-w-2xl py-16">
        <EmptyState
          title="You can't edit this listing"
          description="Only the seller who posted it can make changes."
          action={{ label: "Back to the listing", href: `/listings/${id}` }}
        />
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <PageHeader
        eyebrow="Edit listing"
        title={listing.title}
        description={
          <>
            Update photos, price or details. <Link href={`/listings/${id}`} className="text-brand underline-offset-4 hover:underline">View listing</Link>
          </>
        }
      />
      <ListingForm
        userId={user.id}
        mode="edit"
        listingId={listing.id}
        defaultValues={{
          title: listing.title,
          description: listing.description,
          category: listing.category,
          condition: listing.condition,
          price: listing.price,
          images: listing.images.map((i) => ({ url: i.url, path: storagePathFromUrl(i.url) })),
          location: { address: listing.address, city: listing.city, lat: listing.lat, lng: listing.lng },
        }}
      />
    </div>
  );
}
