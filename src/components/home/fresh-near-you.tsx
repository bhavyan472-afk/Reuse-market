"use client";

import { ArrowRight, Loader2, LocateFixed } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ListingRow, ListingRowSkeleton } from "@/components/listings/listing-grid";
import { useViewerLocation } from "@/components/providers/location-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
import { buildMarketQuery } from "@/lib/search-params";
import { createClient } from "@/lib/supabase/client";
import type { ListingCardData } from "@/lib/types";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; items: ListingCardData[]; widened: boolean }
  | { status: "error"; message: string };

export function FreshNearYou() {
  const { location: viewerLocation, requestLocation, locating, error } = useViewerLocation();
  const hydrated = useHydrated();
  const location = hydrated ? viewerLocation : null;
  const [state, setState] = useState<State>({ status: "idle" });
  const lat = location?.lat;
  const lng = location?.lng;

  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    let cancelled = false;
    const supabase = createClient();
    const run = async () => {
      setState({ status: "loading" });
      const base = { p_lat: lat, p_lng: lng, p_sort: "nearest", p_limit: 4 };
      const near = await supabase.rpc("search_listings", { ...base, p_radius_km: 25 });
      if (cancelled) return;
      if (near.error) {
        setState({ status: "error", message: "Couldn't load nearby listings right now." });
        return;
      }
      if ((near.data ?? []).length > 0) {
        setState({ status: "ready", items: near.data ?? [], widened: false });
        return;
      }
      const any = await supabase.rpc("search_listings", base);
      if (cancelled) return;
      if (any.error) setState({ status: "error", message: "Couldn't load nearby listings right now." });
      else setState({ status: "ready", items: any.data ?? [], widened: true });
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (!location) {
    return (
      <div className="relative overflow-hidden rounded-card border border-border bg-card shadow-soft">
        <div className="grid items-center gap-6 p-5 sm:grid-cols-[1fr_auto] sm:p-8">
          <div className="space-y-3">
            <p className="eyebrow">Near you</p>
            <h2 id="fresh-near-you" className="text-[1.375rem] font-bold sm:text-[1.75rem]">
              What&apos;s for sale in your neighbourhood?
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
              Find deals you can walk or cycle to — pick up today, no shipping. Your location stays in your browser and is
              only used to sort results.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button size="lg" onClick={() => void requestLocation()} disabled={locating} className="mt-1 w-full sm:w-auto">
              {locating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
              Use my location
            </Button>
          </div>
          <NeighbourhoodIllustration className="mx-auto hidden h-40 w-auto sm:block lg:h-48" />
        </div>
      </div>
    );
  }

  const header = (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-3">Near you</p>
        <h2 id="fresh-near-you" className="text-[1.375rem] font-bold sm:text-[1.75rem]">
          Fresh in your neighbourhood
        </h2>
      </div>
      {state.status === "ready" && state.items.length > 0 && (
        <Link
          href={`/marketplace${buildMarketQuery({ lat: location.lat, lng: location.lng, sort: "nearest", radius: state.widened ? null : 25 })}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          See all <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );

  if (state.status === "idle" || state.status === "loading") {
    return (
      <div className="space-y-5">
        {header}
        <ListingRowSkeleton count={4} />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="space-y-5">
        {header}
        <p className="text-sm text-destructive">{state.message}</p>
      </div>
    );
  }
  if (state.items.length === 0) {
    return (
      <div className="space-y-5">
        {header}
        <p className="text-sm text-muted-foreground">No listings yet — be the first to list something nearby.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {header}
      {state.widened && (
        <p className="text-sm text-muted-foreground">Nothing within 25 km yet — here are the closest listings instead.</p>
      )}
      <ListingRow listings={state.items} />
    </div>
  );
}

/** Friendly little neighbourhood: houses, a tree, and a saffron map pin. */
function NeighbourhoodIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" className={className} aria-hidden>
      <circle cx="120" cy="96" r="78" fill="var(--green-tint)" />
      <path d="M30 150h180" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
      <path d="M52 150v-38l22-18 22 18v38z" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" />
      <rect x="67" y="126" width="14" height="24" rx="3" fill="var(--primary)" />
      <path d="M136 150v-48l26-20 26 20v48z" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" />
      <rect x="150" y="112" width="12" height="12" rx="2" fill="var(--saffron)" />
      <rect x="168" y="112" width="12" height="12" rx="2" fill="var(--green-soft)" />
      <rect x="156" y="130" width="14" height="20" rx="3" fill="var(--primary)" />
      <circle cx="112" cy="122" r="14" fill="var(--green-soft)" />
      <path d="M112 136v14" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      <path d="M120 22c-14 0-25 11-25 25 0 19 25 42 25 42s25-23 25-42c0-14-11-25-25-25z" fill="var(--saffron)" />
      <circle cx="120" cy="47" r="9" fill="var(--card)" />
    </svg>
  );
}
