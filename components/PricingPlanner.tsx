"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check } from "@phosphor-icons/react";
import { plans, services, serviceHref, type PlanTier, type ServiceKey } from "@/lib/content";
import { BoardMini, QuoteMini, TeamMini } from "./Minis";
import { ServiceMini } from "./ServicesBento";
import { SpecularButton } from "./SpecularButton";
import { SplitHeading } from "./SplitHeading";
import { CountUp } from "./CountUp";

/*
 * The pricing page, driven by one control panel. Two choices (one project or a monthly team, and which
 * services) produce a recommendation, and also arrange the page: project mode leads with the per-service
 * project prices, monthly mode leads with the plans. The recommended plan card and the picked services'
 * tiles light up so the answer is visible in place, not only in the result panel.
 */

type Mode = "project" | "monthly";
type PlanId = PlanTier["id"];

const PLAN_MINI: Record<PlanId, ReactNode> = {
  starter: <QuoteMini />,
  growth: <BoardMini />,
  team: <TeamMini />,
};

/** Project work is the Project plan; ongoing work needs a full team once it spans three or more services. */
const recommend = (mode: Mode, picked: ServiceKey[]): PlanId =>
  mode === "project" ? "starter" : picked.length >= 3 ? "team" : "growth";

const list = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

export function PricingPlanner() {
  const [mode, setMode] = useState<Mode>("project");
  const [picked, setPicked] = useState<ServiceKey[]>([]);
  const planId = recommend(mode, picked);
  const plan = plans.find((p) => p.id === planId)!;
  const pickedServices = services.filter((s) => picked.includes(s.key));
  const names = pickedServices.map((s) => s.name);

  const toggle = (key: ServiceKey) =>
    setPicked((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));

  const why =
    mode === "project"
      ? names.length
        ? `A fixed quote for ${list(names)}, agreed before work starts.`
        : "A fixed quote for one piece of work, agreed before work starts."
      : planId === "team"
        ? `A dedicated team across ${list(names)}, full-time.`
        : names.length
          ? `Part-time developer capacity for steady work on ${list(names)}.`
          : "Part-time developer capacity for a steady stream of features and fixes.";

  const planSection = (
    <section key="plans" className="planner__section">
      <div className="section-head" data-reveal>
        <SplitHeading className="display display--h2">
          {mode === "monthly" ? (
            <>
              Monthly <em>plans</em>
            </>
          ) : (
            <>
              Or keep a team <em>on hand</em>
            </>
          )}
        </SplitHeading>
      </div>
      <div className="pcards">
        {plans.map((p, i) => (
          <article
            key={p.id}
            className={`pcard pcard--${p.id}`}
            data-reveal
            data-recommended={p.id === planId || undefined}
            style={{ "--d": i } as CSSProperties}
          >
            {p.id === planId && <span className="pcard__flag">Recommended</span>}
            <div className="pcard__visual">{PLAN_MINI[p.id]}</div>
            <div className="pcard__head">
              <span className="tier__stack" aria-hidden="true">
                {Array.from({ length: i + 1 }, (_, k) => (
                  <span key={k} style={{ "--k": k } as CSSProperties} />
                ))}
              </span>
              <div>
                <h3 className="pcard__name">{p.name}</h3>
                <p className="pcard__blurb">{p.blurb}</p>
              </div>
            </div>
            <p className="pcard__price">
              <CountUp value={p.price.split(" / ")[0]} />
              {p.price.includes(" / ") && <small> / {p.price.split(" / ")[1]}</small>}
            </p>
            <ul className="pcard__facts">
              {p.facts.map((f) => (
                <li key={f.label}>
                  <Check size={15} weight="bold" aria-hidden />
                  <span>
                    <b>{f.label}:</b> {f.value}
                  </span>
                </li>
              ))}
            </ul>
            <SpecularButton
              href="/contact"
              autoAnimate={p.id === planId}
              className={`btn ${p.id === planId ? "btn--primary" : "btn--ghost"}`}
            >
              Start a Project
              <ArrowUpRight size={18} weight="bold" aria-hidden />
            </SpecularButton>
          </article>
        ))}
      </div>
    </section>
  );

  const tilesSection = (
    <section key="tiles" className="planner__section">
      <div className="section-head" data-reveal>
        <SplitHeading className="display display--h2">
          Project prices <em>by service</em>
        </SplitHeading>
      </div>
      <ul className="stiles">
        {services.map((s, i) => (
          <li key={s.key} data-reveal style={{ "--d": i } as CSSProperties}>
            <Link href={serviceHref(s)} className="stile" data-picked={picked.includes(s.key) || undefined}>
              <span className="stile__mini">
                <ServiceMini kind={s.key} />
              </span>
              <span className="stile__name">{s.name}</span>
              <span className="stile__meta">
                <span>
                  From <b>{s.fromPrice}</b>
                </span>
                <span>{s.timeline}</span>
              </span>
              <ArrowRight className="stile__arrow" size={18} weight="bold" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <>
      <section className="wrap planner">
        <div className="planner__panel" data-reveal>
          <div className="planner__controls">
            <div className="planner__q">
              <p className="planner__label">How do you want to work?</p>
              <div className="planner__mode" role="radiogroup" aria-label="How do you want to work?">
                {(["project", "monthly"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    className="planner__mode-btn"
                    onClick={() => setMode(m)}
                  >
                    {m === "project" ? "One project" : "Monthly team"}
                  </button>
                ))}
                <span className="planner__mode-thumb" data-mode={mode} aria-hidden="true" />
              </div>
            </div>
            <div className="planner__q">
              <p className="planner__label">What do you need?</p>
              <div className="pills" role="group" aria-label="What do you need?">
                {services.map((s) => (
                  <button key={s.key} type="button" className="pill" aria-pressed={picked.includes(s.key)} onClick={() => toggle(s.key)}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div key={`${mode}-${planId}-${picked.join()}`} className="planner__result" aria-live="polite">
            <p className="planner__label">We&apos;d suggest</p>
            <p className="planner__plan">{plan.name}</p>
            <p className="planner__price">{plan.price}</p>
            <p className="planner__why">{why}</p>
            {mode === "project" && pickedServices.length > 0 && (
              <ul className="planner__from">
                {pickedServices.map((s) => (
                  <li key={s.key}>
                    <span>{s.name}</span>
                    <b>From {s.fromPrice}</b>
                  </li>
                ))}
              </ul>
            )}
            <SpecularButton href="/contact" autoAnimate className="btn btn--primary btn--sm">
              Start a Project
              <ArrowUpRight size={16} weight="bold" aria-hidden />
            </SpecularButton>
          </div>
        </div>
      </section>

      {/* The page leads with whatever fits the chosen way of working. */}
      <div key={mode} className="wrap planner__flow">
        {mode === "project" ? [tilesSection, planSection] : [planSection, tilesSection]}
      </div>
    </>
  );
}
