"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

type TiltState = { x: number; y: number; tx: number; ty: number };
const MAX_TILT = 5;

/**
 * Feeds the pointer position to the hovered `.spot` child as --mx/--my (cursor-lit glow), and with
 * `tilt` also leans that card toward the pointer in 3D, easing back when the pointer leaves.
 */
export function Spotlight({ className, children, tilt = false }: { className?: string; children: ReactNode; tilt?: boolean }) {
  const states = useRef(new Map<HTMLElement, TiltState>());
  const current = useRef<HTMLElement | null>(null);
  const raf = useRef(0);
  const last = useRef(0);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current = tilt && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => cancelAnimationFrame(raf.current);
  }, [tilt]);

  const tick = (now: number) => {
    const k = 1 - Math.exp(-Math.min((now - last.current) / 1000, 0.05) * 9);
    last.current = now;
    let busy = false;
    for (const [el, s] of states.current) {
      s.x += (s.tx - s.x) * k;
      s.y += (s.ty - s.y) * k;
      const done = Math.abs(s.tx - s.x) < 0.01 && Math.abs(s.ty - s.y) < 0.01;
      if (done && s.tx === 0 && s.ty === 0) {
        el.style.transform = "";
        states.current.delete(el);
        continue;
      }
      el.style.transform = `perspective(1100px) rotateX(${s.y}deg) rotateY(${s.x}deg)`;
      if (!done) busy = true;
    }
    raf.current = busy ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => {
    if (raf.current) return;
    last.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };
  const release = (el: HTMLElement | null) => {
    const s = el && states.current.get(el);
    if (!s) return;
    s.tx = 0;
    s.ty = 0;
    wake();
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const cell = (e.target as HTMLElement).closest<HTMLElement>(".spot");
    if (cell !== current.current) {
      release(current.current);
      current.current = cell;
    }
    if (!cell) return;
    const r = cell.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    cell.style.setProperty("--mx", `${px}px`);
    cell.style.setProperty("--my", `${py}px`);
    if (!enabled.current || !cell.classList.contains("is-in")) return;
    let s = states.current.get(cell);
    if (!s) {
      s = { x: 0, y: 0, tx: 0, ty: 0 };
      states.current.set(cell, s);
      cell.style.transition = "border-color 300ms ease"; // per-frame transforms must not be smoothed twice
    }
    s.tx = (px / r.width - 0.5) * 2 * MAX_TILT;
    s.ty = -(py / r.height - 0.5) * 2 * MAX_TILT;
    wake();
  };
  const onLeave = () => {
    release(current.current);
    current.current = null;
  };

  return (
    <div className={className} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}
