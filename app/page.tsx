import Link from "next/link";
import { createElement, type CSSProperties } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Browser, Code, DeviceMobile, PenNib,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { services, serviceHref, type ServiceKey } from "@/lib/content";
import { Scramble } from "@/components/Scramble";
import { ServiceMarquee } from "@/components/ServiceMarquee";
import { CaseStudyExplorer } from "@/components/CaseStudyExplorer";
import { ContactDetails } from "@/components/ContactDetails";
import { ContactForm } from "@/components/ContactForm";
import { PlanLadder } from "@/components/PlanLadder";
import { SpecularButton } from "@/components/SpecularButton";
import { Spotlight } from "@/components/Spotlight";
import { StackVisual } from "@/components/StackVisual";
import { Magnetic } from "@/components/Magnetic";
import { TechHeading } from "@/components/TechHeading";
import { SplitHeading } from "@/components/SplitHeading";

const i = (n: number) => ({ "--i": n }) as CSSProperties;
const d = (n: number) => ({ "--d": n }) as CSSProperties;

const BENTO_ART = ["glow", "dots", "grid", "warm"];
const BENTO_ICON: Record<ServiceKey, Icon> = { web: Browser, software: Code, uiux: PenNib, mobile: DeviceMobile };

export default function HomePage() {
  return (
    <>
      {/* Hero: asymmetric split, copy left, the stack right */}
      <section className="wrap hero">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__copy load-in">
          <p className="eyebrow" style={i(0)}>
            <Scramble text="Outsourced dev department for SMEs" />
          </p>
          <TechHeading className="display display--hero" style={i(1)}>
            Your dev team, <em>without the hiring.</em>
          </TechHeading>
          <p className="lede" style={i(2)}>
            Web, software, design and apps. One project, or your whole dev team.
          </p>
          <div className="hero__actions" style={i(3)}>
            <Magnetic>
              <SpecularButton href="/contact" autoAnimate className="btn btn--primary">
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
        </div>
        <StackVisual />
      </section>

      <ServiceMarquee />

      {/* Services: asymmetric bento, one cell per discipline */}
      <section id="services" className="wrap section">
        <div className="section-head" data-reveal>
          <SplitHeading className="display display--h2">
            Four disciplines. <em>One team.</em>
          </SplitHeading>
        </div>
        <Spotlight className="bento" tilt>
          {services.map((s, n) => (
            <Link
              key={s.key}
              href={serviceHref(s)}
              className="bento__cell surface spot"
              data-reveal
              style={d(n)}
            >
              <span className={`bento__art bento__art--${BENTO_ART[n]}`} aria-hidden="true" />
              {n === 0 && (
                <span className="bento__big" aria-hidden="true">
                  {s.number}
                </span>
              )}
              <div>
                <span className="bento__icon" aria-hidden="true">
                  {createElement(BENTO_ICON[s.key], { size: n === 0 ? 56 : 40, weight: "duotone" })}
                </span>
                <h3>{s.name}</h3>
              </div>
              <div className="bento__foot">
                <div className="bento__tags">
                  {s.included.slice(0, n === 1 ? 4 : 2).map((it) => (
                    <span key={it.id} className="tag">
                      {it.title}
                    </span>
                  ))}
                </div>
                <span className="textlink" aria-hidden="true">
                  Learn more
                  <ArrowRight size={16} weight="bold" />
                </span>
              </div>
            </Link>
          ))}
        </Spotlight>
      </section>

      {/* Proof: one wide panel with a tabbed explorer */}
      <section id="work" className="wrap section" style={{ paddingTop: 0 }}>
        <div className="section-head" data-reveal>
          <SplitHeading className="display display--h2">
            See the work behind <em>each service.</em>
          </SplitHeading>
          <p className="lede">Pick a service. See the proof.</p>
        </div>
        <div className="explorer surface" data-reveal>
          <CaseStudyExplorer />
        </div>
      </section>

      {/* Plans: stacked ladder */}
      <section id="plans" className="wrap section" style={{ paddingTop: 0 }}>
        <div className="section-head" data-reveal>
          <SplitHeading className="display display--h2">
            Scoped to how you <em>grow.</em>
          </SplitHeading>
          <p className="lede">Every plan starts with a scoped project. Pricing scales as the relationship does.</p>
          <Link href="/pricing" className="textlink textlink--accent">
            Compare plans in detail
            <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>
        <Spotlight>
          <PlanLadder />
        </Spotlight>
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
    </>
  );
}
