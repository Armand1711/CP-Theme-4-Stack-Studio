import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { faqs } from "@/lib/content";
import { PricingPlanner } from "@/components/PricingPlanner";
import { TechHeading } from "@/components/TechHeading";
import { SplitHeading } from "@/components/SplitHeading";
import { PageTransition } from "@/components/PageTransition";
import { ScaleMini } from "@/components/Minis";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Pay per project, or keep a dev team on a monthly retainer.",
};

const i = (n: number) => ({ "--i": n }) as CSSProperties;

// Bracketed answers are unwritten placeholders; the FAQ only shows once it has real answers.
const answered = faqs.filter((f) => !f.a.startsWith("["));

export default function PricingPage() {
  return (
    <PageTransition>
      <section className="wrap hero hero--inner">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__copy load-in">
          <TechHeading className="display display--h1" style={i(0)}>
            Plans that <em>scale with you</em>
          </TechHeading>
          <p className="lede" style={i(1)}>
            Pay per project, or keep a dev team on a monthly retainer.
          </p>
        </div>
        <div className="hero__mini load-in">
          <div style={i(2)}>
            <ScaleMini />
          </div>
        </div>
      </section>

      <PricingPlanner />

      {answered.length > 0 && (
        <section className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-head" data-reveal>
            <SplitHeading className="display display--h2">Questions</SplitHeading>
          </div>
          <div className="faq">
            {answered.map((f, n) => (
              <div key={f.q} className="faq__item" data-reveal style={{ "--d": n } as CSSProperties}>
                <h3 className="faq__q">{f.q}</h3>
                <p className="body-2">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageTransition>
  );
}
