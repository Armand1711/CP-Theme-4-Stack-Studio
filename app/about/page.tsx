import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { PageTransition } from "@/components/PageTransition";
import ProfileCard from "@/components/ProfileCard";
import { SplitHeading } from "@/components/SplitHeading";
import { TeamQr } from "@/components/TeamQr";
import { TechHeading } from "@/components/TechHeading";
import { CrewMini } from "@/components/Minis";
import { about, team } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Stack Studio is a small product studio in Centurion building websites, software and apps.",
};

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export default function AboutPage() {
  return (
    <PageTransition>
      <section className="wrap hero hero--inner">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__copy load-in">
          <TechHeading className="display display--h1" style={i(0)}>
            A small studio with <em>senior hands.</em>
          </TechHeading>
          <p className="lede" style={i(1)}>
            {about.lede}
          </p>
        </div>
        <div className="hero__mini autoplay load-in">
          <div style={i(2)}>
            <CrewMini />
          </div>
        </div>
      </section>

      <section className="wrap section about">
        <div className="about__story" data-reveal>
          <span className="eyebrow">Who we are</span>
          {about.story.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <ul className="about__values">
          {about.values.map((v, n) => (
            <li key={v.title} className="surface about__value" data-reveal style={i(n)}>
              <span className="mono about__value-num">0{n + 1}</span>
              <h3>{v.title}</h3>
              <p className="body-2">{v.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap section" id="team">
        <div className="section-head section-head--center" data-reveal>
          <span className="eyebrow">The team</span>
          <SplitHeading className="display display--h2">
            Meet the <em>team</em>
          </SplitHeading>
          <p className="lede">The people you&apos;ll actually talk to, from the first call to launch day.</p>
        </div>

        <div className="team">
          {team.map((m) => (
            <article key={m.slug} className="member surface" data-reveal>
              <ProfileCard
                className="member__card"
                name={m.name}
                title={m.role}
                handle={m.handle}
                status="Available for projects"
                statusColor="#f36c21"
                contactText="Email"
                contactHref={`mailto:${m.email}`}
                avatarUrl={m.photo}
                iconUrl="/brand/stack-studio-pattern.svg"
                backdropColor="#1b1a19"
                holo={0.7}
                glare={0.45}
              />
              <div className="member__body">
                <p className="member__bio">{m.bio}</p>
                <div className="member__qr">
                  <TeamQr slug={m.slug} name={m.firstName} size={128} />
                  <div className="member__qr-copy">
                    <div className="meta__label">Digital business card</div>
                    <p className="body-2">Scan to save {m.firstName}&apos;s details straight to your phone.</p>
                    <a href={`mailto:${m.email}`} className="textlink textlink--accent">
                      <EnvelopeSimple size={16} weight="bold" aria-hidden />
                      {m.email}
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
