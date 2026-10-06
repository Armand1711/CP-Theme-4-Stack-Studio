import type { CSSProperties } from "react";
import { Clock, CurrencyCircleDollar } from "@phosphor-icons/react/dist/ssr";
import type { Service } from "@/lib/content";

/*
 * A service hero's starting price and typical timeline, dressed for the service:
 * Web as a JS object, Software as a YAML config, UI/UX as a design-variables panel, Apps as an app store
 * info strip. The themed versions are decorative; screen readers get one plain sentence.
 */
export function HeroFacts({ service, style }: { service: Service; style?: CSSProperties }) {
  const { key, fromPrice, timeline } = service;

  return (
    <div style={style}>
      <p className="visually-hidden">
        Projects from {fromPrice}. Typical timeline {timeline}.
      </p>
      {key === "web" && (
        <pre className="hero__code mono" aria-hidden="true">
          <span className="tok tok--kw">const</span> project = {"{\n  "}
          <span className="tok tok--prop">from</span>: <span className="tok tok--str">&quot;{fromPrice}&quot;</span>
          {",\n  "}
          <span className="tok tok--prop">timeline</span>: <span className="tok tok--str">&quot;{timeline}&quot;</span>
          {",\n};"}
        </pre>
      )}
      {key === "software" && (
        <pre className="hero__code mono" aria-hidden="true">
          <span className="tok tok--comment"># project.yml</span>
          {"\n"}
          <span className="tok tok--prop">from</span>: <span className="tok tok--str">{fromPrice}</span>
          {"\n"}
          <span className="tok tok--prop">timeline</span>: <span className="tok tok--str">{timeline}</span>
        </pre>
      )}
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
