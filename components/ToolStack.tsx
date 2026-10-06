"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { services, serviceHref, type ServiceKey } from "@/lib/content";
import { CompareDemo } from "./demos/CompareDemo";
import { PipelineDemo } from "./demos/PipelineDemo";
import { ResponsiveDemo } from "./demos/ResponsiveDemo";
import { SheetDemo } from "./demos/SheetDemo";

/*
 * "See it in action" (home): the real demos from the four service pages, stacked like the hero's
 * plates. The section pins while you scroll through it; each quarter of the scroll brings the next
 * demo to the front (IntersectionObserver on four invisible markers, no scroll listeners). The demos
 * here are previews (inert, scaled to fit); the copy column links to each full, interactive version.
 * Hidden on small screens, where the services bento above already covers each service.
 */

const DEMOS: Record<ServiceKey, () => ReactNode> = {
  web: () => <ResponsiveDemo />,
  software: () => <PipelineDemo />,
  uiux: () => <CompareDemo />,
  mobile: () => <SheetDemo />,
};

/** Width the demos are laid out at before being scaled down to the stage. */
const DESIGN_W = 1080;

export function ToolStack() {
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    markers.current.forEach((m) => m && io.observe(m));

    // Scale the demos so their design width fits the stage.
    const stage = stageRef.current;
    const ro = new ResizeObserver(() => {
      if (stage) stage.style.setProperty("--s", String(Math.min(1, stage.clientWidth / DESIGN_W)));
    });
    if (stage) ro.observe(stage);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const goTo = (i: number) => markers.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="tstack">
      <div className="tstack__pin">
        <ol className="tstack__list">
          {services.map((s, i) => (
            <li key={s.key} data-on={i === active || undefined}>
              <button type="button" className="tstack__name" aria-current={i === active || undefined} onClick={() => goTo(i)}>
                <span className="mono">{s.number}</span>
                {s.name}
              </button>
              <div className="tstack__detail">
                <div>
                  <p>{s.demo.lede}</p>
                  <Link href={serviceHref(s)} className="textlink textlink--accent" tabIndex={i === active ? undefined : -1}>
                    Try the full demo
                    <ArrowRight size={16} weight="bold" aria-hidden />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div ref={stageRef} className="tstack__stage" aria-hidden="true">
          {services.map((s, i) => (
            <div
              key={s.key}
              className="tstack__win"
              inert
              style={{ "--pos": i - active, "--depth": Math.abs(i - active) } as CSSProperties}
              data-front={i === active || undefined}
              data-past={i < active || undefined}
            >
              <div className="tstack__scale">{DEMOS[s.key]()}</div>
            </div>
          ))}
        </div>
      </div>

      {services.map((s, i) => (
        <div
          key={s.key}
          ref={(el) => void (markers.current[i] = el)}
          className="tstack__marker"
          data-i={i}
          style={{ "--i": i } as CSSProperties}
        />
      ))}
    </div>
  );
}
