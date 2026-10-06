"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import {
  BatteryFull, BatteryCharging, CellSignalFull, ChartLineUp, Desktop, DeviceMobile, DeviceTablet, DotsSixVertical,
  List, SolarPanel, WifiHigh,
} from "@phosphor-icons/react";
import { highlight, type Lang } from "./highlight";

/*
 * Web Development signature, styled like a browser's responsive design mode: a toolbar (device, size,
 * zoom), a breakpoint ruler, the example site in a device frame, and a docked code panel whose lines
 * light up when they apply at the current width.
 *
 * Picking a device, clicking the ruler or dragging the handle changes the screen width; the site inside
 * is laid out with container queries, so it genuinely reflows. The frame follows the width: a monitor
 * with a browser bar on desktop, a tablet, or a phone. Wide screens are scaled down to fit, so a visitor
 * on a laptop still sees the real 1280px layout.
 *
 * Motion: screen width and zoom each run on a critically damped spring (response 0.45s) that starts from
 * the on-screen value, so a preset change can be grabbed and redirected mid-flight. Dragging is 1:1 with
 * the pointer (the frame resizes symmetrically from its centre) and rubber-bands past the limits.
 */

const MIN = 320;
const MAX = 1440;
/** Bezel on each side of the screen, in screen pixels. */
const BEZEL = 12;
/** Space kept free on each side of the frame for the drag handle. */
const GUTTER = 28;

type DeviceKind = "desktop" | "tablet" | "phone";

const PRESETS: { id: DeviceKind; label: string; width: number; Icon: typeof Desktop }[] = [
  { id: "desktop", label: "Desktop", width: 1280, Icon: Desktop },
  { id: "tablet", label: "Tablet", width: 768, Icon: DeviceTablet },
  { id: "phone", label: "Phone", width: 390, Icon: DeviceMobile },
];

/** Same breakpoints as the example site's container queries. */
const kindOf = (w: number): DeviceKind => (w < 600 ? "phone" : w < 1024 ? "tablet" : "desktop");
/** Visible screen height per device (matches the frame heights in CSS, minus the bezel). */
const SCREEN_H: Record<DeviceKind, number> = { desktop: 720, tablet: 800, phone: 780 };

/** Ruler bands, widest first so narrower ones sit on top. `max` is the band's upper edge in screen px. */
const BANDS: { id: DeviceKind; label: string; max: number | null }[] = [
  { id: "desktop", label: "1024px +", max: null },
  { id: "tablet", label: "600 to 1023px", max: 1023 },
  { id: "phone", label: "up to 599px", max: 599 },
];

/*
 * The code shown in the dock. `when` marks lines that only apply at some sizes:
 * "narrow" = tablet and phone, "phone" = phone only, "wide" = desktop and tablet.
 */
type When = "narrow" | "phone" | "wide";
type Line = { code: string; when?: When };

const HTML: Line[] = [
  { code: '<header class="nav">' },
  { code: '  <a class="logo" href="/">Northfield Solar</a>' },
  { code: '  <nav class="links">Services Projects Contact</nav>', when: "wide" },
  { code: '  <button class="menu" aria-label="Menu"></button>', when: "phone" },
  { code: "</header>" },
  { code: '<section class="hero">' },
  { code: "  <h1>Clean power for growing businesses.</h1>" },
  { code: '  <a class="btn" href="/quote">Get a quote</a>' },
  { code: '  <img class="art" src="roof.jpg" alt="">' },
  { code: "</section>" },
  { code: '<ul class="cards">…</ul>' },
  { code: '<div class="installs">…</div>' },
];

