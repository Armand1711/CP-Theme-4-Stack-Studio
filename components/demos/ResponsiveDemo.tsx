"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import {
  BatteryCharging, ChartLineUp, Desktop, DeviceMobile, DeviceTablet, DotsSixVertical, List, SolarPanel,
} from "@phosphor-icons/react";
import { SpecularButton } from "../SpecularButton";

/*
 * Web Development signature: a live, resizable browser frame. The example site inside is laid out
 * with container queries, so it genuinely reflows as the frame changes width (drag the handle,
 * use the arrow keys, or pick a device preset). Past the edges the frame rubber-bands, then springs back.
 */

const MIN = 320;
const PRESETS = [
  { id: "desktop", label: "Desktop", width: 1180, Icon: Desktop },
  { id: "tablet", label: "Tablet", width: 768, Icon: DeviceTablet },
  { id: "phone", label: "Phone", width: 375, Icon: DeviceMobile },
] as const;

const rubberband = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

export function ResponsiveDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const width = useRef(0);
  const drag = useRef<{ startX: number; startW: number } | null>(null);
  const [preset, setPreset] = useState<string | null>("desktop");

  // Leave room on the right for the drag handle.
  const maxWidth = () => (stageRef.current?.clientWidth ?? 1200) - 16;

  const apply = (w: number, animate: boolean) => {
    const frame = frameRef.current;
    if (!frame) return;
    width.current = w;
    frame.style.transition = animate ? "width 650ms var(--ease-out)" : "none";
    frame.style.width = `${w}px`;
    handleRef.current?.setAttribute("aria-valuenow", String(Math.round(w)));
  };
  const clamp = (w: number) => Math.min(maxWidth(), Math.max(MIN, w));

  useEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    if (!frame || !stage) return;
    apply(maxWidth(), false);
    // The readout always reports the frame's real rendered width, including mid-animation.
    const ro = new ResizeObserver(() => {
      if (readoutRef.current) readoutRef.current.textContent = `${Math.round(frame.getBoundingClientRect().width)}px`;
    });
    ro.observe(frame);
    let lastMax = maxWidth();
    const onStage = new ResizeObserver(() => {
      if (drag.current) return;
      const max = maxWidth();
      // Stay full-width if we were full-width; otherwise just keep the frame inside the stage.
      apply(width.current >= lastMax - 1 ? max : clamp(width.current), false);
      lastMax = max;
    });
    onStage.observe(stage);
    return () => {
      ro.disconnect();
      onStage.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startW: width.current };
    setPreset(null);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const raw = drag.current.startW + (e.clientX - drag.current.startX);
    const max = maxWidth();
    const w = raw > max ? max + rubberband(raw - max, max) : raw < MIN ? MIN - rubberband(MIN - raw, MIN) : raw;
    apply(w, false);
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    apply(clamp(width.current), true);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 100 : 20;
    if (e.key === "ArrowLeft") apply(clamp(width.current - step), false);
    else if (e.key === "ArrowRight") apply(clamp(width.current + step), false);
    else if (e.key === "Home") apply(MIN, true);
    else if (e.key === "End") apply(maxWidth(), true);
    else return;
    e.preventDefault();
    setPreset(null);
  };

  return (
    <div className="rdemo">
      <div className="rdemo__controls">
        <div className="pills" role="group" aria-label="Device preset">
          {PRESETS.map(({ id, label, width: w, Icon }) => (
            <SpecularButton
              key={id}
              type="button"
              className="pill"
              aria-pressed={preset === id}
              onClick={() => {
                setPreset(id);
                apply(clamp(w), true);
              }}
            >
              <Icon size={16} weight="bold" aria-hidden />
              {label}
            </SpecularButton>
          ))}
        </div>
        <span ref={readoutRef} className="mono rdemo__readout" aria-live="off" />
      </div>

      <div ref={stageRef} className="rdemo__stage">
        <div ref={frameRef} className="rdemo__frame">
          <div className="rdemo__bar">
            <span className="rdemo__url">northfield-solar.example</span>
          </div>
          <div className="rdemo__page">
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
            </div>
          </div>
          <div
            ref={handleRef}
            className="rdemo__handle"
            role="slider"
            tabIndex={0}
            aria-label="Preview width"
            aria-valuemin={MIN}
            aria-valuemax={1400}
            aria-valuenow={0}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey}
          >
            <DotsSixVertical size={18} weight="bold" aria-hidden />
          </div>
        </div>
      </div>
      <p className="rdemo__caption">Example site. Drag the handle, or focus it and use the arrow keys.</p>
    </div>
  );
}
