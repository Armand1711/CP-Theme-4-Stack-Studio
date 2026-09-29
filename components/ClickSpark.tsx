"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
 * React Bits' ClickSpark, adapted for site-wide use from the root layout:
 * - one fixed, viewport-sized, DPR-aware canvas above everything (the stock version sizes the canvas to its
 *   wrapper, which for a whole page means a document-tall, blurry canvas hidden under positioned content);
 * - the rAF loop only runs while sparks are alive (stock loops forever);
 * - keyboard-triggered clicks (no pointer position) and prefers-reduced-motion get no sparks.
 */

type Easing = "linear" | "ease-in" | "ease-in-out" | "ease-out";

type Props = {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: Easing;
  extraScale?: number;
  children?: ReactNode;
};

type Spark = { x: number; y: number; angle: number; startTime: number };

const ease = (easing: Easing, t: number) => {
  switch (easing) {
    case "linear":
      return t;
    case "ease-in":
      return t * t;
    case "ease-in-out":
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    default:
      return t * (2 - t);
  }
};

export function ClickSpark({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1,
  children,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef({ sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale });

  useEffect(() => {
    settingsRef.current = { sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let sparks: Spark[] = [];
    let raf = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };

    const draw = (now: number) => {
      const s = settingsRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = s.sparkColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";

      sparks = sparks.filter((spark) => {
        const elapsed = now - spark.startTime;
        if (elapsed >= s.duration) return false;
        const eased = ease(s.easing, Math.max(0, elapsed) / s.duration);
        const distance = eased * s.sparkRadius * s.extraScale;
        const lineLength = s.sparkSize * (1 - eased);
        const cos = Math.cos(spark.angle);
        const sin = Math.sin(spark.angle);
        ctx.beginPath();
        ctx.moveTo(spark.x + distance * cos, spark.y + distance * sin);
        ctx.lineTo(spark.x + (distance + lineLength) * cos, spark.y + (distance + lineLength) * sin);
        ctx.stroke();
        return true;
      });

      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    };

    const onClick = (e: MouseEvent) => {
      // detail === 0 means a keyboard-activated click with no real pointer position.
      if (e.detail === 0 || motion.matches) return;
      const { sparkCount: count } = settingsRef.current;
      const now = performance.now();
      for (let i = 0; i < count; i++) {
        sparks.push({ x: e.clientX, y: e.clientY, angle: (2 * Math.PI * i) / count, startTime: now });
      }
      if (!raf) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    // Capture phase so sparks still fire when a handler stops propagation.
    document.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <>
      {children}
      <canvas ref={canvasRef} className="click-spark" aria-hidden="true" />
    </>
  );
}
