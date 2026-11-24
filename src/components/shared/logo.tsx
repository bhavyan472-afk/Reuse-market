import Link from "next/link";
import { cn } from "@/lib/utils";

/** Leaf mark: a rounded green tile with a white leaf. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="10" fill="#1F6F4A" />
      <path d="M9 23c0-8 5.5-13.5 15-14-.4 9.6-6 15-14 15" fill="#FFFFFF" />
      <path d="M9.5 23.5c2.6-4.4 5.8-7.6 9.8-9.8" fill="none" stroke="#1F6F4A" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="24" cy="23" r="2.4" fill="#F2A33A" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        className,
      )}
      aria-label="ReUse Market — home"
    >
      <LogoMark />
      <span className={cn("text-[1.05rem] leading-none font-extrabold tracking-[-0.02em]", compact && "hidden sm:inline")}>
        ReUse<span className="text-primary"> Market</span>
      </span>
    </Link>
  );
}
