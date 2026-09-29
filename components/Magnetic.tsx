"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pulls its child a little toward the pointer when the pointer comes within `radius` px, then lets it
 * settle back with a critically damped follow. Mouse only; static under reduced motion.
 */
export function Magnetic({ children, strength = 0.22, radius = 90 }: { children: ReactNode; strength?: number; radius?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const k = 1 - Math.exp(-Math.min((now - last) / 1000, 0.05) * 12);
      last = now;
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      el.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.05 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const edge = Math.hypot(Math.max(Math.abs(dx) - r.width / 2, 0), Math.max(Math.abs(dy) - r.height / 2, 0));
      const pull = edge < radius ? 1 - edge / radius : 0;
      target.x = dx * strength * pull;
      target.y = dy * strength * pull;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [strength, radius]);

  return (
    <span ref={ref} style={{ display: "inline-block" }}>
      {children}
    </span>
  );
}
