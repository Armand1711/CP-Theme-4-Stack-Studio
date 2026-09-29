import Link from "next/link";
import { services, serviceHref } from "@/lib/content";
import { CaseStudyExplorer } from "@/components/CaseStudyExplorer";
import { ChevronStack } from "@/components/ChevronStack";
import { ContactDetails } from "@/components/ContactDetails";
import { ContactForm } from "@/components/ContactForm";
import { Eyebrow } from "@/components/Eyebrow";
import { PlanLadder } from "@/components/PlanLadder";
import { TechHeading } from "@/components/TechHeading";
import { SpecularButton } from "@/components/SpecularButton";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="home-hero px">
        <div className="home-hero__copy">
          <div className="eyebrow eyebrow--accent">Outsourced dev department for SMEs</div>
          <TechHeading className="display display--xl">
            Your dev team,
            <br />
            <em>without the hiring.</em>
          </TechHeading>
          <p className="lede">
            Web, software, UI/UX design, and mobile apps, scoped as a single project or run as your standing dev team.
          </p>
          <div className="home-hero__actions">
            <SpecularButton href="/contact" autoAnimate className="btn btn--primary">
              Start a Project
            </SpecularButton>
            <span className="home-hero__note">Fixed-scope projects up to full-team retainers</span>
          </div>
        </div>
        <div className="home-hero__art">
          <ChevronStack />
        </div>
      </section>

      <div className="rule" />

      {/* 2. Case-study explorer */}
      <section className="explorer px">
        <ChevronStack mono className="explorer__bgart" width={640} height={640} />
        <div className="explorer__inner">
          <div className="explorer__head">
            <div>
              <Eyebrow num="02" label="Proof, not promises" />
              <h2 className="display display--section">
                See the work
                <br />
                behind <em>each service.</em>
              </h2>
            </div>
            <p className="explorer__hint">Pick a service below to see a real proof point from the field.</p>
          </div>
          <CaseStudyExplorer />
        </div>
      </section>

      <div className="rule" />

      {/* 3. Service pillars */}
      <section id="services" className="section px">
        <Eyebrow num="03" label="What we do" />
        <h2 className="display display--sm" style={{ marginBottom: 48 }}>
          Four disciplines. <em>One team.</em>
        </h2>
        <div className="pillars">
          {services.map((s) => (
            <div key={s.key} className="pillar">
              <div className="pillar__num">{s.number}</div>
              <h3 className="pillar__name">{s.name}</h3>
              <div className="pillar__body">
                <p>{s.summary}</p>
                <Link href={serviceHref(s)} className="textlink" style={{ flexShrink: 0 }}>
                  Learn more<span className="visually-hidden"> about {s.name}</span> →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rule" />

      {/* 4. Plans */}
      <section id="plans" className="section section--tail px">
        <Eyebrow num="04" label="Plans" />
        <h2 className="display display--sm" style={{ marginBottom: 12 }}>
          Scoped to how you <em>grow.</em>
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 520, marginBottom: 20 }}>
          Every plan starts with a scoped project. Pricing scales as the relationship does.
        </p>
        <Link href="/pricing" className="textlink" style={{ display: "inline-block", marginBottom: 56 }}>
          Compare all plans in detail →
        </Link>
        <PlanLadder />
      </section>

      <div className="rule" />

      {/* 5. Contact */}
      <section id="contact" className="contact contact--home px">
        <ContactForm
          variant="compact"
          header={
            <>
              <Eyebrow num="05" label="Start a project" />
              <h2 className="display display--sm">
                Let&apos;s <em>build something.</em>
              </h2>
              <p>Tell us what you&apos;re building. We&apos;ll reply within one business day.</p>
            </>
          }
        />
        <ContactDetails />
      </section>
    </>
  );
}
