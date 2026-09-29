import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import { plans } from "@/lib/content";
import { SpecularButton } from "@/components/SpecularButton";

/** Three-tier plan ladder. `detailed` adds the facts row (pricing page). */
export function PlanLadder({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="ladder">
      {plans.map((p, i) => {
        const [amount, unit] = p.price.split(" / ");
        return (
          <article
            key={p.id}
            className={`tier tier--${p.id} surface spot`}
            data-reveal
            style={{ "--d": i } as CSSProperties}
          >
            <div className="tier__row">
              <div>
                <h3 className="tier__name">
                  {p.name}
                  {p.id === "team" && <span className="tier__badge">Full service</span>}
                </h3>
                <p className="body-2">{p.blurb}</p>
              </div>
              <div className="tier__cta">
                <div className="tier__price">
                  {amount}
                  {unit && <small> / {unit}</small>}
                </div>
                {p.id === "starter" && (
                  <Link href="/contact" className="textlink">
                    Start a Project
                    <ArrowRight size={16} weight="bold" aria-hidden />
                  </Link>
                )}
                {p.id === "growth" && (
                  <SpecularButton href="/contact" className="btn btn--ghost">
                    Start a Project
                  </SpecularButton>
                )}
                {p.id === "team" && (
                  <SpecularButton href="/contact" autoAnimate className="btn btn--primary">
                    Start a Project
                    <ArrowUpRight size={18} weight="bold" aria-hidden />
                  </SpecularButton>
                )}
              </div>
            </div>
            {detailed && (
              <dl className="tier__facts">
                {p.facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </article>
        );
      })}
    </div>
  );
}
