import Link from "next/link";
import type { CaseStudy as CaseStudyData } from "@/lib/content";

export function CaseStudy({
  study,
  kicker,
  href,
  tone = "home",
}: {
  study: CaseStudyData;
  kicker?: string;
  href?: string;
  tone?: "home" | "band";
}) {
  return (
    <div className="case">
      <div className="case__copy">
        <h3>{study.title}</h3>
        {kicker && <div className="case__kicker">{kicker}</div>}
        <p>{study.summary}</p>
        <div className="case__tags">
          {study.tags.map((t) => (
            <span key={t} className={tone === "home" ? "tag tag--home" : "tag"}>
              {t}
            </span>
          ))}
        </div>
        {href && (
          <Link href={href} className="case__link">
            View case study →
          </Link>
        )}
      </div>
      <div className="case__visual">
        <div className={tone === "band" ? "visual-placeholder visual-placeholder--dark" : "visual-placeholder"}>
          <span>Case study visual: placeholder</span>
        </div>
      </div>
    </div>
  );
}
