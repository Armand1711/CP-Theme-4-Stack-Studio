"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Code, MagnifyingGlass, PaperPlaneTilt, PenNib } from "@phosphor-icons/react";
import { LogoMark } from "./Logo";

/*
 * "How it comes together": a pinned stack that builds one plate per step as its line scrolls past
 * the middle of the viewport (IntersectionObserver, no scroll listeners). The active step is lit in
 * accent; finished steps stay in the stack. On small screens the visual unpins and sits on top.
 */

const STEPS = [
  { name: "Discover", line: "We learn how your business actually runs.", Icon: MagnifyingGlass },
  { name: "Design", line: "Screens you can click before we build.", Icon: PenNib },
  { name: "Build", line: "Shipped in small pieces you can use early.", Icon: Code },
  { name: "Launch", line: "Live, measured, and looked after.", Icon: PaperPlaneTilt },
];

export function BuildStory() {
  const [step, setStep] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="story" data-step={step}>
      <div className="story__pin" aria-hidden="true">
        <div className="story__stage">
          <div className="story__scene">
            {STEPS.map((s, i) => (
              <div
                key={s.name}
                className="story__plate"
                data-on={i <= step || undefined}
                data-active={i === step || undefined}
                style={{ "--z": i } as CSSProperties}
              >
                <span className="story__label mono">
                  <b>{s.name}</b>
                </span>
              </div>
            ))}
            <div className="story__plate story__plate--cap" data-on={step === STEPS.length - 1 || undefined} style={{ "--z": STEPS.length } as CSSProperties}>
              <LogoMark />
            </div>
          </div>
        </div>
      </div>

      <ol className="story__steps">
        {STEPS.map(({ name, line, Icon }, i) => (
          <li
            key={name}
            ref={(el) => void (refs.current[i] = el)}
            data-i={i}
            className="story__step"
            data-active={i === step || undefined}
          >
            <span className="story__icon">
              <Icon size={24} weight="bold" aria-hidden />
            </span>
            <h3 className="story__name">{name}</h3>
            <p className="story__line">{line}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
