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
 * Editorial product card: framed image (slow zoom), serif title, crisp price, quiet meta.
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
    <article className={cn("lift group relative flex flex-col", className)}>
      <div className="zoom-img relative aspect-[4/5] overflow-hidden rounded-[4px] bg-secondary ring-1 ring-border ring-inset">
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt={listing.title}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 768px) 30vw, 46vw"
            className={cn("object-cover", sold && "grayscale-[40%]")}
          />
        ) : (
          <div className="grid size-full place-items-center font-serif text-sm text-muted-foreground italic">No photo</div>
        )}
        {sold && <SoldRibbon />}
        <span className="pointer-events-none absolute top-2.5 left-2.5 z-10 rounded-[2px] bg-card/92 px-2 py-1 text-[0.58rem] font-semibold tracking-[0.18em] text-foreground uppercase backdrop-blur-sm sm:top-3 sm:left-3">
          {conditionLabel(listing.condition)}
        </span>
        <FavoriteButton listingId={listing.id} className="absolute top-2 right-2 z-20 sm:top-2.5 sm:right-2.5" />
      </div>

      <div className="flex flex-1 flex-col pt-3.5 sm:pt-4">
        <h3 className="line-clamp-2 font-serif text-[1.08rem] leading-[1.18] font-medium tracking-normal sm:text-[1.2rem]">
          <Link
            href={`/listings/${listing.id}`}
            className="rounded-sm outline-none after:absolute after:inset-0 after:z-0 after:rounded-[4px] focus-visible:after:ring-3 focus-visible:after:ring-ring/40"
          >
            {listing.title}
          </Link>
        </h3>
        <p className={cn("price mt-2 mb-3 text-[0.98rem] leading-none text-forest sm:text-[1.05rem]", sold && "text-muted-foreground line-through decoration-1")}>
          {formatPrice(listing.price)}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/80 pt-2.5">
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
