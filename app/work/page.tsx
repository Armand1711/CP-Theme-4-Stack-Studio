import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PageTransition } from "@/components/PageTransition";
import { TechHeading } from "@/components/TechHeading";
import { WorkGallery } from "@/components/WorkGallery";
import { DeckMini } from "@/components/Minis";

export const metadata: Metadata = {
  title: "Work",
  description: "Websites, software and apps Stack Studio has designed and built for clients.",
};

const i = (n: number) => ({ "--i": n }) as CSSProperties;

/** Every case study in one place. Projects are added in lib/content.ts (a service's `caseStudies`). */
export default function WorkPage() {
  return (
    <PageTransition>
      <section className="wrap hero hero--inner">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__copy load-in">
          <TechHeading className="display display--h1" style={i(0)}>
            Work we&apos;re <em>proud of.</em>
          </TechHeading>
          <p className="lede" style={i(1)}>
            Real projects for real clients, across web, software, design and apps. Scroll through each live
            site right here.
          </p>
        </div>
        <div className="hero__mini autoplay load-in">
          <div style={i(2)}>
            <DeckMini />
          </div>
        </div>
      </section>

      <section className="wrap section work" style={{ paddingTop: 0 }}>
        <WorkGallery />
      </section>
    </PageTransition>
  );
}
