"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { services, type ServiceKey } from "@/lib/content";
import { LogoMark } from "./Logo";

/*
 * The "stack" in Stack Studio: one glass layer per service with the brand layer on top, in CSS 3D.
 * The scene tilts toward the pointer through a critically damped follow (no overshoot), and the
 * layers spread apart on load. On a service page the matching layer lifts out in accent.
 * Decorative only (aria-hidden); every layer's destination is reachable from the nav and content.
 * `lost` (404 page): the brand layer has slid off the stack; a tap puts it back.
 */

const PATTERN: Record<ServiceKey, string> = { web: "grid", software: "bars", uiux: "rings", mobile: "dots" };
const BASE_X = 58;
const BASE_Z = -42;
const TILT = 7;
// Spin spring: Apple-style response/damping. Slight bounce is earned here because a flick precedes it.
const RESPONSE = 0.55;
const DAMPING = 0.8;
const STIFF = (2 * Math.PI / RESPONSE) ** 2;
const FRICTION = (4 * Math.PI * DAMPING) / RESPONSE;
/** Where a flick would come to rest (Apple's scroll-deceleration projection), in degrees. */
const project = (velocity: number, rate = 0.998) => ((velocity / 1000) * rate) / (1 - rate);

export function StackVisual({ active, lost = false }: { active?: ServiceKey; lost?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const target = { x: 0, z: 0 };
    const current = { x: 0, z: 0 };
    // Spin: grab and throw the stack around its vertical axis. On release the resting point is
    // projected from the throw velocity, snapped to the nearest full turn, and a spring carries the
    // release velocity into it, so there is no seam between the drag and the settle.
    const spin = { angle: 0, vel: 0, home: 0, dragging: false, startX: 0, startAngle: 0, lastX: 0, lastT: 0, moved: 0 };
    let raf = 0;
    let last = 0;
    let visible = true;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = 1 - Math.exp(-dt * 5);
      current.x += (target.x - current.x) * k;
      current.z += (target.z - current.z) * k;

      if (!spin.dragging) {
        // Semi-implicit Euler in small steps keeps the spring stable at any frame rate.
        for (let left = dt; left > 0; left -= 1 / 240) {
          const h = Math.min(left, 1 / 240);
          spin.vel += (-STIFF * (spin.angle - spin.home) - FRICTION * spin.vel) * h;
          spin.angle += spin.vel * h;
        }
      }

      scene.style.transform = `rotateX(${BASE_X + current.x}deg) rotateZ(${BASE_Z + current.z + spin.angle}deg)`;
      const settled =
        Math.abs(target.x - current.x) < 0.01 &&
        Math.abs(target.z - current.z) < 0.01 &&
        !spin.dragging &&
        Math.abs(spin.vel) < 0.5 &&
        Math.abs(spin.home - spin.angle) < 0.05;
      if (settled) {
        spin.vel = 0;
        spin.angle = 0;
        spin.home = 0;
      }
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      root.setPointerCapture(e.pointerId);
      Object.assign(spin, { dragging: true, startX: e.clientX, startAngle: spin.angle, lastX: e.clientX, lastT: performance.now(), vel: 0, moved: 0 });
      root.dataset.grabbing = "true";
      wake();
    };
    const onDrag = (e: PointerEvent) => {
      if (!spin.dragging) return;
      const now = performance.now();
      const dx = e.clientX - spin.startX;
      spin.moved = Math.max(spin.moved, Math.abs(dx));
      spin.angle = spin.startAngle + dx * 0.6;
      const dt = Math.max(1, now - spin.lastT) / 1000;
      spin.vel = spin.vel * 0.6 + (((e.clientX - spin.lastX) * 0.6) / dt) * 0.4;
      spin.lastX = e.clientX;
      spin.lastT = now;
      wake();
    };
    const onUp = () => {
      if (!spin.dragging) return;
      spin.dragging = false;
      delete root.dataset.grabbing;
      spin.home = Math.round((spin.angle + project(spin.vel)) / 360) * 360;
      if (spin.moved < 4) {
        spin.vel = 0;
        if (root.dataset.lost) {
          // 404: a tap slides the missing layer back onto the stack.
          delete root.dataset.lost;
        } else if (!root.classList.contains("is-bouncing")) {
          // A tap sends a bounce wave up through the plates (ignored mid-bounce rather than restarting it).
          root.classList.add("is-bouncing");
        }
      }
      wake();
    };
    const onBounceEnd = (e: AnimationEvent) => {
      if (e.animationName === "plate-bump" && (e.target as HTMLElement).classList.contains("plate--brand")) {
        root.classList.remove("is-bouncing");
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!fine) return;
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
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onDrag);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("animationend", onBounceEnd);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onDrag);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("animationend", onBounceEnd);
    };
  }, []);

  const layers = [...services].reverse();

  return (
    <div
      ref={rootRef}
      className="stack"
      data-muted={active ? "true" : undefined}
      data-lost={lost ? "true" : undefined}
      aria-hidden="true"
    >
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
          <LogoMark />
        </div>
      </div>
    </div>
  );
}
