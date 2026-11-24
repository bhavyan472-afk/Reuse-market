import { Ban, Search, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const SAFETY_TIPS = [
  { icon: Users, title: "Meet in public", body: "Campus gates, cafés and metro stations are ideal. Bring a friend if you like." },
  { icon: Search, title: "Inspect before paying", body: "Switch it on, check the charger, flip through the pages — then pay." },
  { icon: Ban, title: "Never pay in advance", body: "No deposits, no “courier charges”, and never share OTPs or UPI PINs." },
];

/** Safety tips strip — homepage (wide) and product page (compact). */
export function SafetyTips({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <section
      aria-labelledby={compact ? "safety-compact" : "safety-heading"}
      className={cn("rounded-card border border-border bg-card", compact ? "p-4" : "p-5 shadow-soft sm:p-6", className)}
    >
      <h2
        id={compact ? "safety-compact" : "safety-heading"}
        className={cn("flex items-center gap-2 font-bold", compact ? "text-sm" : "text-lg")}
      >
        <ShieldCheck className="size-5 text-primary" aria-hidden /> Stay safe while you deal
      </h2>
      <ul className={cn("mt-3 grid gap-3", !compact && "sm:mt-4 md:grid-cols-3 md:gap-5")}>
        {SAFETY_TIPS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-saffron-tint text-saffron-ink">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="text-sm">
              <p className="font-semibold">{title}</p>
              <p className="text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
