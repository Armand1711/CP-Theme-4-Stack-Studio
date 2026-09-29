"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { BatteryFull, CellSignalFull, MapPin, SolarPanel, WifiHigh } from "@phosphor-icons/react";

/*
 * Mobile signature: a bottom sheet with native-feeling physics, following Apple's fluid-interface
 * guidance. 1:1 tracking that respects the grab offset, velocity-projected snapping
 * (current + v/1000 * d / (1 - d)), an under-damped spring (damping 0.8, response 0.3) that inherits
 * release velocity, and rubber-banding past either end. The handle cycles snap points from the keyboard.
 */

const VISITS = [
  { place: "Menlyn Office Park", job: "Solar install", time: "09:30" },
  { place: "Irene Farm Village", job: "Battery check", time: "11:00" },
  { place: "Highveld Techno Park", job: "Site survey", time: "13:30" },
  { place: "Midrand Warehouse", job: "Monitoring setup", time: "15:00" },
];

const DAMPING = 0.8;
const RESPONSE = 0.3;
const K = (2 * Math.PI / RESPONSE) ** 2;
const C = (4 * Math.PI * DAMPING) / RESPONSE;
const DECEL = 0.995;

const rubberband = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));
const project = (v: number) => ((v / 1000) * DECEL) / (1 - DECEL);

export function SheetDemo() {
  const screenRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const y = useRef(0);
  const v = useRef(0);
  const snaps = useRef<number[]>([0, 0, 0]); // full, half, collapsed (px from top)
  const raf = useRef(0);
  const drag = useRef<{ grab: number; samples: { t: number; y: number }[] } | null>(null);
  const [snap, setSnap] = useState(2);
  const dragged = useRef(false);

  const render = () => {
    const [full, , collapsed] = snaps.current;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${y.current}px)`;
    const t = Math.min(1, Math.max(0, (collapsed - y.current) / (collapsed - full || 1)));
    if (dimRef.current) dimRef.current.style.opacity = String(t * 0.55);
  };

  const springTo = (target: number, velocity = 0) => {
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      y.current = target;
      v.current = 0;
      render();
      return;
    }
    v.current = velocity;
    let last = performance.now();
    const step = (now: number) => {
      let dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // Semi-implicit Euler in small substeps for stability.
      while (dt > 0) {
        const h = Math.min(dt, 1 / 240);
        v.current += (-K * (y.current - target) - C * v.current) * h;
        y.current += v.current * h;
        dt -= h;
      }
      render();
      if (Math.abs(v.current) < 5 && Math.abs(y.current - target) < 0.5) {
        y.current = target;
        render();
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const measure = () => {
      const h = screen.clientHeight;
      snaps.current = [h * 0.12, h * 0.44, h * 0.72];
      y.current = snaps.current[snap];
      render();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(screen);

    // One gentle nudge the first time the phone is on screen, hinting that the sheet moves.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || reduce) return;
        io.disconnect();
        setTimeout(() => {
          if (drag.current) return;
          springTo(snaps.current[2], -900);
        }, 500);
      },
      { threshold: 0.7 },
    );
    io.observe(screen);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancelAnimationFrame(raf.current); // grab it mid-flight, from where it is right now
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { grab: e.clientY - y.current, samples: [{ t: performance.now(), y: y.current }] };
    dragged.current = false;
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const [full, , collapsed] = snaps.current;
    const h = screenRef.current?.clientHeight ?? 600;
    let next = e.clientY - d.grab;
    if (next < full) next = full - rubberband(full - next, h);
    else if (next > collapsed) next = collapsed + rubberband(next - collapsed, h);
    if (Math.abs(next - d.samples[0].y) > 4) dragged.current = true;
    y.current = next;
    d.samples.push({ t: performance.now(), y: next });
    if (d.samples.length > 6) d.samples.shift();
    render();
  };
  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const a = d.samples[0];
    const b = d.samples[d.samples.length - 1];
    const velocity = b.t - a.t > 0 ? ((b.y - a.y) / (b.t - a.t)) * 1000 : 0;
    const projected = y.current + project(velocity);
    let best = 0;
    snaps.current.forEach((s, i) => {
      if (Math.abs(s - projected) < Math.abs(snaps.current[best] - projected)) best = i;
    });
    setSnap(best);
    springTo(snaps.current[best], velocity);
  };

  const cycle = () => {
    // A drag that started on the grip shouldn't also count as a tap.
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    const next = snap === 0 ? 2 : snap - 1;
    setSnap(next);
    springTo(snaps.current[next]);
  };

  return (
    <div className="phone" aria-label="Example app with a draggable sheet">
      <div ref={screenRef} className="phone__screen">
        <div className="phone__status mono" aria-hidden="true">
          <span>9:41</span>
          <span className="phone__status-icons">
            <CellSignalFull size={14} weight="fill" />
            <WifiHigh size={14} weight="bold" />
            <BatteryFull size={16} weight="fill" />
          </span>
        </div>
        <div className="phone__app">
          <p className="phone__hello">Today</p>
          <div className="phone__hero">
            <SolarPanel size={28} weight="duotone" aria-hidden />
            <div>
              <p className="phone__big">4 site visits</p>
              <p className="phone__small">Northfield Solar field team</p>
            </div>
          </div>
          <div className="phone__map" aria-hidden="true">
            {[18, 46, 64, 30].map((l, i) => (
              <span key={i} style={{ left: `${l + i * 8}%`, top: `${22 + ((i * 37) % 60)}%` }}>
                <MapPin size={20} weight="fill" />
              </span>
            ))}
          </div>
        </div>
        <div ref={dimRef} className="phone__dim" aria-hidden="true" />
        <div
          ref={sheetRef}
          className="sheet"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <button
            type="button"
            className="sheet__grip"
            aria-label={snap === 0 ? "Collapse sheet" : "Expand sheet"}
            aria-expanded={snap === 0}
            onClick={cycle}
          >
            <span />
          </button>
          <p className="sheet__title">Site visits</p>
          <ul className="sheet__list">
            {VISITS.map((vis) => (
              <li key={vis.place}>
                <span className="sheet__time mono">{vis.time}</span>
                <span>
                  <span className="sheet__place">{vis.place}</span>
                  <span className="sheet__job">{vis.job}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
