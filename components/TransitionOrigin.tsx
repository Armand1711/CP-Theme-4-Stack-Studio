"use client";

import { useEffect } from "react";

/**
 * Records where the next page-in view transition should grow from, relative to where the next page
 * will sit (top of <main> at scroll 0). Pure CSS variables on <html>; the ::view-transition
 * pseudo-elements inherit them.
 * - Pointer: the press point.
 * - Keyboard (Enter on a focused link/button): the centre of the focused element.
 * - Back/forward: top centre, since there is no on-page trigger.
 * --vt-r is the distance to the farthest visible corner, so the circle always fully covers the screen.
 */
export function TransitionOrigin() {
  useEffect(() => {
    const root = document.documentElement;
    const set = (clientX: number, clientY: number) => {
      const main = document.getElementById("main");
      const left = main?.getBoundingClientRect().left ?? 0;
      const top = main?.offsetTop ?? 0;
      const x = clientX - left;
      const y = clientY - top;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.style.setProperty("--vt-x", `${Math.round(x)}px`);
      root.style.setProperty("--vt-y", `${Math.round(y)}px`);
      root.style.setProperty("--vt-r", `${Math.ceil(r)}px`);
    };
    const onDown = (e: PointerEvent) => set(e.clientX, e.clientY);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = document.activeElement;
      if (!(el instanceof HTMLElement) || el === document.body) return;
      const r = el.getBoundingClientRect();
      set(r.left + r.width / 2, r.top + r.height / 2);
    };
    const onPop = () => set(window.innerWidth / 2, 0);

    window.addEventListener("pointerdown", onDown, { passive: true, capture: true });
    window.addEventListener("keydown", onKey, { capture: true });
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("pointerdown", onDown, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
      window.removeEventListener("popstate", onPop);
    };
  }, []);
  return null;
}
