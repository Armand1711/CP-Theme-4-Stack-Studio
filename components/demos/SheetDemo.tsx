"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  AndroidLogo, AppleLogo, BatteryFull, CellSignalFull, Desktop, MapPin, SolarPanel, WifiHigh, type Icon,
} from "@phosphor-icons/react";

/*
 * Apps signature, styled like an app simulator: one field-service app shown on iOS, Android or desktop.
 *
 * On a phone the app has a bottom sheet with native-feeling physics, following Apple's fluid-interface
 * guidance: 1:1 tracking that respects the grab offset, velocity-projected snapping
 * (current + v/1000 * d / (1 - d)), an under-damped spring (damping 0.8, response 0.3) that inherits
 * release velocity, and rubber-banding past either end. The handle cycles snap points from the keyboard.
 * A gesture inspector beside the phone shows those numbers live. On desktop the same data becomes a
 * sidebar, which is the point: one app, adapted to each platform.
 */

const VISITS = [
  { place: "Menlyn Office Park", job: "Solar install", time: "09:30" },
  { place: "Irene Farm Village", job: "Battery check", time: "11:00" },
  { place: "Highveld Techno Park", job: "Site survey", time: "13:30" },
  { place: "Midrand Warehouse", job: "Monitoring setup", time: "15:00" },
];

type Platform = "ios" | "android" | "desktop";
const PLATFORMS: { id: Platform; label: string; Icon: Icon }[] = [
  { id: "ios", label: "iOS", Icon: AppleLogo },
  { id: "android", label: "Android", Icon: AndroidLogo },
  { id: "desktop", label: "Desktop", Icon: Desktop },
];
const SNAP_NAMES = ["Full", "Half", "Peek"];

const DAMPING = 0.8;
const RESPONSE = 0.3;
const K = (2 * Math.PI / RESPONSE) ** 2;
const C = (4 * Math.PI * DAMPING) / RESPONSE;
const DECEL = 0.995;
/** Pointer samples older than this at release don't count toward the flick (the finger had stopped). */
const STALE_MS = 80;

const rubberband = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));
const project = (v: number) => ((v / 1000) * DECEL) / (1 - DECEL);

