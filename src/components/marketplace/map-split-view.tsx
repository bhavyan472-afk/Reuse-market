"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DistanceLabel } from "@/components/listings/distance-label";
import { ListingsMap } from "@/components/maps/listings-map";
import { conditionLabel } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { ListingCardData } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MapSplitView({ listings, total }: { listings: ListingCardData[]; total: number }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  // Clicking a card: select it and ask the map to fly there.
  const selectFromList = (id: string) => {
    setSelected(id);
    setFocusKey((k) => k + 1);
    // On mobile the map sits above the list — bring it into view.
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Selecting a marker on the map: reveal the matching card in the (desktop) side list.
  useEffect(() => {
    if (!selected || !window.matchMedia("(min-width: 1024px)").matches) return;
    itemRefs.current.get(selected)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selected]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(320px,400px)_1fr]">
      <div className="order-2 lg:order-1">
        <p className="mb-3 text-sm text-muted-foreground">
          {total > listings.length
            ? `Showing ${listings.length} of ${total.toLocaleString("en-IN")} on the map — refine your filters to see more.`
            : `${total.toLocaleString("en-IN")} ${total === 1 ? "listing" : "listings"} on the map`}
        </p>
        <ul className="no-scrollbar space-y-3 lg:max-h-[calc(100dvh-15rem)] lg:overflow-y-auto lg:pr-1">
          {listings.map((l) => {
            const isSelected = selected === l.id;
            return (
              <li
                key={l.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(l.id, el);
                  else itemRefs.current.delete(l.id);
                }}
                className={cn(
                  "rounded-2xl border bg-card transition-all hover:shadow-soft",
                  isSelected ? "border-primary shadow-soft" : hovered === l.id ? "border-primary/50" : "border-border",
                )}
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Show ${l.title} on the map`}
                  onClick={() => selectFromList(l.id)}
                  onMouseEnter={() => setHovered(l.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(l.id)}
                  onBlur={() => setHovered(null)}
                  className="flex w-full gap-3 rounded-2xl p-2.5 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {l.cover_url && <Image src={l.cover_url} alt="" fill sizes="80px" className="object-cover" />}
                    {l.status === "sold" && (
                      <span className="absolute inset-x-0 bottom-0 bg-saffron py-0.5 text-center text-[10px] font-bold text-saffron-foreground">
                        SOLD
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col justify-center gap-0.5">
                    <p className="line-clamp-1 text-sm font-medium">{l.title}</p>
                    <p className="price text-base leading-tight">{formatPrice(l.price)}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{conditionLabel(l.condition)}</span>
                      <DistanceLabel lat={l.lat} lng={l.lng} city={l.city} serverDistanceKm={l.distance_km} />
                    </div>
                  </div>
                </button>
                {isSelected && (
                  <div className="border-t border-border px-3 py-2">
                    <Link
                      href={`/listings/${l.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      View listing <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div ref={mapRef} className="order-1 scroll-mt-20 lg:sticky lg:top-24 lg:order-2 lg:self-start">
        <ListingsMap
          listings={listings}
          highlightedId={hovered}
          selectedId={selected}
          focusKey={focusKey}
          onSelect={setSelected}
          className="h-[55vh] min-h-80 lg:h-[calc(100dvh-12rem)]"
        />
      </div>
    </div>
  );
}
