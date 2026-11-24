"use client";

import "leaflet.markercluster/dist/MarkerCluster.css";
import L, { type Marker as LeafletMarker, type MarkerClusterGroup as LeafletClusterGroup } from "leaflet";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { DEFAULT_CENTER, conditionLabel } from "@/lib/constants";
import { formatDistance, formatPrice } from "@/lib/format";
import { haversineKm } from "@/lib/geo";
import type { ListingCardData } from "@/lib/types";
import { useViewerLocation } from "@/components/providers/location-provider";
import { BaseMap } from "./base-map";

export type ListingsMapProps = {
  listings: ListingCardData[];
  className?: string;
  /** Listing hovered/focused in a side list — its marker is emphasised. */
  highlightedId?: string | null;
  /** Listing currently selected (popup open). */
  selectedId?: string | null;
  /** Bump this number to fly the map to `selectedId` and open its popup (e.g. after a list click). */
  focusKey?: number;
  onSelect?: (id: string | null) => void;
};

function compactPrice(p: number) {
  if (p === 0) return "Free";
  if (p >= 100000) return `₹${(p / 100000).toFixed(p % 100000 === 0 ? 0 : 1)}L`;
  if (p >= 1000) return `₹${(p / 1000).toFixed(p % 1000 === 0 ? 0 : 1)}k`;
  return `₹${p}`;
}

function priceIcon(listing: ListingCardData, active: boolean) {
  const tone = active
    ? "background:#1F6F4A;color:#FFFFFF;border-color:#1F6F4A;transform:translate(-50%,calc(-100% - 6px)) scale(1.1);"
    : "background:#FFFFFF;color:#1C1C1C;border-color:#ECE8E1;transform:translate(-50%,calc(-100% - 6px));";
  const sold = listing.status === "sold" ? "opacity:.6;text-decoration:line-through;" : "";
  const tail = active ? "#1F6F4A" : "#FFFFFF";
  const tailBorder = active ? "#1F6F4A" : "#ECE8E1";
  return L.divIcon({
    className: "reuse-price-marker",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -34],
    html: `<div class="reuse-price-pill" style="${tone}${sold}">${compactPrice(listing.price)}<span style="background:${tail};border-color:${tailBorder}"></span></div>`,
  });
}

function clusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 40 : count < 50 ? 48 : 56;
  return L.divIcon({
    className: "reuse-cluster-marker",
    iconSize: [size, size],
    html: `<div aria-label="${count} listings" style="width:${size}px;height:${size}px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:#1F6F4A;color:#FFFFFF;font:700 13px/1 var(--font-sans);box-shadow:0 0 0 4px rgba(242,163,58,.45),0 8px 20px -6px rgba(0,0,0,.4);">${count}</div>`,
  });
}

export default function ListingsMapLeaflet({
  listings,
  highlightedId = null,
  selectedId = null,
  focusKey = 0,
  onSelect,
}: ListingsMapProps) {
  const markers = useRef(new Map<string, LeafletMarker>());
  const clusterRef = useRef<LeafletClusterGroup>(null);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  return (
    <BaseMap center={DEFAULT_CENTER} zoom={4}>
      <MarkerClusterGroup
        ref={clusterRef}
        chunkedLoading
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
        maxClusterRadius={50}
        iconCreateFunction={clusterIcon}
      >
        {listings.map((l) => (
          <PriceMarker
            key={l.id}
            listing={l}
            active={l.id === highlightedId || l.id === selectedId}
            registerMarker={(m) => {
              if (m) markers.current.set(l.id, m);
              else markers.current.delete(l.id);
            }}
            onOpen={() => onSelect?.(l.id)}
            onClose={() => {
              // Defer until Leaflet has finished removing the popup, then clear the selection — but only if
              // this popup is still the selected one (opening another popup closes this one first).
              window.setTimeout(() => {
                if (selectedRef.current === l.id) onSelect?.(null);
              }, 0);
            }}
          />
        ))}
      </MarkerClusterGroup>
      <FitBounds listings={listings} />
      <FocusSelected listings={listings} selectedId={selectedId} focusKey={focusKey} markers={markers} clusterRef={clusterRef} />
    </BaseMap>
  );
}