export function SheetDemo() {
  const screenRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const stats = useRef<Record<"y" | "v" | "proj" | "snap" | "state", HTMLElement | null>>({
    y: null, v: null, proj: null, snap: null, state: null,
  });
  const y = useRef(0);
  const v = useRef(0);
  const snaps = useRef<number[]>([0, 0, 0]); // full, half, peek (px from top)
  const raf = useRef(0);
  const drag = useRef<{ grab: number; samples: { t: number; y: number }[] } | null>(null);
  const [snap, setSnapState] = useState(2);
  // Mirrors `snap` for the resize handler, which is set up once.
  const snapRef = useRef(2);
  const setSnap = (i: number) => {
    snapRef.current = i;
    setSnapState(i);
  };
  const [platform, setPlatform] = useState<Platform>("ios");
  const dragged = useRef(false);

  /** Velocity from the recent pointer samples, ignoring anything older than STALE_MS. */
  const dragVelocity = (samples: { t: number; y: number }[], now: number) => {
    const recent = samples.filter((s) => now - s.t <= STALE_MS);
    if (recent.length < 2) return 0;
    const a = recent[0];
    const b = recent[recent.length - 1];
    return b.t - a.t > 0 ? ((b.y - a.y) / (b.t - a.t)) * 1000 : 0;
  };

  const nearestSnap = (pos: number) => {
    let best = 0;
    snaps.current.forEach((s, i) => {
      if (Math.abs(s - pos) < Math.abs(snaps.current[best] - pos)) best = i;
    });
    return best;
  };

  const render = (state?: "dragging" | "settling" | "resting", velocity = v.current) => {
    const [full, , peek] = snaps.current;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${y.current}px)`;
    const t = Math.min(1, Math.max(0, (peek - y.current) / (peek - full || 1)));
    if (dimRef.current) dimRef.current.style.opacity = String(t * 0.55);
    // Gesture inspector: written straight to the DOM, no React render per frame.
    const s = stats.current;
    const projected = y.current + project(velocity);
    if (s.y) s.y.textContent = `${Math.round(y.current)}px`;
    if (s.v) s.v.textContent = `${Math.round(velocity)} px/s`;
    if (s.proj) s.proj.textContent = `${Math.round(projected)}px`;
    if (s.snap) s.snap.textContent = SNAP_NAMES[nearestSnap(projected)];
    if (s.state && state) {
      s.state.textContent = state;
      s.state.dataset.state = state;
    }
  };

  const springTo = (target: number, velocity = 0) => {
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      y.current = target;
      v.current = 0;
      render("resting");
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
      if (Math.abs(v.current) < 5 && Math.abs(y.current - target) < 0.5) {
        y.current = target;
        v.current = 0;
        render("resting");
        return;
      }
      render("settling");
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const measure = () => {
      const h = screen.clientHeight;
      if (!h) return; // hidden while the desktop view is showing
      snaps.current = [h * 0.12, h * 0.44, h * 0.72];
      cancelAnimationFrame(raf.current);
      y.current = snaps.current[snapRef.current];
      v.current = 0;
      render("resting");
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
    render("dragging", 0);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const [full, , peek] = snaps.current;
    const h = screenRef.current?.clientHeight ?? 600;
    let next = e.clientY - d.grab;
    if (next < full) next = full - rubberband(full - next, h);
    else if (next > peek) next = peek + rubberband(next - peek, h);
    if (Math.abs(next - d.samples[0].y) > 4) dragged.current = true;
    y.current = next;
    const now = performance.now();
    d.samples.push({ t: now, y: next });
    if (d.samples.length > 6) d.samples.shift();
    render("dragging", dragVelocity(d.samples, now));
  };
  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const velocity = dragVelocity(d.samples, performance.now());
    const best = nearestSnap(y.current + project(velocity));
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

  const stat = (key: keyof typeof stats.current) => (el: HTMLElement | null) => void (stats.current[key] = el);

  return (
    <div className="sim">
      <div className="sim__bar">
        <span className="sim__title">
          <SolarPanel size={16} weight="fill" aria-hidden /> Field app
        </span>
        <div className="devtools__devices" role="group" aria-label="Platform">
          {PLATFORMS.map(({ id, label, Icon }) => (
            <button key={id} type="button" className="devtools__device" aria-pressed={platform === id} onClick={() => setPlatform(id)}>
              <Icon size={15} weight="fill" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="sim__main" data-platform={platform}>
        <div className="sim__device">
          <div className="phone" data-platform={platform} hidden={platform === "desktop"} aria-label="Example app with a draggable sheet">
            <div ref={screenRef} className="phone__screen">
              <div className="phone__status mono" aria-hidden="true">
                <span>9:41</span>
                <span className="phone__camera" />
                <span className="phone__status-icons">
                  <CellSignalFull size={14} weight="fill" />
                  <WifiHigh size={14} weight="bold" />
                  <BatteryFull size={16} weight="fill" />
                </span>
              </div>
              <AppHome />
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
                <VisitList />
              </div>
              <span className="phone__homebar" aria-hidden="true" />
            </div>
          </div>

          {platform === "desktop" && (
            <div className="dapp" aria-label="The same app on desktop">
              <div className="dapp__bar" aria-hidden="true">
                <span className="device__dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span>Northfield Field App</span>
              </div>
              <div className="dapp__body">
                <aside className="dapp__side">
                  <p className="sheet__title">Site visits</p>
                  <VisitList />
                </aside>
                <div className="dapp__content">
                  <AppHome />
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="sim__inspect" aria-label="Gesture inspector">
          <p className="sim__inspect-title">{platform === "desktop" ? "Layout" : "Gesture inspector"}</p>
          {platform === "desktop" ? (
            <p className="sim__note">
              On desktop the sheet becomes a sidebar. Same code, same data, a layout that suits a mouse and a big screen.
            </p>
          ) : (
            <>
              <dl className="sim__stats mono">
                <div>
                  <dt>state</dt>
                  <dd ref={stat("state")} className="sim__state" data-state="resting">resting</dd>
                </div>
                <div>
                  <dt>position</dt>
                  <dd ref={stat("y")}>0px</dd>
                </div>
                <div>
                  <dt>velocity</dt>
                  <dd ref={stat("v")}>0 px/s</dd>
                </div>
                <div>
                  <dt>projected</dt>
                  <dd ref={stat("proj")}>0px</dd>
                </div>
                <div>
                  <dt>snaps to</dt>
                  <dd ref={stat("snap")}>Peek</dd>
                </div>
              </dl>
              <p className="sim__spring mono">
                spring(damping: {DAMPING}, response: {RESPONSE}s)
              </p>
              <p className="sim__note">Flick the sheet. It lands where your throw was heading, not where you let go.</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

/** The app's home screen: greeting, today's summary and a map. Shared by phone and desktop. */
function AppHome() {
  return (
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
  );
}

function VisitList() {
  return (
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
  );
}
