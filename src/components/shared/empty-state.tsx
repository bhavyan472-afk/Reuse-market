import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Illustration() {
  return (
    <svg viewBox="0 0 200 140" className="h-32 w-auto" aria-hidden>
      <ellipse cx="100" cy="124" rx="70" ry="8" fill="var(--muted)" />
      <rect x="52" y="44" width="96" height="72" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      <path d="M52 62h96" stroke="var(--border)" strokeWidth="2" />
      <path d="M78 44c0-12 10-20 22-20s22 8 22 20" fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="84" cy="86" r="4" fill="var(--emerald)" opacity=".8" />
      <circle cx="116" cy="86" r="4" fill="var(--emerald)" opacity=".8" />
      <path d="M88 100c7 5 17 5 24 0" fill="none" stroke="var(--emerald)" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
      <path d="M158 30l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="var(--gold)" opacity=".7" />
      <path d="M36 48l2.5 5 5 2.5-5 2.5-2.5 5-2.5-5-5-2.5 5-2.5z" fill="var(--gold)" opacity=".5" />
    </svg>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card px-6 py-14 text-center sm:py-20",
        className,
      )}
    >
      <Illustration />
      <div className="max-w-md space-y-2">
        <h2 className="font-serif text-2xl">{title}</h2>
        {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button asChild size="lg" className="mt-2">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
      {children}
    </div>
  );
}
