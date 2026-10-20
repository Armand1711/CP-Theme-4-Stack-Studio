import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Scramble } from "@/components/Scramble";
import { ServicesBento } from "@/components/ServicesBento";
import { HeroTicker } from "@/components/HeroTicker";
import { CaseStudyExplorer } from "@/components/CaseStudyExplorer";
import { ContactDetails } from "@/components/ContactDetails";
import { ContactForm } from "@/components/ContactForm";
import { PlanLadder } from "@/components/PlanLadder";
import { SpecularButton } from "@/components/SpecularButton";
import { StackVisual } from "@/components/StackVisual";
import { Magnetic } from "@/components/Magnetic";
import { TechHeading } from "@/components/TechHeading";
import { SplitHeading } from "@/components/SplitHeading";
import { PageTransition } from "@/components/PageTransition";
import { StackRail } from "@/components/StackRail";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

// Bottom-up: the page builds the stack as you scroll; Contact caps it with the brand plate.
const RAIL = [
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "plans", label: "Plans" },
  { id: "contact", label: "Contact" },
];

export default function HomePage() {
  return (
    <>
      <PageTransition>
        {/* Hero: full-width headline; the stack rises into it from the bottom right */}
        <section className="wrap hero hero--bold">
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__copy load-in">
            <p className="eyebrow" style={i(0)}>
              <Scramble text="Outsourced dev department for SMEs" />
            </p>
            <TechHeading className="display display--hero" style={i(1)}>
              A full dev team, <em>from day one.</em>
            </TechHeading>
            <p className="lede" style={i(2)}>
              Web, software, design and apps. One project, or your whole dev team.
            </p>
            <div className="hero__actions" style={i(3)}>
              <Magnetic>
                <SpecularButton href="/contact" className="btn btn--primary">
                  Start a Project
                  <ArrowUpRight size={18} weight="bold" aria-hidden />
                </SpecularButton>
              </Magnetic>
              <Magnetic>
                <SpecularButton href="#work" className="btn btn--ghost">
                  See the work
                  <ArrowDown size={16} weight="bold" aria-hidden />
                </SpecularButton>
              </Magnetic>
            </div>
            <HeroTicker style={i(4)} />
          </div>
          <StackVisual />
        </section>

        {/* Services: a bento, each tile in its service's own tool */}
        <section id="services" className="wrap section">
          <div className="section-head" data-reveal>
            <SplitHeading className="display display--h2">
              Four disciplines. One team.
            </SplitHeading>
          </div>
          <ServicesBento />
        </section>

        {/* Proof: one wide panel with a tabbed explorer */}
        <section id="work" className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-head" data-reveal>
            <SplitHeading className="display display--h2">
              See the work behind each service.
            </SplitHeading>
            <Link href="/work" className="textlink textlink--accent">
              View all work
              <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
          </div>
          <div className="explorer" data-reveal>
            <CaseStudyExplorer />
          </div>
        </section>

        {/* Plans: open rows */}
        <section id="plans" className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-head" data-reveal>
            <SplitHeading className="display display--h2">
              Scoped to how you grow.
            </SplitHeading>
            <p className="lede">Start with one project. Scale when you are ready.</p>
            <Link href="/pricing" className="textlink textlink--accent">
              Compare plans in detail
              <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
          </div>
          <PlanLadder />
        </section>

        {/* Contact: form + details */}
        <section id="contact" className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-head" data-reveal>
            <SplitHeading className="display display--h2">
              Let&apos;s <em>build something.</em>
            </SplitHeading>
            <p className="lede">Tell us what you&apos;re building. We&apos;ll reply within one business day.</p>
          </div>
          <div className="contact" data-reveal>
            <ContactForm variant="compact" />
            <ContactDetails />
          </div>
        </section>
      </PageTransition>
      {/* Outside the page transition: position: fixed must not be captured in the page snapshot. */}
      <StackRail sections={RAIL} />
    </>
  );
}
