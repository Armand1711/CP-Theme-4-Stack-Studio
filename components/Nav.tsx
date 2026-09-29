"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { services, serviceHref } from "@/lib/content";
import { LogoMark } from "./Logo";

const links = [
  ...services.map((s) => ({ href: serviceHref(s), label: s.navLabel })),
  { href: "/pricing", label: "Pricing" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const items = links.map((l) => (
    <Link
      key={l.href}
      href={l.href}
      className="nav__link"
      aria-current={pathname === l.href ? "page" : undefined}
    >
      {l.label}
    </Link>
  ));

  return (
    <header className="nav">
      <div className="nav__bar px">
        <Link href="/" className="nav__brand" aria-label="Stack Studio home">
          <LogoMark />
          STACK STUDIO
        </Link>
        <nav className="nav__links" aria-label="Primary">
          {items}
          <Link href="/contact" className="btn btn--primary btn--sm shine">
            Start a Project
          </Link>
        </nav>
        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-drawer"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <nav id="nav-drawer" className="nav__drawer px" data-open={open} aria-label="Primary (mobile)">
        {items}
        <Link href="/contact" className="btn btn--primary btn--sm shine">
          Start a Project
        </Link>
      </nav>
    </header>
  );
}
