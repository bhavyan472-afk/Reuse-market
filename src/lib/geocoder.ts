// Free geocoding via the Nominatim API (OpenStreetMap data).
// Public-instance usage policy (https://operations.osmfoundation.org/policies/nominatim/):
//   - max 1 request per second  -> enforced below with a simple serial queue
//   - no autocomplete / search-as-you-type -> we only search on explicit submit
//   - identify the application -> browsers send a Referer header automatically
//   - cache results -> in-memory cache below
// For heavier production use, set NEXT_PUBLIC_GEOCODER_URL to your own or a commercial Nominatim-compatible endpoint.
import { env } from "@/lib/env";
import type { LatLng } from "@/lib/geo";

export type GeocodeResult = { id: string; label: string; main: string; secondary: string; city: string; lat: number; lng: number };

type NominatimAddress = Partial<
  Record<"city" | "town" | "village" | "municipality" | "suburb" | "county" | "state_district" | "state", string>
>;
type NominatimPlace = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: NominatimAddress;
};

const MIN_INTERVAL_MS = 1100;
let queue: Promise<unknown> = Promise.resolve();
let lastRequest = 0;
const cache = new Map<string, unknown>();

function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = lastRequest + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequest = Date.now();
    return fn();
  });
  queue = run.catch(() => undefined);
  return run;
}

async function getJson<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${env.geocoderUrl}${path}?${new URLSearchParams({ format: "jsonv2", addressdetails: "1", ...params })}`;
  if (cache.has(url)) return cache.get(url) as T;
  const data = await throttled(async () => {
    const res = await fetch(url, { headers: { Accept: "application/json", "Accept-Language": "en" } });
    if (!res.ok) throw new Error(`Geocoder responded ${res.status}`);
    return (await res.json()) as T;
  });
  cache.set(url, data);
  return data;
}

export function cityFromAddress(a: NominatimAddress | undefined): string {
  if (!a) return "";
  return a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? a.state_district ?? a.suburb ?? a.state ?? "";
}

function toResult(p: NominatimPlace): GeocodeResult {
  const parts = p.display_name.split(",").map((s) => s.trim());
  const main = p.name || parts[0] || p.display_name;
  return {
    id: String(p.place_id),
    label: p.display_name,
    main,
    secondary: parts.filter((s) => s !== main).slice(0, 3).join(", "),
    city: cityFromAddress(p.address),
    lat: Number(p.lat),
    lng: Number(p.lon),
  };
}

/** Forward search. Call on explicit submit only (no search-as-you-type). Results limited to India like before. */
export async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const data = await getJson<NominatimPlace[]>("/search", { q, countrycodes: "in", limit: "6" });
  return data.map(toResult);
}

/** Reverse geocode a point to an address + city. */
export async function reverseGeocode(pos: LatLng): Promise<{ address: string; city: string } | null> {
  const data = await getJson<NominatimPlace & { error?: string }>("/reverse", {
    lat: pos.lat.toFixed(6),
    lon: pos.lng.toFixed(6),
    zoom: "18",
  });
  if (!data || data.error) return null;
  return { address: data.display_name, city: cityFromAddress(data.address) };
}
