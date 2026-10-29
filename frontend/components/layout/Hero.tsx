import Link from "next/link";

interface HeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function Hero({
  eyebrow = "PROLANCE AI",
  title,
  description,
  actionHref,
  actionLabel,
}: HeroProps) {
  return (
    <section className="hero">
      <p className="hero-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="hero-description">{description}</p>

      {actionHref && actionLabel && (
        <Link className="button-primary" href={actionHref}>
          {actionLabel}
        </Link>
      )}
    </section>
  );
}
