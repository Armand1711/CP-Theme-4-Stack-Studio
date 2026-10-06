"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Browser, Code, DeviceMobile, PenNib, type Icon } from "@phosphor-icons/react";
import { services, serviceHref, type ServiceKey } from "@/lib/content";
import { onServiceSignal, signalService } from "@/lib/serviceSync";

/*
 * A one-line strip under the home hero's buttons that cycles through the four services, each written
 * in its own tool's voice (CSS, an API call, a design selection, a spring). Each line links to its
 * service. Pauses while hovered or focused; under reduced motion it only changes when a dot is pressed.
 * Kept in step with the hero stack: the showing service's layer lifts, and hovering a layer shows it here.
 */

const LINES: Record<ServiceKey, { Icon: Icon; line: ReactNode }> = {
  web: {
    Icon: Browser,
    line: (
      <>
        <span className="tok tok--at">@container</span> (<span className="tok tok--prop">max-width</span>:{" "}
        <span className="tok tok--num">599px</span>)
      </>
    ),
  },
  software: {
    Icon: Code,
    line: (
      <>
        <span className="tok tok--kw">POST</span> /crm/contacts <span className="tok tok--str">201</span>
      </>
    ),
  },
  uiux: {
    Icon: PenNib,
    line: (
      <>
        <span className="ticker__sel">Confirm button</span> <span className="tok tok--comment">512 × 46</span>
      </>
    ),
  },
  mobile: {
    Icon: DeviceMobile,
    line: (
      <>
        <span className="tok tok--kw">spring</span>(<span className="tok tok--prop">damping</span>:{" "}
        <span className="tok tok--num">0.8</span>)
      </>
    ),
  },
};

const INTERVAL = 2800;

export function HeroTicker({ style }: { style?: CSSProperties }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // Held while the pointer is over a layer of the hero stack (see lib/serviceSync.ts).
  const [stackHold, setStackHold] = useState(false);

  useEffect(() => {
    if (paused || stackHold || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % services.length), INTERVAL);
    return () => window.clearInterval(t);
  }, [paused, stackHold]);

  // Tell the stack which service is showing, and follow the stack when a layer is hovered.
  useEffect(() => {
    signalService({ key: services[i].key, source: "ticker" });
  }, [i]);
  useEffect(
    () =>
      onServiceSignal((s) => {
        if (s.source !== "stack") return;
        setStackHold(s.key !== null);
        if (s.key) setI(services.findIndex((x) => x.key === s.key));
      }),
    [],
  );

  return (
    <div
      className="ticker"
      style={style}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="ticker__window">
        {services.map((s, n) => {
          const { Icon, line } = LINES[s.key];
          return (
            <Link
              key={s.key}
              href={serviceHref(s)}
              className="ticker__item"
              data-on={n === i || undefined}
              tabIndex={n === i ? undefined : -1}
              aria-hidden={n === i ? undefined : true}
            >
              <span className="ticker__tag">
                <Icon size={14} weight="bold" aria-hidden />
                {s.navLabel}
              </span>
              <span className="ticker__line mono" aria-hidden="true">
                {line}
              </span>
              <span className="visually-hidden">{s.name}</span>
              <ArrowRight className="ticker__arrow" size={14} weight="bold" aria-hidden />
            </Link>
          );
        })}
      </div>
      <div className="ticker__dots">
        {services.map((s, n) => (
          <button
            key={s.key}
            type="button"
            className="ticker__dot"
            aria-label={`Show ${s.name}`}
            aria-pressed={n === i}
            onClick={() => setI(n)}
          />
        ))}
      </div>
    </div>
  );
}
