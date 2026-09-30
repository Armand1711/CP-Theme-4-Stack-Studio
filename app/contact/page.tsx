import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ContactDetails } from "@/components/ContactDetails";
import { ContactForm } from "@/components/ContactForm";
import { TechHeading } from "@/components/TechHeading";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us what you're building. We'll reply within one business day.",
};

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export default function ContactPage() {
  return (
    <PageTransition>
      <section className="wrap hero hero--inner hero--text">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__copy load-in">
          <TechHeading className="display display--h1" style={i(0)}>
            Let&apos;s build <em>something.</em>
          </TechHeading>
          <p className="lede" style={i(1)}>
            Tell us what you&apos;re building. We&apos;ll reply within one business day.
          </p>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: "clamp(80px, 10vw, 128px)" }}>
        <div className="contact load-in">
          <div style={i(2)}>
            <ContactForm variant="full" />
          </div>
          <div style={i(3)}>
            <ContactDetails showNextSteps />
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
