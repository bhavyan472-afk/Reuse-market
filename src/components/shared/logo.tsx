import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="8" fill="#1E3A2F" />
      <path
        d="M10.5 20.5c0-4.7 3.3-8.5 8.6-9.5-.6 1.7-.6 3.3.1 4.6 1-.9 2.1-1.4 3.3-1.6-.6 4.8-4.3 8-8.9 8-1.1 0-2.1-.2-3.1-.6"
        fill="none"
        stroke="#A8834A"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10.5" cy="21" r="1.4" fill="#F5F0E6" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5 rounded-full", className)} aria-label="ReUse Market — home">
      <LogoMark />
      <span className="font-serif text-[1.55rem] leading-none font-medium tracking-[-0.01em]">
        ReUse<span className="text-gold">.</span>
        <span className="ml-1.5 hidden font-normal text-muted-foreground italic sm:inline">Market</span>
      </span>
    </Link>
  );
}
