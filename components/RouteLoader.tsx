"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ElectricLogo } from "./ElectricLogo";

/** How long the loading screen stays up on every page change, at minimum. */
const MIN_VISIBLE_MS = 1300;
/** Give up and hide if a navigation never lands (network error, cancelled route). */
const MAX_VISIBLE_MS = 8000;
/** Class on <html> while the loader covers the page; see "Route loading screen" in globals.css. */
const LOADING_CLASS = "route-loading";
/** Fired on window when the loader starts revealing the new page (RevealObserver listens). */
export const LOADER_REVEAL_EVENT = "routeloader:reveal";

type Phase = "hidden" | "in" | "out";

/*
 * Loading screen shown on every page change: the brand mark traced in lightning.
 *
 * The lightning logo is expensive to set up (WebGL shader compile + tracing the mark), so it is built
 * once, paused and invisible, when the browser is idle after the first load. A click then only has to
 * show it, so the screen covers instantly and the mark charges up straight away.
 *
 * Sequence: click (or back/forward) -> fade in -> new route renders underneath -> after at least
 * MIN_VISIBLE_MS a circle opens from the centre to reveal it. While covering, <html> gets
 * .route-loading, which holds the new page's entrance animations and scroll reveals so they play as
 * the page is revealed rather than unseen beneath the loader. Same-page links (#anchors), new-tab
 * clicks and external links are ignored.
 */
export function RouteLoader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("hidden");
  const [warm, setWarm] = useState(false);
  const startedAt = useRef(0);
  const lastPath = useRef(pathname);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  // Build the logo ahead of time, once the first page has settled.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setWarm(true), { timeout: 2500 });
    return () => cancel(id);
  }, []);

  useEffect(() => {
    const show = () => {
      clearTimers();
      startedAt.current = performance.now();
      setWarm(true);
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
      // Files (e.g. the .vcf contact card) open or download in place; there is no page to load.
      if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return;
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

  // The new route has rendered: reveal once the minimum time is up.
  useEffect(() => {
    lastPath.current = pathname;
    if (phase !== "in") return;
    const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt.current));
    clearTimers();
    timers.current.push(window.setTimeout(() => setPhase("out"), remaining));
    // Only the path change matters here; phase is read, not tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Hold the page's entrance animations while covered; release them as the reveal starts.
  useEffect(() => {
    const root = document.documentElement;
    if (phase === "in") {
      root.classList.add(LOADING_CLASS);
    } else if (root.classList.contains(LOADING_CLASS)) {
      root.classList.remove(LOADING_CLASS);
      window.dispatchEvent(new Event(LOADER_REVEAL_EVENT));
    }
  }, [phase]);

  if (!warm && phase === "hidden") return null;

  return (
    <div
      className="route-loader"
      data-phase={phase}
      role="status"
      aria-hidden={phase === "hidden"}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && e.animationName === "loader-out") setPhase("hidden");
      }}
    >
      {phase !== "hidden" && <span className="visually-hidden">Loading</span>}
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
        charge={0.9}
        interactive
        paused={phase === "hidden"}
        className="route-loader__logo"
      />
    </div>
  );
}
