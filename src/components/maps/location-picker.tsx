"use client";

import { Crosshair, Loader2, MapPin, Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES } from "@/lib/cities";
import { reverseGeocode, searchPlaces, type GeocodeResult } from "@/lib/geocoder";
import { getCurrentPosition, haversineKm, type LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";
import type { LocationValue } from "@/lib/validations";
import { MapErrorBoundary, MapLoading, MapUnavailable } from "./map-status";

const LocationPickerMap = dynamic(() => import("./leaflet/location-picker-map"), {
  ssr: false,
  loading: () => <MapLoading />,
});

type Props = {
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  error?: string;
  id?: string;
};

function nearestCity(p: LatLng): string {
  let best = CITIES[0];
  let bestD = Infinity;
  for (const c of CITIES) {
    const d = haversineKm(p, c);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best.name;
}

export function LocationPicker(props: Props) {
  // If the map bundle fails to load or render, fall back to the city-based picker so the form still works.
  return (
    <MapErrorBoundary fallback={<ManualLocationPicker {...props} />}>
      <OsmLocationPicker {...props} />
    </MapErrorBoundary>
  );
}

/* ------------------------------------------------------------------ OpenStreetMap-powered picker */

function OsmLocationPicker({ value, onChange, error, id }: Props) {
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const requestId = useRef(0);
  const pickId = useRef(0);

  // Searches only on explicit submit (Enter / button) — the public Nominatim policy forbids search-as-you-type.
  const runSearch = async () => {
    const q = query.trim();
    if (q.length < 3) {
      setSearchError("Type at least 3 characters, then press Enter.");
      return;
    }
    const current = ++requestId.current;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await searchPlaces(q);
      if (current !== requestId.current) return;
      setResults(res);
      setActive(-1);
      setOpen(true);
      if (res.length === 0) setSearchError("No places found. Try a nearby landmark, area or city, or tap the map.");
    } catch {
      if (current !== requestId.current) return;
      setResults([]);
      setSearchError("Address search is unavailable right now. Tap the map or use your current location instead.");
    } finally {
      if (current === requestId.current) setSearching(false);
    }
  };

  const pickPoint = useCallback(
    async (pos: LatLng, fallbackCity?: string) => {
      // Move the pin immediately; fill in the address once the reverse lookup returns.
      const prevAddress = value?.address && value.address.length > 1 ? value.address : null;
      onChange({
        address: prevAddress ?? `Pinned location near ${nearestCity(pos)}`,
        city: value?.city || fallbackCity || nearestCity(pos),
        lat: pos.lat,
        lng: pos.lng,
      });
      const current = ++pickId.current;
      setResolving(true);
      try {
        const found = await reverseGeocode(pos);
        if (current !== pickId.current) return; // a newer pin drop superseded this lookup
        if (found) {
          onChange({ address: found.address.slice(0, 300), city: (found.city || fallbackCity || nearestCity(pos)).slice(0, 100), lat: pos.lat, lng: pos.lng });
        }
      } catch {
        // Keep the pinned coordinates with the fallback address; the seller can edit it below.
      } finally {
        if (current === pickId.current) setResolving(false);
      }
    },
    [onChange, value],
  );

  const choose = (r: GeocodeResult) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    onChange({ address: r.label.slice(0, 300), city: (r.city || nearestCity(r)).slice(0, 100), lat: r.lat, lng: r.lng });
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      await pickPoint(pos);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not get your location.");
    } finally {
      setLocating(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Never let Enter submit the surrounding listing/profile form.
      e.preventDefault();
      if (open && results.length > 0 && active >= 0) choose(results[active]);
      else void runSearch();
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const position = value ? { lat: value.lat, lng: value.lng } : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id={id}
            role="combobox"
            aria-expanded={open && results.length > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listboxId}-${active}` : undefined}
            aria-invalid={!!error}
            enterKeyHint="search"
            placeholder="Search an address or landmark, then press Enter"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchError(null);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => results.length && setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            className="pr-20 pl-10"
            autoComplete="off"
          />
          <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
            {query && !searching && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setSearchError(null);
                }}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              aria-label="Search address"
              onClick={() => void runSearch()}
              disabled={searching}
              className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-60"
            >
              {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            </button>
          </div>
          {open && results.length > 0 && (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-[1100] mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover p-1 shadow-lift"
            >
              {results.map((r, i) => (
                <li
                  key={r.id}
                  id={`${listboxId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(r)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-sm",
                    i === active ? "bg-muted" : "hover:bg-muted/70",
                  )}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{r.main}</span>
                    {r.secondary && <span className="block truncate text-xs text-muted-foreground">{r.secondary}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button type="button" variant="outline" onClick={useMyLocation} disabled={locating} className="h-11">
          {locating ? <Loader2 className="animate-spin" /> : <Crosshair />}
          Use my current location
        </Button>
      </div>
      {searchError && <p className="text-xs text-muted-foreground">{searchError}</p>}

      <div
        className={cn(
          "relative isolate h-64 overflow-hidden rounded-2xl border sm:h-72",
          error ? "border-destructive" : "border-border",
        )}
      >
        <MapErrorBoundary fallback={<MapUnavailable className="rounded-none border-0" />}>
          <LocationPickerMap position={position} onPick={(pos) => void pickPoint(pos)} />
        </MapErrorBoundary>
        {!position && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[600] mx-auto w-fit rounded-full bg-card/95 px-4 py-1.5 text-xs shadow-soft">
            Search above, use your location, or tap the map to drop a pin
          </div>
        )}
        {resolving && (
          <div className="absolute top-3 right-3 z-[600] flex items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 text-xs shadow-soft">
            <Loader2 className="size-3.5 animate-spin" /> Finding address…
          </div>
        )}
      </div>

      {value && <SelectedLocation value={value} onChange={onChange} />}
    </div>
  );
}

