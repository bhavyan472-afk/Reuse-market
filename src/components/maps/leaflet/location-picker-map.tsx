"use client";

import type { Marker as LeafletMarker } from "leaflet";
import { useEffect, useMemo } from "react";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import { DEFAULT_CENTER } from "@/lib/constants";
import type { LatLng } from "@/lib/geo";
import { BaseMap, pinIcon } from "./base-map";

export type LocationPickerMapProps = { position: LatLng | null; onPick: (pos: LatLng) => void };

export default function LocationPickerMap({ position, onPick }: LocationPickerMapProps) {
  const icon = useMemo(() => pinIcon(1.1), []);
  return (
    <BaseMap center={position ?? DEFAULT_CENTER} zoom={position ? 15 : 4} scrollWheelZoom={false}>
      <ClickToPick onPick={onPick} />
      {position && (
        <Marker
          position={position}
          icon={icon}
          draggable
          autoPan
          title="Drag to adjust the meeting point"
          alt="Meeting point"
          eventHandlers={{
            dragend: (e) => {
              const ll = (e.target as LeafletMarker).getLatLng();
              onPick({ lat: ll.lat, lng: ll.lng });
            },
          }}
        />
      )}
      <PanTo position={position} />
    </BaseMap>
  );
}

function ClickToPick({ onPick }: { onPick: (pos: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function PanTo({ position }: { position: LatLng | null }) {
  const map = useMap();
  const lat = position?.lat;
  const lng = position?.lng;
  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    map.setView([lat, lng], Math.max(map.getZoom(), 15));
  }, [map, lat, lng]);
  return null;
}
