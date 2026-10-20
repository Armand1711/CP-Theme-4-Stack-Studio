"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { LOADER_REVEAL_EVENT } from "./RouteLoader";

/**
 * Adds `.is-in` to every `[data-reveal]` element the first time it scrolls into view.
 * Elements stay fully visible until this has mounted (`.reveal-ready` gates the hidden state),
 * so no-JS and pre-hydration renders never hide content. Stagger with `style={{ "--d": n }}`.
 * While the route loader covers the page (.route-loading on <html>), nothing is marked, so the
 * reveals play as the new page is uncovered instead of unseen beneath the loader.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        if (root.classList.contains("route-loading")) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    scan();
    root.classList.add("reveal-ready");
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    // Re-observing reports each element's current visibility again, so on-screen ones reveal now.
    const onReveal = () =>
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
        io.unobserve(el);
        io.observe(el);
      });
    window.addEventListener(LOADER_REVEAL_EVENT, onReveal);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener(LOADER_REVEAL_EVENT, onReveal);
    };
  }, [pathname]);

  return null;
}
