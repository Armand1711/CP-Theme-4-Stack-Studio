"use client";

import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/*
 * Heading port of React Bits' <TechText />.
 *
 * Unlike the original (one centred, single-colour line fitted into a fixed box), the real heading stays in
 * the DOM: CSS decides wrapping, size, colour and italics, and every character is read back from the
 * layout via Range rects. The canvas then redraws those glyphs with TechText's effects (dashed outline
 * reveal, selection frame, specks, drag-and-spring, idle sweep). The DOM text is hidden with
 * -webkit-text-fill-color only once the canvas has drawn, so SSR, SEO, screen readers and no-JS all
 * still get a normal <h1>.
 */

type Reveal = "area" | "letter" | "off";

type Props = {
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Colour of the selection frame, connector, specks and labels (hex). */
  frameColor?: string;
  reveal?: Reveal;
  reach?: number;
  softness?: number;
  dashLength?: number;
  dashGap?: number;
  strokeWidth?: number;
  lineStyle?: "dashed" | "solid";
  specks?: number;
  selection?: boolean;
  labels?: boolean;
  draggable?: boolean;
  sweep?: boolean;
  speed?: number;
};

type Settings = Required<Omit<Props, "as" | "className" | "style" | "children">>;

type Art = { image: HTMLCanvasElement; left: number; top: number };
type Box = { x1: number; y1: number; x2: number; y2: number };
type Glyph = {
  char: string;
  font: string;
  color: string;
  x: number;
  baseline: number;
  line: number;
  box: Box;
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  outline: number;
  fill: Art;
  dashes: Art;
};

/** Room around the heading for frame labels, specks and dragged letters. */
const PAD = 48;
const LABEL_FONT = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const FALLOFF_STEPS = 8;
const SPRING = 320;
const DAMPING = 22;

const approach = (current: number, target: number, dt: number, seconds: number) =>
  current + (target - current) * (1 - Math.exp(-dt / seconds));