const CSS: Line[] = [
  { code: ".site     { container: site / inline-size; }" },
  { code: ".hero     { grid-template-columns: 1.1fr 1fr; }" },
  { code: ".cards    { grid-template-columns: repeat(3, 1fr); }" },
  { code: ".installs { grid-template-columns: repeat(4, 1fr); }" },
  { code: ".menu     { display: none; }" },
  { code: "" },
  { code: "@container site (max-width: 1023px) {", when: "narrow" },
  { code: "  .hero     { grid-template-columns: 1fr; }", when: "narrow" },
  { code: "  .installs { grid-template-columns: repeat(2, 1fr); }", when: "narrow" },
  { code: "}", when: "narrow" },
  { code: "" },
  { code: "@container site (max-width: 599px) {", when: "phone" },
  { code: "  .links { display: none; }", when: "phone" },
  { code: "  .menu  { display: grid; }", when: "phone" },
  { code: "  .cards { grid-template-columns: 1fr; }", when: "phone" },
  { code: "}", when: "phone" },
];

const applies = (when: When, kind: DeviceKind) =>
  when === "narrow" ? kind !== "desktop" : when === "phone" ? kind === "phone" : kind !== "phone";

// Apple-style spring: damping ratio 1 (no overshoot), response 0.45s.
const RESPONSE = 0.45;
const STIFF = (2 * Math.PI / RESPONSE) ** 2;
const FRICTION = (4 * Math.PI) / RESPONSE;

const rubberband = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

type Spring = { value: number; vel: number; target: number };

