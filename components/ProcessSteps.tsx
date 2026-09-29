import type { CSSProperties } from "react";
import { processSteps } from "@/lib/content";

/** Four-step timeline; the connecting line draws across when the row scrolls into view. */
export function ProcessSteps() {
  return (
    <ol className="process" data-reveal>
      {processSteps.map((name, i) => (
        <li key={name} className="process__step" data-reveal style={{ "--d": i + 1 } as CSSProperties}>
          <div className="process__num">{String(i + 1).padStart(2, "0")}</div>
          <div className="process__name">{name}</div>
        </li>
      ))}
    </ol>
  );
}
