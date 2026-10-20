"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Browser, DeviceMobile, GearSix, PenNib, type Icon } from "@phosphor-icons/react";
import { allWork, serviceHref, services, type CaseStudy, type Service, type ServiceKey } from "@/lib/content";

/*
 * /work: every project, filterable by service. Each project shows its live site in a browser frame that
 * scrolls top to bottom on hover (touch screens scroll it by finger). Services without a project yet get
 * an invitation card instead, so the page doubles as a call to action.
 */

const ICONS: Record<ServiceKey, Icon> = { web: Browser, software: GearSix, uiux: PenNib, mobile: DeviceMobile };
type Filter = ServiceKey | "all";

export function WorkGallery() {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = allWork.filter((w) => filter === "all" || w.service.key === filter);
  const open = services.filter((s) => (filter === "all" || s.key === filter) && s.caseStudies.length === 0);
  const count = (key: Filter) => (key === "all" ? allWork.length : allWork.filter((w) => w.service.key === key).length);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All work" },
    ...services.map((s) => ({ key: s.key, label: s.navLabel })),
  ];

  return (
    <>
      <div className="work__filters pills" role="group" aria-label="Filter by service">
        {tabs.map((t) => (
          <button key={t.key} type="button" className="pill" aria-pressed={filter === t.key} onClick={() => setFilter(t.key)}>
            {t.label}
            <span className="work__count">{count(t.key)}</span>
          </button>
        ))}
      </div>

      {/* Re-keyed per filter so the results fade in fresh. */}
      <div key={filter} className="work__results" aria-live="polite">
        {shown.map(({ study, service }, n) => (
          <WorkProject key={study.title} study={study} service={service} index={n} total={shown.length} />
        ))}

        {open.length > 0 && (
          <div className="work__open">
            {shown.length > 0 && <p className="eyebrow">Next up</p>}
            <div className="work__slots">
              {open.map((s) => (
                <OpenSlot key={s.key} service={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function WorkProject({ study, service, index, total }: { study: CaseStudy; service: Service; index: number; total: number }) {
  const host = study.url ? new URL(study.url).host : null;
  // Roughly one second per screen of page, so long sites don't whizz past.
  const scroll = study.fullPage ? ({ "--scroll-time": `${Math.max(4, study.fullPage.height / 900)}s` } as CSSProperties) : undefined;

  return (
    <article className="wproject surface">
      <div className="wproject__frame browser" style={scroll}>
        <div className="browser__bar" aria-hidden="true">
          <span className="browser__dots">
            <i />
            <i />
            <i />
          </span>
          {host && <span className="browser__url">{host}</span>}
        </div>
        <div className="browser__viewport" tabIndex={study.fullPage ? 0 : undefined} aria-label={study.fullPage ? `${study.client ?? study.title} website, full page` : undefined}>
          {study.fullPage ? (
            <Image
              className="browser__page"
              src={study.fullPage.src}
              alt={study.image.alt}
              width={1000}
              height={study.fullPage.height}
              sizes="(max-width: 900px) 100vw, 760px"
            />
          ) : (
            <Image className="browser__still" src={study.image.src} alt={study.image.alt} width={1600} height={1000} sizes="(max-width: 900px) 100vw, 760px" />
          )}
        </div>
        {study.fullPage && (
          <span className="browser__hint" aria-hidden="true">
            <span className="browser__hint-hover">Hover to scroll the site</span>
            <span className="browser__hint-touch">Scroll inside to explore</span>
          </span>
        )}
      </div>

      <div className="wproject__info">
        <p className="wproject__meta mono">
          <span>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span>{service.name}</span>
          {study.year && <span>{study.year}</span>}
        </p>
        <h2 className="wproject__title">{study.title}</h2>
        <p className="body-2">{study.summary}</p>
        <div className="case__tags">
          {study.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
        <div className="case__links">
          {study.url && (
            <a href={study.url} className="btn btn--primary btn--sm" target="_blank" rel="noopener noreferrer">
              Visit live site
              <ArrowUpRight size={16} weight="bold" aria-hidden />
            </a>
          )}
          <Link href={serviceHref(service)} className="textlink">
            {service.name}
            <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

function OpenSlot({ service }: { service: Service }) {
  const IconFor = ICONS[service.key];
  return (
    <div className="wslot">
      <span className="wslot__icon">
        <IconFor size={22} weight="bold" aria-hidden />
      </span>
      <p className="mono wslot__kicker">{service.name}</p>
      <h3 className="wslot__title">Your project could be here.</h3>
      <p className="body-2">{service.lede}</p>
      <div className="case__links">
        <Link href="/contact" className="textlink textlink--accent">
          Start a project
          <ArrowUpRight size={16} weight="bold" aria-hidden />
        </Link>
        <Link href={serviceHref(service)} className="textlink">
          About the service
          <ArrowRight size={16} weight="bold" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
