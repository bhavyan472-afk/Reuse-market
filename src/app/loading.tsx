import { ListingGridSkeleton } from "@/components/listings/listing-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="space-y-3 pb-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <ListingGridSkeleton count={8} />
    </div>
  );
}
