import type { CSSProperties } from "react";
import { Code, MagnifyingGlass, PaperPlaneTilt, PenNib } from "@phosphor-icons/react/dist/ssr";
import { processSteps } from "@/lib/content";

const ICONS = [MagnifyingGlass, PenNib, Code, PaperPlaneTilt];

/**
 * Four-step timeline. When the row scrolls into view the connecting line draws across and each
 * step's icon lights up in turn, so the sequence reads left to right.
 */
export function ProcessSteps() {
  return (
    <ol className="process" data-reveal>
      {processSteps.map((name, i) => {
        const Glyph = ICONS[i] ?? Code;
        return (
          <li key={name} className="process__step" data-reveal style={{ "--d": i + 1 } as CSSProperties}>
            <div className="process__num">
              <Glyph size={20} weight="bold" aria-hidden />
            </div>
            <div>
              <div className="process__index mono">{String(i + 1).padStart(2, "0")}</div>
              <div className="process__name">{name}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
