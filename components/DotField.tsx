"use client";

import { useEffect, useRef } from "react";

/*
 * Site-wide interactive background: a fixed grid of faint dots.
 * - A slow diagonal wave of light drifts across the grid (ambient motion).
 * - Dots near the pointer brighten toward the accent and part around it (feedback).
 * - A click sends a ring of light outward from the click point.
 * Pauses when the tab is hidden (rAF), draws one static frame under reduced motion.
 */

const GAP = 28;
const REACH = 150;
const PUSH = 9;
const ACCENT: [number, number, number] = [243, 108, 33];
const BASE: [number, number, number] = [245, 243, 239];

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
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: 0, target: 0 };
    const rings: { x: number; y: number; t: number }[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (reduce) draw(0);
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      // Pointer eases toward its target so the lit area glides rather than snaps.
      pointer.x += (pointer.tx - pointer.x) * 0.18;
      pointer.y += (pointer.ty - pointer.y) * 0.18;
      pointer.on += (pointer.target - pointer.on) * 0.08;

      for (let i = rings.length - 1; i >= 0; i--) if (t - rings[i].t > 1.4) rings.splice(i, 1);

      const offX = (w % GAP) / 2;
      const offY = (h % GAP) / 2;
      for (let y = offY; y < h; y += GAP) {
        for (let x = offX; x < w; x += GAP) {
          // Ambient wave: a soft diagonal band that drifts across the page.
          const wave = reduce ? 0 : Math.max(0, Math.sin(x * 0.006 + y * 0.004 - t * 0.6)) ** 6;
          let a = 0.07 + wave * 0.12;
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
            const radius = age * 520;
            const d = Math.hypot(x - r.x, y - r.y);
            const band = Math.max(0, 1 - Math.abs(d - radius) / 46) * (1 - age / 1.4);
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
      draw(now);
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
    };
    const onLeave = () => (pointer.target = 0);
    const onDown = (e: PointerEvent) => rings.push({ x: e.clientX, y: e.clientY, t: performance.now() / 1000 });

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      if (fine) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      }
      window.addEventListener("pointerdown", onDown, { passive: true });
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={ref} className="dot-field" aria-hidden="true" />;
}
