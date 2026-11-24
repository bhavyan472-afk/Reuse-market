import { CalendarDays, ChevronRight, ExternalLink, Eye, Heart, MapPin, Navigation, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SafetyTips } from "@/components/home/safety-tips";
import { ContactSeller } from "@/components/listings/contact-seller";
import { DistanceLabel } from "@/components/listings/distance-label";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ImageGallery } from "@/components/listings/image-gallery";
import { ConditionBadge } from "@/components/listings/listing-card";
import { ListingGrid, ListingGridSkeleton } from "@/components/listings/listing-grid";
import { OwnerActions } from "@/components/listings/owner-actions";
import { ReportDialog } from "@/components/listings/report-dialog";
import { ViewTracker } from "@/components/listings/view-tracker";
import { ListingLocationMap } from "@/components/maps/listing-location-map";
import { UserAvatar } from "@/components/shared/user-avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import { categoryLabel, conditionLabel, CONDITIONS, SITE_NAME } from "@/lib/constants";
import { formatDate, formatPrice, formatRupees, timeAgo } from "@/lib/format";
import { directionsUrl } from "@/lib/geo";
import { getOrigin } from "@/lib/origin";
import { getListing, getSimilarListings, searchListings } from "@/lib/queries";
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

/** Similar items in the same category and price band (±50%), falling back to the same category. */
async function SimilarItems({ id, category, price }: { id: string; category: ListingCategory; price: number }) {
  const band = { min: Math.floor(price * 0.5), max: Math.ceil(price * 1.5) };
  let inBand = true;
  let items = await searchListings(
    { category, excludeId: id, minPrice: band.min, maxPrice: band.max, sort: "price_asc" },
    { limit: 4, offset: 0 },
  )
    .then((r) => r.items)
    .catch(() => []);
  if (items.length === 0) {
    inBand = false;
    items = await getSimilarListings(id, category, 4).catch(() => []);
  }
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="similar" className="mt-12 space-y-5 sm:mt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="similar" className="text-[1.375rem] font-bold sm:text-[1.75rem]">
            More in {categoryLabel(category)}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {inBand ? `In a similar price range: ${formatRupees(band.min)} – ${formatRupees(band.max)}` : "Other listings you might like"}
          </p>
        </div>
        <Link
          href={`/marketplace?category=${category}${inBand ? `&min=${band.min}&max=${band.max}` : ""}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          See all <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
      <ListingGrid listings={items} />
    </section>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1.5 text-sm font-medium">{children}</dd>
    </div>
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
  const saving =
    listing.original_price && listing.original_price > listing.price ? listing.original_price - listing.price : null;

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
    <div className="container-page py-5 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ViewTracker listingId={listing.id} />

      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/marketplace" className="rounded-sm hover:text-primary">
              Marketplace
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link href={`/marketplace?category=${listing.category}`} className="rounded-sm hover:text-primary">
              {categoryLabel(listing.category)}
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="line-clamp-1 max-w-[50vw] font-medium text-foreground">
            {listing.title}
          </li>
        </ol>
      </nav>

      {listing.is_hidden && isOwner && (
        <div role="alert" className="mb-5 rounded-card border border-destructive/30 bg-destructive/5 p-4 text-sm">
          This listing is hidden from the marketplace because several members reported it. Edit it to fix any issues.
        </div>
      )}

      {/* DOM order = mobile reading order: photos → price & actions → seller → details. */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-x-10">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <ImageGallery images={listing.images} title={listing.title} sold={sold} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="rounded-card border border-border bg-card p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <ConditionBadge condition={listing.condition} className="shadow-none" />
              <span className="inline-flex h-6 items-center gap-1 rounded-full bg-muted px-2.5 text-[0.7rem] font-semibold text-muted-foreground">
                <Tag className="size-3" aria-hidden /> {categoryLabel(listing.category)}
              </span>
              {sold && (
                <span className="inline-flex h-6 items-center rounded-full bg-foreground px-2.5 text-[0.7rem] font-bold text-background">
                  Sold
                </span>
              )}
            </div>
            <h1 className="mt-3 text-[1.375rem] leading-snug font-bold sm:text-[1.6rem]">{listing.title}</h1>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className={`price text-[2rem] leading-none sm:text-[2.25rem] ${sold ? "text-muted-foreground line-through decoration-2" : ""}`}>
                {formatPrice(listing.price)}
              </p>
              {saving && !sold && (
                <p className="rounded-full bg-green-tint px-2.5 py-1 text-xs font-bold text-primary">
                  Save {formatRupees(saving)} vs new
                </p>
              )}
            </div>
            {condition && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{condition.label}:</span> {condition.hint.toLowerCase()}
              </p>
            )}

            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-muted/60 p-3.5">
              <Meta label="Posted">
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                <time dateTime={listing.created_at} suppressHydrationWarning>
                  {timeAgo(listing.created_at)}
                </time>
              </Meta>
              <Meta label="Location">
                <DistanceLabel lat={listing.lat} lng={listing.lng} city={listing.city} className="text-sm font-medium text-foreground" />
              </Meta>
              <Meta label="Views">
                <Eye className="size-4 text-muted-foreground" aria-hidden /> {listing.views.toLocaleString("en-IN")}
              </Meta>
              <Meta label="Saved by">
                <Heart className="size-4 text-muted-foreground" aria-hidden /> {listing.favorites_count.toLocaleString("en-IN")}
              </Meta>
            </dl>

            <div className="mt-5">
              {isOwner ? (
                <OwnerActions listingId={listing.id} status={listing.status} title={listing.title} redirectAfterDelete="/dashboard" />
              ) : (
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
              )}
            </div>
          </div>

          {/* Seller card */}
          <div className="rounded-card border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3.5">
              <UserAvatar name={listing.seller.full_name} src={listing.seller.avatar_url} className="size-14 text-lg" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Sold by</p>
                <p className="truncate text-base font-bold">{listing.seller.full_name || "ReUse member"}</p>
                <p className="text-xs text-muted-foreground">Member since {formatDate(listing.seller.created_at)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.seller.email_verified && <VerifiedBadge label="Verified seller" />}
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[0.72rem] font-semibold">
                {listing.sellerActiveCount} active {listing.sellerActiveCount === 1 ? "listing" : "listings"}
              </span>
            </div>
            {(listing.seller.college || listing.seller.city) && (
              <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {[listing.seller.college, listing.seller.city].filter(Boolean).join(" · ")}
              </p>
            )}
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href={`/users/${listing.seller.id}`}>View profile</Link>
            </Button>
          </div>

          <SafetyTips compact />
          <div className="flex justify-center">
            <ReportDialog listingId={listing.id} sellerId={listing.seller_id} />
          </div>
        </aside>

        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-2">
          <section aria-labelledby="desc" className="rounded-card border border-border bg-card p-5 shadow-soft sm:p-6">
            <h2 id="desc" className="text-lg font-bold">
              Description
            </h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-foreground/85">{listing.description}</p>
          </section>

          <section aria-labelledby="where" className="space-y-3 rounded-card border border-border bg-card p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="where" className="text-lg font-bold">
                  Where to meet
                </h2>
                <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {listing.address}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href={directionsUrl(listing.lat, listing.lng)} target="_blank" rel="noopener noreferrer">
                  <Navigation /> Get directions <ExternalLink className="size-3.5 opacity-60" />
                </a>
              </Button>
            </div>
            <ListingLocationMap lat={listing.lat} lng={listing.lng} title={listing.title} />
          </section>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mt-12 sm:mt-16">
            <ListingGridSkeleton count={4} />
          </div>
        }
      >
        <SimilarItems id={listing.id} category={listing.category} price={listing.price} />
      </Suspense>
    </div>
  );
}
