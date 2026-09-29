"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { AddressBook, ArrowCounterClockwise, Browser, ChatCircleDots, FileText, Play } from "@phosphor-icons/react";
import { SpecularButton } from "../SpecularButton";

/*
 * Software Development signature: a four-step automation. Run sends a pulse down each wire
 * (WAAPI on stroke-dashoffset), lights each step and writes a timed log. Steps can be dragged
 * anywhere in the stage; the wires re-route live.
 */

const NODES = [
  { id: "form", title: "Website enquiry", detail: "Form submitted", Icon: Browser },
  { id: "crm", title: "CRM", detail: "Contact created", Icon: AddressBook },
  { id: "quote", title: "Quote", detail: "Draft generated", Icon: FileText },
  { id: "team", title: "Sales team", detail: "Notified on chat", Icon: ChatCircleDots },
];

type Offset = { x: number; y: number };

export function PipelineDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wireRefs = useRef<(SVGPathElement | null)[]>([]);
  const pulseRefs = useRef<(SVGPathElement | null)[]>([]);
  const offsets = useRef<Offset[]>(NODES.map(() => ({ x: 0, y: 0 })));
  const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const alive = useRef(true);
  const [lit, setLit] = useState(-1);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<{ t: string; text: string }[]>([]);
  const [moved, setMoved] = useState(false);

  /** Re-route every wire from the current node positions. */
  const draw = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const s = stage.getBoundingClientRect();
    const vertical = s.width < 700;
    for (let i = 0; i < NODES.length - 1; i++) {
      const a = nodeRefs.current[i]?.getBoundingClientRect();
      const b = nodeRefs.current[i + 1]?.getBoundingClientRect();
      if (!a || !b) continue;
      let d: string;
      if (vertical) {
        const x1 = a.left + a.width / 2 - s.left, y1 = a.bottom - s.top;
        const x2 = b.left + b.width / 2 - s.left, y2 = b.top - s.top;
        const h = Math.max(24, (y2 - y1) / 2);
        d = `M${x1},${y1} C${x1},${y1 + h} ${x2},${y2 - h} ${x2},${y2}`;
      } else {
        const x1 = a.right - s.left, y1 = a.top + a.height / 2 - s.top;
        const x2 = b.left - s.left, y2 = b.top + b.height / 2 - s.top;
        const h = Math.max(24, Math.abs(x2 - x1) / 2);
        d = `M${x1},${y1} C${x1 + h},${y1} ${x2 - h},${y2} ${x2},${y2}`;
      }
      wireRefs.current[i]?.setAttribute("d", d);
      pulseRefs.current[i]?.setAttribute("d", d);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    draw();
    const ro = new ResizeObserver(draw);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => {
      alive.current = false;
      ro.disconnect();
    };
  }, [draw]);

  const onDown = (i: number) => (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { i, sx: e.clientX, sy: e.clientY, ox: offsets.current[i].x, oy: offsets.current[i].y };
    e.currentTarget.dataset.dragging = "true";
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const stage = stageRef.current;
    const node = d && nodeRefs.current[d.i];
    if (!d || !stage || !node) return;
    // Keep the node inside the stage.
    const s = stage.getBoundingClientRect();
    const n = node.getBoundingClientRect();
    const cur = offsets.current[d.i];
    let x = d.ox + (e.clientX - d.sx);
    let y = d.oy + (e.clientY - d.sy);
    const baseLeft = n.left - cur.x, baseTop = n.top - cur.y;
    x = Math.min(s.right - n.width - baseLeft, Math.max(s.left - baseLeft, x));
    y = Math.min(s.bottom - n.height - baseTop, Math.max(s.top - baseTop, y));
    offsets.current[d.i] = { x, y };
    node.style.translate = `${x}px ${y}px`;
    draw();
    if (!moved) setMoved(true);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    delete e.currentTarget.dataset.dragging;
  };

  const resetLayout = () => {
    offsets.current = NODES.map(() => ({ x: 0, y: 0 }));
    nodeRefs.current.forEach((n) => {
      if (!n) return;
      n.style.transition = "translate 600ms var(--ease-out)";
      n.style.translate = "0px 0px";
      setTimeout(() => (n.style.transition = ""), 650);
    });
    const start = performance.now();
    const follow = () => {
      draw();
      if (performance.now() - start < 700 && alive.current) requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
    setMoved(false);
  };

  const run = async () => {
    if (running) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const t0 = performance.now();
    const stamp = () => `+${((performance.now() - t0) / 1000).toFixed(1)}s`;
    setRunning(true);
    setLog([]);
    setLit(-1);
    for (let i = 0; i < NODES.length; i++) {
      if (!alive.current) return;
      setLit(i);
      setLog((l) => [...l, { t: stamp(), text: NODES[i].detail }]);
      if (i === NODES.length - 1) break;
      const pulse = pulseRefs.current[i];
      if (reduce || !pulse) {
        await wait(250);
        continue;
      }
      await wait(180);
      await pulse.animate([{ strokeDashoffset: 0.16, opacity: 1 }, { strokeDashoffset: -1, opacity: 1 }], {
        duration: 650,
        easing: "cubic-bezier(0.77, 0, 0.175, 1)",
      }).finished;
    }
    if (!alive.current) return;
    setLog((l) => [...l, { t: stamp(), text: "Done. No one copied anything by hand." }]);
    setRunning(false);
  };

  return (
    <div className="pipe">
      <div ref={stageRef} className="pipe__stage">
        <svg className="pipe__wires" aria-hidden="true">
          {NODES.slice(0, -1).map((n, i) => (
            <g key={n.id}>
              <path ref={(el) => void (wireRefs.current[i] = el)} className="pipe__wire" data-on={lit > i || undefined} />
              <path ref={(el) => void (pulseRefs.current[i] = el)} className="pipe__pulse" pathLength={1} />
            </g>
          ))}
        </svg>
        {NODES.map(({ id, title, detail, Icon }, i) => (
          <div
            key={id}
            ref={(el) => void (nodeRefs.current[i] = el)}
            className="pipe__node"
            data-lit={lit >= i || undefined}
            data-active={lit === i && running ? true : undefined}
            onPointerDown={onDown(i)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <span className="pipe__icon">
              <Icon size={22} weight="duotone" aria-hidden />
            </span>
            <span>
              <span className="pipe__title">{title}</span>
              <span className="pipe__detail">{detail}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="pipe__footer">
        <div className="pipe__actions">
          <SpecularButton type="button" autoAnimate className="btn btn--primary btn--sm" onClick={run} disabled={running}>
            <Play size={14} weight="fill" aria-hidden />
            {running ? "Running…" : log.length ? "Run again" : "Run"}
          </SpecularButton>
          {moved && (
            <SpecularButton type="button" className="btn btn--ghost btn--sm" onClick={resetLayout}>
              <ArrowCounterClockwise size={14} weight="bold" aria-hidden />
              Reset layout
            </SpecularButton>
          )}
        </div>
        <ol className="pipe__log mono" aria-live="polite">
          {log.length === 0 && <li className="pipe__log-empty">Press run to watch an enquiry move through.</li>}
          {log.map((l, i) => (
            <li key={i}>
              <span>{l.t}</span>
              {l.text}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
