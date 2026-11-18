"use client";

import { useMemo } from "react";
import { Marker, Tooltip } from "react-leaflet";
import { BaseMap, pinIcon } from "./base-map";

export default function ListingLocationMapLeaflet({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const icon = useMemo(() => pinIcon(1.15), []);
  return (
    // Scroll-wheel zoom off so the page scrolls normally past the map; zoom buttons and pinch still work.
    <BaseMap center={[lat, lng]} zoom={15} scrollWheelZoom={false}>
      <Marker position={[lat, lng]} icon={icon} title={title} alt={title} keyboard={false}>
        <Tooltip direction="top" offset={[0, -40]}>
          {title}
        </Tooltip>
      </Marker>
    </BaseMap>
  );
}
