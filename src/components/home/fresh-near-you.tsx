"use client";

import { ArrowRight, Loader2, LocateFixed } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingGridSkeleton } from "@/components/listings/listing-grid";
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
      <div className="flex flex-col items-start gap-5 rounded-3xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <p className="font-serif text-2xl">See what&apos;s around you</p>
          <p className="max-w-lg text-sm text-muted-foreground">
            Share your location to discover listings within walking or cycling distance. We only use it in your browser
            to sort results — it&apos;s never stored on our servers.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button size="lg" onClick={() => void requestLocation()} disabled={locating}>
          {locating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
          Use my location
        </Button>
      </div>
    );
  }

  if (state.status === "idle" || state.status === "loading") return <ListingGridSkeleton count={4} />;
  if (state.status === "error") return <p className="text-sm text-destructive">{state.message}</p>;
  if (state.items.length === 0) {
    return <p className="text-sm text-muted-foreground">No listings yet — be the first to list something nearby.</p>;
  }

  return (
    <div className="space-y-5">
      {state.widened && (
        <p className="text-sm text-muted-foreground">Nothing within 25 km yet — here are the closest listings instead.</p>
      )}
      <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {state.items.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
      <Link
        href={`/marketplace${buildMarketQuery({ lat: location.lat, lng: location.lng, sort: "nearest", radius: state.widened ? null : 25 })}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        See everything nearby <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
