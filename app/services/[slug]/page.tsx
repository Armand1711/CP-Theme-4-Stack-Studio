import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getServiceBySlug, services } from "@/lib/content";
import { CaseStudy } from "@/components/CaseStudy";
import { FlipGrid } from "@/components/FlipGrid";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SpecularButton } from "@/components/SpecularButton";
import { StackVisual } from "@/components/StackVisual";
import { TechHeading } from "@/components/TechHeading";
import { CompareDemo } from "@/components/demos/CompareDemo";
import { PipelineDemo } from "@/components/demos/PipelineDemo";
import { ResponsiveDemo } from "@/components/demos/ResponsiveDemo";
import { SheetDemo } from "@/components/demos/SheetDemo";
import type { ServiceKey } from "@/lib/content";

const DEMOS: Record<ServiceKey, () => React.ReactNode> = {
  web: () => <ResponsiveDemo />,
  software: () => <PipelineDemo />,
  uiux: () => <CompareDemo />,
  mobile: () => <SheetDemo />,
};

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getServiceBySlug((await params).slug);
  return service ? { title: service.name, description: service.lede } : {};
}

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export default async function ServicePage({ params }: Props) {
  const service = getServiceBySlug((await params).slug);
  if (!service) notFound();

  return (
    <>
      <section className="wrap hero hero--inner" data-service={service.key}>
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__copy load-in">
          <Link href="/#services" className="textlink" style={{ ...i(0), color: "var(--text-2)", fontSize: 14 }}>
            <ArrowLeft size={14} weight="bold" aria-hidden />
            All services
          </Link>
          <TechHeading className="display display--h1" style={i(1)}>
            {service.titleLead} <em>{service.titleEm}</em>
          </TechHeading>
          <p className="lede" style={i(2)}>
            {service.lede}
          </p>
          <div className="hero__actions" style={i(3)}>
            <SpecularButton href="/contact" autoAnimate className="btn btn--primary">
              Start a Project
              <ArrowUpRight size={18} weight="bold" aria-hidden />
            </SpecularButton>
          </div>
        </div>
        <StackVisual active={service.key} />
      </section>

      <section className="wrap section signature" data-service={service.key} style={{ paddingTop: 0 }}>
        <div className="section-head" data-reveal>
          <h2 className="display display--h2">
            {service.demo.lead} <em>{service.demo.em}</em>
          </h2>
          <p className="lede">{service.demo.lede}</p>
        </div>
        <div className="signature__stage" data-reveal>
          {DEMOS[service.key]()}
        </div>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="section-head" data-reveal>
          <h2 className="display display--h2">What&apos;s included</h2>
        </div>
        <FlipGrid items={service.included} />
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="section-head" data-reveal>
          <h2 className="display display--h2">How it runs</h2>
        </div>
        <ProcessSteps />
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="proof surface" data-reveal>
          {service.caseStudy ? (
            <CaseStudy study={service.caseStudy} kicker="Proof point" />
          ) : (
            <div className="proof__placeholder">
              <p className="mono case__kicker" style={{ fontSize: 13 }}>
                Proof point
              </p>
              <p className="body-2">[Case study placeholder. Add a {service.name} proof point]</p>
            </div>
          )}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: "clamp(40px, 6vw, 80px)" }}>
        <div className="cta-band" data-reveal>
          <h2 className="display display--h2" style={{ fontSize: "clamp(26px, 2.6vw, 36px)" }}>
            Where this fits in a plan
          </h2>
          <Link href="/pricing" className="textlink textlink--accent">
            See how {service.name} fits into a plan
            <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
