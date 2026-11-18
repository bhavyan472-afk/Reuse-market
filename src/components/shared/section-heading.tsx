import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FadeIn } from "./fade-in";

/** Editorial section heading: ruled eyebrow, large serif title, optional underlined "view all" link. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  action,
  align = "left",
  className,
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  action?: { label: string; href: string };
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <FadeIn
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-4 font-serif text-[2.4rem] leading-[1.02] sm:text-[3.4rem]">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="link-underline inline-flex shrink-0 items-center gap-2 pb-1 text-[0.72rem] font-semibold tracking-[0.18em] uppercase outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          {action.label} <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      )}
    </FadeIn>
  );
}

/** Italic gold accent word inside a serif heading. */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="font-normal text-gold-text italic">{children}</em>;
}
