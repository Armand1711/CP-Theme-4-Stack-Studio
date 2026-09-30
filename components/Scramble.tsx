"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>";

/** Decodes its text from random glyphs on first mount (once). Plain text under reduced motion. */
export function Scramble({ text, duration = 900 }: { text: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * text.length);
      let out = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) {
        out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text, duration]);

  return (
    <span ref={ref} aria-label={text}>
      {text}
    </span>
  );
}
