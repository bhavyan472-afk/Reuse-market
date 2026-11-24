import { cn } from "@/lib/utils";

/** "Sold" state: a soft veil and a centred pill. */
export function SoldRibbon({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-10 grid place-items-center", className)} aria-hidden>
      <div className="absolute inset-0 bg-black/30" />
      <span
        className={cn(
          "relative rounded-full bg-card font-bold text-foreground shadow-soft",
          size === "lg" ? "px-5 py-2 text-sm" : "px-3 py-1 text-xs",
        )}
      >
        Sold
      </span>
    </div>
  );
}
