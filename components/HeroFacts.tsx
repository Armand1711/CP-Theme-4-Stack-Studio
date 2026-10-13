import type { CSSProperties } from "react";
import { Clock, CurrencyCircleDollar } from "@phosphor-icons/react/dist/ssr";
import type { Service } from "@/lib/content";

/*
 * A service hero's starting price and typical timeline, dressed for the service:
 * UI/UX as a design-variables panel, Apps as an app store info strip, Web and Software as plain facts
 * (code-styled versions read as noise to non-technical visitors). The themed versions are decorative;
 * screen readers get one plain sentence.
 */
export function HeroFacts({ service, style }: { service: Service; style?: CSSProperties }) {
  const { key, fromPrice, timeline } = service;

  if (key === "web" || key === "software") {
    return (
      <dl className="hero__facts" style={style}>
        <div>
          <dt>Projects from</dt>
          <dd>{fromPrice}</dd>
        </div>
        <div>
          <dt>Typical timeline</dt>
          <dd>{timeline}</dd>
        </div>
      </dl>
    );
  }

  return (
    <div style={style}>
      <p className="visually-hidden">
        Projects from {fromPrice}. Typical timeline {timeline}.
      </p>
      {key === "uiux" && (
        <div className="hero__vars" aria-hidden="true">
          <span className="hero__vars-title">Project variables</span>
          <span className="hero__var">
            <CurrencyCircleDollar size={16} weight="bold" />
            <span>price/from</span>
            <b>{fromPrice}</b>
          </span>
          <span className="hero__var">
            <Clock size={16} weight="bold" />
            <span>timeline</span>
            <b>{timeline}</b>
          </span>
        </div>
      )}
      {key === "mobile" && (
        <div className="hero__store" aria-hidden="true">
          <span>
            <small>Price</small>
            <b>{fromPrice}</b>
            <small>from</small>
          </span>
          <span>
            <small>Timeline</small>
            <b>{timeline}</b>
            <small>typical</small>
          </span>
          <span>
            <small>Platforms</small>
            <b>iOS + Android</b>
            <small>Windows, macOS</small>
          </span>
        </div>
      )}
    </div>
  );
}
