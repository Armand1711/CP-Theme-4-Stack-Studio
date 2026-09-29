"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { services, serviceHref } from "@/lib/content";
import { LogoMark } from "./Logo";
import { SpecularButton } from "@/components/SpecularButton";

const links = [
  ...services.map((s) => ({ href: serviceHref(s), label: s.navLabel })),
  { href: "/pricing", label: "Pricing" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hoverRef = useRef<HTMLSpanElement>(null);

  // A highlight that glides between hovered links. It appears in place (no slide from nowhere),
  // then slides between neighbours while visible.
  const onLinkEnter = (e: PointerEvent<HTMLAnchorElement>) => {
    const pill = hoverRef.current;
    if (!pill || e.pointerType !== "mouse") return;
    const a = e.currentTarget;
    const visible = pill.dataset.on === "true";
    if (!visible) pill.style.transition = "none";
    pill.style.width = `${a.offsetWidth}px`;
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
    if (!visible) {
      void pill.offsetWidth;
      pill.style.transition = "";
    }
    pill.dataset.on = "true";
  };
  const onLinksLeave = () => {
    if (hoverRef.current) hoverRef.current.dataset.on = "false";
  };

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const items = links.map((l) => (
    <Link
      key={l.href}
      href={l.href}
      className="nav__link"
      aria-current={pathname === l.href ? "page" : undefined}
      onPointerEnter={onLinkEnter}
    >
      {l.label}
    </Link>
  ));

  return (
    <header className="nav">
      <div className="wrap">
        <div className="nav__bar">
          <Link href="/" className="nav__brand" aria-label="Stack Studio home">
            <LogoMark />
            Stack Studio
          </Link>
          <nav className="nav__links" aria-label="Primary" onPointerLeave={onLinksLeave}>
            <span ref={hoverRef} className="nav__hover" aria-hidden="true" />
            {items}
            <SpecularButton href="/contact" autoAnimate className="btn btn--primary btn--sm">
              Start a Project
              <ArrowUpRight size={16} weight="bold" aria-hidden />
            </SpecularButton>
          </nav>
          <SpecularButton
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="nav-drawer"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </SpecularButton>
        </div>
        <div id="nav-drawer" className="nav__drawer" data-open={open} inert={!open}>
          <div>
            <nav aria-label="Primary (mobile)">
              {items}
              <SpecularButton href="/contact" autoAnimate className="btn btn--primary">
                Start a Project
                <ArrowUpRight size={16} weight="bold" aria-hidden />
              </SpecularButton>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
