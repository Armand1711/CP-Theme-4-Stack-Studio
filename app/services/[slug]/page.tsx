import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug, services } from "@/lib/content";
import { CaseStudy } from "@/components/CaseStudy";
import { Eyebrow } from "@/components/Eyebrow";
import { FlipGrid } from "@/components/FlipGrid";
import { ProcessSteps } from "@/components/ProcessSteps";
import { TechHeading } from "@/components/TechHeading";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getServiceBySlug((await params).slug);
  return service ? { title: service.name, description: service.lede } : {};
}

export default async function ServicePage({ params }: Props) {
  const service = getServiceBySlug((await params).slug);
  if (!service) notFound();

  return (
    <>
      <section className="page-hero px">
        <Eyebrow num={service.number} label="Service" />
        <TechHeading className="display display--lg">
          {service.titleLead} <em>{service.titleEm}</em>
        </TechHeading>
        <p className="lede">{service.lede}</p>
        <Link href="/contact" className="btn btn--primary shine">
          Start a Project
        </Link>
      </section>

      <section className="block px">
        <h2 className="h-plain">What&apos;s included</h2>
        <FlipGrid items={service.included} />
      </section>

      <section className="block px">
        <h2 className="h-plain">How it runs</h2>
        <ProcessSteps />
      </section>

      <section className="proof px">
        <Eyebrow label="Proof point" />
        {service.caseStudy ? (
          <CaseStudy study={service.caseStudy} tone="band" />
        ) : (
          <div className="placeholder-box">
            <p>[Case study placeholder. Add a {service.name} proof point]</p>
          </div>
        )}
      </section>

      <section className="cta-row px">
        <div>
          <h2 className="h-plain">Where this fits in a plan</h2>
          <Link href="/pricing" className="textlink textlink--md">
            See how {service.name} fits into a plan →
          </Link>
        </div>
        <Link href="/contact" className="btn btn--primary shine">
          Start a Project
        </Link>
      </section>
    </>
  );
}
