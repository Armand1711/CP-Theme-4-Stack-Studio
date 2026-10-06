"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, X } from "@phosphor-icons/react";
import { services, serviceHref, type ServiceKey } from "@/lib/content";
import { onServiceSignal, signalService } from "@/lib/serviceSync";
import { LogoMark } from "./Logo";
import { ServiceMini } from "./ServicesBento";

/*
 * The "stack" in Stack Studio: one glass layer per service with the brand layer on top, in CSS 3D.
 * Each service layer carries a tiny, looping drawing of its tool (code, workflow, design frame, phone).
 *
 * Gestures, split by where you press:
 * - Brand layer or empty space: drag to spin the whole stack (the throw is projected and snapped to a
 *   full turn, and a spring carries the release velocity in); a tap sends a bounce up through the layers.
 * - A service layer: drag to pull that layer out sideways (1:1 along the layer's own axis, rubber-banded,
 *   springing back with the release velocity); a tap, or a hard throw, opens it as a card.
 * - Hover (mouse): the stack fans apart; hovering a layer lifts it, shows its price, and tells the hero
 *   ticker to show that service. When the ticker moves on by itself, the matching layer lifts.
 *
 * The opened card flies out of its layer and turns to face you (FLIP from the layer's on-screen box),
 * and flies back into the same slot when closed. The scene tilts toward the pointer through a
 * critically damped follow (held still while the pointer is over the stack, so targets don't move under
 * it). On a service page the matching layer is lit in accent.
 * `lost` (404 page): the brand layer has slid off the stack; a tap puts it back.
 * The 3D scene is decorative (aria-hidden); the card it opens is a real, focusable dialog.
 */

/** A tiny, flat drawing of each service's tool, laid on its plate. Pure CSS shapes, looping. */
function PlateArt({ kind }: { kind: ServiceKey }) {
  if (kind === "web")
    return (
      <span className="pa pa--web">
        <i className="pa__bar" />
        <i style={{ width: "70%" }} />
        <i style={{ width: "45%" }} />
        <i style={{ width: "58%" }} />
      </span>
    );
  if (kind === "software")
    return (
      <span className="pa pa--sw">
        <i />
        <i />
        <i />
      </span>
    );
  if (kind === "uiux")
    return (
      <span className="pa pa--ux">
        <i className="pa__sel" />
      </span>
    );
  return (
    <span className="pa pa--app">
      <i className="pa__sheet" />
    </span>
  );
}

const BASE_X = 58;
const BASE_Z = -42;
const TILT = 7;
// Spin spring: Apple-style response/damping. Slight bounce is earned here because a flick precedes it.
const RESPONSE = 0.55;
const DAMPING = 0.8;
const STIFF = (2 * Math.PI / RESPONSE) ** 2;
const FRICTION = (4 * Math.PI * DAMPING) / RESPONSE;
// Pull-back spring for a single layer: critically damped, response 0.4s (Apple's "move" values).
const PULL_STIFF = (2 * Math.PI / 0.4) ** 2;
const PULL_FRICTION = (4 * Math.PI) / 0.4;
/** A throw faster than this (layer px/s) opens the layer instead of letting it spring back. */
const OPEN_VELOCITY = 1400;
/** Pointer samples older than this at release don't count toward a throw. */
const STALE_MS = 80;
/** Where a flick would come to rest (Apple's scroll-deceleration projection), in degrees. */
const project = (velocity: number, rate = 0.998) => ((velocity / 1000) * rate) / (1 - rate);
const rubberband = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

type Pull = { value: number; vel: number; dragging: boolean };

