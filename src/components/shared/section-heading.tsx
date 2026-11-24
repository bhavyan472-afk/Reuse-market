import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FadeIn } from "./fade-in";

/** Section heading: bold sans title, optional subline, optional "See all" link. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; href: string };
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <FadeIn
      className={cn(
        "flex items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      <div className={cn("min-w-0 max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 id={id} className="text-[1.375rem] leading-tight font-bold sm:text-[1.75rem]">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-sm text-muted-foreground sm:text-[0.95rem]">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1 rounded-full px-1 py-1 text-sm font-semibold text-primary outline-none hover:text-primary-hover focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </FadeIn>
  );
}

/** Highlighted word inside a heading (green). */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-primary">{children}</span>;
}
