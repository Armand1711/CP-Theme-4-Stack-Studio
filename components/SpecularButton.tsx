"use client";

import Link from "next/link";
import { useEffect, useRef, type ButtonHTMLAttributes, type ComponentProps, type ReactNode, type Ref } from "react";
import { attachSpecular, type SpecularSettings } from "@/lib/specular-engine";

/*
 * React Bits' SpecularButton, adapted to the Stack Studio buttons: it keeps whatever button styling you
 * pass via className (.btn, .pill, ...) and adds the WebGL specular rim on top. Renders a Next <Link>
 * when given `href`, otherwise a <button>. See lib/specular-engine.ts for why rendering is shared.
 */

type EffectProps = Partial<SpecularSettings> & { children: ReactNode; className?: string };

type AsButton = EffectProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & { href?: undefined };
type AsLink = EffectProps & Omit<ComponentProps<typeof Link>, "children" | "className">;

export type SpecularButtonProps = AsButton | AsLink;

const EFFECT_KEYS = [
  "radius", "lineColor", "baseColor", "baseOpacity", "intensity", "shineSize", "shineFade",
  "thickness", "speed", "followMouse", "proximity", "autoAnimate",
] as const;

// Tuned for the site's square, bordered buttons: no radius, no extra base stroke (the CSS border is the base).
const DEFAULTS: SpecularSettings = {
  radius: 0,
  lineColor: "#ffffff",
  baseColor: "#525252",
  baseOpacity: 0,
  intensity: 1,
  shineSize: 10,
  shineFade: 40,
  thickness: 1,
  speed: 0.35,
  followMouse: true,
  proximity: 250,
  autoAnimate: false,
};

export function SpecularButton(props: SpecularButtonProps) {
  const { children, className = "" } = props;
  const rest: Record<string, unknown> = { ...props };
  const settings = { ...DEFAULTS };
  for (const key of EFFECT_KEYS) {
    if (props[key] !== undefined) (settings as Record<string, unknown>)[key] = props[key];
    delete rest[key];
  }
  delete rest.children;
  delete rest.className;

  const elRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef(settings);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    settingsRef.current = settings;
    wakeRef.current();
  });

  useEffect(() => {
    if (!elRef.current || !canvasRef.current) return;
    const { detach, wake } = attachSpecular(elRef.current, canvasRef.current, () => settingsRef.current);
    wakeRef.current = wake;
    return () => {
      wakeRef.current = () => {};
      detach();
    };
  }, []);

  const inner = (
    <>
      <span className="specular__fx" aria-hidden="true">
        <canvas ref={canvasRef} />
      </span>
      <span className="specular__label">{children}</span>
    </>
  );
  const cls = `specular ${className}`.trim();

  if (typeof rest.href === "string" || (rest.href && typeof rest.href === "object")) {
    return (
      <Link {...(rest as unknown as ComponentProps<typeof Link>)} ref={elRef as Ref<HTMLAnchorElement>} className={cls}>
        {inner}
      </Link>
    );
  }
  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" {...buttonProps} ref={elRef as Ref<HTMLButtonElement>} className={cls}>
      {inner}
    </button>
  );
}
