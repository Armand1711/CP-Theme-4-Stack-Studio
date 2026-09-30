"use client";

import { useEffect, useRef } from "react";

/*
 * Site-wide interactive background: a fixed grid of faint dots.
 * - Dots near the pointer brighten toward the accent and part around it (feedback).
 * - A click sends a ring of light outward from the click point.
 * - `burstDots(x, y)` sends a bigger, slower ring for rare moments (a sent form).
 * The grid is still when nothing is happening: the rAF loop only runs while the pointer glow is
 * easing or a ring is alive, then draws one final frame and sleeps. Reduced motion: static grid.
 */

const GAP = 28;
const REACH = 150;
const PUSH = 9;
const ACCENT: [number, number, number] = [243, 108, 33];
const BASE: [number, number, number] = [245, 243, 239];
const BURST_EVENT = "dotfield:burst";

type Ring = { x: number; y: number; t: number; speed: number; life: number; width: number };

/** Celebrate at a point on screen (client coordinates). No-op under reduced motion. */
export function burstDots(x: number, y: number) {
  window.dispatchEvent(new CustomEvent(BURST_EVENT, { detail: { x, y } }));
}

export function DotField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: 0, target: 0 };
    const rings: Ring[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      draw(performance.now() / 1000);
    };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const offX = (w % GAP) / 2;
      const offY = (h % GAP) / 2;
      for (let y = offY; y < h; y += GAP) {
        for (let x = offX; x < w; x += GAP) {
          let a = 0.08;
          let mix = 0;
          let dx = 0;
          let dy = 0;

          if (pointer.on > 0.01) {
            const px = x - pointer.x;
            const py = y - pointer.y;
            const d = Math.hypot(px, py);
            if (d < REACH) {
              const f = (1 - d / REACH) ** 2 * pointer.on;
              a += f * 0.75;
              mix = Math.max(mix, f);
              dx += (px / (d || 1)) * PUSH * f;
              dy += (py / (d || 1)) * PUSH * f;
            }
          }
          for (const r of rings) {
            const age = t - r.t;
            const d = Math.hypot(x - r.x, y - r.y);
            const band = Math.max(0, 1 - Math.abs(d - age * r.speed) / r.width) * (1 - age / r.life);
            if (band > 0) {
              a += band * 0.8;
              mix = Math.max(mix, band);
            }
          }

          const r = BASE[0] + (ACCENT[0] - BASE[0]) * mix;
          const g = BASE[1] + (ACCENT[1] - BASE[1]) * mix;
          const b = BASE[2] + (ACCENT[2] - BASE[2]) * mix;
          ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${Math.min(a, 0.95)})`;
          const s = 1.2 + mix * 1.2;
          ctx.fillRect(x + dx - s / 2, y + dy - s / 2, s, s);
        }
      }
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      // Frame-rate independent easing: the lit area glides the same on 60Hz and 120Hz screens.
      const kPos = 1 - Math.exp(-dt * 12);
      const kOn = 1 - Math.exp(-dt * 5);
      pointer.x += (pointer.tx - pointer.x) * kPos;
      pointer.y += (pointer.ty - pointer.y) * kPos;
      pointer.on += (pointer.target - pointer.on) * kOn;
      for (let i = rings.length - 1; i >= 0; i--) if (t - rings[i].t > rings[i].life) rings.splice(i, 1);

      draw(t);

      const easing =
        Math.abs(pointer.target - pointer.on) > 0.005 ||
        (pointer.on > 0.01 && Math.hypot(pointer.tx - pointer.x, pointer.ty - pointer.y) > 0.3);
      raf = easing || rings.length ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => {
      if (raf || reduce) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (pointer.target === 0) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
      pointer.target = 1;
      wake();
    };
    const onLeave = () => {
      pointer.target = 0;
      wake();
    };
    const addRing = (x: number, y: number, big: boolean) => {
      rings.push({ x, y, t: performance.now() / 1000, speed: big ? 700 : 520, life: big ? 2 : 1.4, width: big ? 90 : 46 });
      wake();
    };
    const onDown = (e: PointerEvent) => addRing(e.clientX, e.clientY, false);
    const onBurst = (e: Event) => {
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail;
      addRing(x, y, true);
      // A second, trailing wave reads as a celebration rather than a click.
      setTimeout(() => addRing(x, y, true), 180);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      if (fine) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      }
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener(BURST_EVENT, onBurst);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener(BURST_EVENT, onBurst);
    };
  }, []);

  return <canvas ref={ref} className="dot-field" aria-hidden="true" />;
}
