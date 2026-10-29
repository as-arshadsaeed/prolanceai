import Link from "next/link";

const footerLinks = [
  { href: "/proposals", label: "Proposals" },
  { href: "/cover-letters", label: "Cover Letters" },
  { href: "/settings", label: "Settings" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link href="/" className="brand" aria-label="Prolance AI">
          <span className="brand-mark" aria-hidden="true">
            <span>P</span>
          </span>

          <span className="brand-copy">
            <span className="brand-name">Prolance AI</span>
            <span className="brand-caption">Your freelance workspace</span>
          </span>
        </Link>

        <nav className="footer-nav" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Prolance AI. All rights reserved.</p>

          <span className="footer-built-note">
            Built for independent professionals
          </span>
        </div>
      </div>
    </footer>
  );
}
