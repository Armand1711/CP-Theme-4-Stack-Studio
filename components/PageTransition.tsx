import { ViewTransition, type ReactNode } from "react";

/*
 * Route transition wrapper (React ViewTransition + the browser View Transitions API).
 * Wrap each page's content in this, not the layout: layouts persist, so enter/exit never fire there.
 * The new page is revealed as a circle growing from the click point (--vt-x/--vt-y, set by
 * TransitionOrigin) while the old page sinks back. Browsers without support just swap pages.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div className="page">{children}</div>
    </ViewTransition>
  );
}
