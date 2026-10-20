import type { ReactNode } from "react";

/*
 * Wraps each page's content. Page changes are covered by the route loader (components/RouteLoader.tsx),
 * which fades away to reveal the new page and starts its entrance animations, so there is no separate
 * page transition here: a View Transition underneath the loader only cost a snapshot and could let
 * the new page bleed through it.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="page">{children}</div>;
}
