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
        variant === "overlay" && "grid size-11 place-items-center [&>span]:grid [&>span]:size-8 [&>span]:place-items-center [&>span]:rounded-full [&>span]:bg-card/95 [&>span]:shadow-soft [&>span]:backdrop-blur-sm hover:[&>span]:bg-card",
        variant === "inline" && "inline-flex h-11 gap-2 border border-border bg-card px-5 text-sm hover:bg-secondary",
        variant === "quiet" && "inline-flex h-10 gap-2 px-3 text-sm text-foreground hover:bg-secondary",
        className,
      )}
    >
      <span className={variant === "overlay" ? undefined : "contents"}>
        <Heart
          className={cn(
            "size-[17px] transition-[color,fill,transform] duration-200",
            saved ? "scale-110 fill-[#E5484D] text-[#E5484D]" : "group-hover/fav:text-[#E5484D]",
          )}
          aria-hidden
        />
      </span>
      {withLabel && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
