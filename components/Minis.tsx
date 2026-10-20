import {
  ChartLineUp,
  Check,
  Code,
  DeviceMobile,
  Globe,
  NavigationArrow,
  PaperPlaneTilt,
  PenNib,
  Phone,
  RocketLaunch,
} from "@phosphor-icons/react/dist/ssr";
import { plans } from "@/lib/content";

/*
 * Small looping illustrations, in the same family as the home bento minis: flat UI shapes that act out
 * one idea each (a plan growing, a quote being written, a task moving across a board...). All pure CSS
 * keyframes (see "Minis" in globals.css), decorative (aria-hidden), and still under reduced motion.
 */

/** Pricing hero: the stack grows a plate per plan while the matching plan lights up. */
export function ScaleMini() {
  return (
    <div className="mm mm--scale" aria-hidden="true">
      <div className="mm-scale__stack">
        <i />
        <i />
        <i />
      </div>
      <ul className="mm-scale__plans">
        {plans.map((p) => (
          <li key={p.id}>
            <span>{p.name}</span>
            <b>{p.price}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A document that writes itself, then gets stamped. Used for quotes and proposals. */
export function QuoteMini({ title = "Quote", stamp = "Fixed" }: { title?: string; stamp?: string }) {
  return (
    <div className="mm mm--doc" aria-hidden="true">
      <div className="mm-doc">
        <span className="mm-doc__head">
          <b>{title}</b>
          <i />
        </span>
        <i className="mm-doc__line" />
        <i className="mm-doc__line" />
        <i className="mm-doc__line" />
        <span className="mm-doc__total">
          <i />
          <i />
        </span>
        <span className="mm-doc__stamp">{stamp}</span>
      </div>
    </div>
  );
}

/** A sprint board: one task travels To do, Doing, Done; the rest of the board stays put. */
export function BoardMini() {
  return (
    <div className="mm mm--board" aria-hidden="true">
      <div className="mm-board">
        {["To do", "Doing", "Done"].map((c) => (
          <span key={c} className="mm-board__col">
            <b>{c}</b>
            <i />
            <i />
          </span>
        ))}
        <span className="mm-board__card" />
      </div>
    </div>
  );
}

/** Full team: three cursors (design, frontend, backend) building the same page at once. */
export function TeamMini() {
  return (
    <div className="mm mm--team" aria-hidden="true">
      <div className="mm-team">
        <i className="mm-team__block mm-team__block--head" />
        <i className="mm-team__block mm-team__block--a" />
        <i className="mm-team__block mm-team__block--b" />
        <i className="mm-team__block mm-team__block--foot" />
        {["Design", "Frontend", "Backend"].map((who, n) => (
          <span key={who} className={`mm-team__cursor mm-team__cursor--${n + 1}`}>
            <NavigationArrow size={14} weight="fill" />
            <span>{who}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Contact hero: a message types itself out, sends, and a confirmation lands. */
export function MessageMini() {
  return (
    <div className="mm mm--msg" aria-hidden="true">
      <div className="mm-msg">
        <span className="mm-msg__to">
          To: <b>Stack Studio</b>
        </span>
        <i className="mm-msg__line" />
        <i className="mm-msg__line" />
        <i className="mm-msg__line" />
        <span className="mm-msg__send">
          <PaperPlaneTilt size={14} weight="fill" />
          Send
        </span>
      </div>
      <span className="mm-msg__toast">
        <Check size={14} weight="bold" />
        Sent. We reply within one business day.
      </span>
    </div>
  );
}

/** "We reply": typing dots, then the reply. */
export function ReplyMini() {
  return (
    <div className="mm mm--reply" aria-hidden="true">
      <span className="mm-reply__in">Here&apos;s what we&apos;re building…</span>
      <span className="mm-reply__typing">
        <i />
        <i />
        <i />
      </span>
      <span className="mm-reply__out">Thanks! When suits you for a call?</span>
    </div>
  );
}

/** "A short scoping call": a call card with a live waveform. */
export function CallMini() {
  return (
    <div className="mm mm--call" aria-hidden="true">
      <div className="mm-call">
        <span className="mm-call__who">
          <span className="mm-call__avatar">S</span>
          <span className="mm-call__avatar mm-call__avatar--you">You</span>
        </span>
        <span className="mm-call__wave">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
        <span className="mm-call__end">
          <Phone size={14} weight="fill" />
        </span>
      </div>
    </div>
  );
}

/** About hero: one project moves through design, build and launch, handled by the same team throughout. */
export function CrewMini() {
  const steps = [
    { label: "Design", detail: "Screens you can click through", Icon: PenNib },
    { label: "Build", detail: "Fast, solid code", Icon: Code },
    { label: "Launch", detail: "Live, with support after", Icon: RocketLaunch },
  ];
  return (
    <div className="mm mm--crew" aria-hidden="true">
      <div className="mm-crew">
        <span className="mm-crew__head">
          <b>Your project</b>
          <span className="mm-crew__faces">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/team/enzo-contact.jpg" alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/team/armand-contact.jpg" alt="" />
          </span>
        </span>
        <i className="mm-crew__bar">
          <b />
        </i>
        <span className="mm-crew__steps">
          {steps.map(({ label, detail, Icon }) => (
            <span key={label} className="mm-crew__step">
              <span className="mm-crew__icon">
                <Icon size={15} weight="bold" />
              </span>
              <span className="mm-crew__label">
                {label}
                <small>{detail}</small>
              </span>
              <span className="mm-crew__check">
                <Check size={11} weight="bold" />
              </span>
            </span>
          ))}
        </span>
      </div>
      <span className="mm-crew__toast">
        <RocketLaunch size={14} weight="fill" />
        Launched. Same team, start to finish.
      </span>
    </div>
  );
}

/** Work hero: a fanned deck of live projects (a site, a dashboard, an app); the front one slides away to the back. */
export function DeckMini() {
  return (
    <div className="mm mm--deck" aria-hidden="true">
      <div className="mm-deck">
        <div className="mm-deck__card">
          <span className="mm-deck__bar">
            <i />
            <i />
            <i />
            <em>mpgf.org.za</em>
          </span>
          <span className="mm-deck__body mm-deck__web">
            <span>
              <b />
              <i />
              <i />
              <u />
            </span>
            <span className="mm-deck__sun" />
          </span>
          <span className="mm-deck__tag">
            <Globe size={12} weight="bold" />
            Website
          </span>
          <span className="mm-deck__live">Live</span>
        </div>
        <div className="mm-deck__card">
          <span className="mm-deck__bar">
            <i />
            <i />
            <i />
            <em>dashboard</em>
          </span>
          <span className="mm-deck__body mm-deck__dash">
            <span className="mm-deck__side">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="mm-deck__chart">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </span>
          <span className="mm-deck__tag">
            <ChartLineUp size={12} weight="bold" />
            Software
          </span>
          <span className="mm-deck__live">Live</span>
        </div>
        <div className="mm-deck__card">
          <span className="mm-deck__bar">
            <i />
            <i />
            <i />
            <em>app</em>
          </span>
          <span className="mm-deck__body mm-deck__app">
            <span className="mm-deck__phone">
              <i />
              <i />
              <i />
              <b />
            </span>
          </span>
          <span className="mm-deck__tag">
            <DeviceMobile size={12} weight="bold" />
            App
          </span>
          <span className="mm-deck__live">Live</span>
        </div>
      </div>
    </div>
  );
}
