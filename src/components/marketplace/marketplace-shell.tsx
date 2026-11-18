"use client";

import { LayoutGrid, Map as MapIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useViewerLocation } from "@/components/providers/location-provider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CATEGORIES, categoryLabel, conditionLabel, SORT_OPTIONS, type SortOption } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { MarketFilters } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { FilterPanel } from "./filter-panel";
import { useMarketNavigation } from "./use-market-navigation";

export function MarketplaceShell({ filters, children }: { filters: MarketFilters; children: ReactNode }) {
  const { update, pending } = useMarketNavigation(filters);
  const { location, requestLocation } = useViewerLocation();
  const [q, setQ] = useState(filters.q);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => setQ(filters.q), [filters.q]);

  const onSort = async (sort: SortOption) => {
    if (sort !== "nearest") return update({ sort });
    let point = filters.lat !== null && filters.lng !== null ? { lat: filters.lat, lng: filters.lng } : location;
    if (!point) point = await requestLocation();
    if (!point) {
      toast.error("Allow location access to sort by distance.");
      return;
    }
    update({ sort, lat: point.lat, lng: point.lng });
  };

  const chips: { label: string; clear: Partial<MarketFilters> }[] = [];
  if (filters.q) chips.push({ label: `“${filters.q}”`, clear: { q: "" } });
  if (filters.category) chips.push({ label: categoryLabel(filters.category), clear: { category: null } });
  if (filters.minPrice !== null || filters.maxPrice !== null)
    chips.push({
      label: `${filters.minPrice !== null ? formatPrice(filters.minPrice) : "₹0"} – ${filters.maxPrice !== null ? formatPrice(filters.maxPrice) : "any"}`,
      clear: { minPrice: null, maxPrice: null },
    });
  filters.conditions.forEach((c) =>
    chips.push({ label: conditionLabel(c), clear: { conditions: filters.conditions.filter((x) => x !== c) } }),
  );
  if (filters.radius) chips.push({ label: `Within ${filters.radius} km`, clear: { radius: null } });
  if (!filters.availableOnly) chips.push({ label: "Including sold", clear: { availableOnly: true } });

  const isMap = filters.view === "map";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form
          role="search"
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: q.trim() });
          }}
        >
          <label htmlFor="market-q" className="sr-only">
            Search listings
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="market-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={100}
            placeholder="Search books, laptops, cycles…"
            className="h-12 w-full rounded-full border border-border bg-card pr-28 pl-11 text-[0.95rem] transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
          />
          <Button type="submit" size="sm" className="absolute top-1/2 right-2 h-9 -translate-y-1/2">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className={cn("h-12 shrink-0", !isMap && "lg:hidden")}>
                <SlidersHorizontal /> Filters
                {chips.length > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {chips.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-6">
              <SheetHeader className="sr-only">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Refine the listings shown</SheetDescription>
              </SheetHeader>
              <FilterPanel filters={filters} update={update} />
            </SheetContent>
          </Sheet>

          <Select value={filters.sort} onValueChange={(v) => void onSort(v as SortOption)}>
            <SelectTrigger aria-label="Sort by" className="h-12 min-w-0 flex-1 rounded-full sm:min-w-44 lg:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div role="group" aria-label="View" className="flex h-12 shrink-0 items-center rounded-full border border-border bg-card p-1">
            <button
              type="button"
              aria-pressed={!isMap}
              onClick={() => update({ view: "list" }, { resetPage: false })}
              className={cn(
                "flex h-full items-center gap-1.5 rounded-full px-3.5 text-sm transition-colors",
                !isMap ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-4" /> <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              aria-pressed={isMap}
              onClick={() => update({ view: "map" })}
              className={cn(
                "flex h-full items-center gap-1.5 rounded-full px-3.5 text-sm transition-colors",
                isMap ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MapIcon className="size-4" /> <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category bar — always visible on small screens and in map view (where the sidebar is hidden). */}
      <nav aria-label="Categories" className={cn("no-scrollbar -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6", !isMap && "lg:hidden")}>
        <ul className="flex w-max gap-2">
          {[{ value: null, label: "All", icon: null }, ...CATEGORIES].map(({ value, label, icon: Icon }) => {
            const active = filters.category === value;
            return (
              <li key={label}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ category: value })}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[0.8rem] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-foreground/30",
                  )}
                >
                  {Icon && <Icon className={cn("size-3.5", active ? "text-gold" : "text-brand")} aria-hidden />}
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Active filters">
          {chips.map((c) => (
            <li key={c.label}>
              <button
                type="button"
                onClick={() => update(c.clear)}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-sage-soft px-3 text-xs font-semibold text-brand transition-colors hover:bg-sage/40"
                aria-label={`Remove filter ${c.label}`}
              >
                {c.label} <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={cn(!isMap && "lg:grid lg:grid-cols-[260px_1fr] lg:gap-10")}>
        {!isMap && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <FilterPanel filters={filters} update={update} />
            </div>
          </aside>
        )}
        <div aria-busy={pending} className={cn("min-w-0 transition-opacity duration-300", pending && "pointer-events-none opacity-50")}>
          {children}
        </div>
      </div>
    </div>
  );
}
