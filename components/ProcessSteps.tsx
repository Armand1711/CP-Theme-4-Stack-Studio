import type { CSSProperties } from "react";
import { processSteps } from "@/lib/content";

// Top rule brightens step by step: 0.3 → 0.55 → 0.8 → 1.
const alphas = [0.3, 0.55, 0.8, 1];

export function ProcessSteps() {
  return (
    <ol className="process">
      {processSteps.map((name, i) => (
        <li key={name} className="process__step" style={{ "--step-alpha": alphas[i] } as CSSProperties}>
          <div className="process__num">{String(i + 1).padStart(2, "0")}</div>
          <div className="process__name">{name}</div>
        </li>
      ))}
    </ol>
  );
}
