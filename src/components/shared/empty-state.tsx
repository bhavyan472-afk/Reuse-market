import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Illustration() {
  return (
    <svg viewBox="0 0 200 140" className="h-28 w-auto" aria-hidden>
      <ellipse cx="100" cy="126" rx="66" ry="7" fill="var(--muted)" />
      <rect x="56" y="48" width="88" height="70" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      <path d="M80 48c0-11 9-19 20-19s20 8 20 19" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="86" cy="84" r="4" fill="var(--primary)" />
      <circle cx="114" cy="84" r="4" fill="var(--primary)" />
      <path d="M90 98c6 5 14 5 20 0" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      <path d="M150 26c8 0 14 6 14 14-8 0-14-6-14-14z" fill="var(--green-soft)" />
      <circle cx="40" cy="52" r="5" fill="var(--saffron)" opacity=".8" />
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
        "flex flex-col items-center justify-center gap-4 rounded-card border border-border bg-card px-6 py-12 shadow-soft text-center sm:py-20",
        className,
      )}
    >
      <Illustration />
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-bold">{title}</h2>
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