export function ResponsiveDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const dimsRef = useRef<HTMLSpanElement>(null);
  const zoomRef = useRef<HTMLSpanElement>(null);
  const bandRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const width = useRef<Spring>({ value: 1280, vel: 0, target: 1280 });
  const zoom = useRef<Spring>({ value: 1, vel: 0, target: 1 });
  const raf = useRef(0);
  const drag = useRef<{ x: number; visual: number; zoom: number; width: number } | null>(null);
  const kindRef = useRef<DeviceKind>("desktop");
  const [kind, setKind] = useState<DeviceKind>("desktop");

  /** Width available to the frame inside the stage, in page pixels. */
  const avail = () => Math.max(200, (stageRef.current?.clientWidth ?? 1200) - GUTTER * 2);
  /** Zoom that makes a screen of width `w` fit the stage (never enlarges). */
  const fit = (w: number) => Math.min(1, avail() / (w + BEZEL * 2));

  const render = () => {
    const stage = stageRef.current;
    const device = deviceRef.current;
    if (!stage || !device) return;
    const w = width.current.value;
    const k = zoom.current.value;
    device.style.width = `${w + BEZEL * 2}px`;
    device.style.transform = `translateX(-50%) scale(${k})`;
    stage.style.height = `${device.offsetHeight * k}px`;
    const visual = (w + BEZEL * 2) * k;
    if (handleRef.current) {
      handleRef.current.style.left = `${stage.clientWidth / 2 + visual / 2 + 6}px`;
      handleRef.current.setAttribute("aria-valuenow", String(Math.round(w)));
      handleRef.current.setAttribute("aria-valuetext", `${Math.round(w)} pixels wide`);
    }
    const next = kindOf(w);
    if (dimsRef.current) dimsRef.current.textContent = `${Math.round(w)} × ${SCREEN_H[next]}`;
    if (zoomRef.current) zoomRef.current.textContent = `${Math.round(k * 100)}%`;
    // Ruler bands are drawn at the current zoom, so a band's edge meets the frame's edge exactly at
    // that breakpoint.
    BANDS.forEach((b, i) => {
      const el = bandRefs.current[i];
      if (el) el.style.width = b.max === null ? "100%" : `${(b.max + BEZEL * 2) * k}px`;
    });
    if (next !== kindRef.current) {
      kindRef.current = next;
      setKind(next);
    }
  };

  const step = (s: Spring, h: number) => {
    s.vel += (-STIFF * (s.value - s.target) - FRICTION * s.vel) * h;
    s.value += s.vel * h;
  };

  /** Spring width and zoom toward new targets, starting from wherever they are now. */
  const animateTo = (w: number, k: number) => {
    width.current.target = w;
    zoom.current.target = k;
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      Object.assign(width.current, { value: w, vel: 0 });
      Object.assign(zoom.current, { value: k, vel: 0 });
      render();
      return;
    }
    let last = performance.now();
    const tick = (now: number) => {
      let dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      while (dt > 0) {
        const h = Math.min(dt, 1 / 240);
        step(width.current, h);
        step(zoom.current, h);
        dt -= h;
      }
      const wDone = Math.abs(width.current.value - w) < 0.5 && Math.abs(width.current.vel) < 5;
      const kDone = Math.abs(zoom.current.value - k) < 0.001 && Math.abs(zoom.current.vel) < 0.01;
      if (wDone && kDone) {
        Object.assign(width.current, { value: w, vel: 0 });
        Object.assign(zoom.current, { value: k, vel: 0 });
        render();
        return;
      }
      render();
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const jumpTo = (w: number, k: number) => {
    cancelAnimationFrame(raf.current);
    Object.assign(width.current, { value: w, vel: 0, target: w });
    Object.assign(zoom.current, { value: k, vel: 0, target: k });
    render();
  };

  const goTo = (w: number) => {
    const target = Math.min(MAX, Math.max(MIN, w));
    animateTo(target, fit(target));
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // Start on desktop, or on the phone when the visitor is on one.
    const start = window.matchMedia("(max-width: 600px)").matches ? 390 : 1280;
    jumpTo(start, fit(start));
    // Keep the frame fitted when the page resizes; the screen width itself is left alone.
    const ro = new ResizeObserver(() => {
      if (drag.current) return;
      jumpTo(width.current.target, fit(width.current.target));
    });
    ro.observe(stage);
    // The frame's height changes between device kinds (CSS transition); keep the stage height in step.
    const device = deviceRef.current;
    const onResize = new ResizeObserver(() => render());
    if (device) onResize.observe(device);
    return () => {
      ro.disconnect();
      onResize.disconnect();
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Grab it mid-flight: freeze both springs where they are on screen right now.
    cancelAnimationFrame(raf.current);
    width.current.vel = 0;
    zoom.current.vel = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    const w = width.current.value;
    const k = zoom.current.value;
    drag.current = { x: e.clientX, visual: (w + BEZEL * 2) * k, zoom: k, width: w };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    // The frame grows from its centre, so the edge under the pointer moves at the pointer's speed.
    let visual = d.visual + (e.clientX - d.x) * 2;
    const max = avail();
    if (visual > max) visual = max + rubberband(visual - max, max);
    let w = visual / d.zoom - BEZEL * 2;
    if (w < MIN) w = MIN - rubberband(MIN - w, MIN);
    width.current.value = w;
    render();
  };
  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    // Settle inside the limits, then zoom to fit the new width.
    const maxW = Math.max(avail() - BEZEL * 2, d.zoom < 1 ? d.width : 0);
    goTo(Math.min(maxW, Math.max(MIN, width.current.value)));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const by = e.shiftKey ? 100 : 20;
    const w = width.current.target;
    if (e.key === "ArrowLeft") goTo(w - by);
    else if (e.key === "ArrowRight") goTo(w + by);
    else if (e.key === "Home") goTo(MIN);
    else if (e.key === "End") goTo(1280);
    else return;
    e.preventDefault();
  };

  return (
    <div className="rdemo devtools">
      <div className="devtools__bar">
        <div className="devtools__devices" role="group" aria-label="Device">
          {PRESETS.map(({ id, label, width: w, Icon }) => (
            <button key={id} type="button" className="devtools__device" aria-pressed={kind === id} onClick={() => goTo(w)}>
              <Icon size={15} weight="bold" aria-hidden />
              {label}
            </button>
          ))}
        </div>
        <span className="devtools__readout mono" aria-hidden="true">
          <span ref={dimsRef}>1280 × 720</span>
          <span className="devtools__sep" />
          <span ref={zoomRef}>100%</span>
        </span>
      </div>

      <div className="devtools__ruler" aria-hidden="true">
        {BANDS.map((b, i) => (
          <button
            key={b.id}
            ref={(el) => void (bandRefs.current[i] = el)}
            type="button"
            tabIndex={-1}
            className="devtools__band"
            data-band={b.id}
            data-on={kind === b.id || undefined}
            onClick={() => goTo(PRESETS.find((p) => p.id === b.id)!.width)}
          >
            <span>{b.label}</span>
          </button>
        ))}
      </div>

      <div ref={stageRef} className="rdemo__stage">
        <div ref={deviceRef} className="device" data-kind={kind}>
          <div className="device__screen">
            {kind === "desktop" ? (
              <div className="device__browser" aria-hidden="true">
                <span className="device__dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="device__url">northfield-solar.example</span>
              </div>
            ) : (
              <div className="device__status mono" aria-hidden="true">
                <span>9:41</span>
                {kind === "phone" && <span className="device__island" />}
                <span className="device__status-icons">
                  <CellSignalFull size={12} weight="fill" />
                  <WifiHigh size={12} weight="bold" />
                  <BatteryFull size={14} weight="fill" />
                </span>
              </div>
            )}
            <div className="device__page">
              <ExampleSite />
            </div>
          </div>
          {kind === "desktop" && <div className="device__stand" aria-hidden="true" />}
        </div>
        <div
          ref={handleRef}
          className="rdemo__handle"
          role="slider"
          tabIndex={0}
          aria-label="Screen width"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={1280}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKey}
        >
          <DotsSixVertical size={18} weight="bold" aria-hidden />
        </div>
      </div>

      <div className="devtools__dock">
        <CodePane file="index.html" lang="html" lines={HTML} kind={kind} />
        <CodePane file="styles.css" lang="css" lines={CSS} kind={kind} />
      </div>
      <p className="rdemo__caption">
        Example site. Lit lines are the code in use at this width. Drag the handle, click the ruler, or use the arrow keys.
      </p>
    </div>
  );
}

