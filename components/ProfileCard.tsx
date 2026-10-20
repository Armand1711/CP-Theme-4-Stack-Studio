"use client";

import Link from "next/link";
import { memo, useEffect, useRef, type CSSProperties } from "react";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

import "./ProfileCard.css";

/*
 * Holographic profile card, adapted from React Bits' <ProfileCard />.
 * Changes from upstream: TypeScript, Phosphor icon, `contactHref` (renders the button as a link),
 * an initials fallback when there is no photo yet, and Stack Studio styling: warm near-black panels
 * (the site's surfaces), an orange glow and logo pattern behind the photo, an orange foil instead of the
 * rainbow one, and an accent contact button.
 */

const THEMES = {
  dark: {
    "--pc-frame": "linear-gradient(180deg, rgba(26, 25, 24, 0.92) 0%, rgba(15, 15, 14, 0.92) 100%)",
    "--pc-frame-edge": "rgba(255, 255, 255, 0.09)",
    "--pc-frame-highlight": "rgba(255, 255, 255, 0.06)",
    "--pc-frame-shadow": "0 30px 60px -28px rgba(0, 0, 0, 0.9), 0 6px 16px -8px rgba(0, 0, 0, 0.5)",
    "--pc-tile": "linear-gradient(180deg, #262422 0%, #1a1918 100%)",
    "--pc-tile-edge": "rgba(255, 255, 255, 0.07)",
    "--pc-tile-highlight": "rgba(255, 255, 255, 0.1)",
    "--pc-tile-shadow": "0 4px 10px -4px rgba(0, 0, 0, 0.7)",
    "--pc-ink": "#f4f4f5",
    "--pc-muted": "rgba(244, 244, 245, 0.6)",
    "--pc-hover": "brightness(1.12)",
    "--pc-press": "brightness(0.8)",
    "--pc-shade": "rgba(0, 0, 0, 0.4)",
  },
  light: {
    "--pc-frame": "rgba(240, 240, 243, 0.8)",
    "--pc-frame-edge": "rgba(24, 24, 27, 0.07)",
    "--pc-frame-highlight": "rgba(255, 255, 255, 0.95)",
    "--pc-frame-shadow": "0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)",
    "--pc-tile": "linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)",
    "--pc-tile-edge": "rgba(24, 24, 27, 0.08)",
    "--pc-tile-highlight": "rgba(255, 255, 255, 1)",
    "--pc-tile-shadow": "0 4px 10px -5px rgba(24, 24, 27, 0.25)",
    "--pc-ink": "#27272a",
    "--pc-muted": "rgba(39, 39, 42, 0.6)",
    "--pc-hover": "brightness(0.97)",
    "--pc-press": "brightness(0.92)",
    "--pc-shade": "rgba(24, 24, 27, 0.14)",
  },
};

const FOILS = {
  dark: {
    "--pc-blend": "color-dodge",
    "--pc-holo-filter": "hue-rotate(0deg)",
    "--pc-sheen": "rgba(255, 255, 255, 0.16)",
  },
  light: {
    "--pc-blend": "multiply",
    "--pc-holo-filter": "invert(1) hue-rotate(180deg)",
    "--pc-sheen": "rgba(255, 255, 255, 0)",
  },
};

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>"
)}")`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isDark = (color: string) => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());
  if (!match) return null;
  const hex = match[1].length === 3 ? match[1].replace(/./g, (digit) => digit + digit) : match[1];
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((part) => /^[a-z]/i.test(part))
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join("");

type Axis = { p: number; v: number; target: number };
type Engine = { aim: (nx: number, ny: number, on?: boolean) => void; release: () => void; write: () => void };

export type ProfileCardProps = {
  avatarUrl?: string | null;
  iconUrl?: string;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  statusColor?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
  /** Renders the contact button as a link instead of calling onContactClick. */
  contactHref?: string;
  theme?: "dark" | "light";
  backdropColor?: string;
  radius?: number;
  holo?: number;
  glare?: number;
  enableTilt?: boolean;
  tiltStrength?: number;
  parallax?: number;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  intro?: boolean;
  className?: string;
};

