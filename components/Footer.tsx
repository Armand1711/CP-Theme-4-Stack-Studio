"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { services, serviceHref } from "@/lib/content";
import { LogoFull } from "./Logo";
import { SpecularButton } from "./SpecularButton";

export function Footer() {
  const pathname = usePathname();
  // Home and contact already end in the contact form.
  const showCta = pathname !== "/contact" && pathname !== "/";

  return (
    <footer className="footer">
      <div className="wrap">
        {showCta && (
          <div className="footer__cta surface" data-reveal>
            <h2 className="display display--h2">
              Have something <em>to build?</em>
            </h2>
            <SpecularButton href="/contact" autoAnimate className="btn btn--primary">
              Start a Project
              <ArrowUpRight size={18} weight="bold" aria-hidden />
            </SpecularButton>
          </div>
        )}
        <div className="footer__brand">
          <Link href="/" aria-label="Stack Studio home">
            <LogoFull width={200} />
          </Link>
        </div>
        <div className="footer__row">
          <div>© {new Date().getFullYear()} Stack Studio. Centurion, South Africa.</div>
          <nav className="footer__links" aria-label="Footer">
            {services.map((s) => (
              <Link key={s.key} href={serviceHref(s)}>
                {s.navLabel}
              </Link>
            ))}
            <Link href="/pricing">Pricing</Link>
            {/* TODO: point at real policy pages before launch. */}
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
