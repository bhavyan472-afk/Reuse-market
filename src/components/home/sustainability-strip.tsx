import { IndianRupee, Leaf, PackageCheck, Recycle } from "lucide-react";
import { CountUp } from "@/components/shared/count-up";
import { FadeIn } from "@/components/shared/fade-in";

/**
 * Impact band (light green). Stats whose value is 0 are hidden so a "0" never shows;
 * the rest count up from ~40% of their value when scrolled into view.
 * CO₂ is a community estimate (~48 kg CO₂e avoided per item reused instead of bought new).
 */
export function SustainabilityStrip({ activeListings, soldListings }: { activeListings: number; soldListings: number }) {
  const reused = Math.max(soldListings, 0);
  const kg = (activeListings + reused) * 48;
  const co2 = kg >= 1000 ? { value: Math.round(kg / 1000), suffix: " t" } : { value: kg, suffix: " kg" };

  const stats = [
    { icon: PackageCheck, value: activeListings, prefix: "", suffix: "", label: "items listed" },
    { icon: Recycle, value: reused, prefix: "", suffix: "", label: "items re-homed" },
    { icon: Leaf, value: co2.value, prefix: "~", suffix: co2.suffix, label: "CO₂ saved*" },
  ].filter((s) => s.value > 0);

  return (
    <section aria-labelledby="impact-heading" className="rounded-card bg-green-tint px-5 py-8 sm:px-10 sm:py-10">
      <FadeIn className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="impact-heading" className="text-[1.375rem] font-bold text-primary sm:text-[1.75rem]">
          Every resale keeps good stuff in use
        </h2>
        <p className="text-sm text-accent-foreground/80">Our community&apos;s impact so far</p>
      </FadeIn>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.05} className="rounded-2xl bg-card p-4 shadow-soft sm:p-5">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
              <s.icon className="size-4 text-primary" aria-hidden /> {s.label}
            </dt>
            <dd className="mt-2">
              <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} className="numeral block text-[1.75rem] text-foreground sm:text-[2.25rem]" />
            </dd>
          </FadeIn>
        ))}
        <FadeIn delay={stats.length * 0.05} className="rounded-2xl bg-card p-4 shadow-soft sm:p-5">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
            <IndianRupee className="size-4 text-primary" aria-hidden /> commission, ever
          </dt>
          <dd className="numeral mt-2 text-[1.75rem] text-foreground sm:text-[2.25rem]">₹0</dd>
        </FadeIn>
      </dl>
      <p className="mt-4 text-xs text-accent-foreground/80">
        *Community estimate: roughly 48 kg CO₂e avoided per item reused instead of bought new.
      </p>
    </section>
  );
}
