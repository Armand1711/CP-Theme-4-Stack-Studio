"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { services, serviceHref, type ServiceKey } from "@/lib/content";
import { CaseStudy } from "./CaseStudy";
import { SpecularButton } from "@/components/SpecularButton";

export function CaseStudyExplorer() {
  const [active, setActive] = useState<ServiceKey>("web");
  const baseId = useId();
  const current = services.find((s) => s.key === active)!;
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // Slide the accent pill under the selected tab (transform + width only, set directly, no re-render).
  useLayoutEffect(() => {
    const place = () => {
      const tab = listRef.current?.querySelector<HTMLElement>(`[data-key="${active}"]`);
      const ind = indicatorRef.current;
      if (!tab || !ind) return;
      // First placement is instant (no slide in from zero width); later moves animate.
      const first = !ind.dataset.placed;
      if (first) ind.style.transition = "none";
      ind.style.width = `${tab.offsetWidth}px`;
      ind.style.transform = `translateX(${tab.offsetLeft}px)`;
      if (first) {
        void ind.offsetWidth;
        ind.style.transition = "";
        ind.dataset.placed = "true";
      }
    };
    place();
    const ro = new ResizeObserver(place);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [active]);

  return (
    <>
      <div ref={listRef} className="explorer__tabs" role="tablist" aria-label="Service">
        <span ref={indicatorRef} className="explorer__indicator" aria-hidden="true" />
        {services.map((s) => (
          <SpecularButton
            key={s.key}
            type="button"
            role="tab"
            data-key={s.key}
            id={`${baseId}-tab-${s.key}`}
            aria-selected={s.key === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={s.key === active ? 0 : -1}
            className="explorer__tab"
            onClick={() => setActive(s.key)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const i = services.findIndex((x) => x.key === active);
              const next = services[(i + (e.key === "ArrowRight" ? 1 : -1) + services.length) % services.length];
              setActive(next.key);
              document.getElementById(`${baseId}-tab-${next.key}`)?.focus();
            }}
          >
            {s.name}
          </SpecularButton>
        ))}
      </div>

      {/* The panel is the top card of a deck; the other services sit underneath. */}
      <div className="deck">
        <div
          key={active}
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${active}`}
          className="explorer__panel deck__top"
        >
          {current.caseStudy ? (
            <CaseStudy study={current.caseStudy} kicker={`${current.name} case study`} href={serviceHref(current)} />
          ) : (
            <div className="coming-soon">
              <h3>Case study coming soon</h3>
              <p className="body-2">
                We&apos;re writing up a {current.name} project. In the meantime, see what the service covers.
              </p>
              <Link href={serviceHref(current)} className="textlink textlink--accent">
                Explore {current.name}
                <ArrowRight size={16} weight="bold" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
