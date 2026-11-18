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
    <section id="how-it-works" className="scroll-mt-24">
      <FadeIn className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 font-serif text-3xl sm:text-5xl">Three quiet steps.</h2>
      </FadeIn>
      <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <FadeIn delay={i * 0.08} className="relative h-full border-t border-foreground/80 pt-7 md:pr-6">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-full bg-sage-soft text-brand">
                  <step.icon className="size-[18px]" aria-hidden />
                </span>
                <span className="font-serif text-4xl text-gold" aria-hidden>
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-6 font-serif text-2xl">{step.title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </FadeIn>
          </li>
        ))}
      </ol>
    </section>
  );
}
