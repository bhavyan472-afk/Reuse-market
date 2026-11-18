"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { buildMarketQuery, type MarketFilters } from "@/lib/search-params";

export function useMarketNavigation(filters: MarketFilters) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (patch: Partial<MarketFilters>, { resetPage = true }: { resetPage?: boolean } = {}) => {
      const next: MarketFilters = { ...filters, ...patch, ...(resetPage && !("page" in patch) ? { page: 1 } : {}) };
      if (next.sort === "nearest" && (next.lat === null || next.lng === null)) next.sort = "newest";
      startTransition(() => {
        router.push(`/marketplace${buildMarketQuery(next)}`, { scroll: false });
      });
    },
    [filters, router],
  );

  return { update, pending };
}
