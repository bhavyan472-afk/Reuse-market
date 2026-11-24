"use client";

import { MapPin } from "lucide-react";
import { useViewerLocation } from "@/components/providers/location-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatDistance } from "@/lib/format";
import { haversineKm } from "@/lib/geo";
import { cn } from "@/lib/utils";

/** "2.3 km away · Pune" — computed from the viewer's location (device GPS or saved profile location). */
export function DistanceLabel({
  lat,
  lng,
  city,
  serverDistanceKm,
  className,
}: {
  lat: number;
  lng: number;
  city: string;
  serverDistanceKm?: number | null;
  className?: string;
}) {
  const { location } = useViewerLocation();
  const hydrated = useHydrated();
  const viewer = hydrated ? location : null;
  const km = viewer ? haversineKm(viewer, { lat, lng }) : (serverDistanceKm ?? null);
  const dist = formatDistance(km);
  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-1 text-xs text-muted-foreground", className)}>
      <MapPin className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{dist ? `${dist} · ${city}` : city}</span>
    </span>
  );
}
