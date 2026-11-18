"use client";

// Client-only module: Leaflet touches `window` at import time. Only import this file through
// `next/dynamic(..., { ssr: false })` (see the wrappers in components/maps/*.tsx).
import "leaflet/dist/leaflet.css";
import L, { type LatLngExpression, type Map as LeafletMap } from "leaflet";
import { useState, type ReactNode, type Ref } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { MapLoading, MapUnavailable } from "../map-status";

/** Brand-coloured teardrop pin (divIcon, so no external marker images are needed). */
export function pinIcon(scale = 1) {
  const w = Math.round(30 * scale);
  const h = Math.round(40 * scale);
  return L.divIcon({
    className: "reuse-pin",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 4],
    html: `<svg width="${w}" height="${h}" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 1C7.3 1 1 7.2 1 14.9 1 25.3 15 39 15 39s14-13.7 14-24.1C29 7.2 22.7 1 15 1z" fill="#1E3A2F" stroke="#142821" stroke-width="1.5"/><circle cx="15" cy="15" r="5.5" fill="#A8834A"/></svg>`,
  });
}

export function BaseMap({
  center,
  zoom,
  className,
  children,
  scrollWheelZoom = true,
  mapRef,
}: {
  center: LatLngExpression;
  zoom: number;
  className?: string;
  children?: ReactNode;
  scrollWheelZoom?: boolean;
  mapRef?: Ref<LeafletMap>;
}) {
  const [loaded, setLoaded] = useState(false);
  const [tileErrors, setTileErrors] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const tilesFailed = !loaded && tileErrors >= 4;

  return (
    <div className={cn("reuse-map relative size-full", className)}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        minZoom={3}
        maxZoom={env.mapTileMaxZoom}
        scrollWheelZoom={scrollWheelZoom}
        worldCopyJump
        className="size-full"
      >
        <TileLayer
          key={attempt}
          url={env.mapTileUrl}
          attribution={env.mapTileAttribution}
          maxZoom={env.mapTileMaxZoom}
          eventHandlers={{
            tileload: () => setLoaded(true),
            tileerror: () => setTileErrors((n) => n + 1),
          }}
        />
        {children}
      </MapContainer>
      {!loaded && !tilesFailed && <MapLoading overlay />}
      {tilesFailed && (
        <div className="absolute inset-0 z-[500]">
          <MapUnavailable
            reason="tiles"
            className="rounded-none border-0 bg-muted"
            onRetry={() => {
              setTileErrors(0);
              setAttempt((a) => a + 1);
            }}
          />
        </div>
      )}
    </div>
  );
}
