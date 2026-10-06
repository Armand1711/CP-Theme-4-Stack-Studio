"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "@phosphor-icons/react";

/*
 * "How it runs" on the Web Development page, as a terminal session. When it scrolls into view each
 * step types out as a command, runs for a beat, then ticks off with what it delivers. Screen readers
 * get the finished list straight away; the animated session is decorative. Reduced motion shows the
 * finished session.
 */

const STEPS = [
  { cmd: "stack discover", out: "Mapped how your business actually runs" },
  { cmd: "stack design", out: "Screens you can click before we build" },
  { cmd: "stack build", out: "Shipped in small pieces you can use early" },
  { cmd: "stack launch", out: "Live, measured, and looked after" },
];

const PROMPT = "~/your-site $";
const TYPE_MS = 45;
const RUN_MS = 420;
const GAP_MS = 260;

/** step: the command being typed; chars: how much of it is typed; done: how many steps have finished. */
type Progress = { step: number; chars: number; done: number };

export function TerminalSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState<Progress>({ step: -1, chars: 0, done: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const finished = { step: STEPS.length - 1, chars: Infinity, done: STEPS.length };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setP(finished);
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));

    const run = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        for (let c = 1; c <= STEPS[i].cmd.length; c++) {
          if (cancelled) return;
          setP({ step: i, chars: c, done: i });
          await wait(TYPE_MS);
        }
        await wait(RUN_MS);
        if (cancelled) return;
        setP({ step: i, chars: Infinity, done: i + 1 });
        await wait(GAP_MS);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const allDone = p.done === STEPS.length;

  return (
    <div ref={ref} className="term" data-reveal>
      <div className="term__bar" aria-hidden="true">
        <span className="device__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="term__title mono">zsh: ~/your-site</span>
      </div>

      <ol className="visually-hidden">
        {STEPS.map((s) => (
          <li key={s.cmd}>
            {s.cmd.replace("stack ", "")}: {s.out}
          </li>
        ))}
      </ol>

      <div className="term__body mono" aria-hidden="true">
        {STEPS.map((s, i) => {
          if (i > p.step) return null;
          const typing = i === p.step && i >= p.done;
          return (
            <div key={s.cmd} className="term__step">
              <div className="term__cmd">
                <span className="term__prompt">{PROMPT}</span> {s.cmd.slice(0, p.chars === Infinity || i < p.step ? undefined : p.chars)}
                {typing && <span className="term__cursor" />}
              </div>
              {i < p.done && (
                <div className="term__out">
                  <Check size={14} weight="bold" />
                  {s.out}
                </div>
              )}
            </div>
          );
        })}
        {(allDone || p.step === -1) && (
          <div className="term__cmd">
            <span className="term__prompt">{PROMPT}</span> <span className="term__cursor" />
          </div>
        )}
      </div>
    </div>
  );
}
