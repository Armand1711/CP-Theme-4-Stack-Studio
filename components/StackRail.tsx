"use client";

import { useEffect, useState, type CSSProperties } from "react";

/*
 * On-page index drawn as the brand stack: one plate per section, stacked bottom-up. Plates you have
 * scrolled to are solid, the current one is lit in accent, and the last section caps the stack with
 * the brand plate, so the page literally builds the stack as you read it. Hover or keyboard focus
 * spreads the plates apart (like the hero stack) and shows their names; each plate jumps to its section.
 * Wide screens only (it lives in the side gutter). IntersectionObserver, no scroll listeners.
 */
export function StackRail({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = els.indexOf(e.target as HTMLElement);
          if (e.isIntersecting) setActive(i);
          // Scrolling back up above the first section empties the stack again.
          else if (i === 0 && e.boundingClientRect.top > 0) setActive((cur) => (cur === 0 ? -1 : cur));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const last = sections.length - 1;

  return (
    <nav className="rail" aria-label="On this page" data-visible={active >= 0 || undefined}>
      <ol>
        {sections.map((s, i) => (
          <li key={s.id} style={{ "--i": i } as CSSProperties}>
            <a
              href={`#${s.id}`}
              className={`rail__plate${i === last ? " rail__plate--cap" : ""}`}
              data-on={i <= active || undefined}
              data-active={i === active || undefined}
              aria-current={i === active ? "location" : undefined}
            >
              <span className="rail__label">{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
