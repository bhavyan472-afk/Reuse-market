"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/providers/favorites-provider";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  listingId,
  className,
  variant = "overlay",
}: {
  listingId: string;
  className?: string;
  /** overlay: round icon on a photo · inline: bordered pill with label · quiet: borderless text action */
  variant?: "overlay" | "inline" | "quiet";
}) {
  const { isSaved, toggle, pending } = useFavorites();
  const saved = isSaved(listingId);
  const withLabel = variant !== "overlay";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved items" : "Save item"}
      disabled={pending(listingId)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(listingId);
      }}
      className={cn(
        "group/fav items-center justify-center rounded-full font-semibold transition-[background-color,color,transform] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-95 disabled:opacity-70",
        variant === "overlay" && "grid size-9 bg-card/92 text-foreground backdrop-blur-sm hover:bg-card",
        variant === "inline" && "inline-flex h-10 gap-2 border border-border bg-card px-4 text-sm hover:bg-secondary/60",
        variant === "quiet" && "inline-flex h-10 gap-2 px-3 text-sm text-foreground hover:bg-secondary",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-[18px] transition-[color,fill,transform] duration-200",
          saved ? "scale-110 fill-[#B4532A] text-[#B4532A]" : "group-hover/fav:text-[#B4532A]",
        )}
        aria-hidden
      />
      {withLabel && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
