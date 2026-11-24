import { FadeIn } from "@/components/shared/fade-in";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListingCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ListingCard } from "./listing-card";

// 2 columns on phones (360px+), 3 on tablets, 4 on desktop.
const GRID = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4";

export function ListingGrid({
  listings,
  className,
  priorityCount = 0,
  badgeFor,
}: {
  listings: ListingCardData[];
  className?: string;
  priorityCount?: number;
  /** Optional per-card deal badge. */
  badgeFor?: (listing: ListingCardData) => string | undefined;
}) {
  return (
    <div className={cn(GRID, className)}>
      {listings.map((l, i) => (
        <FadeIn key={l.id} delay={(i % 4) * 0.05} className="h-full">
          <ListingCard listing={l} priority={i < priorityCount} badge={badgeFor?.(l)} className="h-full" />
        </FadeIn>
      ))}
    </div>
  );
}

/** Horizontal, swipeable row of cards (mobile) that becomes a 4-up grid on desktop. */
export function ListingRow({
  listings,
  priorityCount = 0,
  badgeFor,
}: {
  listings: ListingCardData[];
  priorityCount?: number;
  badgeFor?: (listing: ListingCardData) => string | undefined;
}) {
  return (
    <div className="no-scrollbar -mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
      <ul className="flex w-max gap-3 sm:gap-4 lg:grid lg:w-auto lg:grid-cols-4 lg:gap-5 lg:[&>li:nth-child(n+5)]:hidden">
        {listings.map((l, i) => (
          <li key={l.id} className="w-[44vw] max-w-[220px] shrink-0 snap-start sm:w-[220px] lg:w-auto lg:max-w-none">
            <ListingCard listing={l} priority={i < priorityCount} badge={badgeFor?.(l)} className="h-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-card border border-border bg-card">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="mt-1 h-5 w-1/3" />
        <Skeleton className="mt-3 h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(GRID, className)} role="status" aria-label="Loading listings">
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function ListingRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="no-scrollbar -mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0" role="status" aria-label="Loading listings">
      <div className="flex gap-3 sm:gap-4 lg:grid lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="w-[44vw] max-w-[220px] shrink-0 sm:w-[220px] lg:w-auto lg:max-w-none">
            <ListingCardSkeleton />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
