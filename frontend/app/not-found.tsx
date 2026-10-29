import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container not-found-page">
      <section className="not-found-panel">
        <div className="not-found-visual" aria-hidden="true">
          <span className="not-found-orbit not-found-orbit-one" />
          <span className="not-found-orbit not-found-orbit-two" />

          <span className="not-found-number">4</span>
          <span className="not-found-center">P</span>
          <span className="not-found-number">4</span>

          <span className="not-found-spark not-found-spark-one">✦</span>
          <span className="not-found-spark not-found-spark-two">✧</span>
        </div>

        <p className="section-eyebrow not-found-eyebrow">
          <span className="not-found-status-dot" />
          ERROR 404
        </p>

        <h1>
          Looks like this page
          <br />
          <span>has gone missing.</span>
        </h1>

        <p className="not-found-description">
          The page you’re looking for may have moved, been removed, or never
          existed. Let’s get you back to your workspace.
        </p>

        <div className="not-found-actions">
          <Link className="button-primary not-found-home-button" href="/">
            <span aria-hidden="true">←</span>
            Back to home
          </Link>

          <Link className="not-found-secondary-link" href="/proposals">
            Open proposal generator
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="not-found-divider" />

        <p className="not-found-help">
          Need a fresh start? Your workspace is just one click away.
        </p>
      </section>
    </main>
  );
}
