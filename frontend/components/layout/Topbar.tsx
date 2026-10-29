"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/proposals", label: "Proposals" },
  { href: "/cover-letters", label: "Cover Letters" },
  { href: "/settings", label: "Settings" },
];

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="Prolance AI">
          <span className="brand-mark" aria-hidden="true">
            <span>P</span>
          </span>

          <span className="brand-copy">
            <span className="brand-name">Prolance AI</span>
            <span className="brand-caption">Your freelance workspace</span>
          </span>
        </Link>

        <nav className="topbar-nav" aria-label="Main navigation">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span>{link.label}</span>
                {active && <span className="nav-active-indicator" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
