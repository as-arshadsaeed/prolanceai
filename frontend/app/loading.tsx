export default function Loading() {
  return (
    <main className="page-container loading-page">
      <section
        className="loading-panel"
        role="status"
        aria-live="polite"
        aria-label="Loading workspace"
      >
        <div className="loading-brand-mark" aria-hidden="true">
          <span>P</span>
        </div>

        <div className="loading-indicator" aria-hidden="true">
          <span className="loading-spinner" />
          <span className="loading-indicator-dot" />
        </div>

        <p className="section-eyebrow loading-eyebrow">PROLANCE AI WORKSPACE</p>

        <h1>
          Getting things
          <br />
          <span>ready for you.</span>
        </h1>

        <p className="loading-description">
          Preparing your workspace. This should only take a moment.
        </p>

        <div className="loading-progress" aria-hidden="true">
          <span />
        </div>

        <p className="loading-footnote">Please wait while we load your page</p>
      </section>
    </main>
  );
}
