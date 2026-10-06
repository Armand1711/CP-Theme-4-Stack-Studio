"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { AddressBook, ArrowCounterClockwise, Browser, ChatCircleDots, FileText, Play } from "@phosphor-icons/react";
import { SpecularButton } from "../SpecularButton";
import { highlight } from "./highlight";

/*
 * Software Development signature, styled like a workflow editor. Four steps of an automation sit on a
 * canvas (drag them anywhere; the wires re-route live). Clicking a step opens it in the inspector, which
 * shows the record that step passes on. Run sends a test enquiry through: a pulse travels each wire
 * (WAAPI on stroke-dashoffset), each step lights and hands its payload to the inspector, and the console
 * logs the API call it made. Everything is simulated example data.
 */

const NODES = [
  {
    id: "form", title: "Website enquiry", detail: "Form submitted", Icon: Browser,
    req: { method: "POST", path: "/api/enquiries", status: 202, ms: 38 },
    payload: {
      name: "Thandi Mokoena",
      company: "Northfield Solar",
      email: "thandi@northfield.example",
      message: "Quote for three rooftop sites",
    },
  },
  {
    id: "crm", title: "CRM", detail: "Contact created", Icon: AddressBook,
    req: { method: "POST", path: "/crm/contacts", status: 201, ms: 84 },
    payload: { id: "con_4821", name: "Thandi Mokoena", company: "Northfield Solar", source: "website", stage: "new lead" },
  },
  {
    id: "quote", title: "Quote", detail: "Draft generated", Icon: FileText,
    req: { method: "POST", path: "/quotes", status: 201, ms: 112 },
    payload: { id: "Q-1047", contact: "con_4821", sites: 3, status: "draft", owner: null },
  },
  {
    id: "team", title: "Sales team", detail: "Notified on chat", Icon: ChatCircleDots,
    req: { method: "POST", path: "/chat/messages", status: 200, ms: 61 },
    payload: { channel: "#sales", text: "New lead: Thandi Mokoena (Northfield Solar). Quote Q-1047 drafted.", mention: "@on-call" },
  },
];

type Offset = { x: number; y: number };
type LogLine = { t: string; method?: string; path?: string; status?: number; ms?: number; text?: string };

