import type { CSSProperties } from "react";
import { Code, MagnifyingGlass, PaperPlaneTilt, PenNib } from "@phosphor-icons/react/dist/ssr";

/*
 * "How it runs" on the Desktop & Mobile Apps page, as four apps installing on a home screen. When the
 * row scrolls into view each icon's progress ring fills in turn (CSS, via RevealObserver's `.is-in`),
 * then the icon brightens and its status flips from "Waiting" to "Done". Reduced motion shows them done.
 */

const STEPS = [
  { name: "Discover", line: "We learn how your business actually runs.", Icon: MagnifyingGlass },
  { name: "Design", line: "Screens you can click before we build.", Icon: PenNib },
  { name: "Build", line: "Shipped in small pieces you can use early.", Icon: Code },
  { name: "Launch", line: "Live, measured, and looked after.", Icon: PaperPlaneTilt },
];

export function InstallSteps() {
  return (
    <ol className="installs">
      {STEPS.map(({ name, line, Icon }, i) => (
        <li key={name} className="install" data-reveal style={{ "--d": i } as CSSProperties}>
          <span className="install__icon" aria-hidden="true">
            <Icon size={34} weight="duotone" />
            <span className="install__ring" />
          </span>
          <span className="install__name">{name}</span>
          <span className="install__status mono" aria-hidden="true">
            <span>Waiting</span>
            <span>Done</span>
          </span>
          <span className="install__line">{line}</span>
        </li>
      ))}
    </ol>
  );
}
