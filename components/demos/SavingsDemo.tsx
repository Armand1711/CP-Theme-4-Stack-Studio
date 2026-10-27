"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowCounterClockwise, Check, HourglassMedium, Lightning, Play } from "@phosphor-icons/react";
import { SpecularButton } from "../SpecularButton";

/*
 * Software Development signature: one new enquiry handled two ways, side by side. "By hand" works through
 * the admin slowly while its clock climbs to 40 minutes; "With custom software" ticks the same tasks off
 * in a moment and leaves only a quick check. It plays by itself when scrolled into view (Play again to
 * repeat). Underneath, a slider turns enquiries per week into time saved per month.
 * Written for business owners: plain tasks and minutes, no workflow or data jargon. Example timings.
 */

const TASKS = [
  { text: "Copy the enquiry into a spreadsheet", hand: 5, auto: "Instant" },
  { text: "Add them to your contacts", hand: 5, auto: "Instant" },
  { text: "Write and send a quote", hand: 25, auto: "Drafted for you" },
  { text: "Tell the team to follow up", hand: 5, auto: "Instant" },
];
const HAND_MINUTES = TASKS.reduce((sum, t) => sum + t.hand, 0); // 40
/** Your time per enquiry with the software: a quick look over the drafted quote. */
const AUTO_MINUTES = 2;
const SAVED_PER_ENQUIRY = HAND_MINUTES - AUTO_MINUTES;

/** Real-time length of each lane's animation. */
const HAND_MS = 7200;
const AUTO_STEP_MS = 320;
const AUTO_MS = AUTO_STEP_MS * TASKS.length;

type State = "todo" | "doing" | "done";

/** Where each "by hand" task stands at a given point (0..1) through the 40 minutes. */
function handStates(progress: number): State[] {
  let start = 0;
  return TASKS.map((t) => {
    const end = start + t.hand / HAND_MINUTES;
    const state: State = progress >= end ? "done" : progress >= start ? "doing" : "todo";
    start = end;
    return state;
  });
}

const WEEKS_PER_MONTH = 52 / 12;

export function SavingsDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const startedAt = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const [played, setPlayed] = useState(false);
  const [perWeek, setPerWeek] = useState(20);

  const running = played && elapsed < HAND_MS;

  const play = () => {
    cancelAnimationFrame(raf.current);
    setPlayed(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setElapsed(HAND_MS);
      return;
    }
    startedAt.current = performance.now();
    setElapsed(0);
    const tick = (now: number) => {
      const t = Math.min(HAND_MS, now - startedAt.current);
      setElapsed(t);
      if (t < HAND_MS) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  // Play once by itself the first time it comes into view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        play();
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current);
    };
    // play only reads refs and setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handProgress = played ? elapsed / HAND_MS : 0;
  const hand = handStates(handProgress);
  const autoDone = played ? Math.floor(elapsed / AUTO_STEP_MS) : 0;
  const auto: State[] = TASKS.map((_, i) => (i < autoDone ? "done" : i === autoDone && played ? "doing" : "todo"));
  const autoFinished = played && elapsed >= AUTO_MS;
  const handFinished = played && elapsed >= HAND_MS;

  const handClock = Math.round(handProgress * HAND_MINUTES);
  const autoClock = autoFinished ? AUTO_MINUTES : Math.round((Math.min(elapsed, AUTO_MS) / AUTO_MS) * AUTO_MINUTES);

  const handHours = (perWeek * HAND_MINUTES * WEEKS_PER_MONTH) / 60;
  const autoHours = (perWeek * AUTO_MINUTES * WEEKS_PER_MONTH) / 60;
  const savedHours = Math.round((perWeek * SAVED_PER_ENQUIRY * WEEKS_PER_MONTH) / 60);
  const savedDays = Math.round((savedHours / 8) * 2) / 2;

  return (
    <div ref={rootRef} className="saves">
      <div className="saves__race">
        <section className="saves__lane" data-lane="hand" data-finished={handFinished || undefined} aria-label="By hand">
          <header className="saves__head">
            <span className="saves__label">
              <HourglassMedium size={18} weight="bold" aria-hidden />
              By hand
            </span>
            <span className="saves__clock">
              <b>{handClock}</b> min
            </span>
          </header>
          <ol className="saves__tasks">
            {TASKS.map((t, i) => (
              <li key={t.text} data-state={hand[i]}>
                <span className="saves__tick" aria-hidden>
                  {hand[i] === "done" && <Check size={12} weight="bold" />}
                </span>
                <span className="saves__task">{t.text}</span>
                <span className="saves__time">{t.hand} min</span>
              </li>
            ))}
          </ol>
          <p className="saves__total">
            <b>{HAND_MINUTES} minutes</b> of your time, every enquiry
          </p>
        </section>

        <section className="saves__lane" data-lane="auto" data-finished={autoFinished || undefined} aria-label="With custom software">
          <header className="saves__head">
            <span className="saves__label">
              <Lightning size={18} weight="fill" aria-hidden />
              With custom software
            </span>
            <span className="saves__clock">
              <b>{autoClock}</b> min
            </span>
          </header>
          <ol className="saves__tasks">
            {TASKS.map((t, i) => (
              <li key={t.text} data-state={auto[i]}>
                <span className="saves__tick" aria-hidden>
                  {auto[i] === "done" && <Check size={12} weight="bold" />}
                </span>
                <span className="saves__task">{t.text}</span>
                <span className="saves__time">{t.auto}</span>
              </li>
            ))}
          </ol>
          <p className="saves__total">
            <b>{AUTO_MINUTES} minutes</b> to check the quote. The rest happens automatically.
          </p>
        </section>
      </div>

      <div className="saves__controls">
        <SpecularButton type="button" className="btn btn--ghost btn--sm" onClick={play} disabled={running}>
          {played ? <ArrowCounterClockwise size={16} weight="bold" aria-hidden /> : <Play size={16} weight="fill" aria-hidden />}
          {played ? "Play again" : "Play"}
        </SpecularButton>
        <span className="saves__note">One new enquiry, start to finish. Example timings.</span>
      </div>

      <div className="saves__calc">
        <div className="saves__ask">
          <label htmlFor="saves-week">How many enquiries do you get a week?</label>
          <output htmlFor="saves-week" className="saves__count">
            {perWeek}
          </output>
        </div>
        <input
          id="saves-week"
          className="saves__range"
          type="range"
          min={5}
          max={100}
          step={5}
          value={perWeek}
          onChange={(e) => setPerWeek(Number(e.target.value))}
          style={{ "--fill": `${((perWeek - 5) / 95) * 100}%` } as CSSProperties}
        />
        <p className="saves__result" aria-live="polite">
          <span className="saves__big">
            <b>{savedHours}</b> hours
          </span>
          <span>
            back every month, about <b>{savedDays} working days</b>. That&apos;s {Math.round(handHours)} hours of admin by
            hand, down to {Math.max(1, Math.round(autoHours))} with software.
          </span>
        </p>
      </div>
    </div>
  );
}
