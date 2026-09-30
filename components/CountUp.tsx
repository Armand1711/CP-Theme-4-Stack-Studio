"use client";

import { useEffect, useRef } from "react";

/**
 * Counts the number inside `value` (e.g. "R30,000") up from zero the first time it scrolls into view,
 * keeping the prefix, suffix and thousands separators. Non-numeric values render as-is.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const match = value.match(/^(\D*)([\d,]+)(.*)$/);
    if (!el || !match || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, digits, post] = match;
    const target = Number(digits.replace(/,/g, ""));
    const fmt = (n: number) => `${pre}${Math.round(n).toLocaleString("en-US")}${post}`;
    let raf = 0;
    el.textContent = fmt(0);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          el.textContent = fmt(target * (1 - Math.pow(1 - p, 4))); // ease-out quart
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value, duration]);

  return (
    <span ref={ref} aria-label={value}>
      {value}
    </span>
  );
}
