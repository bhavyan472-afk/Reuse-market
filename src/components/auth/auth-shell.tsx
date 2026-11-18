import Image from "next/image";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/shared/logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="container-page grid min-h-[calc(100dvh-4rem)] items-center gap-12 py-10 lg:grid-cols-2 lg:gap-20">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 space-y-3">
          <LogoMark className="size-10" />
          <h1 className="display pt-3 text-[2.4rem] sm:text-5xl">{title}</h1>
          {subtitle && <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">{children}</div>
      </div>
      <div className="relative hidden h-[min(680px,calc(100dvh-8rem))] min-h-[520px] overflow-hidden rounded-3xl lg:block">
        <Image
          src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80"
          alt="A shelf of well-loved books"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/25 to-transparent" />
        <blockquote className="absolute inset-x-10 bottom-10 text-ivory">
          <p className="font-serif text-[1.9rem] leading-snug text-balance text-white">“Sold my first-year textbooks in a day — to a junior in the next hostel.”</p>
          <footer className="mt-4 text-sm text-white/70">— A ReUse Market seller, Pune</footer>
        </blockquote>
      </div>
    </div>
  );
}

export function FormField({
  id,
  label,
  error,
  children,
  aside,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