export function StackVisual({ active, lost = false }: { active?: ServiceKey; lost?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const plateRefs = useRef<Partial<Record<ServiceKey, HTMLDivElement | null>>>({});
  const [open, setOpen] = useState<ServiceKey | null>(null);
  const [closing, setClosing] = useState(false);
  const [highlight, setHighlight] = useState<ServiceKey | null>(null);
  // Bumped on every open, so a close animation that finishes after a newer open doesn't clear it.
  const openToken = useRef(0);
  const openRef = useRef<(key: ServiceKey) => void>(() => {});
  openRef.current = (key) => {
    openToken.current++;
    setClosing(false);
    setOpen(key);
  };

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const target = { x: 0, z: 0 };
    const current = { x: 0, z: 0 };
    const spin = { angle: 0, vel: 0, home: 0, dragging: false, lastX: 0, lastT: 0 };
    const pulls: Partial<Record<ServiceKey, Pull>> = {};
    let press: {
      kind: "stack" | "plate"; key?: ServiceKey; x: number; y: number; moved: boolean;
      start: number; samples: { t: number; v: number }[];
    } | null = null;
    let raf = 0;
    let last = 0;
    let visible = true;

    const setPull = (key: ServiceKey, value: number) => {
      plateRefs.current[key]?.style.setProperty("--pull", `${value}px`);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = 1 - Math.exp(-dt * 5);
      current.x += (target.x - current.x) * k;
      current.z += (target.z - current.z) * k;

      // Semi-implicit Euler in small steps keeps the springs stable at any frame rate.
      for (let left = dt; left > 0; left -= 1 / 240) {
        const h = Math.min(left, 1 / 240);
        if (!spin.dragging) {
          spin.vel += (-STIFF * (spin.angle - spin.home) - FRICTION * spin.vel) * h;
          spin.angle += spin.vel * h;
        }
        for (const p of Object.values(pulls)) {
          if (!p || p.dragging) continue;
          p.vel += (-PULL_STIFF * p.value - PULL_FRICTION * p.vel) * h;
          p.value += p.vel * h;
        }
      }
      let pullsMoving = false;
      for (const [key, p] of Object.entries(pulls) as [ServiceKey, Pull][]) {
        if (!p.dragging && Math.abs(p.value) < 0.3 && Math.abs(p.vel) < 5) {
          p.value = 0;
          p.vel = 0;
          plateRefs.current[key]?.style.removeProperty("transition");
          delete pulls[key];
        } else pullsMoving = true;
        setPull(key, p.value);
      }

      scene.style.transform = `rotateX(${BASE_X + current.x}deg) rotateZ(${BASE_Z + current.z + spin.angle}deg)`;
      const settled =
        Math.abs(target.x - current.x) < 0.01 &&
        Math.abs(target.z - current.z) < 0.01 &&
        !spin.dragging &&
        Math.abs(spin.vel) < 0.5 &&
        Math.abs(spin.home - spin.angle) < 0.05 &&
        !pullsMoving;
      if (settled) {
        spin.vel = 0;
        spin.angle = 0;
        spin.home = 0;
      }
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (raf || !visible || reduce) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    /** Unit vector of a layer's own x axis on screen, and how many screen px one layer px covers. */
    const layerAxis = () => {
      const z = ((BASE_Z + current.z + spin.angle) * Math.PI) / 180;
      const x = ((BASE_X + current.x) * Math.PI) / 180;
      const ux = Math.cos(z);
      const uy = Math.sin(z) * Math.cos(x);
      const len = Math.hypot(ux, uy) || 1;
      return { ux: ux / len, uy: uy / len, len };
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if ((e.target as Element).closest(".stack-card")) return;
      const plate = (e.target as Element).closest<HTMLElement>(".plate");
      const key = plate && !plate.classList.contains("plate--brand") ? (plate.dataset.key as ServiceKey) : undefined;
      root.setPointerCapture(e.pointerId);
      press = { kind: key ? "plate" : "stack", key, x: e.clientX, y: e.clientY, moved: false, start: 0, samples: [] };
      if (!key) {
        Object.assign(spin, { dragging: true, lastX: e.clientX, lastT: performance.now(), vel: 0 });
        spin.home = spin.angle;
        root.dataset.grabbing = "true";
      }
      wake();
    };

    const onDrag = (e: PointerEvent) => {
      const p = press;
      if (!p) return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      if (!p.moved && Math.hypot(dx, dy) < 6) return;
      const now = performance.now();

      if (p.kind === "stack") {
        p.moved = true;
        if (reduce) return;
        spin.angle = spin.home + dx * 0.6;
        const dt = Math.max(1, now - spin.lastT) / 1000;
        spin.vel = spin.vel * 0.6 + (((e.clientX - spin.lastX) * 0.6) / dt) * 0.4;
        spin.lastX = e.clientX;
        spin.lastT = now;
        wake();
        return;
      }

      // Pull one layer along its own x axis, 1:1 with the pointer.
      const key = p.key!;
      const plate = plateRefs.current[key];
      if (!plate || reduce) return;
      if (!p.moved) {
        p.moved = true;
        const existing = pulls[key];
        p.start = existing?.value ?? 0;
        pulls[key] = { value: p.start, vel: 0, dragging: true };
        plate.style.transition = "none";
        root.dataset.pulling = "true";
      }
      const { ux, uy, len } = layerAxis();
      const raw = p.start + (dx * ux + dy * uy) / len;
      const limit = plate.offsetWidth * 0.55;
      const value = Math.abs(raw) > limit ? Math.sign(raw) * (limit + rubberband(Math.abs(raw) - limit, plate.offsetWidth)) : raw;
      pulls[key]!.value = value;
      p.samples.push({ t: now, v: value });
      if (p.samples.length > 6) p.samples.shift();
      setPull(key, value);
    };

    const onUp = () => {
      const p = press;
      press = null;
      if (!p) return;

      if (p.kind === "stack") {
        spin.dragging = false;
        delete root.dataset.grabbing;
        if (!p.moved) {
          spin.vel = 0;
          if (root.dataset.lost) delete root.dataset.lost; // 404: a tap slides the missing layer back
          else if (!reduce && !root.classList.contains("is-bouncing")) root.classList.add("is-bouncing");
        } else {
          spin.home = Math.round((spin.angle + project(spin.vel)) / 360) * 360;
        }
        wake();
        return;
      }

      const key = p.key!;
      if (!p.moved) {
        openRef.current(key);
        return;
      }
      delete root.dataset.pulling;
      const pull = pulls[key];
      if (!pull) return;
      const now = performance.now();
      const recent = p.samples.filter((s) => now - s.t <= STALE_MS);
      const vel = recent.length > 1 ? ((recent.at(-1)!.v - recent[0].v) / Math.max(1, recent.at(-1)!.t - recent[0].t)) * 1000 : 0;
      pull.dragging = false;
      pull.vel = vel;
      const plate = plateRefs.current[key];
      if (Math.abs(vel) > OPEN_VELOCITY || (plate && Math.abs(pull.value) > plate.offsetWidth * 0.5)) openRef.current(key);
      wake();
    };

    const onBounceEnd = (e: AnimationEvent) => {
      if (e.animationName === "plate-bump" && (e.target as HTMLElement).classList.contains("plate--brand")) {
        root.classList.remove("is-bouncing");
      }
    };

    // Hovering a layer tells the ticker which service to show; leaving the stack hands control back.
    // Entering the stack fans the layers apart, which moves them under a still pointer, so hovers are
    // only read once the fan has settled, from whatever is under the pointer at that moment.
    const FAN_MS = reduce ? 0 : 600;
    let hovered: ServiceKey | null = null;
    let inside = false;
    let enteredAt = 0;
    let settleTimer = 0;
    const pointer = { x: 0, y: 0 };
    const readHover = () => {
      if (press) return;
      const plate = document.elementFromPoint(pointer.x, pointer.y)?.closest<HTMLElement>(".stack .plate:not(.plate--brand)");
      const key = (plate?.dataset.key as ServiceKey | undefined) ?? null;
      if (key && key !== hovered) {
        hovered = key;
        signalService({ key, source: "stack" });
      }
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      enteredAt = performance.now();
      inside = true;
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      const wait = FAN_MS - (performance.now() - enteredAt);
      window.clearTimeout(settleTimer);
      if (wait > 0) settleTimer = window.setTimeout(readHover, wait);
      else readHover();
    };
    const onLeave = () => {
      inside = false;
      window.clearTimeout(settleTimer);
      if (hovered === null) return;
      hovered = null;
      signalService({ key: null, source: "stack" });
    };

    // Tilt toward the pointer while it's outside the stack; hold still while it's over the stack, so the
    // layers stay put under the pointer for hovering, tapping and pulling.
    const onMove = (e: PointerEvent) => {
      if (!fine || inside) return;
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
    const offSignal = onServiceSignal((s) => {
      if (s.source === "ticker") setHighlight(s.key);
    });

    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onDrag);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("animationend", onBounceEnd);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
      root.removeEventListener("pointerenter", onEnter);
      io.disconnect();
      offSignal();
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onDrag);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("animationend", onBounceEnd);
    };
  }, []);

  /** FLIP between the opened layer's on-screen box and the card's resting box. */
  const flip = (direction: "in" | "out") => {
    const card = cardRef.current;
    const plate = open ? plateRefs.current[open] : null;
    if (!card || !plate) return null;
    // The card element is reused between opens; drop any earlier fly-in/out before measuring.
    card.getAnimations().forEach((a) => a.cancel());
    const c = card.getBoundingClientRect();
    const p = plate.getBoundingClientRect();
    const dx = p.left + p.width / 2 - (c.left + c.width / 2);
    const dy = p.top + p.height / 2 - (c.top + c.height / 2);
    const s = Math.min(1, p.width / c.width);
    const fromLayer = { transform: `translate(${dx}px, ${dy}px) rotateX(${BASE_X}deg) rotateZ(${BASE_Z}deg) scale(${s})`, opacity: 0.3 };
    const resting = { transform: "none", opacity: 1 };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return card.animate(
      reduce ? [{ opacity: direction === "in" ? 0 : 1 }, { opacity: direction === "in" ? 1 : 0 }] : direction === "in" ? [fromLayer, resting] : [resting, fromLayer],
      { duration: reduce ? 180 : direction === "in" ? 520 : 380, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" },
    );
  };

  useLayoutEffect(() => {
    if (!open || closing) return;
    flip("in");
    cardRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    if (!open || closing) return;
    setClosing(true);
    const token = openToken.current;
    const anim = flip("out");
    const done = () => {
      if (openToken.current !== token) return;
      setOpen(null);
      setClosing(false);
    };
    if (anim) anim.finished.then(done, done);
    else done();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onPress = (e: PointerEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPress, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPress, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closing]);

  const layers = [...services].reverse();
  const card = services.find((s) => s.key === open);

  return (
    <div
      ref={rootRef}
      className="stack"
      data-muted={active ? "true" : undefined}
      data-lost={lost ? "true" : undefined}
      data-open={open ?? undefined}
    >
      <div ref={sceneRef} className="stack__scene" aria-hidden="true">
        {layers.map((s, i) => (
          <div
            key={s.key}
            ref={(el) => void (plateRefs.current[s.key] = el)}
            className="plate"
            data-key={s.key}
            data-active={active === s.key ? "true" : undefined}
            data-ticker={highlight === s.key || undefined}
            data-opened={open === s.key || undefined}
            style={{ "--z": i } as CSSProperties}
          >
            <PlateArt kind={s.key} />
            <span className="plate__label">
              {s.number}
              <b>{s.name}</b>
              <span className="plate__price">From {s.fromPrice}</span>
            </span>
          </div>
        ))}
        <div className="plate plate--brand" style={{ "--z": layers.length } as CSSProperties}>
          <LogoMark />
        </div>
      </div>

      {card && (
        <div ref={cardRef} className="stack-card" role="dialog" aria-label={card.name}>
          <button type="button" className="stack-card__close" aria-label="Close" onClick={close}>
            <X size={16} weight="bold" />
          </button>
          <div className="stack-card__mini">
            <ServiceMini kind={card.key} />
          </div>
          <p className="stack-card__name">
            <span className="mono">{card.number}</span>
            {card.name}
          </p>
          <p className="stack-card__lede">{card.lede}</p>
          <div className="stack-card__foot">
            <span className="stack-card__price">
              From <b>{card.fromPrice}</b>
            </span>
            <Link href={serviceHref(card)} className="textlink textlink--accent">
              Explore
              <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
