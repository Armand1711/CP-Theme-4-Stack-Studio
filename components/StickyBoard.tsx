import { Fragment, type CSSProperties } from "react";

/*
 * "How it runs" on the UI/UX Design page, as sticky notes on a whiteboard. Each note drops onto the
 * board in turn as it scrolls into view (RevealObserver's `.is-in` with a stagger), and the arrow to the
 * next note draws itself. Pure CSS; reduced motion shows the board as-is.
 */

const NOTES = [
  { name: "Discover", line: "We learn how your business actually runs.", tilt: -2.5 },
  { name: "Design", line: "Screens you can click before we build.", tilt: 1.8 },
  { name: "Build", line: "Shipped in small pieces you can use early.", tilt: -1.2 },
  { name: "Launch", line: "Live, measured, and looked after.", tilt: 2.4 },
];

export function StickyBoard() {
  return (
    <ol className="board">
      {NOTES.map((n, i) => (
        <Fragment key={n.name}>
          <li
            className="sticky"
            data-reveal
            data-tone={i}
            style={{ "--d": i * 2, "--tilt": `${n.tilt}deg` } as CSSProperties}
          >
            <span className="sticky__name">{n.name}</span>
            <span className="sticky__line">{n.line}</span>
          </li>
          {i < NOTES.length - 1 && (
            <li className="board__arrow" data-reveal style={{ "--d": i * 2 + 1 } as CSSProperties} aria-hidden="true">
              <svg viewBox="0 0 64 24" fill="none">
                <path d="M2 14 C 20 2, 40 2, 56 12" pathLength={1} />
                <path d="M50 6 L57 12.5 L49 16" pathLength={1} />
              </svg>
            </li>
          )}
        </Fragment>
      ))}
    </ol>
  );
}
