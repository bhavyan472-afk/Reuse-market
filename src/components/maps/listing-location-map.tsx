"use client";

import dynamic from "next/dynamic";
import { MapErrorBoundary, MapLoading } from "./map-status";

const ListingLocationMapLeaflet = dynamic(() => import("./leaflet/listing-location-map-leaflet"), {
  ssr: false,
  loading: () => <MapLoading />,
});

export function ListingLocationMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  return (
    <div className="relative isolate h-64 overflow-hidden rounded-2xl border border-border sm:h-80">
      <MapErrorBoundary>
        <ListingLocationMapLeaflet lat={lat} lng={lng} title={title} />
      </MapErrorBoundary>
    </div>
  );
}
