import type { Metadata } from "next";
import { ContactDetails } from "@/components/ContactDetails";
import { ContactForm } from "@/components/ContactForm";
import { Eyebrow } from "@/components/Eyebrow";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us what you're building. We'll reply within one business day.",
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero page-hero--narrow px" style={{ paddingBottom: 56 }}>
        <Eyebrow label="Contact" />
        <h1 className="display display--md">
          Let&apos;s build <em>something.</em>
        </h1>
        <p className="lede lede--sm">Tell us what you&apos;re building. We&apos;ll reply within one business day.</p>
      </section>

      <section className="contact contact--page px">
        <ContactForm variant="full" />
        <ContactDetails showNextSteps />
      </section>
    </>
  );
}
