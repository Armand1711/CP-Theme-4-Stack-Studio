"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowsHorizontal, Cursor, DiamondsFour, Hash, PenNib, Square, SquaresFour, TextT, type Icon } from "@phosphor-icons/react";

/*
 * UI/UX signature, styled like a design tool. The canvas holds the same booking card twice, wireframe
 * underneath and finished design on top, split by a clip-path you drag. Both layers share one markup so
 * every element lines up exactly; only the styling differs.
 *
 * Around it: a layers panel and a properties inspector. Selecting a layer (in the panel, or by clicking
 * the card without dragging) draws a selection box with handles and the element's real size, and the
 * inspector shows its fill, radius and type, which match the card's actual CSS. A one-time sweep hints
 * at the drag when the canvas first scrolls into view.
 */

const DAYS = ["Mon 12", "Tue 13", "Wed 14", "Thu 15"];
const TIMES = ["09:00", "11:30", "14:00"];

type LayerId = "frame" | "title" | "sub" | "days" | "times" | "cta";
type Layer = {
  id: LayerId;
  name: string;
  kind: string;
  Icon: Icon;
  depth: 0 | 1;
  fill: string;
  radius?: string;
  gap?: string;
  text?: { font: string; size: string; weight: string; tracking: string };
};

// Values mirror the .cmp__card--final styles in globals.css.
const LAYERS: Layer[] = [
  { id: "frame", name: "Book a visit", kind: "Frame", Icon: Hash, depth: 0, fill: "#1C1A18", radius: "24" },
  { id: "title", name: "Title", kind: "Text", Icon: TextT, depth: 1, fill: "#F5F3EF", text: { font: "Archivo", size: "24", weight: "Semi Bold", tracking: "-3%" } },
  { id: "sub", name: "Subtitle", kind: "Text", Icon: TextT, depth: 1, fill: "#A8A6A1", text: { font: "Archivo", size: "14", weight: "Regular", tracking: "0%" } },
  { id: "days", name: "Day picker", kind: "Auto layout", Icon: SquaresFour, depth: 1, fill: "#F36C21", radius: "999", gap: "8" },
  { id: "times", name: "Time picker", kind: "Auto layout", Icon: SquaresFour, depth: 1, fill: "#F36C21", radius: "999", gap: "8" },
  { id: "cta", name: "Confirm button", kind: "Component", Icon: DiamondsFour, depth: 1, fill: "#F36C21", radius: "999", text: { font: "Archivo", size: "15", weight: "Semi Bold", tracking: "0%" } },
];

const TOOLS: { label: string; Icon: Icon }[] = [
  { label: "Move", Icon: Cursor },
  { label: "Frame", Icon: Hash },
  { label: "Shape", Icon: Square },
  { label: "Text", Icon: TextT },
  { label: "Pen", Icon: PenNib },
];

function Card({ variant }: { variant: "wire" | "final" }) {
  return (
    <div className={`cmp__card cmp__card--${variant}`} data-layer="frame" aria-hidden={variant === "wire" || undefined}>
      {variant === "wire" && <span className="cmp__note" style={{ top: 64, left: 18 }}>H2 / 24</span>}
      <p className="cmp__title" data-layer="title">Book a site visit</p>
      <p className="cmp__sub" data-layer="sub">Pick a day and we&apos;ll confirm within the hour.</p>
      <div className="cmp__label">Day</div>
      <div className="cmp__chips" data-layer="days">
        {DAYS.map((d, i) => (
          <span key={d} className="cmp__chip" data-on={i === 2 || undefined}>
            {d}
          </span>
        ))}
      </div>
      <div className="cmp__label">Time</div>
      <div className="cmp__chips" data-layer="times">
        {TIMES.map((t, i) => (
          <span key={t} className="cmp__chip" data-on={i === 1 || undefined}>
            {t}
          </span>
        ))}
      </div>
      <span className="cmp__btn" data-layer="cta">Confirm visit</span>
      {variant === "wire" && <span className="cmp__note" style={{ bottom: 84, left: 18 }}>Primary action</span>}
    </div>
  );
}

