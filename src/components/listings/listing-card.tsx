import Image from "next/image";
import Link from "next/link";
import { conditionLabel } from "@/lib/constants";
import { formatPrice, timeAgo } from "@/lib/format";
import type { ListingCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DistanceLabel } from "./distance-label";
import { FavoriteButton } from "./favorite-button";
import { SoldRibbon } from "./sold-ribbon";

/**
 * Editorial product card: frameless image, then price → title → meta.
 * The whole card is one link target (stretched link); the favourite button sits above it.
 */
export function ListingCard({
  listing,
  priority = false,
  className,
}: {
  listing: ListingCardData;
  priority?: boolean;
  className?: string;
}) {
  const sold = listing.status === "sold";
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary ring-1 ring-border/60 ring-inset">
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt={listing.title}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 768px) 30vw, 46vw"
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]",
              sold && "grayscale-[40%]",
            )}
          />
        ) : (
          <div className="grid size-full place-items-center font-serif text-sm text-muted-foreground">No photo</div>
        )}
        {sold && <SoldRibbon />}
        <span className="pointer-events-none absolute top-2.5 left-2.5 z-10 rounded-full bg-card/92 px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide text-foreground backdrop-blur-sm sm:top-3 sm:left-3">
          {conditionLabel(listing.condition)}
        </span>
        <FavoriteButton listingId={listing.id} className="absolute top-2 right-2 z-20 sm:top-2.5 sm:right-2.5" />
      </div>

      <div className="flex flex-1 flex-col pt-3 sm:pt-3.5">
        <p className={cn("price text-[1.05rem] leading-none sm:text-lg", sold && "text-muted-foreground line-through decoration-1")}>
          {formatPrice(listing.price)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-sans text-[0.875rem] leading-snug font-medium tracking-normal text-foreground/85">
          <Link
            href={`/listings/${listing.id}`}
            className="rounded-sm outline-none after:absolute after:inset-0 after:z-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
          >
            {listing.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <DistanceLabel lat={listing.lat} lng={listing.lng} city={listing.city} serverDistanceKm={listing.distance_km} />
          <time
            dateTime={listing.created_at}
            className="hidden shrink-0 text-xs text-muted-foreground min-[400px]:inline"
            suppressHydrationWarning
          >
            {timeAgo(listing.created_at)}
          </time>
        </div>
      </div>
    </article>
  );
}
