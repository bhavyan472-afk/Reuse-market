"use client";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Subtle fade + slide-up on scroll (Framer Motion, 260ms).
 * Content renders visible on the server and is only hidden after hydration when it is
 * still below the fold — so it can never get stuck invisible (no JS, slow networks,
 * crawlers, reduced motion, full-page screenshots), and it never delays LCP.
 */
export function FadeIn({
  children,
  delay = 0,
  className,
  y = 12,
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
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already on screen
    setState("hidden");
    let raf = 0;
    const reveal = () => {
      setState("shown");
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && reveal(), { rootMargin: "0px 0px -6% 0px" });
    // Fallback: IntersectionObserver never fires if a fast fling / End key jumps the element from below the
    // viewport to above it in one frame — so also reveal anything that is at or above the viewport.
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.94) reveal();
      });
    };
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        ref={ref}
        className={className}
        initial={false}
        animate={state === "hidden" ? { opacity: 0, y } : { opacity: 1, y: 0 }}
        transition={
          state === "hidden" ? { duration: 0 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1], delay: Math.min(delay, 0.24) }
        }
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
