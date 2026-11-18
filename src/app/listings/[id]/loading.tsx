import { Skeleton } from "@/components/ui/skeleton";

export default function ListingLoading() {
  return (
    <div className="container-page py-8 sm:py-12" role="status" aria-label="Loading listing">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        <div className="space-y-3">
          <Skeleton className="aspect-[4/3] rounded-3xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="size-20 rounded-2xl sm:size-24" />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-border bg-card p-8">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
