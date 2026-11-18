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
import { CATEGORIES, CONDITIONS, DISTANCE_OPTIONS, PRICE_MAX } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { MarketFilters } from "@/lib/search-params";
import type { ListingCondition } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-9 rounded-full border px-3.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/25",
      )}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 border-b border-border pb-6 last:border-0">
      <legend className="mb-3 text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">{title}</legend>
      {children}
    </fieldset>
  );
}

export function FilterPanel({
  filters,
  update,
}: {
  filters: MarketFilters;
  update: (patch: Partial<MarketFilters>) => void;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Filters</h2>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              update({ category: null, minPrice: null, maxPrice: null, conditions: [], availableOnly: true, radius: null })
            }
          >
            <RotateCcw /> Reset
          </Button>
        )}
      </div>

      <Section title="Category">
        <div className="flex flex-wrap gap-2">
          <Pill active={!filters.category} onClick={() => update({ category: null })}>
            All
          </Pill>
          {CATEGORIES.map((c) => (
            <Pill key={c.value} active={filters.category === c.value} onClick={() => update({ category: c.value })}>
              {c.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Price">
        <Slider
          min={0}
          max={PRICE_MAX}
          step={500}
          value={price}
          onValueChange={(v) => setPrice([v[0], v[1]])}
          onValueCommit={(v) => commitPrice([v[0], v[1]])}
          aria-label="Price range"
          className="py-2"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(price[0]) === "Free" ? "₹0" : formatPrice(price[0])}</span>
          <span>{price[1] >= PRICE_MAX ? `${formatPrice(PRICE_MAX)}+` : formatPrice(price[1])}</span>
        </div>
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
            className="h-9"
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
            className="h-9"
          />
          <Button type="submit" size="sm" variant="outline" className="h-9">
            Go
          </Button>
        </form>
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
                  <span>{c.label}</span>
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
              <LocateFixed className="size-3.5 text-brand" /> Measured from your current location
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
          <Switch
            id="available-only"
            checked={filters.availableOnly}
            onCheckedChange={(v) => update({ availableOnly: v })}
          />
        </div>
      </Section>
    </div>
  );
}
