"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Subtle reveal-on-scroll. Content is rendered visible on the server and only hidden after
 * hydration when it is still below the fold — so it can never stay invisible (no JS, slow
 * connections, crawlers, reduced motion, full-page screenshots).
 */
export function FadeIn({
  children,
  delay = 0,
  className,
  y = 14,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen at load → leave it alone (no flash).
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    setState("hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties | undefined =
    state === "static"
      ? undefined
      : {
          opacity: state === "shown" ? 1 : 0,
          transform: state === "shown" ? "none" : `translateY(${y}px)`,
          transition: `opacity 600ms cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 600ms cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
