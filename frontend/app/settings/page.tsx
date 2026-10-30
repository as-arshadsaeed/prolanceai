import Link from "next/link";

export default function SettingsPage() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

  const isLocalApi =
    apiBaseUrl.includes("localhost") || apiBaseUrl.includes("127.0.0.1");

  return (
    <main className="page-container settings-page">
      <section className="settings-hero">
        <div className="settings-hero-copy">
          <div className="settings-eyebrow">
            <span className="settings-eyebrow-dot" />
            WORKSPACE PREFERENCES
          </div>

          <h1>
            Your workspace,
            <br />
            <span>your settings.</span>
          </h1>

          <p>
            Manage your application connection and access your writing tools
            from one place.
          </p>
        </div>

        <div className="settings-hero-art" aria-hidden="true">
          <div className="settings-art-orbit orbit-one" />
          <div className="settings-art-orbit orbit-two" />
          <div className="settings-art-icon">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M26 7h12l2 7a20 20 0 0 1 5 3l7-2 6 10-5 5a20 20 0 0 1 0 6l5 5-6 10-7-2a20 20 0 0 1-5 3l-2 7H26l-2-7a20 20 0 0 1-5-3l-7 2-6-10 5-5a20 20 0 0 1 0-6l-5-5 6-10 7 2a20 20 0 0 1 5-3l2-7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle
                cx="32"
                cy="33"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="32" cy="33" r="3" fill="currentColor" />
            </svg>
          </div>
          <span className="settings-art-spark spark-one">✦</span>
          <span className="settings-art-spark spark-two">✧</span>
        </div>
      </section>

      <div className="settings-content">
        <section className="settings-section">
          <div className="settings-section-heading">
            <div className="settings-section-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3 14.5 9.5 21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
                <path d="m19 2 .8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8L19 2Z" />
              </svg>
            </div>

            <div>
              <h2>Your writing tools</h2>
              <p>Jump straight into your next draft.</p>
            </div>
          </div>

          <div className="settings-generator-grid">
            <Link href="/proposals" className="settings-generator-card">
              <div className="settings-generator-top">
                <span className="settings-generator-icon proposal-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6M8 13h8M8 17h6" />
                  </svg>
                </span>
                <span className="settings-card-arrow">↗</span>
              </div>

              <span className="settings-card-kicker">TOOL 01</span>
              <h3>Proposal generator</h3>
              <p>
                Turn project requirements and your skills into a tailored
                freelance proposal.
              </p>
              <span className="settings-card-link">
                Open proposal workspace <span>→</span>
              </span>
            </Link>

            <Link href="/cover-letters" className="settings-generator-card">
              <div className="settings-generator-top">
                <span className="settings-generator-icon letter-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>
                <span className="settings-card-arrow">↗</span>
              </div>

              <span className="settings-card-kicker">TOOL 02</span>
              <h3>Cover letter generator</h3>
              <p>
                Create a focused introduction that connects your skills with the
                opportunity.
              </p>
              <span className="settings-card-link">
                Open cover letter workspace <span>→</span>
              </span>
            </Link>
          </div>
        </section>

        <section className="settings-footer-note">
          <span className="settings-footer-mark">✦</span>
          <div>
            <strong>Designed to keep you in control.</strong>
            <p>
              Generate, edit, and review your writing before sharing it with a
              client or employer.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
