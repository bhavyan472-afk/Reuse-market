import { CalendarDays, ExternalLink, Eye, Heart, MapPin, Navigation, ShieldCheck, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactSeller } from "@/components/listings/contact-seller";
import { DistanceLabel } from "@/components/listings/distance-label";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ImageGallery } from "@/components/listings/image-gallery";
import { ListingGrid, ListingGridSkeleton } from "@/components/listings/listing-grid";
import { OwnerActions } from "@/components/listings/owner-actions";
import { ReportDialog } from "@/components/listings/report-dialog";
import { ViewTracker } from "@/components/listings/view-tracker";
import { ListingLocationMap } from "@/components/maps/listing-location-map";
import { UserAvatar } from "@/components/shared/user-avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabel, conditionLabel, CONDITIONS, SITE_NAME } from "@/lib/constants";
import { formatDate, formatPrice, timeAgo } from "@/lib/format";
import { directionsUrl } from "@/lib/geo";
import { getOrigin } from "@/lib/origin";
import { getListing, getSimilarListings } from "@/lib/queries";
import { getUser } from "@/lib/supabase/server";
import type { ListingCategory } from "@/lib/supabase/database.types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id).catch(() => null);
  if (!listing) notFound();
  const description = `${formatPrice(listing.price)} · ${conditionLabel(listing.condition)} · ${listing.city}. ${listing.description.slice(0, 140)}`;
  const cover = listing.images[0]?.url;
  return {
    title: `${listing.title} — ${formatPrice(listing.price)}`,
    description,
    alternates: { canonical: `/listings/${listing.id}` },
    openGraph: {
      type: "website",
      title: `${listing.title} — ${formatPrice(listing.price)}`,
      description,
      siteName: SITE_NAME,
      images: cover ? [{ url: cover, width: 1200, height: 900, alt: listing.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title: listing.title, description, images: cover ? [cover] : undefined },
  };
}

async function SimilarItems({ id, category }: { id: string; category: ListingCategory }) {
  const items = await getSimilarListings(id, category, 4).catch(() => []);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="similar" className="mt-24 space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">You may also like</p>
          <h2 id="similar" className="mt-2 font-serif text-3xl">
            More in {categoryLabel(category)}
          </h2>
        </div>
        <Button asChild variant="outline">
          <Link href={`/marketplace?category=${category}`}>See all</Link>
        </Button>
      </div>
      <ListingGrid listings={items} />
    </section>
  );
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const [listing, user, origin] = await Promise.all([getListing(id), getUser(), getOrigin()]);
  if (!listing) notFound();

  const isOwner = user?.id === listing.seller_id;
  const sold = listing.status === "sold";
  const condition = CONDITIONS.find((c) => c.value === listing.condition);
  const shareUrl = `${origin}/listings/${listing.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images.map((i) => i.url),
    category: categoryLabel(listing.category),
    itemCondition: listing.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "INR",
      availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: shareUrl,
    },
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ViewTracker listingId={listing.id} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/marketplace" className="hover:text-foreground">Marketplace</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/marketplace?category=${listing.category}`} className="hover:text-foreground">{categoryLabel(listing.category)}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="line-clamp-1 max-w-[50vw] text-foreground">{listing.title}</li>
        </ol>
      </nav>

      {listing.is_hidden && isOwner && (
        <div role="alert" className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          This listing is hidden from the marketplace because several members reported it. Edit it to fix any issues.
        </div>
      )}

      {/* DOM order = mobile reading order: photos → price & actions → details. On desktop the aside spans both rows. */}
      <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-x-14">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <ImageGallery images={listing.images} title={listing.title} sold={sold} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="h-6 rounded-[3px] px-2.5 text-muted-foreground"><Tag /> {categoryLabel(listing.category)}</Badge>
              <Badge className="h-6 rounded-[3px] bg-sage-soft px-2.5 text-brand">{condition?.label}</Badge>
              {sold && <Badge className="h-6 rounded-[3px] bg-foreground px-2.5 tracking-[0.2em] text-background uppercase">Sold</Badge>}
            </div>
            <h1 className="mt-5 font-serif text-[2rem] leading-[1.08] text-forest sm:text-[2.5rem]">{listing.title}</h1>
            <p className={`price mt-5 text-[2rem] leading-none sm:text-[2.25rem] ${sold ? "text-muted-foreground line-through decoration-2" : "text-brand"}`}>{formatPrice(listing.price)}</p>
            {condition && <p className="mt-1 text-sm text-muted-foreground">{condition.label}: {condition.hint.toLowerCase()}</p>}

            <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm">
              <div className="space-y-1">
                <dt className="text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">Posted</dt>
                <dd className="flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                  <time dateTime={listing.created_at} suppressHydrationWarning>{timeAgo(listing.created_at)}</time>
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">Distance</dt>
                <dd><DistanceLabel lat={listing.lat} lng={listing.lng} city={listing.city} className="text-sm text-foreground" /></dd>
              </div>
              <div className="space-y-1">
                <dt className="text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">Views</dt>
                <dd className="flex items-center gap-1.5"><Eye className="size-4 text-muted-foreground" aria-hidden /> {listing.views.toLocaleString("en-IN")}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">Saved by</dt>
                <dd className="flex items-center gap-1.5"><Heart className="size-4 text-muted-foreground" aria-hidden /> {listing.favorites_count.toLocaleString("en-IN")}</dd>
              </div>
            </dl>

            <div className="mt-6 space-y-3">
              {isOwner ? (
                <OwnerActions listingId={listing.id} status={listing.status} title={listing.title} redirectAfterDelete="/dashboard" />
              ) : (
                <>
                  <ContactSeller
                    listingId={listing.id}
                    title={listing.title}
                    price={listing.price}
                    sellerId={listing.seller_id}
                    sellerName={listing.seller.full_name || "there"}
                    phone={listing.seller.phone}
                    sold={sold}
                    shareUrl={shareUrl}
                    tertiary={<FavoriteButton listingId={listing.id} variant="quiet" />}
                  />
                </>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="eyebrow">Seller</p>
            <div className="mt-4 flex items-center gap-4">
              <UserAvatar name={listing.seller.full_name} src={listing.seller.avatar_url} className="size-14 text-lg" />
              <div className="min-w-0">
                <p className="truncate font-serif text-xl">{listing.seller.full_name || "ReUse member"}</p>
                <p className="text-xs text-muted-foreground">Member since {formatDate(listing.seller.created_at)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {listing.seller.email_verified && <VerifiedBadge />}
              <span className="inline-flex items-center gap-1 rounded-[3px] bg-muted px-2 py-0.5 text-[0.7rem] font-medium">
                {listing.sellerActiveCount} active {listing.sellerActiveCount === 1 ? "listing" : "listings"}
              </span>
            </div>
            {(listing.seller.college || listing.seller.city) && (
              <p className="mt-3 text-sm text-muted-foreground">{[listing.seller.college, listing.seller.city].filter(Boolean).join(" · ")}</p>
            )}
            <Button asChild variant="outline" className="mt-5 w-full">
              <Link href={`/users/${listing.seller.id}`}>View profile</Link>
            </Button>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-sage-soft/70 p-4 text-xs leading-relaxed text-foreground/75">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <p>Meet in a public place, inspect the item before paying, and never share OTPs or pay in advance to strangers.</p>
          </div>
          <div className="flex justify-center">
            <ReportDialog listingId={listing.id} sellerId={listing.seller_id} />
          </div>
        </aside>

        <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-2">
          <section aria-labelledby="desc" className="space-y-4">
            <h2 id="desc" className="font-serif text-[2rem]">Description</h2>
            <p className="leading-relaxed whitespace-pre-line text-foreground/85">{listing.description}</p>
          </section>

          <section aria-labelledby="where" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="where" className="font-serif text-[2rem]">Where to meet</h2>
                <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {listing.address}
                </p>
              </div>
              <Button asChild variant="outline">
                <a href={directionsUrl(listing.lat, listing.lng)} target="_blank" rel="noopener noreferrer">
                  <Navigation /> Get directions <ExternalLink className="size-3.5 opacity-60" />
                </a>
              </Button>
            </div>
            <ListingLocationMap lat={listing.lat} lng={listing.lng} title={listing.title} />
          </section>
        </div>
      </div>

      <Suspense fallback={<div className="mt-24"><ListingGridSkeleton count={4} /></div>}>
        <SimilarItems id={listing.id} category={listing.category} />
      </Suspense>
    </div>
  );
}
