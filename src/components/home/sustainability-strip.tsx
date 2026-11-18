import { FadeIn } from "@/components/shared/fade-in";

/**
 * Indicative figures per item reused instead of bought new (sources: typical lifecycle assessments
 * for laptops, phones and furniture). Shown as community estimates, not audited numbers.
 */
export function SustainabilityStrip({ activeListings, soldListings }: { activeListings: number; soldListings: number }) {
  const reused = Math.max(soldListings, 0);
  const stats = [
    { value: activeListings.toLocaleString("en-IN"), label: "items looking for a second home" },
    { value: reused.toLocaleString("en-IN"), label: "items already re-homed" },
    { value: `~${Math.max(1, Math.round(((activeListings + reused) * 48) / 1000)).toLocaleString("en-IN")} t`, label: "CO₂e kept out of the atmosphere*" },
    { value: "₹0", label: "commission, ever" },
  ];
  return (
    <section aria-label="Sustainability impact" className="relative overflow-hidden rounded-3xl bg-forest-deep text-white">
      <div className="relative grid gap-10 px-8 py-12 sm:px-12 lg:grid-cols-[1fr_2fr] lg:items-center lg:py-16">
        <FadeIn>
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-gold uppercase">Circular by design</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">Every resale is a small act of care.</h2>
        </FadeIn>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:border-l lg:border-white/15 lg:pl-10">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.06}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-serif text-3xl sm:text-4xl">{s.value}</span>
                <span className="mt-1.5 block text-xs leading-snug text-white/70">{s.label}</span>
              </dd>
            </FadeIn>
          ))}
        </dl>
        <p className="text-[0.7rem] text-white/55 lg:col-span-2">
          *Community estimate: roughly 48 kg CO₂e avoided per item reused instead of bought new.
        </p>
      </div>
    </section>
  );
}
