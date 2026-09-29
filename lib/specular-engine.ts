import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

/*
 * Shared renderer for React Bits' SpecularButton shader.
 *
 * The stock component opens one WebGL context per button; browsers cap live contexts (~16) and this
 * site has 10+ buttons on some pages. Here a single offscreen WebGL2 canvas renders each on-screen
 * button's rim in turn and copies it into that button's own 2D canvas. One context, one rAF loop,
 * and off-screen / display:none buttons cost nothing.
 */

/** Canvas bleed around the button so the rim glow can spill past the edge (keep in sync with CSS). */
export const SPECULAR_PAD = 20;

export type SpecularSettings = {
  radius: number;
  lineColor: string;
  baseColor: string;
  /** Strength of the static edge stroke. 0 when the element already draws its own border. */
  baseOpacity: number;
  intensity: number;
  shineSize: number;
  shineFade: number;
  thickness: number;
  speed: number;
  followMouse: boolean;
  proximity: number;
  autoAnimate: boolean;
};

type Instance = {
  el: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  settings: () => SpecularSettings;
  w: number;
  h: number;
  visible: boolean;
  angle: number;
  idleAngle: number;
  bright: number;
  blank: boolean;
  observers: { resize: ResizeObserver; intersect: IntersectionObserver };
};

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uBaseOpacity;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = sdRoundedRect(p, uHalfSize, uRadius);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * uBaseOpacity;

  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

type Engine = {
  add: (inst: Instance) => void;
  remove: (inst: Instance) => void;
  wake: () => void;
};

let engine: Engine | null | undefined;

