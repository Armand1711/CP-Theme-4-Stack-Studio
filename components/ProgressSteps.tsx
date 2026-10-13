"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, CircleDashed, CircleNotch, ListChecks } from "@phosphor-icons/react";

/*
 * "How it runs" on the Web and Software Development pages, as a project progress tracker. When it
 * scrolls into view the four stages go from up next to in progress to done, in order, and the bar along
 * the top of each stage fills as it completes. Reduced motion shows the finished project.
 */

const JOBS = [
  { name: "Discover", line: "We learn how your business actually runs." },
  { name: "Design", line: "Screens you can click before we build." },
  { name: "Build", line: "Shipped in small pieces you can use early." },
  { name: "Launch", line: "Live, measured, and looked after." },
];

const RUN_MS = 900;
const GAP_MS = 180;

type Status = "queued" | "running" | "passed";
const STATUS_TEXT: Record<Status, string> = { queued: "Up next", running: "In progress", passed: "Done" };

export function ProgressSteps() {
  const ref = useRef<HTMLDivElement>(null);
  /** How many jobs have passed, and whether the next one is running. */
  const [passed, setPassed] = useState(0);
  const [runningJob, setRunningJob] = useState(-1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPassed(JOBS.length);
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));
    const run = async () => {
      for (let i = 0; i < JOBS.length; i++) {
        if (cancelled) return;
        setRunningJob(i);
        await wait(RUN_MS);
        if (cancelled) return;
        setPassed(i + 1);
        setRunningJob(-1);
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

  const status = (i: number): Status => (i < passed ? "passed" : i === runningJob ? "running" : "queued");
  const overall: Status = passed === JOBS.length ? "passed" : runningJob >= 0 || passed > 0 ? "running" : "queued";

  return (
    <div ref={ref} className="ci" data-reveal>
      <div className="ci__bar">
        <span className="ci__file">
          <ListChecks size={15} weight="bold" aria-hidden />
          Your project
        </span>
        <span className="ci__overall" data-status={overall} aria-hidden="true">
          {overall === "passed" ? "Live" : STATUS_TEXT[overall]}
        </span>
      </div>
      <ol className="ci__jobs">
        {JOBS.map((j, i) => {
          const s = status(i);
          return (
            <li key={j.name} className="ci__job" data-status={s}>
              <span className="ci__icon" aria-hidden="true">
                {s === "passed" ? (
                  <CheckCircle size={22} weight="fill" />
                ) : s === "running" ? (
                  <CircleNotch size={22} weight="bold" className="ci__spin" />
                ) : (
                  <CircleDashed size={22} weight="bold" />
                )}
              </span>
              <span className="ci__name">{j.name}</span>
              <span className="ci__line">{j.line}</span>
              <span className="ci__state" aria-hidden="true">
                {STATUS_TEXT[s]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
