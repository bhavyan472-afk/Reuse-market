import { CountUp } from "@/components/shared/count-up";
import { FadeIn } from "@/components/shared/fade-in";

/**
 * Indicative figures per item reused instead of bought new (sources: typical lifecycle assessments
 * for laptops, phones and furniture). Shown as community estimates, not audited numbers.
 */
export function SustainabilityStrip({ activeListings, soldListings }: { activeListings: number; soldListings: number }) {
  const reused = Math.max(soldListings, 0);
  const tonnes = Math.max(1, Math.round(((activeListings + reused) * 48) / 1000));
  const stats = [
    { value: activeListings, prefix: "", suffix: "", label: "items looking for a second home" },
    { value: reused, prefix: "", suffix: "", label: "items already re-homed" },
    { value: tonnes, prefix: "~", suffix: " t", label: "CO₂e kept out of the atmosphere*" },
    { value: 0, prefix: "₹", suffix: "", label: "commission, ever" },
  ];
  return (
    <section
      aria-labelledby="impact-heading"
      className="relative overflow-hidden rounded-[4px] bg-forest-deep text-[#F5F0E6] [background-image:var(--grain)]"
    >
      <div className="relative grid gap-12 px-6 py-16 sm:px-12 sm:py-20 lg:grid-cols-12 lg:gap-10 lg:px-16 lg:py-24">
        <FadeIn className="lg:col-span-4">
          <p className="eyebrow text-[#D4B57E]">Circular by design</p>
          <h2 id="impact-heading" className="mt-5 font-serif text-[2.5rem] leading-[1.02] sm:text-[3.4rem]">
            Every resale is a small act of <em className="font-normal text-[#D4B57E] italic">care.</em>
          </h2>
        </FadeIn>
        <dl className="grid grid-cols-2 border-t border-l border-white/15 lg:col-span-8">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08} className="border-r border-b border-white/15 p-5 sm:p-8">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <CountUp
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  className="numeral block text-[3.4rem] text-[#C9A66B] sm:text-[5.2rem]"
                />
                <span className="mt-3 block text-[0.7rem] leading-snug font-semibold tracking-[0.16em] text-white/70 uppercase">
                  {s.label}
                </span>
              </dd>
            </FadeIn>
          ))}
        </dl>
        <p className="text-[0.7rem] text-white/55 lg:col-span-12">
          *Community estimate: roughly 48 kg CO₂e avoided per item reused instead of bought new.
        </p>
      </div>
    </section>
  );
}
