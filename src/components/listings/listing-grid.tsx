import { FadeIn } from "@/components/shared/fade-in";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListingCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ListingCard } from "./listing-card";

// Two columns from the smallest phones (scannable, app-like), widening to four on desktop.
const GRID = "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 xl:grid-cols-4";

export function ListingGrid({
  listings,
  className,
  priorityCount = 0,
}: {
  listings: ListingCardData[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div className={cn(GRID, className)}>
      {listings.map((l, i) => (
        // Staggered reveal across each row (cards already on screen at load are left untouched).
        <FadeIn key={l.id} delay={(i % 4) * 0.07} className="h-full">
          <ListingCard listing={l} priority={i < priorityCount} className="h-full" />
        </FadeIn>
      ))}
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-[4/5] rounded-[4px]" />
      <div className="space-y-2.5 pt-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
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