export function CompareDemo() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const selRef = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  const press = useRef<{ x: number; y: number; offset: number; dragging: boolean } | null>(null);
  const [selected, setSelected] = useState<LayerId>("cta");
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const set = (p: number) => {
    pos.current = Math.min(100, Math.max(0, p));
    stageRef.current?.style.setProperty("--pos", `${pos.current}%`);
    handleRef.current?.setAttribute("aria-valuenow", String(Math.round(pos.current)));
  };
  const stopHint = () => stageRef.current?.classList.remove("is-hinting");

  /** Draw the selection box over the selected element (measured from the finished card). */
  const place = () => {
    const canvas = canvasRef.current;
    const box = selRef.current;
    const el = stageRef.current?.querySelector<HTMLElement>(`.cmp__card--final [data-layer="${selected}"]`);
    if (!canvas || !box || !el) return;
    const c = canvas.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    box.style.transform = `translate(${r.left - c.left}px, ${r.top - c.top}px)`;
    box.style.width = `${r.width}px`;
    box.style.height = `${r.height}px`;
    const w = Math.round(el.offsetWidth);
    const h = Math.round(el.offsetHeight);
    setDims((d) => (d.w === w && d.h === h ? d : { w, h }));
  };

  useLayoutEffect(() => {
    place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ro = new ResizeObserver(() => place());
    ro.observe(canvas);
    ro.observe(stage);
    document.fonts?.ready.then(() => place());

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => ro.disconnect();
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
      ro.disconnect();
      io.disconnect();
      stage.removeEventListener("animationend", end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Press anywhere on the card: a drag moves the divider (keeping the offset from where you grabbed),
  // a click without movement selects the element under the pointer.
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    stopHint();
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = stageRef.current!.getBoundingClientRect();
    const dividerX = r.left + (pos.current / 100) * r.width;
    const onHandle = !!(e.target as Element).closest(".cmp__handle");
    press.current = { x: e.clientX, y: e.clientY, offset: e.clientX - dividerX, dragging: onHandle };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (!p) return;
    if (!p.dragging && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 5) return;
    p.dragging = true;
    const r = stageRef.current!.getBoundingClientRect();
    set(((e.clientX - p.offset - r.left) / r.width) * 100);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    press.current = null;
    if (!p || p.dragging) return;
    const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-layer]");
    if (hit) setSelected(hit.dataset.layer as LayerId);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") set(pos.current - step);
    else if (e.key === "ArrowRight") set(pos.current + step);
    else return;
    e.preventDefault();
    stopHint();
  };

  const layer = LAYERS.find((l) => l.id === selected)!;

  return (
    <div className="dt">
      <div className="dt__bar">
        <div className="dt__tools" aria-hidden="true">
          {TOOLS.map(({ label, Icon }, i) => (
            <span key={label} className="dt__tool" data-on={i === 0 || undefined} title={label}>
              <Icon size={16} weight={i === 0 ? "fill" : "bold"} />
            </span>
          ))}
        </div>
        <span className="dt__file">
          Booking flow <span>/</span> Visit picker
        </span>
        <span className="dt__zoom mono" aria-hidden="true">
          100%
        </span>
      </div>

      <div className="dt__main">
        <nav className="dt__layers" aria-label="Layers">
          <p className="dt__panel-title">Layers</p>
          <ul>
            {LAYERS.map(({ id, name, Icon, depth }) => (
              <li key={id}>
                <button
                  type="button"
                  className="dt__layer"
                  aria-pressed={selected === id}
                  style={{ "--depth": depth } as CSSProperties}
                  onClick={() => setSelected(id)}
                >
                  <Icon size={14} weight="bold" aria-hidden />
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div ref={canvasRef} className="dt__canvas">
          <p className="dt__frame-label" aria-hidden="true">
            <Hash size={12} weight="bold" /> Book a visit
          </p>
          <div
            ref={stageRef}
            className="cmp__stage"
            style={{ "--pos": "50%" } as CSSProperties}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => (press.current = null)}
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
          <div ref={selRef} className="dt__sel" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <span className="dt__size mono">
              {dims.w} × {dims.h}
            </span>
          </div>
        </div>

        <aside className="dt__inspect" aria-label={`Properties of ${layer.name}`} aria-live="polite">
          <p className="dt__panel-title">
            <layer.Icon size={14} weight="bold" aria-hidden /> {layer.kind}
          </p>
          <dl className="dt__props">
            <div className="dt__row">
              <dt>W</dt>
              <dd className="mono">{dims.w}</dd>
              <dt>H</dt>
              <dd className="mono">{dims.h}</dd>
            </div>
            {layer.radius && (
              <div className="dt__row">
                <dt>Radius</dt>
                <dd className="mono">{layer.radius}</dd>
                {layer.gap && (
                  <>
                    <dt>Gap</dt>
                    <dd className="mono">{layer.gap}</dd>
                  </>
                )}
              </div>
            )}
          </dl>
          <p className="dt__panel-title">Fill</p>
          <p className="dt__fill mono">
            <span className="dt__swatch" style={{ background: layer.fill }} aria-hidden="true" />
            {layer.fill}
            <span className="dt__fill-pct">100%</span>
          </p>
          {layer.text && (
            <>
              <p className="dt__panel-title">Text</p>
              <dl className="dt__props">
                <div className="dt__row dt__row--wide">
                  <dt className="visually-hidden">Font</dt>
                  <dd>{layer.text.font}</dd>
                </div>
                <div className="dt__row">
                  <dt className="visually-hidden">Weight</dt>
                  <dd>{layer.text.weight}</dd>
                  <dt className="visually-hidden">Size</dt>
                  <dd className="mono">{layer.text.size}</dd>
                </div>
                <div className="dt__row">
                  <dt>Tracking</dt>
                  <dd className="mono">{layer.text.tracking}</dd>
                </div>
              </dl>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
