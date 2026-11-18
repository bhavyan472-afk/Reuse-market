"use client";

import { Loader2, MapPinOff } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Static fallback shown when a map can't be rendered. Safe to render on the server. */
export function MapUnavailable({
  reason = "failed",
  className,
  compact = false,
  onRetry,
}: {
  reason?: "failed" | "tiles";
  className?: string;
  compact?: boolean;
  onRetry?: () => void;
}) {
  const messages = {
    failed: {
      title: "Map failed to load",
      body: "Something went wrong while loading the map. Refresh the page to try again.",
    },
    tiles: {
      title: "Map tiles couldn't load",
      body: "We couldn't reach the map server. Check your connection and try again.",
    },
  }[reason];

  return (
    <div
      role="status"
      className={cn(
        "flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/50 p-6 text-center",
        className,
      )}
    >
      <MapPinOff className="size-6 text-muted-foreground" aria-hidden />
      <p className="font-medium">{messages.title}</p>
      {!compact && <p className="max-w-sm text-sm text-muted-foreground">{messages.body}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/** Placeholder shown while the (client-only) Leaflet bundle or the first tiles are loading. */
export function MapLoading({ className, overlay = false }: { className?: string; overlay?: boolean }) {
  return (
    <div
      role="status"
      aria-label="Loading map"
      className={cn(
        "flex items-center justify-center bg-muted/70",
        overlay ? "pointer-events-none absolute inset-0 z-[500]" : "size-full min-h-40 animate-pulse",
        className,
      )}
    >
      <div className="flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Loading map…
      </div>
    </div>
  );
}

/** Catches failures loading or rendering a map (e.g. chunk load error) so the rest of the page keeps working. */
export class MapErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[map] failed to render", error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        this.props.fallback ?? <MapUnavailable onRetry={() => this.setState({ failed: false })} className="rounded-none border-0" />
      );
    }
    return this.props.children;
  }
}
