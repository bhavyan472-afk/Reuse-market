import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingGrid, ListingGridSkeleton } from "@/components/listings/listing-grid";
import { MapSplitView } from "@/components/marketplace/map-split-view";
import { MarketplaceShell } from "@/components/marketplace/marketplace-shell";
import { Pagination } from "@/components/marketplace/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryLabel, MAP_PAGE_SIZE, PAGE_SIZE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { searchListings } from "@/lib/queries";
import { parseMarketFilters, type MarketFilters } from "@/lib/search-params";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const f = parseMarketFilters(await searchParams);
  const title = f.category ? `Second-hand ${categoryLabel(f.category).toLowerCase()}` : "Marketplace";
  return {
    title: f.q ? `“${f.q}” — ${title}` : title,
    description: "Browse pre-owned books, laptops, mobiles, bicycles and furniture from students and neighbours near you.",
    alternates: { canonical: f.category ? `/marketplace?category=${f.category}` : "/marketplace" },
  };
}

async function Results({ filters }: { filters: MarketFilters }) {
  if (!isSupabaseConfigured) {
    return <EmptyState title="Connect Supabase to browse" description="Add your Supabase keys to .env.local and run the migration (see README)." />;
  }

  if (filters.view === "map") {
    const { items, total } = await searchListings(filters, { limit: MAP_PAGE_SIZE, offset: 0 });
    if (items.length === 0) return <NoResults />;
    return <MapSplitView listings={items} total={total} />;
  }

  const { items, total } = await searchListings(filters, {
    limit: PAGE_SIZE,
    offset: (filters.page - 1) * PAGE_SIZE,
  });
  if (total === 0) return <NoResults />;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (items.length === 0) {
    return (
      <EmptyState
        title="That page is empty"
        description={`There are only ${totalPages} page${totalPages === 1 ? "" : "s"} of results.`}
        action={{ label: "Back to page 1", href: "/marketplace" }}
      />
    );
  }

  const from = (filters.page - 1) * PAGE_SIZE + 1;
  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground" aria-live="polite">
        {total === 1 ? "1 listing" : `${from}–${from + items.length - 1} of ${total.toLocaleString("en-IN")} listings`}
      </p>
      <ListingGrid listings={items} priorityCount={3} className="xl:grid-cols-3" />
      <Pagination filters={filters} totalPages={totalPages} />
    </div>
  );
}

function NoResults() {
  return (
    <EmptyState
      title="No matches — yet"
      description="Try a broader search, widen the distance, or clear a few filters. New items are listed every day."
      action={{ label: "Clear all filters", href: "/marketplace" }}
    />
  );
}

function ResultsSkeleton({ map }: { map: boolean }) {
  if (map) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(320px,400px)_1fr]">
        <div className="order-2 space-y-3 lg:order-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="order-1 h-[55vh] rounded-3xl lg:order-2 lg:h-[calc(100dvh-12rem)]" />
      </div>
    );
  }
  return (
    <div>
      <Skeleton className="mb-5 h-4 w-40" />
      <ListingGridSkeleton count={9} className="xl:grid-cols-3" />
    </div>
  );
}

export default async function MarketplacePage({ searchParams }: Props) {
  const filters = parseMarketFilters(await searchParams);
  const heading = filters.category ? categoryLabel(filters.category) : "The Marketplace";

  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Browse"
        title={heading}
        description="Pre-owned, well-kept and close by. Filter by price, condition and distance — or switch to the map."
      />
      <MarketplaceShell filters={filters}>
        <Suspense key={JSON.stringify(filters)} fallback={<ResultsSkeleton map={filters.view === "map"} />}>
          <Results filters={filters} />
        </Suspense>
      </MarketplaceShell>
    </div>
  );
}
