import { Check, ChatCircleDots, NavigationArrow, PaperPlaneTilt, Phone, SolarPanel } from "@phosphor-icons/react/dist/ssr";
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

/** GC Solar case study: a visitor opens the site's chat, and a new lead lands in the CRM. */
export function CaseMini() {
  return (
    <div className="mm mm--case" aria-hidden="true">
      <div className="mm-case__browser">
        <span className="mm-case__bar">
          <i />
          <i />
          <i />
        </span>
        <span className="mm-case__nav">
          <SolarPanel size={14} weight="fill" />
          <i />
          <i />
          <i />
        </span>
        <span className="mm-case__hero">
          <span>
            <i />
            <i />
            <b />
          </span>
          <span className="mm-case__sun" />
        </span>
        <span className="mm-case__chat">
          <span className="mm-case__bubble">Hi, can I get a quote?</span>
          <span className="mm-case__fab">
            <ChatCircleDots size={18} weight="fill" />
          </span>
        </span>
      </div>
      <span className="mm-case__crm">
        <span className="mm-case__crm-head">Zoho CRM</span>
        <span className="mm-case__crm-row">
          <Check size={12} weight="bold" />
          New lead from website
        </span>
      </span>
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
