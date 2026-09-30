"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowUpRight, Browser, Code, DeviceMobile, PenNib, type Icon } from "@phosphor-icons/react";
import { services, serviceHref, type ServiceKey } from "@/lib/content";

const ICON: Record<ServiceKey, Icon> = { web: Browser, software: Code, uiux: PenNib, mobile: DeviceMobile };

/*
 * Home services as giant type instead of cards. Hovering a row rolls its name to an accent italic copy,
 * dims the other rows, and shows a preview that trails the cursor on a critically damped follow,
 * leaning with the pointer's horizontal speed. Touch and reduced motion get the plain list.
 */
export function ServiceList() {
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ServiceKey | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0, tilt: 0 });
  const raf = useRef(0);
  const last = useRef(0);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const tick = (now: number) => {
    const el = previewRef.current;
    if (!el) return;
    // Frame-rate independent follow (same feel on 60Hz and 120Hz screens).
    const dt = Math.min((now - (last.current || now - 16)) / 1000, 0.05);
    last.current = now;
    const k = 1 - Math.exp(-dt * 9);
    const p = pos.current;
    const t = target.current;
    const dx = t.x - p.x;
    p.x += dx * k;
    p.y += (t.y - p.y) * k;
    p.tilt += (Math.max(-14, Math.min(14, dx * 0.12)) - p.tilt) * k;
    el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.tilt}deg)`;
    const moving = Math.abs(dx) + Math.abs(t.y - p.y) + Math.abs(p.tilt) > 0.2;
    raf.current = moving ? requestAnimationFrame(tick) : 0;
    if (!moving) last.current = 0;
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled.current || !rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };
  const onEnterRow = (key: ServiceKey) => (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    // First entry: start the preview at the pointer instead of flying in from the corner.
    if (!active && rootRef.current) {
      const r = rootRef.current.getBoundingClientRect();
      pos.current = { x: e.clientX - r.left, y: e.clientY - r.top, tilt: 0 };
    }
    setActive(key);
  };

  return (
    <div
      ref={rootRef}
      className="slist"
      data-active={active ?? undefined}
      onPointerMove={onMove}
      onPointerLeave={() => setActive(null)}
    >
      {services.map((s, i) => (
        <Link
          key={s.key}
          href={serviceHref(s)}
          className="slist__row"
          data-reveal
          style={{ "--d": i } as CSSProperties}
          onPointerEnter={onEnterRow(s.key)}
          onFocus={() => setActive(s.key)}
          onBlur={() => setActive(null)}
        >
          <span className="slist__num mono">{s.number}</span>
          <span className="slist__name" aria-label={s.name}>
            <span aria-hidden="true">{s.name}</span>
            <span aria-hidden="true">{s.name}</span>
          </span>
          <span className="slist__tags" aria-hidden="true">
            {s.included.slice(0, 2).map((it) => (
              <span key={it.id}>{it.title}</span>
            ))}
          </span>
          <span className="slist__arrow" aria-hidden="true">
            <ArrowUpRight size={28} weight="bold" />
          </span>
        </Link>
      ))}

      <div ref={previewRef} className="slist__preview" aria-hidden="true">
        {services.map((s) => {
          const Glyph = ICON[s.key];
          return (
            <div key={s.key} className="slist__card" data-on={active === s.key || undefined}>
              <span className="slist__disc">
                <Glyph size={44} weight="duotone" />
              </span>
              <ul>
                {s.included.map((it) => (
                  <li key={it.id}>{it.title}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
