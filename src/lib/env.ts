// Only NEXT_PUBLIC_ values live here — they are safe to ship to the browser.
// Next.js inlines NEXT_PUBLIC_* at build time, so they must be read with static property access.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  // Map tiles (Leaflet). Defaults to the public OpenStreetMap tile server, which is fine for
  // development and light use only — see https://operations.osmfoundation.org/policies/tiles/.
  // For production traffic, point these at a tile provider/plan that permits your usage.
  mapTileUrl: process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  mapTileAttribution:
    process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  mapTileMaxZoom: Number(process.env.NEXT_PUBLIC_MAP_TILE_MAX_ZOOM) || 19,
  // Address search / reverse geocoding (Nominatim API). Public instance policy: max 1 req/s,
  // no autocomplete — https://operations.osmfoundation.org/policies/nominatim/.
  geocoderUrl: (process.env.NEXT_PUBLIC_GEOCODER_URL || "https://nominatim.openstreetmap.org").replace(/\/$/, ""),
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  googleAuthEnabled: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true",
} as const;

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const STORAGE_BUCKET = "listing-images";