const ProfileCard = ({
  avatarUrl = "",
  iconUrl,
  miniAvatarUrl,
  name = "",
  title = "",
  handle = "",
  status = "",
  statusColor = "#22c55e",
  contactText = "Contact",
  showUserInfo = true,
  onContactClick,
  contactHref,
  theme = "dark",
  backdropColor,
  radius = 16,
  holo = 0.8,
  glare = 0.5,
  enableTilt = true,
  tiltStrength = 12,
  parallax = 8,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  intro = true,
  className = "",
}: ProfileCardProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const settings = { enableTilt, tiltStrength, parallax, mobileTiltSensitivity, intro };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = { width: root.offsetWidth, height: root.offsetHeight };
    const x: Axis = { p: 0, v: 0, target: 0 };
    const y: Axis = { p: 0, v: 0, target: 0 };
    const light = { p: 0, target: 0 };
    let raf = 0;
    let last = 0;
    let slowUntil = 0;
    let touchId: number | null = null;

    const write = () => {
      const { enableTilt: tiltOn, tiltStrength: strength, parallax: depth } = settingsRef.current;
      const angle = tiltOn && !reduced ? strength : 0;
      const tilt = Math.min(1, Math.hypot(x.p, y.p));
      const style = root.style;
      style.setProperty("--pc-light-x", `${((x.p + 1) * 0.5 * size.width).toFixed(1)}px`);
      style.setProperty("--pc-light-y", `${((y.p + 1) * 0.5 * size.height).toFixed(1)}px`);
      style.setProperty("--pc-pointer-x", `${((x.p + 1) * 50).toFixed(2)}%`);
      style.setProperty("--pc-pointer-y", `${((y.p + 1) * 50).toFixed(2)}%`);
      style.setProperty("--pc-band-x", `${(50 + x.p * 15).toFixed(2)}%`);
      style.setProperty("--pc-band-y", `${(50 + y.p * 15).toFixed(2)}%`);
      style.setProperty("--pc-rotate-x", `${(y.p * angle).toFixed(3)}deg`);
      style.setProperty("--pc-rotate-y", `${(-x.p * angle).toFixed(3)}deg`);
      style.setProperty("--pc-shift-x", `${(x.p * (reduced ? 0 : depth)).toFixed(2)}px`);
      style.setProperty("--pc-shift-y", `${(y.p * (reduced ? 0 : depth)).toFixed(2)}px`);
      style.setProperty("--pc-reach", tilt.toFixed(4));
      style.setProperty("--pc-tilt", (tilt * light.p).toFixed(4));
      style.setProperty("--pc-active", light.p.toFixed(4));
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const slow = now < slowUntil;
      const stiffness = slow ? 24 : 120;
      const damping = slow ? 9 : 16;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const axis of [x, y]) {
          axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
          axis.p += axis.v * h;
        }
      }
      const tau = light.target > light.p ? 0.18 : slow ? 0.9 : 0.45;
      light.p += (light.target - light.p) * (1 - Math.exp(-dt / tau));
      write();
      const moving =
        Math.abs(x.target - x.p) > 0.0005 ||
        Math.abs(y.target - y.p) > 0.0005 ||
        Math.abs(x.v) > 0.0005 ||
        Math.abs(y.v) > 0.0005 ||
        Math.abs(light.target - light.p) > 0.002;
      if (moving) {
        raf = requestAnimationFrame(frame);
      } else {
        x.p = x.target;
        y.p = y.target;
        light.p = light.target;
        write();
        raf = 0;
      }
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const aim = (nx: number, ny: number, on = true) => {
      x.target = clamp(nx, -1, 1);
      y.target = clamp(ny, -1, 1);
      light.target = on ? 1 : 0;
      slowUntil = 0;
      wake();
    };

    const aimAt = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      aim(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const release = () => aim(0, 0, false);

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === "mouse") aimAt(event);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || event.pointerId === touchId) aimAt(event);
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") release();
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      touchId = event.pointerId;
      aimAt(event);
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== touchId) return;
      touchId = null;
      release();
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);

    const observer = new ResizeObserver(() => {
      size.width = root.offsetWidth;
      size.height = root.offsetHeight;
      write();
    });
    observer.observe(root);

    engineRef.current = { aim, release, write };

    if (settingsRef.current.intro && !reduced) {
      x.p = 0.62;
      y.p = -0.55;
      light.p = 1;
      slowUntil = performance.now() + 1400;
      write();
      wake();
    } else {
      write();
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.write();
  }, [enableTilt, tiltStrength, parallax]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enableMobileTilt) return;

    // Tilt is measured against how the phone is being held, not a fixed angle: the baseline starts
    // at the first reading and drifts slowly toward the current one, so the card reacts to rotation
    // and settles back to centre when the phone is held still.
    let base: { beta: number; gamma: number } | null = null;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta == null || event.gamma == null) return;
      if (!base) base = { beta: event.beta, gamma: event.gamma };
      base.beta += (event.beta - base.beta) * 0.005;
      base.gamma += (event.gamma - base.gamma) * 0.005;
      const db = event.beta - base.beta;
      const dg = event.gamma - base.gamma;
      // Map device axes onto screen axes, so landscape tilts the right way.
      const angle = screen.orientation?.angle ?? 0;
      const [dx, dy] = angle === 90 ? [db, -dg] : angle === 270 ? [-db, dg] : angle === 180 ? [-dg, -db] : [dg, db];
      const k = settingsRef.current.mobileTiltSensitivity / 100;
      engineRef.current?.aim(dx * k, dy * k);
    };
    const onRotate = () => {
      base = null;
    };

    let listening = false;
    const listen = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("deviceorientation", onOrientation);
      screen.orientation?.addEventListener("change", onRotate);
    };

    // iOS gates motion behind a permission prompt that must come from a tap; elsewhere it just works.
    const Motion = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    const needsPermission = typeof Motion?.requestPermission === "function";
    const onTap = (event: Event) => {
      // Don't stack the prompt on top of a link or button doing its own thing.
      if ((event.target as Element | null)?.closest("a, button")) return;
      document.removeEventListener("click", onTap);
      Motion!.requestPermission!()
        .then((state) => state === "granted" && listen())
        .catch(() => {});
    };
    if (needsPermission) document.addEventListener("click", onTap);
    else listen();

    return () => {
      document.removeEventListener("click", onTap);
      window.removeEventListener("deviceorientation", onOrientation);
      screen.orientation?.removeEventListener("change", onRotate);
    };
  }, [enableMobileTilt]);

  const palette = theme === "light" ? "light" : "dark";
  const foil = backdropColor ? ((isDark(backdropColor) ?? palette === "dark") ? "dark" : "light") : palette;
  // A warm glow sits behind the head, like the vCard contact photos.
  const backdrop = backdropColor
    ? `radial-gradient(75% 55% at 50% 38%, rgba(243, 108, 33, 0.24), transparent 72%), linear-gradient(180deg, color-mix(in srgb, ${backdropColor}, #ffffff 9%) 0%, color-mix(in srgb, ${backdropColor}, #000000 35%) 100%)`
    : "var(--pc-tile)";

  const contactLabel = name ? `${contactText} ${name}` : contactText;
  const contactInner = (
    <>
      <EnvelopeSimple size={16} weight="bold" aria-hidden />
      {contactText}
    </>
  );

  return (
    <div
      ref={rootRef}
      className={`profile-card ${className}`.trim()}
      style={
        {
          ...THEMES[palette],
          ...FOILS[foil],
          "--pc-radius": `${Math.max(0, radius)}px`,
          "--pc-backdrop": backdrop,
          "--pc-holo": clamp(holo, 0, 1),
          "--pc-glare": clamp(glare, 0, 1),
          "--pc-parallax": `${Math.max(0, parallax)}px`,
          "--pc-status": statusColor,
          "--pc-grain": GRAIN,
          "--pc-pattern": iconUrl ? `url("${iconUrl}")` : "linear-gradient(#000, #000)",
          "--pc-pattern-size": iconUrl ? "52% auto" : "100% 100%",
          "--pc-holo-gain": iconUrl ? 1.25 : 0.75,
          "--pc-holo-detail": iconUrl && foil === "dark" ? 1 : 0,
        } as Record<string, string | number> as CSSProperties
      }
    >
      <div className="profile-card__body">
        <div className="profile-card__tile">
          <span className="profile-card__sheen" />
          {iconUrl && <span className="profile-card__logos" />}
          <span className="profile-card__holo">
            <span className="profile-card__holo-glow" />
            <span className="profile-card__holo-shift" />
          </span>
          {avatarUrl ? (
            <img className="profile-card__photo" src={avatarUrl} alt={name || ""} loading="lazy" draggable={false} />
          ) : (
            name && (
              <span className="profile-card__initials" aria-hidden="true">
                {initials(name)}
              </span>
            )
          )}
          {(name || title) && (
            <>
              <span className="profile-card__scrim" />
              <div className="profile-card__info">
                {name && <h3 className="profile-card__name">{name}</h3>}
                {title && <p className="profile-card__title">{title}</p>}
              </div>
            </>
          )}
          <span className="profile-card__tile-rim" />
        </div>

        {showUserInfo && (
          <div className="profile-card__footer">
            {miniAvatarUrl && (
              <span className="profile-card__avatar">
                <img src={miniAvatarUrl} alt="" loading="lazy" draggable={false} />
              </span>
            )}
            <div className="profile-card__meta">
              {handle && <span className="profile-card__handle">@{handle}</span>}
              {status && <span className="profile-card__status">{status}</span>}
            </div>
            {contactText &&
              (contactHref ? (
                <Link href={contactHref} className="profile-card__contact" aria-label={contactLabel}>
                  {contactInner}
                </Link>
              ) : (
                <button type="button" className="profile-card__contact" onClick={onContactClick} aria-label={contactLabel}>
                  {contactInner}
                </button>
              ))}
          </div>
        )}

        <span className="profile-card__glare" />
        <span className="profile-card__shade" />
        <span className="profile-card__rim" />
      </div>
    </div>
  );
};

export default memo(ProfileCard);