/** One file in the docked code panel. Size-specific lines are lit when they apply and dimmed when not. */
function CodePane({ file, lang, lines, kind }: { file: string; lang: Lang; lines: Line[]; kind: DeviceKind }) {
  return (
    <figure className="code">
      <figcaption className="code__tab mono">{file}</figcaption>
      <pre className="code__body mono">
        {lines.map((l, i) => (
          <span key={i} className="code__line" data-on={l.when ? applies(l.when, kind) : undefined}>
            <span className="code__ln" aria-hidden="true">
              {i + 1}
            </span>
            <code>{l.code ? highlight(l.code, lang) : " "}</code>
          </span>
        ))}
      </pre>
    </figure>
  );
}

/** The example client site. Plain markup; every layout change comes from container queries in CSS. */
function ExampleSite() {
  return (
    <div className="mini">
      <header className="mini__nav">
        <span className="mini__logo">
          <SolarPanel size={18} weight="fill" aria-hidden /> Northfield Solar
        </span>
        <nav className="mini__links" aria-hidden="true">
          <span>Services</span>
          <span>Projects</span>
          <span>Contact</span>
        </nav>
        <span className="mini__menu" aria-hidden="true">
          <List size={18} weight="bold" />
        </span>
      </header>
      <div className="mini__hero">
        <div className="mini__copy">
          <p className="mini__h">Clean power for growing businesses.</p>
          <p className="mini__p">Commercial solar, designed and installed across Gauteng.</p>
          <span className="mini__btn">Get a quote</span>
        </div>
        <div className="mini__art" aria-hidden="true" />
      </div>
      <div className="mini__cards">
        {[
          { t: "Rooftop systems", I: SolarPanel },
          { t: "Battery backup", I: BatteryCharging },
          { t: "Live monitoring", I: ChartLineUp },
        ].map(({ t, I }) => (
          <div key={t} className="mini__card">
            <I size={20} weight="duotone" aria-hidden />
            <span>{t}</span>
          </div>
        ))}
      </div>
      <div className="mini__projects">
        <p className="mini__h2">Recent installs</p>
        <div className="mini__grid" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="mini__band">
        <p className="mini__h2">See what you could save.</p>
        <span className="mini__btn">Book a site visit</span>
      </div>
      <footer className="mini__foot">© Northfield Solar</footer>
    </div>
  );
}