function SelectedLocation({ value, onChange }: { value: LocationValue; onChange: (v: LocationValue | null) => void }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-4 sm:grid-cols-[1fr_200px]">
      <div className="space-y-1.5">
        <Label htmlFor="loc-address" className="text-xs text-muted-foreground">
          Address shown to buyers
        </Label>
        <Input
          id="loc-address"
          value={value.address}
          maxLength={300}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="loc-city" className="text-xs text-muted-foreground">
          City
        </Label>
        <Input id="loc-city" value={value.city} maxLength={100} onChange={(e) => onChange({ ...value, city: e.target.value })} />
      </div>
      <p className="text-xs text-muted-foreground sm:col-span-2">
        Pin: {value.lat.toFixed(5)}, {value.lng.toFixed(5)} · Tip: pick a public meeting spot like a campus gate or café.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ Manual fallback (map failed to load) */

function ManualLocationPicker({ value, onChange, error, id }: Props) {
  const [locating, setLocating] = useState(false);
  const selectedCity = CITIES.find((c) => c.name === value?.city)?.name;

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      const city = nearestCity(pos);
      onChange({ address: value?.address || `Near ${city}`, city, lat: pos.lat, lng: pos.lng });
      toast.success(`Location set near ${city}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not get your location.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="space-y-3">
      <MapUnavailable className="min-h-0 py-4" />
      <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor={id ?? "manual-city"}>City</Label>
          <Select
            value={selectedCity}
            onValueChange={(name) => {
              const c = CITIES.find((x) => x.name === name);
              if (c) onChange({ address: value?.address || `${c.name}, ${c.state}`, city: c.name, lat: c.lat, lng: c.lng });
            }}
          >
            <SelectTrigger id={id ?? "manual-city"} className="w-full" aria-invalid={!!error}>
              <SelectValue placeholder={value?.city || "Choose a city"} />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="manual-address">Area / landmark</Label>
          <Input
            id="manual-address"
            placeholder="e.g. Koramangala 5th Block, near Forum Mall"
            value={value?.address ?? ""}
            maxLength={300}
            disabled={!value}
            onChange={(e) => value && onChange({ ...value, address: e.target.value })}
          />
        </div>
      </div>
      <Button type="button" variant="outline" onClick={useMyLocation} disabled={locating}>
        {locating ? <Loader2 className="animate-spin" /> : <Crosshair />}
        Use my current location
      </Button>
      {value && (
        <p className="text-xs text-muted-foreground">
          Location: {value.city} ({value.lat.toFixed(4)}, {value.lng.toFixed(4)})
        </p>
      )}
    </div>
  );
}
