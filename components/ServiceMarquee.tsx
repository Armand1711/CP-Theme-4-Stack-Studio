import Link from "next/link";
import { services, serviceHref } from "@/lib/content";
import { LogoMark } from "./Logo";

/*
 * The one marquee on the home page: the four services in display type, alternating solid and outline.
 * Two layers of motion, both CSS: the track loops endlessly, and the whole band shifts with scroll
 * position (scroll-driven animation, progressive enhancement). Each word links to its service; hover
 * fills it with the accent and pauses the loop. Static under reduced motion.
 */
export function ServiceMarquee() {
  const set = (hidden: boolean) =>
    services.map((s) => (
      <span key={`${s.key}-${hidden}`} className="marquee__item">
        <Link
          href={serviceHref(s)}
          className="marquee__word"
          tabIndex={hidden ? -1 : undefined}
          aria-hidden={hidden || undefined}
        >
          {s.name}
        </Link>
        <LogoMark className="marquee__sep" />
      </span>
    ));

  return (
    <section className="marquee" aria-label="Services">
      <div className="marquee__scroll">
        <div className="marquee__track">
          {set(false)}
          {set(true)}
        </div>
      </div>
    </section>
  );
}
