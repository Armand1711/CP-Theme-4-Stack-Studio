import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import { plans, type Service } from "@/lib/content";
import { SpecularButton } from "./SpecularButton";
import { BoardMini, QuoteMini } from "./Minis";

/*
 * "What it costs" on a service page: the two ways to buy it, side by side.
 * Left: a one-off project in this service (starting price, timeline, what it covers).
 * Right: the monthly retainers, for when the work is ongoing.
 */
export function ServicePricing({ service }: { service: Service }) {
  const retainers = plans.filter((p) => p.id !== "starter");

  return (
    <div className="sprice">
      <div className="sprice__option sprice__option--project" data-reveal>
        <div className="sprice__visual">
          <QuoteMini />
        </div>
        <p className="sprice__label">One-off project</p>
        <p className="sprice__price">
          <small>From</small> {service.fromPrice}
        </p>
        <p className="sprice__note">Fixed quote. Typically {service.timeline}.</p>
        <ul className="sprice__list">
          {service.projectIncludes.map((line) => (
            <li key={line}>
              <Check size={16} weight="bold" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
        <SpecularButton href="/contact" autoAnimate className="btn btn--primary">
          Start a Project
          <ArrowUpRight size={18} weight="bold" aria-hidden />
        </SpecularButton>
      </div>

      <div className="sprice__option" data-reveal style={{ "--d": 1 } as CSSProperties}>
        <div className="sprice__visual">
          <BoardMini />
        </div>
        <p className="sprice__label">Ongoing work</p>
        <p className="sprice__lead">Need it every month? A retainer gives you a standing team.</p>
        <ul className="sprice__plans">
          {retainers.map((p) => (
            <li key={p.id}>
              <span>
                <span className="sprice__plan">{p.name}</span>
                <span className="sprice__blurb">{p.blurb}</span>
              </span>
              <span className="sprice__amount">{p.price}</span>
            </li>
          ))}
        </ul>
        <Link href="/pricing" className="textlink textlink--accent">
          Compare plans
          <ArrowRight size={16} weight="bold" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
