"use client";

import { Loader2, LocateFixed, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useViewerLocation } from "@/components/providers/location-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { BUDGETS, CATEGORIES, CONDITIONS, DISTANCE_OPTIONS, PRICE_MAX, SORT_OPTIONS, type SortOption } from "@/lib/constants";
import { formatRupees } from "@/lib/format";
import type { MarketFilters } from "@/lib/search-params";
import type { ListingCondition } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

function Pill({
  active,
  children,
  onClick,
  className,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-green-tint",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 border-b border-border pb-5 last:border-0 last:pb-0">
      <legend className="mb-3 text-sm font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

export function FilterPanel({
  filters,
  update,
  onSort,
}: {
  filters: MarketFilters;
  update: (patch: Partial<MarketFilters>) => void;
  onSort?: (sort: SortOption) => void;
}) {
  const { location, requestLocation, locating } = useViewerLocation();
  const [price, setPrice] = useState<[number, number]>([filters.minPrice ?? 0, filters.maxPrice ?? PRICE_MAX]);

  useEffect(() => {
    setPrice([filters.minPrice ?? 0, filters.maxPrice ?? PRICE_MAX]);
  }, [filters.minPrice, filters.maxPrice]);

  const commitPrice = (v: [number, number]) => {
    const [min, max] = v[0] <= v[1] ? v : [v[1], v[0]];
    update({ minPrice: min > 0 ? min : null, maxPrice: max < PRICE_MAX ? max : null });
  };

  const toggleCondition = (c: ListingCondition, checked: boolean) => {
    const set = new Set(filters.conditions);
    if (checked) set.add(c);
    else set.delete(c);
    update({ conditions: CONDITIONS.map((x) => x.value).filter((x) => set.has(x)) });
  };

  const setRadius = async (radius: number | null) => {
    if (radius === null) {
      update({ radius: null });
      return;
    }
    let point = filters.lat !== null && filters.lng !== null ? { lat: filters.lat, lng: filters.lng } : location;
    if (!point) point = await requestLocation();
    if (!point) {
      toast.error("Allow location access to filter by distance.");
      return;
    }
    update({ radius, lat: point.lat, lng: point.lng });
  };

  const hasPoint = filters.lat !== null && filters.lng !== null;
  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.conditions.length ? 1 : 0) +
    (!filters.availableOnly ? 1 : 0) +
    (filters.radius ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="flex min-h-9 items-center justify-between">
        <h2 className="text-lg font-bold">Filters</h2>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() =>
              update({ category: null, minPrice: null, maxPrice: null, conditions: [], availableOnly: true, radius: null })
            }
          >
            <RotateCcw /> Reset
          </Button>
        )}
      </div>

      {onSort && (
        <Section title="Sort by">
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((s) => (
              <Pill key={s.value} active={filters.sort === s.value} onClick={() => onSort(s.value)}>
                {s.label}
              </Pill>
            ))}
          </div>
        </Section>
      )}

      <Section title="Budget">
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <Pill
              key={b.label}
              active={filters.minPrice === b.min && filters.maxPrice === b.max}
              onClick={() => update({ minPrice: b.min, maxPrice: b.max })}
            >
              {b.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Price range">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>{formatRupees(price[0])}</span>
          <span>{price[1] >= PRICE_MAX ? `${formatRupees(PRICE_MAX)}+` : formatRupees(price[1])}</span>
        </div>
        <Slider
          min={0}
          max={PRICE_MAX}
          step={500}
          value={price}
          onValueChange={(v) => setPrice([v[0], v[1]])}
          onValueCommit={(v) => commitPrice([v[0], v[1]])}
          aria-label="Price range in rupees"
          className="py-2"
        />
        <form
          className="grid grid-cols-[1fr_1fr_auto] gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            commitPrice(price);
          }}
        >
          <Label className="sr-only" htmlFor="min-price">
            Minimum price
          </Label>
          <Input
            id="min-price"
            inputMode="numeric"
            placeholder="Min ₹"
            value={price[0] || ""}
            onChange={(e) => setPrice([Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0), price[1]])}
            className="h-10"
          />
          <Label className="sr-only" htmlFor="max-price">
            Maximum price
          </Label>
          <Input
            id="max-price"
            inputMode="numeric"
            placeholder="Max ₹"
            value={price[1] >= PRICE_MAX ? "" : price[1]}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/\D/g, ""));
              setPrice([price[0], e.target.value === "" ? PRICE_MAX : Math.min(n, 10_000_000)]);
            }}
            className="h-10"
          />
          <Button type="submit" size="sm" variant="outline" className="h-10">
            Go
          </Button>
        </form>
      </Section>

      <Section title="Category">
        <div className="flex flex-wrap gap-2">
          <Pill active={!filters.category} onClick={() => update({ category: null })}>
            All
          </Pill>
          {CATEGORIES.map((c) => (
            <Pill key={c.value} active={filters.category === c.value} onClick={() => update({ category: c.value })}>
              <c.icon className="size-3.5" aria-hidden />
              {c.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Condition">
        <div className="space-y-3">
          {CONDITIONS.map((c) => {
            const id = `cond-${c.value}`;
            return (
              <div key={c.value} className="flex items-start gap-3">
                <Checkbox
                  id={id}
                  checked={filters.conditions.includes(c.value)}
                  onCheckedChange={(v) => toggleCondition(c.value, v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor={id} className="flex flex-col items-start gap-0.5 font-normal">
                  <span className="font-medium">{c.label}</span>
                  <span className="text-xs text-muted-foreground">{c.hint}</span>
                </Label>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Distance">
        <div className="flex flex-wrap gap-2">
          <Pill active={!filters.radius} onClick={() => void setRadius(null)}>
            Any
          </Pill>
          {DISTANCE_OPTIONS.map((d) => (
            <Pill key={d} active={filters.radius === d} onClick={() => void setRadius(d)}>
              {d} km
            </Pill>
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {locating ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Finding you…
            </>
          ) : hasPoint ? (
            <>
              <LocateFixed className="size-3.5 text-primary" /> Measured from your location
            </>
          ) : (
            "We'll ask for your location when you pick a distance."
          )}
        </p>
      </Section>

      <Section title="Availability">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="available-only" className="font-normal">
            Available only
          </Label>
          <Switch id="available-only" checked={filters.availableOnly} onCheckedChange={(v) => update({ availableOnly: v })} />
        </div>
      </Section>
    </div>
  );
}
