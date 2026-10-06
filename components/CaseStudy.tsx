import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { CaseStudy as CaseStudyData } from "@/lib/content";
import { CaseMini } from "./Minis";

export function CaseStudy({ study, kicker, href }: { study: CaseStudyData; kicker?: string; href?: string }) {
  return (
    <div className="case">
      <div className="case__copy">
        {kicker && <p className="mono case__kicker" style={{ fontSize: 13 }}>{kicker}</p>}
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
        {href && (
          <Link href={href} className="textlink textlink--accent">
            View case study
            <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        )}
      </div>
      {/* Illustrates the GC Solar build (site chat feeding Zoho CRM). A real screenshot (1600x1000) can sit
          beside or replace it once available. */}
      <CaseMini />
    </div>
  );
}
