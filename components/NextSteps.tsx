import type { CSSProperties, ReactNode } from "react";
import { CallMini, QuoteMini, ReplyMini } from "./Minis";

/** Contact page: what happens after someone gets in touch, as three illustrated tiles. */
const STEPS: { label: string; mini: ReactNode }[] = [
  { label: "We reply within one business day", mini: <ReplyMini /> },
  { label: "A short scoping call", mini: <CallMini /> },
  { label: "A proposal, scoped and quoted", mini: <QuoteMini title="Proposal" stamp="Scoped" /> },
];

export function NextSteps() {
  return (
    <ol className="next">
      {STEPS.map((s, i) => (
        <li key={s.label} className="next__tile" data-reveal style={{ "--d": i } as CSSProperties}>
          {s.mini}
          <p className="next__label">
            <span className="mono">{String(i + 1).padStart(2, "0")}</span>
            {s.label}
          </p>
        </li>
      ))}
    </ol>
  );
}