function createEngine(): Engine | null {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let renderer: Renderer;
  try {
    renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr, webgl: 2 });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  if (!renderer.isWebgl2) return null;

  const geometry = new Triangle(gl);
  if (geometry.attributes.uv) delete geometry.attributes.uv;
  const program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    depthTest: false,
    cullFace: false,
    uniforms: {
      uCenter: { value: [0, 0] },
      uHalfSize: { value: [1, 1] },
      uRadius: { value: 0 },
      uAngle: { value: 2.4 },
      uPx: { value: dpr },
      uLineColor: { value: [1, 1, 1] },
      uBaseColor: { value: [0.32, 0.32, 0.32] },
      uBaseOpacity: { value: 0.45 },
      uIntensity: { value: 1 },
      uShineSize: { value: 0.17 },
      uShineFade: { value: 0.7 },
      uThickness: { value: 1 },
      uBaseWidth: { value: dpr },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });
  const lineC = new Color();
  const baseC = new Color();
  const u = program.uniforms;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const instances = new Set<Instance>();
  const pointer = { x: 0, y: 0, seen: false };
  let glW = 0;
  let glH = 0;
  let raf = 0;
  let last = performance.now();

  const onPointerMove = (e: PointerEvent) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.seen = true;
    wake();
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  /** Where the light should point for this button, and how close the pointer is (0..1). */
  const aim = (inst: Instance, proximity: number): { angle: number | null; near: number } => {
    if (!pointer.seen) return { angle: null, near: 0 };
    const rect = inst.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(rect.left - pointer.x, 0, pointer.x - rect.right);
    const dy = Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom);
    const dist = Math.hypot(dx, dy);
    let angle: number;
    if (dist === 0) {
      // Over the button the light settles on the diagonal and sways gently with the cursor.
      const nx = (pointer.x - cx) / (rect.width / 2);
      const ny = (cy - pointer.y) / (rect.height / 2);
      angle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
    } else {
      angle = Math.atan2(cy - pointer.y, pointer.x - cx);
    }
    const t = Math.max(0, 1 - dist / Math.max(proximity, 1));
    return { angle, near: t * t * (3 - 2 * t) };
  };

  const draw = (inst: Instance, p: SpecularSettings) => {
    const cw = inst.canvas.width;
    const ch = inst.canvas.height;
    if (cw > glW || ch > glH) {
      glW = Math.max(glW, cw);
      glH = Math.max(glH, ch);
      renderer.setSize(glW / dpr, glH / dpr);
    }
    // Render into the bottom-left cw×ch corner of the shared canvas, then copy that corner out.
    gl.viewport(0, 0, cw, ch);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, 0, cw, ch);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);

    lineC.set(p.lineColor);
    baseC.set(p.baseColor);
    u.uCenter.value = [(SPECULAR_PAD + inst.w / 2) * dpr, (SPECULAR_PAD + inst.h / 2) * dpr];
    u.uHalfSize.value = [(inst.w / 2) * dpr, (inst.h / 2) * dpr];
    u.uAngle.value = inst.angle;
    u.uRadius.value = Math.min(p.radius, Math.min(inst.w, inst.h) / 2) * dpr;
    u.uLineColor.value = [lineC.r, lineC.g, lineC.b];
    u.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
    u.uBaseOpacity.value = p.baseOpacity;
    u.uIntensity.value = p.intensity * inst.bright;
    u.uShineSize.value = (p.shineSize * Math.PI) / 180;
    u.uShineFade.value = (p.shineFade * Math.PI) / 180;
    u.uThickness.value = p.thickness * dpr;
    mesh.draw();

    inst.ctx.clearRect(0, 0, cw, ch);
    inst.ctx.drawImage(gl.canvas, 0, glH - ch, cw, ch, 0, 0, cw, ch);
    inst.blank = false;
  };

  const tick = (now: number) => {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    let busy = false;

    for (const inst of instances) {
      if (!inst.visible || inst.w < 1 || inst.h < 1) continue;
      const p = inst.settings();
      const { angle: pointerAngle, near } = aim(inst, p.proximity);

      if (!reducedMotion) inst.idleAngle += p.speed * dt;
      const steer = p.followMouse && pointerAngle != null && (!p.autoAnimate || near > 0);
      const target = steer ? pointerAngle! : inst.idleAngle;
      const diff = ((target - inst.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      inst.angle += diff * (1 - Math.exp(-dt * 7));
      const brightTarget = p.autoAnimate ? 1 : near;
      inst.bright += (brightTarget - inst.bright) * (1 - Math.exp(-dt * 8));

      const settled = Math.abs(brightTarget - inst.bright) < 0.002 && Math.abs(diff) < 0.001;
      if (p.autoAnimate && !reducedMotion) busy = true;
      else if (!settled) busy = true;

      if (inst.bright < 0.002 && p.baseOpacity === 0) {
        if (!inst.blank) {
          inst.ctx.clearRect(0, 0, inst.canvas.width, inst.canvas.height);
          inst.blank = true;
        }
        continue;
      }
      draw(inst, p);
    }

    if (busy) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  return {
    add: (inst) => {
      instances.add(inst);
      wake();
    },
    remove: (inst) => {
      instances.delete(inst);
      if (instances.size) return;
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("pointermove", onPointerMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      engine = undefined;
    },
    wake,
  };
}

/**
 * Attach the specular rim to `el`, drawing into `canvas` (positioned SPECULAR_PAD px past each edge).
 * Returns a cleanup function. No-ops (element keeps its plain CSS look) where WebGL2 is unavailable.
 */
export function attachSpecular(
  el: HTMLElement,
  canvas: HTMLCanvasElement,
  settings: () => SpecularSettings,
): { detach: () => void; wake: () => void } {
  if (engine === undefined) engine = createEngine();
  const ctx = canvas.getContext("2d");
  const eng = engine;
  if (!eng || !ctx) return { detach: () => {}, wake: () => {} };

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const inst: Instance = {
    el,
    canvas,
    ctx,
    settings,
    w: 0,
    h: 0,
    visible: false,
    angle: 2.4,
    idleAngle: 2.4,
    bright: 0,
    blank: true,
    observers: {
      resize: new ResizeObserver(() => {
        // Fractional size keeps the SDF pinned to the exact CSS border.
        const rect = el.getBoundingClientRect();
        inst.w = rect.width;
        inst.h = rect.height;
        canvas.width = Math.max(1, Math.round((rect.width + SPECULAR_PAD * 2) * dpr));
        canvas.height = Math.max(1, Math.round((rect.height + SPECULAR_PAD * 2) * dpr));
        inst.blank = false;
        eng.wake();
      }),
      intersect: new IntersectionObserver(([entry]) => {
        inst.visible = entry.isIntersecting;
        eng.wake();
      }),
    },
  };
  inst.observers.resize.observe(el);
  inst.observers.intersect.observe(el);
  eng.add(inst);

  return {
    detach: () => {
      inst.observers.resize.disconnect();
      inst.observers.intersect.disconnect();
      eng.remove(inst);
    },
    wake: eng.wake,
  };
}
