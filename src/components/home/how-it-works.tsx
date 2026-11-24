import { Camera, ChevronRight, Handshake, MessagesSquare } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";

const STEPS = [
  {
    icon: Camera,
    title: "List",
    body: "Snap a few photos, set a fair price in rupees and pick a meeting spot. Takes about two minutes — and it's free.",
  },
  {
    icon: MessagesSquare,
    title: "Chat",
    body: "Buyers message you in the app, or on WhatsApp if you share your number. Agree on a price and a time.",
  },
  {
    icon: Handshake,
    title: "Meet & pay",
    body: "Meet somewhere public — a campus gate, café or metro station. Check the item, then pay in person by UPI or cash.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-24 space-y-6">
      <SectionHeading id="how-heading" title="How it works" description="Three simple steps. No middlemen, no commission." />
      <ol className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="relative">
            <FadeIn delay={i * 0.06} className="h-full">
              <div className="flex h-full gap-4 rounded-card border border-border bg-card p-5 shadow-soft md:flex-col md:p-6">
                <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-green-tint text-primary">
                  <step.icon className="size-6" strokeWidth={1.75} aria-hidden />
                  <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-saffron text-[0.7rem] font-bold text-saffron-foreground">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </div>
            </FadeIn>
            {i < STEPS.length - 1 && (
              <ChevronRight
                className="absolute top-1/2 -right-3.5 z-10 hidden size-5 -translate-y-1/2 text-muted-foreground md:block"
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
