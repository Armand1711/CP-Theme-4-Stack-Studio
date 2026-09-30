"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { services, serviceHref } from "@/lib/content";
import { CircleCta } from "./CircleCta";
import { LogoFull } from "./Logo";
import { SplitHeading } from "@/components/SplitHeading";

export function Footer() {
  const pathname = usePathname();
  // Home and contact already end in the contact form.
  const showCta = pathname !== "/contact" && pathname !== "/";

  return (
    <footer className="footer">
      <div className="wrap">
        {showCta && (
          <div className="footer__cta">
            <SplitHeading className="display footer__cta-title">
              Have something <em>to build?</em>
            </SplitHeading>
            <CircleCta />
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
