import Link from "next/link";

export default function Home() {
  return (
    <main className="page-container">
      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            AI-POWERED WRITING FOR FREELANCERS
          </div>

          <h1>
            Turn your expertise
            <br />
            into <span>opportunity.</span>
          </h1>

          <p className="hero-description">
            Create thoughtful proposals and compelling cover letters tailored to
            every opportunity. Make your experience stand out with writing that
            sounds like you.
          </p>

          <div className="hero-actions">
            <Link className="primary-cta" href="/proposals">
              Create a proposal <span>↗</span>
            </Link>
            <Link className="secondary-cta" href="/cover-letters">
              Write a cover letter
            </Link>
          </div>

          <div className="hero-points">
            <span>
              <i>✓</i> Tailored to every brief
            </span>
            <span>
              <i>✓</i> Your voice, your experience
            </span>
            <span>
              <i>✓</i> Fully editable drafts
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-heading">
            <div>
              <span className="visual-kicker">YOUR WRITING WORKSPACE</span>
              <h2>From brief to brilliant.</h2>
            </div>
            <span className="visual-status">
              <span /> Ready to create
            </span>
          </div>

          <div className="workflow">
            <div className="workflow-step">
              <div className="step-icon">01</div>
              <div className="step-content">
                <span className="step-label">STEP ONE</span>
                <strong>Share the opportunity</strong>
                <p>
                  Add the job description, project details and requirements.
                </p>
              </div>
              <span className="step-check">✓</span>
            </div>

            <div className="step-divider" />

            <div className="workflow-step featured-step">
              <div className="step-icon">02</div>
              <div className="step-content">
                <span className="step-label">STEP TWO</span>
                <strong>Craft your first draft</strong>
                <p>
                  Build a focused pitch around your relevant skills and
                  experience.
                </p>
                <div className="draft-preview">
                  <span className="draft-spark">✳</span>
                  <span>Personalized writing, built around your brief</span>
                </div>
              </div>
            </div>

            <div className="step-divider" />

            <div className="workflow-step">
              <div className="step-icon">03</div>
              <div className="step-content">
                <span className="step-label">STEP THREE</span>
                <strong>Make it yours</strong>
                <p>Review, edit and polish your draft before you send it.</p>
              </div>
              <span className="step-check">✓</span>
            </div>
          </div>

          <div className="visual-footer">
            <span className="footer-icon">↗</span>
            <p>
              <strong>Your work. Your words.</strong> You stay in control.
            </p>
          </div>
        </div>
      </section>

      <section className="home-tools" aria-labelledby="tools-heading">
        <div className="section-heading">
          <div>
            <span className="section-kicker">YOUR NEXT MOVE</span>
            <h2 id="tools-heading">The right words start here.</h2>
          </div>
          <p>Everything you need to present your value with confidence.</p>
        </div>

        <div className="home-actions">
          <Link className="home-cta" href="/proposals">
            <div className="tool-top">
              <span className="tool-icon">↗</span>
              <span className="tool-number">01 / PROPOSALS</span>
            </div>
            <h3>Proposal generator</h3>
            <p>
              Turn a client&apos;s brief into a personalized proposal that
              connects your experience to their goals.
            </p>
            <div className="tool-link">
              Create a proposal <span>↗</span>
            </div>
          </Link>

          <Link className="home-cta" href="/cover-letters">
            <div className="tool-top">
              <span className="tool-icon">✳</span>
              <span className="tool-number">02 / COVER LETTERS</span>
            </div>
            <h3>Cover letter generator</h3>
            <p>
              Highlight your most relevant skills and experience in a clear,
              compelling introduction.
            </p>
            <div className="tool-link">
              Write a cover letter <span>↗</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="workspace-banner">
        <div className="workspace-icon">⌘</div>
        <div className="workspace-copy">
          <span className="section-kicker">YOUR SPACE, YOUR SETTINGS</span>
          <h2>Everything in one place.</h2>
          <p>
            Manage your API configuration and review available usage information
            from your workspace settings.
          </p>
        </div>
        <Link className="workspace-link" href="/settings">
          Manage settings <span>↗</span>
        </Link>
      </section>
    </main>
  );
}
