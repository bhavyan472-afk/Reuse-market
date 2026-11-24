"use client";

import { useEffect, useRef, useState } from "react";

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

/**
 * Number that counts up when it scrolls into view.
 * - Never displays "0": the animation starts from ~40% of the final value, and callers
 *   hide stats whose value is 0 (see ImpactBand).
 * - Server/no-JS render shows the final value (no layout shift; crawlers see real numbers).
 * - Reduced motion → no animation. Screen readers always get the final value.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 900,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(fmt(value));

  useEffect(() => {
    const el = ref.current;
    if (!el || value < 10 || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already visible: leave it
    const from = Math.max(1, Math.round(value * 0.4));
    setDisplay(fmt(from));
    let raf = 0;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(fmt(from + (value - from) * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && start(), { rootMargin: "0px 0px -10% 0px" });
    // Fallback for scroll jumps that skip past the element (IntersectionObserver would never fire).
    const onScroll = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) start();
    };
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden>
        {prefix}
        {display}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {fmt(value)}
        {suffix}
      </span>
    </span>
  );
}