export function PipelineDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wireRefs = useRef<(SVGPathElement | null)[]>([]);
  const pulseRefs = useRef<(SVGPathElement | null)[]>([]);
  const offsets = useRef<Offset[]>(NODES.map(() => ({ x: 0, y: 0 })));
  const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const alive = useRef(true);
  const [lit, setLit] = useState(-1);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [moved, setMoved] = useState(false);
  const [selected, setSelected] = useState(0);

  /** Re-route every wire from the current node positions. */
  const draw = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const s = stage.getBoundingClientRect();
    // Matches the canvas's container query (vertical layout under 700px).
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
    const node = e.currentTarget;
    node.setPointerCapture(e.pointerId);
    // Grab from where the node is right now, even mid-way through a layout reset.
    const live = getComputedStyle(node).translate.split(" ").map((v) => parseFloat(v) || 0);
    node.style.transition = "";
    node.style.translate = `${live[0] ?? 0}px ${live[1] ?? 0}px`;
    offsets.current[i] = { x: live[0] ?? 0, y: live[1] ?? 0 };
    drag.current = { i, sx: e.clientX, sy: e.clientY, ox: offsets.current[i].x, oy: offsets.current[i].y, moved: false };
    node.dataset.dragging = "true";
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const stage = stageRef.current;
    const node = d && nodeRefs.current[d.i];
    if (!d || !stage || !node) return;
    // A few pixels of slack so a click doesn't nudge the node.
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 5) return;
    d.moved = true;
    // Keep the node inside the canvas.
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
    const d = drag.current;
    drag.current = null;
    delete e.currentTarget.dataset.dragging;
    // A press that didn't move is a click: open the step in the inspector.
    if (d && !d.moved && !running) setSelected(d.i);
  };

  const resetLayout = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    offsets.current = NODES.map(() => ({ x: 0, y: 0 }));
    nodeRefs.current.forEach((n) => {
      if (!n) return;
      n.style.transition = reduce ? "" : "translate 600ms var(--ease-out)";
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
    const stamp = () => `+${((performance.now() - t0) / 1000).toFixed(2)}s`;
    setRunning(true);
    setLog([]);
    setLit(-1);
    for (let i = 0; i < NODES.length; i++) {
      if (!alive.current) return;
      setLit(i);
      setSelected(i);
      const { method, path, status, ms } = NODES[i].req;
      setLog((l) => [...l, { t: stamp(), method, path, status, ms }]);
      if (i === NODES.length - 1) break;
      const pulse = pulseRefs.current[i];
      if (reduce || !pulse) {
        await wait(250);
        continue;
      }
      await wait(220);
      await pulse.animate([{ strokeDashoffset: 0.16, opacity: 1 }, { strokeDashoffset: -1, opacity: 1 }], {
        duration: 650,
        easing: "cubic-bezier(0.77, 0, 0.175, 1)",
      }).finished;
    }
    if (!alive.current) return;
    const total = ((performance.now() - t0) / 1000).toFixed(1);
    setLog((l) => [...l, { t: stamp(), text: `Workflow finished in ${total}s. 0 manual steps.` }]);
    setRunning(false);
  };

  const node = NODES[selected];
  const json = JSON.stringify(node.payload, null, 2).split("\n");
  // Before the first run (and for steps a run hasn't reached), the inspector shows sample data.
  const live = log.length > 0 && selected <= lit;

  return (
    <div className="wf">
      <div className="wf__bar">
        <span className="device__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="wf__file mono">workflows/new-enquiry.flow</span>
        <div className="wf__actions">
          {moved && (
            <SpecularButton type="button" className="btn btn--ghost btn--sm" onClick={resetLayout}>
              <ArrowCounterClockwise size={14} weight="bold" aria-hidden />
              Reset layout
            </SpecularButton>
          )}
          <SpecularButton type="button" autoAnimate className="btn btn--primary btn--sm" onClick={run} disabled={running}>
            <Play size={14} weight="fill" aria-hidden />
            {running ? "Running…" : log.length ? "Run again" : "Run"}
          </SpecularButton>
        </div>
      </div>

      <div className="wf__main">
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
                role="button"
                tabIndex={0}
                aria-pressed={selected === i}
                aria-label={`${title}: ${detail}. Inspect`}
                data-lit={lit >= i || undefined}
                data-active={lit === i && running ? true : undefined}
                onPointerDown={onDown(i)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  if (!running) setSelected(i);
                }}
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
        </div>

        <aside className="wf__inspector" aria-label="Inspector">
          <div className="wf__inspector-head">
            <span className="wf__inspector-title">{node.title}</span>
            <span className="wf__badge mono" data-live={live || undefined}>
              {live ? "output" : "sample"}
            </span>
          </div>
          <p className="wf__route mono">
            <span className="wf__method">{node.req.method}</span> {node.req.path}
          </p>
          <pre key={`${selected}-${live}`} className="wf__json mono">
            {json.map((line, i) => (
              <span key={i} className="wf__json-line">
                {highlight(line, "json")}
              </span>
            ))}
          </pre>
        </aside>
      </div>

      <ol className="wf__console mono" aria-live="polite" aria-label="Console">
        {log.length === 0 && (
          <li className="wf__console-empty">
            <span>&gt;</span> Press Run to send a test enquiry through the workflow.
          </li>
        )}
        {log.map((l, i) => (
          <li key={i} className={l.text ? "wf__console-done" : undefined}>
            <span className="wf__t">{l.t}</span>
            {l.text ? (
              <span>{l.text}</span>
            ) : (
              <>
                <span className="wf__method">{l.method}</span>
                <span className="wf__path">{l.path}</span>
                <span className="wf__status">{l.status}</span>
                <span className="wf__ms">{l.ms}ms</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
