import type { Metadata } from "next";
import type { ComponentProps, CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getServiceBySlug, services } from "@/lib/content";
import { ProgressSteps } from "@/components/ProgressSteps";
import { IncludedGrid } from "@/components/IncludedGrid";
import { InstallSteps } from "@/components/InstallSteps";
import { SpecularButton } from "@/components/SpecularButton";
import { StickyBoard } from "@/components/StickyBoard";
import { StackVisual } from "@/components/StackVisual";
import { TechHeading } from "@/components/TechHeading";
import { CompareDemo } from "@/components/demos/CompareDemo";
import { SavingsDemo } from "@/components/demos/SavingsDemo";
import { ResponsiveDemo } from "@/components/demos/ResponsiveDemo";
import { SheetDemo } from "@/components/demos/SheetDemo";
import type { ServiceKey } from "@/lib/content";
import { SplitHeading } from "@/components/SplitHeading";
import { PageTransition } from "@/components/PageTransition";

const DEMOS: Record<ServiceKey, () => React.ReactNode> = {
  web: () => <ResponsiveDemo />,
  software: () => <SavingsDemo />,
  uiux: () => <CompareDemo />,
  mobile: () => <SheetDemo />,
};

/*
 * Each service page is dressed in its own tools, kept readable for non-technical visitors: Web as a
 * device preview, Software as a workflow, UI/UX as a design tool, Apps as an app platform. `included` picks the "What's included"
 * style and `process` the "How it runs" component.
 */
const THEMES: Record<
  ServiceKey,
  { included: Pick<ComponentProps<typeof IncludedGrid>, "variant">; process: () => React.ReactNode }
> = {
  web: { included: { variant: "tabs" }, process: () => <ProgressSteps /> },
  software: { included: { variant: "tabs" }, process: () => <ProgressSteps /> },
  uiux: { included: { variant: "frames" }, process: () => <StickyBoard /> },
  mobile: { included: { variant: "notifications" }, process: () => <InstallSteps /> },
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
  const theme = THEMES[service.key];

  return (
    <PageTransition>
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
            <SpecularButton href="/contact" className="btn btn--primary">
              Start a Project
              <ArrowUpRight size={18} weight="bold" aria-hidden />
            </SpecularButton>
          </div>
        </div>
        <StackVisual active={service.key} />
      </section>

      <section className="wrap section signature" data-service={service.key} style={{ paddingTop: 0 }}>
        <div className="section-head" data-reveal>
          <SplitHeading className="display display--h2">
            {service.demo.lead} <em>{service.demo.em}</em>
          </SplitHeading>
          <p className="lede">{service.demo.lede}</p>
        </div>
        <div className="signature__stage" data-reveal>
          {DEMOS[service.key]()}
        </div>
      </section>

      <section className="wrap section code-grid" style={{ paddingTop: 0 }}>
        <div className="section-head" data-reveal>
          <SplitHeading className="display display--h2">What&apos;s included</SplitHeading>
        </div>
        <IncludedGrid items={service.included} {...theme.included} />
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="section-head" data-reveal>
          <SplitHeading className="display display--h2">How it runs</SplitHeading>
        </div>
        {theme.process()}
      </section>

    </PageTransition>
  );
}
