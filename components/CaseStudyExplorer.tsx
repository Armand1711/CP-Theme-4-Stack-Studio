"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { services, serviceHref, type ServiceKey } from "@/lib/content";
import { CaseStudy } from "./CaseStudy";

export function CaseStudyExplorer() {
  const [active, setActive] = useState<ServiceKey>("web");
  const baseId = useId();
  const current = services.find((s) => s.key === active)!;

  return (
    <>
      <div className="explorer__tabs" role="tablist" aria-label="Service">
        {services.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            id={`${baseId}-tab-${s.key}`}
            aria-selected={s.key === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={s.key === active ? 0 : -1}
            className="pill pill--lg"
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
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${active}`}>
        {current.caseStudy ? (
          <CaseStudy
            study={current.caseStudy}
            kicker={`${current.name} case study`}
            href={serviceHref(current)}
          />
        ) : (
          <div className="placeholder-box">
            <strong>Case study coming soon</strong>
            <p>We&apos;re writing up a {current.name} project. In the meantime, see what the service covers.</p>
            <Link href={serviceHref(current)} className="textlink">
              Explore {current.name} →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
