"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { services, type ServiceKey } from "@/lib/content";

/*
 * The "stack" in Stack Studio: one glass layer per service with the brand layer on top, in CSS 3D.
 * The scene tilts toward the pointer through a critically damped follow (no overshoot), and the
 * layers spread apart on load. On a service page the matching layer lifts out in accent.
 * Decorative only (aria-hidden); every layer's destination is reachable from the nav and content.
 */

const PATTERN: Record<ServiceKey, string> = { web: "grid", software: "bars", uiux: "rings", mobile: "dots" };
const BASE_X = 58;
const BASE_Z = -42;
const TILT = 7;

export function StackVisual({ active }: { active?: ServiceKey }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const target = { x: 0, z: 0 };
    const current = { x: 0, z: 0 };
    let raf = 0;
    let last = 0;
    let visible = true;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = 1 - Math.exp(-dt * 5);
      current.x += (target.x - current.x) * k;
      current.z += (target.z - current.z) * k;
      scene.style.transform = `rotateX(${BASE_X + current.x}deg) rotateZ(${BASE_Z + current.z}deg)`;
      const settled = Math.abs(target.x - current.x) < 0.01 && Math.abs(target.z - current.z) < 0.01;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
      target.x = -ny * TILT;
      target.z = nx * TILT;
      wake();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(root);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const layers = [...services].reverse();

  return (
    <div ref={rootRef} className="stack" data-muted={active ? "true" : undefined} aria-hidden="true">
      <div ref={sceneRef} className="stack__scene">
        {layers.map((s, i) => (
          <div
            key={s.key}
            className="plate"
            data-active={active === s.key ? "true" : undefined}
            style={{ "--z": i } as CSSProperties}
          >
            <span className={`plate__pattern plate__pattern--${PATTERN[s.key]}`} />
            <span className="plate__label">
              {s.number}
              <b>{s.name}</b>
            </span>
          </div>
        ))}
        <div className="plate plate--brand" style={{ "--z": layers.length } as CSSProperties}>
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 2 L17 8 M10 2 L3 8" stroke="#160B04" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M10 9 L17 15 M10 9 L3 15" stroke="#FFF4EC" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
