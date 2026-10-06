import { contactDetails } from "@/lib/content";

export function ContactDetails() {
  return (
    <aside className="contact__aside">
      <div>
        <div className="meta__label">Prefer email?</div>
        <div className="meta__value">{contactDetails.email}</div>
      </div>
      <div>
        <div className="meta__label">Based in</div>
        <div className="meta__value">{contactDetails.location}</div>
      </div>
      <div className="socials">
        {/* TODO: turn into links once profile URLs exist. */}
        {contactDetails.socials.map((s) => (
          <span key={s} className="tag">
            {s}
          </span>
        ))}
      </div>
    </aside>
  );
}
