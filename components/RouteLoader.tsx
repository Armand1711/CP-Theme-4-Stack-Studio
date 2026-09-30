"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ElectricLogo } from "./ElectricLogo";

/** How long the loading screen stays up on every page change, at minimum. */
const MIN_VISIBLE_MS = 1400;
/** Give up and hide if a navigation never lands (network error, cancelled route). */
const MAX_VISIBLE_MS = 8000;

type Phase = "hidden" | "in" | "out";

/*
 * Loading screen shown on every page change: the brand mark traced in lightning.
 * It starts on the click (or back/forward), not when the new page arrives, so it covers the swap,
 * and stays at least MIN_VISIBLE_MS so the mark has time to charge up. It fades out once the new
 * route has rendered. Same-page links (#anchors), new-tab clicks and external links are ignored.
 */
export function RouteLoader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("hidden");
  const startedAt = useRef(0);
  const lastPath = useRef(pathname);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const show = () => {
      clearTimers();
      startedAt.current = performance.now();
      setPhase("in");
      timers.current.push(window.setTimeout(() => setPhase("out"), MAX_VISIBLE_MS));
    };

    const onClick = (e: MouseEvent) => {
      // Capture phase, and no defaultPrevented check: Next's <Link> prevents default on every click.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      show();
    };
    // Back/forward: the URL has already changed when popstate fires.
    const onPop = () => {
      if (location.pathname !== lastPath.current) show();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      clearTimers();
    };
  }, []);

  // The new route has rendered: hide once the minimum time is up.
  useEffect(() => {
    lastPath.current = pathname;
    if (phase !== "in") return;
    const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt.current));
    clearTimers();
    timers.current.push(window.setTimeout(() => setPhase("out"), remaining));
    // Only the path change matters here; phase is read, not tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (phase === "hidden") return null;

  return (
    <div
      className="route-loader"
      data-phase={phase}
      role="status"
      onAnimationEnd={(e) => {
        if (e.animationName === "loader-out") setPhase("hidden");
      }}
    >
      <span className="visually-hidden">Loading</span>
      <ElectricLogo
        src="/brand/stack-studio-mark.svg"
        color="#ffe2d0"
        glowColor="#f36c21"
        scale={0.5}
        strands={4}
        bend={0.6}
        crackle={1.5}
        arcs={1}
        speed={2.5}
        interactive
        className="route-loader__logo"
      />
    </div>
  );
}
