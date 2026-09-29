"use client";

import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowsHorizontal } from "@phosphor-icons/react";

/*
 * UI/UX signature: the same booking card twice, wireframe underneath and finished design on top,
 * split by a clip-path you drag. Both layers share one markup so every element lines up exactly;
 * only the styling differs. A one-time sweep hints at the gesture when the card first scrolls into view.
 */

const DAYS = ["Mon 12", "Tue 13", "Wed 14", "Thu 15"];
const TIMES = ["09:00", "11:30", "14:00"];

function Card({ variant }: { variant: "wire" | "final" }) {
  return (
    <div className={`cmp__card cmp__card--${variant}`} aria-hidden={variant === "wire" || undefined}>
      {variant === "wire" && <span className="cmp__note" style={{ top: 64, left: 18 }}>H2 / 24</span>}
      <p className="cmp__title">Book a site visit</p>
      <p className="cmp__sub">Pick a day and we&apos;ll confirm within the hour.</p>
      <div className="cmp__label">Day</div>
      <div className="cmp__chips">
        {DAYS.map((d, i) => (
          <span key={d} className="cmp__chip" data-on={i === 2 || undefined}>
            {d}
          </span>
        ))}
      </div>
      <div className="cmp__label">Time</div>
      <div className="cmp__chips">
        {TIMES.map((t, i) => (
          <span key={t} className="cmp__chip" data-on={i === 1 || undefined}>
            {t}
          </span>
        ))}
      </div>
      <span className="cmp__btn">Confirm visit</span>
      {variant === "wire" && <span className="cmp__note" style={{ bottom: 84, left: 18 }}>Primary action</span>}
    </div>
  );
}

export function CompareDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  const dragging = useRef(false);

  const set = (p: number) => {
    pos.current = Math.min(100, Math.max(0, p));
    stageRef.current?.style.setProperty("--pos", `${pos.current}%`);
    handleRef.current?.setAttribute("aria-valuenow", String(Math.round(pos.current)));
  };
  const fromEvent = (e: PointerEvent) => {
    const r = stageRef.current!.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };
  const stopHint = () => stageRef.current?.classList.remove("is-hinting");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        stage.classList.add("is-hinting");
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(stage);
    const end = () => stage.classList.remove("is-hinting");
    stage.addEventListener("animationend", end);
    return () => {
      io.disconnect();
      stage.removeEventListener("animationend", end);
    };
  }, []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    stopHint();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    fromEvent(e);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => dragging.current && fromEvent(e);
  const onUp = () => (dragging.current = false);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") set(pos.current - step);
    else if (e.key === "ArrowRight") set(pos.current + step);
    else return;
    e.preventDefault();
    stopHint();
  };

  return (
    <div className="cmp">
      <div
        ref={stageRef}
        className="cmp__stage"
        style={{ "--pos": "50%" } as CSSProperties}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="cmp__layer cmp__layer--wire">
          <Card variant="wire" />
        </div>
        <div className="cmp__layer cmp__layer--final">
          <Card variant="final" />
        </div>
        <span className="cmp__tag cmp__tag--left">Wireframe</span>
        <span className="cmp__tag cmp__tag--right">Final design</span>
        <div
          ref={handleRef}
          className="cmp__handle"
          role="slider"
          tabIndex={0}
          aria-label="Compare wireframe and final design"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={50}
          onKeyDown={onKey}
        >
          <span>
            <ArrowsHorizontal size={18} weight="bold" aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}
