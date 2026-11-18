import { CATEGORY_VALUES, CONDITION_VALUES, DISTANCE_OPTIONS, SORT_OPTIONS, type SortOption } from "@/lib/constants";
import type { ListingCategory, ListingCondition } from "@/lib/supabase/database.types";

export type MarketFilters = {
  q: string;
  category: ListingCategory | null;
  minPrice: number | null;
  maxPrice: number | null;
  conditions: ListingCondition[];
  availableOnly: boolean;
  lat: number | null;
  lng: number | null;
  radius: number | null;
  sort: SortOption;
  page: number;
  view: "list" | "map";
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function num(v: string, { min, max }: { min: number; max: number }): number | null {
  if (!v.trim()) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

export function parseMarketFilters(params: RawParams): MarketFilters {
  const category = first(params.category);
  const sort = first(params.sort);
  const conditions = first(params.condition)
    .split(",")
    .filter((c): c is ListingCondition => (CONDITION_VALUES as readonly string[]).includes(c));
  const lat = num(first(params.lat), { min: -90, max: 90 });
  const lng = num(first(params.lng), { min: -180, max: 180 });
  const radius = num(first(params.radius), { min: 1, max: 500 });
  const hasPoint = lat !== null && lng !== null;
  const minPrice = num(first(params.min), { min: 0, max: 10_000_000 });
  const maxPrice = num(first(params.max), { min: 0, max: 10_000_000 });

  let parsedSort: SortOption = SORT_OPTIONS.some((s) => s.value === sort) ? (sort as SortOption) : "newest";
  if (parsedSort === "nearest" && !hasPoint) parsedSort = "newest";

  return {
    q: first(params.q).trim().slice(0, 100),
    category: (CATEGORY_VALUES as readonly string[]).includes(category) ? (category as ListingCategory) : null,
    minPrice: minPrice !== null ? Math.floor(minPrice) : null,
    maxPrice: maxPrice !== null ? Math.ceil(maxPrice) : null,
    conditions,
    availableOnly: first(params.sold) !== "1",
    lat: hasPoint ? lat : null,
    lng: hasPoint ? lng : null,
    radius: hasPoint && radius !== null && (DISTANCE_OPTIONS as readonly number[]).includes(radius) ? radius : null,
    sort: parsedSort,
    page: Math.max(1, Math.min(500, Math.floor(num(first(params.page), { min: 1, max: 500 }) ?? 1))),
    view: first(params.view) === "map" ? "map" : "list",
  };
}

/** Build a querystring from (partial) filters, omitting defaults. */
export function buildMarketQuery(filters: Partial<MarketFilters>): string {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.category) sp.set("category", filters.category);
  if (filters.minPrice !== null && filters.minPrice !== undefined && filters.minPrice > 0) sp.set("min", String(filters.minPrice));
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) sp.set("max", String(filters.maxPrice));
  if (filters.conditions?.length) sp.set("condition", filters.conditions.join(","));
  if (filters.availableOnly === false) sp.set("sold", "1");
  if (filters.lat !== null && filters.lat !== undefined && filters.lng !== null && filters.lng !== undefined) {
    sp.set("lat", filters.lat.toFixed(4));
    sp.set("lng", filters.lng.toFixed(4));
  }
  if (filters.radius) sp.set("radius", String(filters.radius));
  if (filters.sort && filters.sort !== "newest") sp.set("sort", filters.sort);
  if (filters.page && filters.page > 1) sp.set("page", String(filters.page));
  if (filters.view === "map") sp.set("view", "map");
  const s = sp.toString();
  return s ? `?${s}` : "";
}