const hexToRgb = (hex: string): [number, number, number] => {
  let h = String(hex || "").replace("#", "");
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  const n = parseInt(h.slice(0, 6), 16);
  return Number.isNaN(n) ? [255, 255, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const noise = (...values: number[]) => {
  let h = 2166136261;
  for (const value of values) {
    h = Math.imul(h ^ (value | 0), 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
};

const signed = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : "0");

export function TechHeading({
  as = "h1",
  className = "",
  style,
  children,
  frameColor = "#F36C21",
  reveal = "letter",
  reach = 160,
  softness = 0.7,
  dashLength = 4,
  dashGap = 2,
  strokeWidth = 1.5,
  lineStyle = "dashed",
  specks = 15,
  selection = true,
  labels = true,
  draggable = true,
  sweep = true,
  speed = 1,
}: Props) {
  const hostRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef<Settings | null>(null);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    settingsRef.current = {
      frameColor, reveal, reach, softness, dashLength, dashGap, strokeWidth,
      lineStyle, specks, selection, labels, draggable, sweep, speed,
    };
    wakeRef.current();
  });

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const scratch = document.createElement("canvas");
    const scratchCtx = scratch.getContext("2d");
    if (!host || !canvas || !ctx || !scratchCtx) return undefined;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let alive = true;
    let layoutKey = "";
    let glyphs: Glyph[] = [];
    let lines: Box[] = [];
    let presence = 0;
    let clock = 0;
    let pulse = 0;
    let placed = false;
    let dragging = -1;
    const pointer = { x: 0, y: 0, inside: false };
    const grab = { x: 0, y: 0 };
    const lens = { x: 0, y: 0 };
    const frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

    const invalidate = () => {
      layoutKey = "";
      wakeRef.current();
    };

    const setFont = (target: CanvasRenderingContext2D, font: string) => {
      target.font = font;
      if ("letterSpacing" in target) target.letterSpacing = "0px";
      target.textAlign = "left";
      target.textBaseline = "alphabetic";
    };

    const sprite = (s: Settings, g: Omit<Glyph, "fill" | "dashes" | "offset" | "velocity" | "outline">, stroke: boolean): Art => {
      const pad = Math.ceil(s.strokeWidth * 2 + 4);
      const left = g.box.x1 - pad;
      const top = g.box.y1 - pad;
      const w = g.box.x2 - g.box.x1 + pad * 2;
      const h = g.box.y2 - g.box.y1 + pad * 2;
      const image = document.createElement("canvas");
      image.width = Math.max(1, Math.ceil(w * dpr));
      image.height = Math.max(1, Math.ceil(h * dpr));
      const c = image.getContext("2d");
      if (!c) return { image, left, top };
      c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
      setFont(c, g.font);
      if (stroke) {
        c.lineJoin = "round";
        c.lineWidth = s.strokeWidth * 2;
        c.lineCap = "butt";
        c.strokeStyle = g.color;
        if (s.lineStyle !== "solid") c.setLineDash([Math.max(1, s.dashLength), Math.max(1, s.dashGap)]);
        c.strokeText(g.char, g.x, g.baseline);
        c.setLineDash([]);
        c.globalCompositeOperation = "destination-out";
        c.fillStyle = "#000000";
        c.fillText(g.char, g.x, g.baseline);
        c.globalCompositeOperation = "source-over";
      } else {
        c.fillStyle = g.color;
        c.fillText(g.char, g.x, g.baseline);
      }
      return { image, left, top };
    };

    /** Read every visible character's position, font and colour back from the DOM layout. */
    const ensureLayout = (s: Settings) => {
      const key = [s.dashLength, s.dashGap, s.strokeWidth, s.lineStyle, width, height, dpr].join("|");
      if (key === layoutKey) return;
      layoutKey = key;

      const hostRect = host.getBoundingClientRect();
      const previous = glyphs;
      const range = document.createRange();
      const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      const baselines: number[] = [];
      glyphs = [];
      lines = [];

      for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
        const el = node.parentElement;
        if (!el) continue;
        const cs = getComputedStyle(el);
        const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const upper = cs.textTransform === "uppercase";
        setFont(scratchCtx, font);
        const ascent = scratchCtx.measureText("H").fontBoundingBoxAscent;

        let i = 0;
        for (const ch of node.data) {
          const start = i;
          i += ch.length;
          if (!ch.trim()) continue;
          range.setStart(node, start);
          range.setEnd(node, start + ch.length);
          const rect = Array.from(range.getClientRects()).find((r) => r.width > 0);
          if (!rect) continue;

          const char = upper ? ch.toUpperCase() : ch;
          const x = rect.left - hostRect.left + PAD;
          const baseline = rect.top - hostRect.top + PAD + ascent;
          let line = baselines.findIndex((b) => Math.abs(b - baseline) < 4);
          if (line < 0) line = baselines.push(baseline) - 1;

          const m = scratchCtx.measureText(char);
          const box = {
            x1: x - m.actualBoundingBoxLeft,
            y1: baseline - m.actualBoundingBoxAscent,
            x2: x + m.actualBoundingBoxRight,
            y2: baseline + m.actualBoundingBoxDescent,
          };
          const base = { char, font, color: cs.color, x, baseline, line, box };
          const kept = previous[glyphs.length];
          glyphs.push({
            ...base,
            offset: kept?.char === char ? kept.offset : { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            outline: 0,
            fill: sprite(s, base, false),
            dashes: sprite(s, base, true),
          });

          const l = (lines[line] ??= { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity });
          l.x1 = Math.min(l.x1, box.x1);
          l.y1 = Math.min(l.y1, box.y1);
          l.x2 = Math.max(l.x2, box.x2);
          l.y2 = Math.max(l.y2, box.y2);
        }
      }

      dragging = -1;
      frame.index = -1;
      if (glyphs.length) host.dataset.ready = "true";
    };

    const glyphAt = (x: number, y: number) => {
      let best = -1;
      let bestDistance = Infinity;
      glyphs.forEach((g, i) => {
        const x1 = g.box.x1 + g.offset.x;
        const x2 = g.box.x2 + g.offset.x;
        const y1 = g.box.y1 + g.offset.y;
        const y2 = g.box.y2 + g.offset.y;
        const dx = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
        const dy = y < y1 ? y1 - y : y > y2 ? y - y2 : 0;
        const d = Math.hypot(dx, dy * 2);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      return bestDistance < 28 ? best : -1;
    };

    const falloff = (
      target: CanvasRenderingContext2D, cx: number, cy: number, radius: number, strength: number, soft: number,
    ) => {
      const inner = Math.min(1, Math.max(0, 1 - soft));
      const gradient = target.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
      if (inner > 0.995) {
        gradient.addColorStop(0.995, `rgba(0, 0, 0, ${strength})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        return gradient;
      }
      for (let i = 0; i <= FALLOFF_STEPS; i++) {
        const t = i / FALLOFF_STEPS;
        const eased = t * t * (3 - 2 * t);
        gradient.addColorStop(inner + (1 - inner) * t, `rgba(0, 0, 0, ${strength * (1 - eased)})`);
      }
      return gradient;
    };

    const blit = (target: CanvasRenderingContext2D, art: Art, dx: number, dy: number, originX: number, originY: number) => {
      target.drawImage(art.image, Math.round((art.left + dx) * dpr - originX), Math.round((art.top + dy) * dpr - originY));
    };

    const drawReveal = (s: Settings) => {
      const radius = s.reach * dpr;
      const cx = lens.x * dpr;
      const cy = lens.y * dpr;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = falloff(ctx, cx, cy, radius, presence, s.softness);
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.globalCompositeOperation = "source-over";

      const x0 = Math.max(0, Math.floor(cx - radius));
      const y0 = Math.max(0, Math.floor(cy - radius));
      const x1 = Math.min(canvas.width, Math.ceil(cx + radius));
      const y1 = Math.min(canvas.height, Math.ceil(cy + radius));
      if (x1 <= x0 || y1 <= y0) return;
      const w = x1 - x0;
      const h = y1 - y0;
      if (scratch.width < w || scratch.height < h) {
        scratch.width = Math.max(scratch.width, w);
        scratch.height = Math.max(scratch.height, h);
      }
      scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      scratchCtx.globalCompositeOperation = "source-over";
      scratchCtx.clearRect(0, 0, w, h);
      for (const g of glyphs) blit(scratchCtx, g.dashes, g.offset.x, g.offset.y, x0, y0);
      scratchCtx.globalCompositeOperation = "destination-in";
      scratchCtx.fillStyle = falloff(scratchCtx, cx - x0, cy - y0, radius, 1, s.softness);
      scratchCtx.fillRect(0, 0, w, h);
      scratchCtx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = presence;
      ctx.drawImage(scratch, 0, 0, w, h, x0, y0, w, h);
      ctx.globalAlpha = 1;
    };

    const crisp = (value: number) => (Math.round(value * dpr) + 0.5) / dpr;

    const perimeterPoint = (distance: number, w: number, h: number): [number, number, number, number] => {
      let d = ((distance % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
      if (d < w) return [frame.x1 + d, frame.y1, 0, -1];
      d -= w;
      if (d < h) return [frame.x2, frame.y1 + d, 1, 0];
      d -= h;
      if (d < w) return [frame.x2 - d, frame.y2, 0, 1];
      d -= w;
      return [frame.x1, frame.y2 - d, -1, 0];
    };

    const drawSpecks = (s: Settings, a: number) => {
      const w = frame.x2 - frame.x1;
      const h = frame.y2 - frame.y1;
      if (w < 2 || h < 2) return;
      const perimeter = 2 * (w + h);
      const seed = frame.index + 1;
      const grid = 3;

      for (let k = 0; k < s.specks; k++) {
        const period = 0.5 + noise(seed, k, 11) * 1.2;
        const t = pulse / period + noise(seed, k, 17);
        const cycle = Math.floor(t);
        const life = t - cycle;
        if (life > 0.7) continue;
        const [px, py, nx, ny] = perimeterPoint(noise(seed, k, cycle) * perimeter, w, h);
        const pick = noise(seed, k, cycle, 2);
        const size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
        const large = size >= 8;
        const out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
        const x = frame.x1 + Math.round((px + nx * out - frame.x1) / grid) * grid;
        const y = frame.y1 + Math.round((py + ny * out - frame.y1) / grid) * grid;
        const tone = noise(seed, k, cycle, 3);
        const blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        const alpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
        const left = Math.round(x - size / 2);
        const top = Math.round(y - size / 2);
        if (tone < 0.26 || (large && tone < 0.78)) {
          ctx.strokeStyle = rgba(s.frameColor, alpha);
          ctx.strokeRect(left + 0.5, top + 0.5, size, size);
          if (large && tone > 0.5) {
            ctx.fillStyle = rgba(s.frameColor, alpha);
            ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
          }
        } else {
          ctx.fillStyle = rgba(s.frameColor, alpha);
          ctx.fillRect(left, top, size, size);
        }
      }

      for (let j = 0; j < 2; j++) {
        const head = (pulse * 0.42 * s.speed + j * 0.5) * perimeter;
        for (let i = 0; i < 4; i++) {
          const [x, y] = perimeterPoint(head - i * 6, w, h);
          const size = i === 0 ? 3 : 2;
          ctx.fillStyle = rgba(s.frameColor, a * [0.95, 0.55, 0.32, 0.16][i]);
          ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
        }
      }
    };

    const drawFrame = (s: Settings) => {
      const g = glyphs[frame.index];
      if (!g || frame.alpha < 0.01) return;
      const a = frame.alpha;
      const x1 = crisp(frame.x1);
      const y1 = crisp(frame.y1);
      const x2 = crisp(frame.x2);
      const y2 = crisp(frame.y2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const moved = Math.hypot(g.offset.x, g.offset.y);
      if (moved > 1) {
        const hx = (g.box.x1 + g.box.x2) / 2;
        const hy = (g.box.y1 + g.box.y2) / 2;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + g.offset.x, hy + g.offset.y);
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(s.frameColor, 0.45 * a);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.rect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
        ctx.fillStyle = rgba(s.frameColor, 0.7 * a);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(s.frameColor, 0.5 * a);
      ctx.stroke();

      ctx.beginPath();
      for (const [cx, cy] of [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]) {
        ctx.rect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
      }
      ctx.fillStyle = rgba(s.frameColor, 0.95 * a);
      ctx.fill();

      if (s.specks > 0) {
        ctx.lineWidth = 1;
        drawSpecks(s, a);
      }

      if (!s.labels) return;
      ctx.font = LABEL_FONT;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = rgba(s.frameColor, 0.62 * a);
      const label =
        moved > 1
          ? `${signed(Math.round(g.offset.x))}, ${signed(Math.round(-g.offset.y))}`
          : `${g.char}  ${Math.round(g.box.x2 - g.box.x1)} × ${Math.round(g.box.y2 - g.box.y1)}`;
      ctx.fillText(label, Math.round(frame.x1), Math.round(frame.y1) - 7);
    };

    const tick = (now: number) => {
      raf = 0;
      const s = settingsRef.current;
      if (!s) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      ensureLayout(s);
      if (!glyphs.length) return;

      const sweeping = s.sweep && !reducedMotion && !pointer.inside && dragging < 0;
      if (sweeping) clock += dt * s.speed;
      pulse += dt;
      let targetX = pointer.x;
      let targetY = pointer.y;
      if (sweeping) {
        // Scan line by line, alternating direction, like a reading pass.
        const phase = clock * 0.45;
        const line = lines[Math.floor(phase / Math.PI) % lines.length];
        targetX = line.x1 + (line.x2 - line.x1) * (0.5 - 0.5 * Math.cos(phase));
        targetY = line.y1 + (line.y2 - line.y1) * (0.45 + 0.1 * Math.sin(clock * 0.8));
      }
      const active = pointer.inside || sweeping || dragging >= 0;
      if (active && !placed) {
        lens.x = targetX;
        lens.y = targetY;
      }
      if (active) {
        const lag = pointer.inside ? 0.05 : 0.22;
        lens.x = approach(lens.x, targetX, dt, lag);
        lens.y = approach(lens.y, targetY, dt, lag);
      }
      placed = active;
      presence = approach(presence, s.reveal === "area" && active && dragging < 0 ? 1 : 0, dt, 0.16);

      let moving = false;
      glyphs.forEach((g, i) => {
        if (i === dragging) {
          g.offset.x = approach(g.offset.x, pointer.x - grab.x, dt, 0.03);
          g.offset.y = approach(g.offset.y, pointer.y - grab.y, dt, 0.03);
          g.velocity.x = 0;
          g.velocity.y = 0;
          moving = true;
          return;
        }
        const { offset, velocity } = g;
        if (Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05 && Math.hypot(velocity.x, velocity.y) < 0.5) {
          offset.x = 0;
          offset.y = 0;
          velocity.x = 0;
          velocity.y = 0;
          return;
        }
        velocity.x += (-SPRING * offset.x - DAMPING * velocity.x) * dt;
        velocity.y += (-SPRING * offset.y - DAMPING * velocity.y) * dt;
        offset.x += velocity.x * dt;
        offset.y += velocity.y * dt;
        moving = true;
      });

      const focus = dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y) : -1;
      if (focus >= 0 && s.selection) {
        const g = glyphs[focus];
        const bx1 = g.box.x1 + g.offset.x - 6;
        const by1 = g.box.y1 + g.offset.y - 6;
        const bx2 = g.box.x2 + g.offset.x + 6;
        const by2 = g.box.y2 + g.offset.y + 6;
        if (frame.index < 0 || frame.alpha < 0.02) {
          frame.x1 = bx1;
          frame.y1 = by1;
          frame.x2 = bx2;
          frame.y2 = by2;
        }
        const glide = focus === dragging ? 0.02 : 0.08;
        frame.x1 = approach(frame.x1, bx1, dt, glide);
        frame.y1 = approach(frame.y1, by1, dt, glide);
        frame.x2 = approach(frame.x2, bx2, dt, glide);
        frame.y2 = approach(frame.y2, by2, dt, glide);
        frame.index = focus;
      }
      frame.alpha = approach(frame.alpha, focus >= 0 && s.selection ? 1 : 0, dt, 0.1);

      glyphs.forEach((g, i) => {
        const target = s.reveal === "letter" && i === focus && i !== dragging ? 1 : 0;
        g.outline = approach(g.outline, target, dt, 0.09);
        if (Math.abs(g.outline - target) > 0.002) moving = true;
        else g.outline = target;
      });

      if (s.draggable) host.style.cursor = dragging >= 0 ? "grabbing" : focus >= 0 && pointer.inside ? "grab" : "";

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const g of glyphs) {
        const moved = Math.hypot(g.offset.x, g.offset.y);
        if (moved > 1) {
          ctx.globalAlpha = Math.min(1, moved / 24) * 0.55;
          blit(ctx, g.dashes, 0, 0, 0, 0);
          ctx.globalAlpha = 1;
        }
      }
      for (const g of glyphs) {
        if (g.outline < 0.999) {
          ctx.globalAlpha = 1 - g.outline;
          blit(ctx, g.fill, g.offset.x, g.offset.y, 0, 0);
        }
        if (g.outline > 0.001) {
          ctx.globalAlpha = g.outline;
          blit(ctx, g.dashes, g.offset.x, g.offset.y, 0, 0);
        }
        ctx.globalAlpha = 1;
      }
      if (presence > 0.001) drawReveal(s);
      drawFrame(s);

      const settling =
        moving ||
        Math.abs(presence - (s.reveal === "area" && active && dragging < 0 ? 1 : 0)) > 0.002 ||
        (frame.alpha > 0.01 && frame.alpha < 0.99);
      if ((active || settling) && visible && alive) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const resize = () => {
      width = Math.max(1, host.clientWidth + PAD * 2);
      height = Math.max(1, host.clientHeight + PAD * 2);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      layoutKey = "";
      wake();
    };

    // Pointer coordinates live in canvas space (heading box + PAD on every side).
    const locate = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left + PAD;
      pointer.y = e.clientY - rect.top + PAD;
    };
    const onMove = (e: PointerEvent) => {
      locate(e);
      pointer.inside = true;
      wake();
    };
    const onLeave = () => {
      if (dragging >= 0) return;
      pointer.inside = false;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      locate(e);
      pointer.inside = true;
      const s = settingsRef.current;
      if (s?.draggable && (e.pointerType !== "mouse" || e.button === 0)) {
        const index = glyphAt(pointer.x, pointer.y);
        if (index >= 0) {
          dragging = index;
          grab.x = pointer.x - glyphs[index].offset.x;
          grab.y = pointer.y - glyphs[index].offset.y;
          host.setPointerCapture?.(e.pointerId);
        }
      }
      wake();
    };
    const onUp = (e: PointerEvent) => {
      if (dragging >= 0) {
        dragging = -1;
        host.releasePointerCapture?.(e.pointerId);
        const rect = host.getBoundingClientRect();
        pointer.inside =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      }
      wake();
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerenter", onMove, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });
    host.addEventListener("pointerup", onUp, { passive: true });
    host.addEventListener("pointercancel", onUp, { passive: true });
    host.addEventListener("pointerleave", onLeave, { passive: true });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    intersectionObserver.observe(host);
    document.fonts?.ready.then(invalidate, invalidate);

    resize();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      wakeRef.current = () => {};
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerenter", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.removeEventListener("pointerleave", onLeave);
      delete host.dataset.ready;
      host.style.cursor = "";
    };
  }, []);

  return createElement(
    as,
    { ref: hostRef, className: `tech-heading ${className}`.trim(), style },
    children,
    <canvas key="tech-canvas" ref={canvasRef} className="tech-heading__canvas" aria-hidden="true" />,
  );
}
