import { BadgeCheck, ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { conditionLabel } from "@/lib/constants";
import { formatPrice, formatRupees, timeAgo } from "@/lib/format";
import type { ListingCondition } from "@/lib/supabase/database.types";
import type { ListingCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DistanceLabel } from "./distance-label";
import { FavoriteButton } from "./favorite-button";
import { SoldRibbon } from "./sold-ribbon";

const CONDITION_STYLE: Record<ListingCondition, string> = {
  new: "bg-primary text-primary-foreground",
  like_new: "bg-green-tint text-primary",
  good: "bg-card text-foreground",
  fair: "bg-saffron-tint text-saffron-ink",
};

export function ConditionBadge({ condition, className }: { condition: ListingCondition; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[0.7rem] font-semibold shadow-soft",
        CONDITION_STYLE[condition],
        className,
      )}
    >
      {conditionLabel(condition)}
    </span>
  );
}

/**
 * Product card: 4:3 photo, condition badge, wishlist heart, 2-line title, big rupee price,
 * optional "Save ₹X vs new", city + time ago, optional verified-seller tick.
 * The whole card is one link target (stretched link); the heart sits above it.
 */
export function ListingCard({
  listing,
  priority = false,
  badge,
  className,
}: {
  listing: ListingCardData;
  priority?: boolean;
  /** Optional saffron deal badge on the photo, e.g. "Deal". */
  badge?: string;
  className?: string;
}) {
  const sold = listing.status === "sold";
  const saving =
    listing.original_price && listing.original_price > listing.price ? listing.original_price - listing.price : null;

  return (
    <article
      className={cn(
        "lift group relative flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-soft",
        className,
      )}
    >
      <div className="zoom-img relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt={listing.title}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes="(min-width: 1280px) 280px, (min-width: 768px) 30vw, 48vw"
            className={cn("object-cover", sold && "grayscale-[40%]")}
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-6" aria-hidden />
            <span className="sr-only">No photo</span>
          </div>
        )}
        {sold && <SoldRibbon />}
        <div className="pointer-events-none absolute top-2 left-2 z-10 flex flex-col items-start gap-1.5">
          <ConditionBadge condition={listing.condition} />
          {badge && !sold && (
            <span className="inline-flex h-6 items-center rounded-full bg-saffron px-2.5 text-[0.7rem] font-bold text-saffron-foreground shadow-soft">
              {badge}
            </span>
          )}
        </div>
        <FavoriteButton listingId={listing.id} className="absolute top-1.5 right-1.5 z-20" />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-3.5">
        <h3 className="line-clamp-2 min-h-[2.5em] text-[0.875rem] leading-[1.25] font-semibold tracking-normal sm:text-[0.9375rem]">
          <Link
            href={`/listings/${listing.id}`}
            className="outline-none after:absolute after:inset-0 after:z-0 after:rounded-card focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {listing.title}
          </Link>
        </h3>
        <p
          className={cn(
            "price mt-0.5 text-[1.2rem] leading-none sm:text-[1.35rem]",
            sold && "text-muted-foreground line-through decoration-2",
          )}
        >
          {formatPrice(listing.price)}
        </p>
        {saving && !sold ? (
          <p className="text-xs font-semibold text-primary">Save {formatRupees(saving)} vs new</p>
        ) : null}
        <div className="mt-auto space-y-0.5 pt-2">
          <DistanceLabel lat={listing.lat} lng={listing.lng} city={listing.city} serverDistanceKm={listing.distance_km} />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <time dateTime={listing.created_at} suppressHydrationWarning>
              {timeAgo(listing.created_at)}
            </time>
            {listing.seller_verified ? (
              <span className="inline-flex items-center gap-0.5 font-medium text-primary">
                <BadgeCheck className="size-3.5" aria-hidden /> Verified
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </article>
  );
}
