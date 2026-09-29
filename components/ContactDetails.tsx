import { contactDetails } from "@/lib/content";

const nextSteps = ["We reply within one business day", "A short scoping call", "A proposal, scoped and quoted"];

export function ContactDetails({ showNextSteps = false }: { showNextSteps?: boolean }) {
  return (
    <div className="contact__aside">
      <div>
        <div className="meta__label">Prefer email?</div>
        <div className="meta__value">{contactDetails.email}</div>
      </div>
      <div>
        <div className="meta__label">Based in</div>
        <div className="meta__value">{contactDetails.location}</div>
      </div>
      {showNextSteps && (
        <div>
          <div className="meta__label">What happens next</div>
          <ol className="steps">
            {nextSteps.map((step, i) => (
              <li key={step}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="socials">
        {/* TODO: turn into links once profile URLs exist. */}
        {contactDetails.socials.map((s) => (
          <span key={s} className="tag tag--muted">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
