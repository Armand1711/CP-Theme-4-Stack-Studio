import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { CaseStudy as CaseStudyData } from "@/lib/content";

export function CaseStudy({ study, kicker, href }: { study: CaseStudyData; kicker?: string; href?: string }) {
  return (
    <div className="case">
      <div className="case__copy">
        {kicker && <p className="mono case__kicker" style={{ fontSize: 14 }}>{kicker}</p>}
        <h3>{study.title}</h3>
        <p className="body-2" style={{ maxWidth: "46ch" }}>
          {study.summary}
        </p>
        <div className="case__tags">
          {study.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
        {(study.url || href) && (
          <div className="case__links">
            {study.url && (
              <a href={study.url} className="textlink textlink--accent" target="_blank" rel="noopener noreferrer">
                Visit live site
                <ArrowUpRight size={16} weight="bold" aria-hidden />
              </a>
            )}
            {href && (
              <Link href={href} className="textlink">
                View service
                <ArrowRight size={16} weight="bold" aria-hidden />
              </Link>
            )}
          </div>
        )}
      </div>
      {study.url ? (
        <a href={study.url} className="case__shot" target="_blank" rel="noopener noreferrer" tabIndex={-1}>
          <Image src={study.image.src} alt={study.image.alt} width={1600} height={1000} sizes="(max-width: 900px) 100vw, 640px" />
        </a>
      ) : (
        <div className="case__shot">
          <Image src={study.image.src} alt={study.image.alt} width={1600} height={1000} sizes="(max-width: 900px) 100vw, 640px" />
        </div>
      )}
    </div>
  );
}
