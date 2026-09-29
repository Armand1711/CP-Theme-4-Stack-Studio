import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "@/lib/content";
import { Eyebrow } from "@/components/Eyebrow";
import { PlanLadder } from "@/components/PlanLadder";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Every plan starts with a scoped project. Pricing scales as the relationship does.",
};

export default function PricingPage() {
  return (
    <>
      <section className="page-hero page-hero--narrow px">
        <Eyebrow label="Pricing" />
        <h1 className="display display--md">
          Plans that <em>scale with you</em>
        </h1>
        <p className="lede lede--sm">Every plan starts with a scoped project. Pricing scales as the relationship does.</p>
      </section>

      <section className="px" style={{ paddingBottom: 32 }}>
        <PlanLadder detailed />
      </section>

      <section className="section px">
        <h2 className="h-plain" style={{ fontSize: 24, marginBottom: 32 }}>
          Questions
        </h2>
        <div className="faq">
          {faqs.map((f) => (
            <div key={f.q} className="faq__item">
              <h3 className="faq__q">{f.q}</h3>
              <p className="faq__a">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-row cta-row--tail px">
        <h2 className="h-plain">Not sure which plan fits?</h2>
        <Link href="/contact" className="btn btn--primary shine">
          Start a Project
        </Link>
      </section>
    </>
  );
}
