import { cn } from "@/lib/utils";

/** Quiet "Sold" state: a soft veil and a centred label, instead of a loud diagonal ribbon. */
export function SoldRibbon({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-10 grid place-items-center", className)} aria-hidden>
      <div className="absolute inset-0 bg-ink/30" />
      <span
        className={cn(
          "relative rounded-full bg-card/95 font-semibold tracking-[0.28em] text-foreground uppercase",
          size === "lg" ? "px-5 py-2 text-sm" : "px-3.5 py-1.5 text-[0.65rem]",
        )}
      >
        Sold
      </span>
    </div>
  );
}
