import { Skeleton } from "@/components/ui/skeleton";
import type { ListingCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ListingCard } from "./listing-card";

// Two columns from the smallest phones (scannable, app-like), widening to four on desktop.
const GRID = "grid grid-cols-2 gap-x-3.5 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4";

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
        <ListingCard key={l.id} listing={l} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="space-y-2.5 pt-3.5">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
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
