"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { ListingsMapProps } from "./leaflet/listings-map-leaflet";
import { MapErrorBoundary, MapLoading } from "./map-status";

// Leaflet needs `window`, so the map is only ever rendered in the browser.
const ListingsMapLeaflet = dynamic(() => import("./leaflet/listings-map-leaflet"), {
  ssr: false,
  loading: () => <MapLoading />,
});

export function ListingsMap({ className, ...props }: ListingsMapProps) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-3xl border border-border", className)}>
      <MapErrorBoundary>
        <ListingsMapLeaflet {...props} />
      </MapErrorBoundary>
    </div>
  );
}
