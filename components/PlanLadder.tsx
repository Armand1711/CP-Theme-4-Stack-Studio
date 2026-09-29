import Link from "next/link";
import { plans } from "@/lib/content";
import { SpecularButton } from "@/components/SpecularButton";

/** Three-tier pricing ladder. `detailed` adds the facts row and steps type up (pricing page). */
export function PlanLadder({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className={detailed ? "ladder ladder--detailed" : "ladder"}>
      {plans.map((p) => (
        <div key={p.id} className={`tier tier--${p.id}`}>
          <div className="tier__row">
            <div>
              <div className="tier__name">{p.name}</div>
              <div className="tier__blurb">{p.blurb}</div>
            </div>
            <div className="tier__cta">
              <div className="tier__price">{p.price}</div>
              {p.id === "starter" && (
                <Link href="/contact" className="textlink textlink--md">
                  Start a Project →
                </Link>
              )}
              {p.id === "growth" && (
                <SpecularButton href="/contact" className="btn btn--outline btn--md">
                  Start a Project
                </SpecularButton>
              )}
              {p.id === "team" && (
                <SpecularButton href="/contact" autoAnimate className="btn btn--primary btn--md">
                  Start a Project
                </SpecularButton>
              )}
            </div>
          </div>
          {detailed && (
            <div className="tier__facts">
              {p.facts.map((f) => (
                <div key={f.label}>
                  <strong>{f.label}:</strong> {f.value}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