function PriceMarker({
  listing,
  active,
  registerMarker,
  onOpen,
  onClose,
}: {
  listing: ListingCardData;
  active: boolean;
  registerMarker: (m: LeafletMarker | null) => void;
  onOpen: () => void;
  onClose: () => void;
}) {
  const icon = useMemo(() => priceIcon(listing, active), [listing, active]);
  // Stable reference: react-leaflet calls setLatLng whenever `position` changes identity, and the cluster
  // plugin treats that as a move and re-opens the marker's popup — which made popups impossible to close.
  const position = useMemo<[number, number]>(() => [listing.lat, listing.lng], [listing.lat, listing.lng]);
  return (
    <Marker
      ref={registerMarker}
      position={position}
      icon={icon}
      title={`${listing.title} — ${formatPrice(listing.price)}`}
      alt={listing.title}
      zIndexOffset={active ? 1000 : 0}
      eventHandlers={{ popupopen: onOpen, popupclose: onClose }}
    >
      <Popup className="reuse-popup" closeButton={false} maxWidth={260} minWidth={240} autoPanPadding={[24, 24]}>
        <MiniCard listing={listing} />
      </Popup>
    </Marker>
  );
}

/** Refit the view whenever the result set changes. */
function FitBounds({ listings }: { listings: ListingCardData[] }) {
  const map = useMap();
  const key = listings.map((l) => l.id).join(",");
  useEffect(() => {
    if (listings.length === 0) return;
    if (listings.length === 1) {
      map.setView([listings[0].lat, listings[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refit only when the result set changes
  }, [map, key]);
  return null;
}

/** On an explicit selection from the list, move the map to the listing and open its popup. */
function FocusSelected({
  listings,
  selectedId,
  focusKey,
  markers,
  clusterRef,
}: {
  listings: ListingCardData[];
  selectedId: string | null;
  focusKey: number;
  markers: RefObject<Map<string, LeafletMarker>>;
  clusterRef: RefObject<LeafletClusterGroup | null>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!focusKey || !selectedId) return;
    const listing = listings.find((l) => l.id === selectedId);
    if (!listing) return;
    const marker = markers.current.get(selectedId);
    const target = L.latLng(listing.lat, listing.lng);
    const zoom = Math.max(map.getZoom(), 15);

    const reveal = () => {
      if (!marker) return;
      const group = clusterRef.current;
      // If the marker is still inside a cluster, zoom/spiderfy until it is visible, then open it.
      if (group) group.zoomToShowLayer(marker, () => marker.openPopup());
      else marker.openPopup();
    };

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    map.closePopup();
    map.once("moveend", reveal);
    if (reduceMotion) map.setView(target, zoom, { animate: false });
    else map.flyTo(target, zoom, { duration: 0.8 });
    return () => {
      map.off("moveend", reveal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when a new focus is requested
  }, [focusKey]);
  return null;
}

function MiniCard({ listing }: { listing: ListingCardData }) {
  const map = useMap();
  const { location } = useViewerLocation();
  const dist =
    listing.distance_km ?? (location ? haversineKm(location, { lat: listing.lat, lng: listing.lng }) : null);
  return (
    <div className="w-[240px] overflow-hidden rounded-xl bg-[#FFFFFF] font-sans text-[#1C1C1C]">
      <div className="relative aspect-[4/3] bg-[#F3F0EA]">
        {listing.cover_url && (
          <Image src={listing.cover_url} alt={listing.title} fill sizes="240px" className="object-cover" />
        )}
        <button
          type="button"
          onClick={() => map.closePopup()}
          aria-label="Close"
          className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/90 text-sm shadow"
        >
          ×
        </button>
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm leading-snug font-medium">{listing.title}</p>
        <p className="price text-lg">{formatPrice(listing.price)}</p>
        <p className="text-xs text-[#6B6B6B]">
          {conditionLabel(listing.condition)} · {formatDistance(dist) ?? listing.city}
        </p>
        <Link
          href={`/listings/${listing.id}`}
          className="mt-2 inline-flex h-8 w-full items-center justify-center rounded-full bg-[#1F6F4A] text-xs font-medium !text-[#FFFFFF] hover:bg-[#1F6F4A]/90"
        >
          View listing
        </Link>
      </div>
    </div>
  );
}
