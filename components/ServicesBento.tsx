import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { services, serviceHref, type ServiceKey } from "@/lib/content";

/*
 * Home services as a bento grid. Each tile is the service in its own tool's dress (the same themes as
 * the service pages): a resizing browser beside its CSS for Web, a workflow with a travelling pulse for
 * Software, a selection hopping between layers for UI/UX, a phone with a springy sheet for Apps.
 * The minis are CSS loops; they sit still under reduced motion.
 */

/** Each service's tool, small and looping. Also used by the pricing page's service tiles. */
export function ServiceMini({ kind }: { kind: ServiceKey }) {
  if (kind === "web")
    return (
      <span className="bm bm--web" aria-hidden="true">
        <span className="bm__code mono">
          <span>
            <span className="tok tok--sel">.cards</span> {"{"} <span className="tok tok--prop">columns</span>: <span className="tok tok--num">3</span> {"}"}
          </span>
          <span className="bm__lit">
            <span className="tok tok--at">@container</span> (<span className="tok tok--num">599px</span>) {"{"}
          </span>
          <span className="bm__lit">
            {"  "}
            <span className="tok tok--sel">.cards</span> {"{"} <span className="tok tok--prop">columns</span>: <span className="tok tok--num">1</span> {"}"}
          </span>
          <span className="bm__lit">{"}"}</span>
        </span>
        <span className="bm__browser">
          <i className="bm__bar" />
          <span className="bm__page">
            <i className="bm__hero" />
            <span className="bm__cards">
              <i />
              <i />
              <i />
            </span>
          </span>
        </span>
      </span>
    );
  if (kind === "software")
    return (
      <span className="bm bm--sw" aria-hidden="true">
        <span className="bm__flow">
          <i />
          <i />
          <i />
          <i />
          <b className="bm__pulse" />
        </span>
        <span className="bm__log mono">
          <span className="tok tok--kw">POST</span> /crm/contacts <span className="tok tok--str">201</span>
        </span>
      </span>
    );
  if (kind === "uiux")
    return (
      <span className="bm bm--ux" aria-hidden="true">
        <span className="bm__card">
          <i className="bm__t" />
          <i className="bm__s" />
          <span className="bm__chips">
            <i />
            <i />
            <i />
          </span>
          <i className="bm__btn" />
          <b className="bm__sel" />
        </span>
      </span>
    );
  return (
    <span className="bm bm--app" aria-hidden="true">
      <span className="bm__phone">
        <i className="bm__island" />
        <i className="bm__tile" />
        <i className="bm__tile bm__tile--map" />
        <span className="bm__sheet">
          <i />
          <i />
          <i />
        </span>
      </span>
    </span>
  );
}

export function ServicesBento() {
  return (
    <ul className="bento">
      {services.map((s, i) => (
        <li key={s.key} className={`bento__tile bento__tile--${s.key}`} data-reveal style={{ "--d": i } as CSSProperties}>
          <Link href={serviceHref(s)} className="bento__link">
            <span className="bento__head">
              <span className="bento__num mono">{s.number}</span>
              <span className="bento__name">{s.name}</span>
            </span>
            <span className="bento__lede">{s.lede}</span>
            <ServiceMini kind={s.key} />
            <span className="bento__foot">
              <span className="bento__price">
                From <b>{s.fromPrice}</b>
              </span>
              <span className="bento__arrow" aria-hidden="true">
                <ArrowUpRight size={20} weight="bold" />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
