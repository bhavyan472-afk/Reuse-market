import { Camera, Handshake, MessagesSquare } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";

const STEPS = [
  {
    icon: Camera,
    title: "List",
    body: "Snap up to six photos, set a fair price in rupees and drop a pin where you'd like to meet. It takes about two minutes.",
  },
  {
    icon: MessagesSquare,
    title: "Connect",
    body: "Buyers message you in-app, or call and WhatsApp if you choose to share your number. No middlemen, no commission.",
  },
  {
    icon: Handshake,
    title: "Meet & Exchange",
    body: "Meet somewhere public — a campus gate, a café, a metro station. Inspect the item, pay in person, and give it a second life.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="grid scroll-mt-28 gap-12 lg:grid-cols-12 lg:gap-10">
      {/* Left: heading column (sticky on desktop) */}
      <FadeIn className="lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          <p className="eyebrow">How it works</p>
          <h2 id="how-heading" className="mt-5 font-serif text-[2.6rem] leading-[1] sm:text-[3.6rem]">
            Three quiet <em className="font-normal text-gold-text italic">steps.</em>
          </h2>
          <p className="mt-6 max-w-sm text-muted-foreground">
            No middlemen and no commission — just neighbours passing on good things, the old-fashioned way.
          </p>
        </div>
      </FadeIn>

      {/* Right: ruled steps with large italic numerals */}
      <ol className="border-b border-border lg:col-span-8">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <FadeIn delay={i * 0.1} className="grid grid-cols-[4.5rem_1fr] gap-5 border-t border-border py-9 sm:grid-cols-[7.5rem_1fr] sm:gap-8 sm:py-11">
              <span className="numeral text-[3.6rem] text-gold sm:text-[6rem]" aria-hidden>
                0{i + 1}
              </span>
              <div className="pt-1 sm:pt-3">
                <div className="flex items-center gap-3">
                  <step.icon className="size-[18px] text-gold-text" strokeWidth={1.5} aria-hidden />
                  <h3 className="font-serif text-[1.9rem] leading-none sm:text-[2.2rem]">{step.title}</h3>
                </div>
                <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </FadeIn>
          </li>
        ))}
      </ol>
    </section>
  );
}
