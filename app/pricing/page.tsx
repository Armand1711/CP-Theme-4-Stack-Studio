import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { faqs } from "@/lib/content";
import { PlanFinder } from "@/components/PlanFinder";
import { PlanLadder } from "@/components/PlanLadder";
import { TechHeading } from "@/components/TechHeading";
import { SplitHeading } from "@/components/SplitHeading";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Every plan starts with a scoped project. Pricing scales as the relationship does.",
};

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export default function PricingPage() {
  return (
    <PageTransition>
      <section className="wrap hero hero--inner hero--text">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__copy load-in">
          <TechHeading className="display display--h1" style={i(0)}>
            Plans that <em>scale with you</em>
          </TechHeading>
          <p className="lede" style={i(1)}>
            Every plan starts with a scoped project. Pricing scales as the relationship does.
          </p>
        </div>
      </section>

      <section className="wrap">
        <PlanFinder>
          <PlanLadder detailed />
        </PlanFinder>
      </section>

      <section className="wrap section">
        <div className="section-head" data-reveal>
          <SplitHeading className="display display--h2">Questions</SplitHeading>
        </div>
        <div className="faq">
          {faqs.map((f, n) => (
            <div key={f.q} className="faq__item" data-reveal style={{ "--d": n } as CSSProperties}>
              <h3 className="faq__q">{f.q}</h3>
              <p className="body-2">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
