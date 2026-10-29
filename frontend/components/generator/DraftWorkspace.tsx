"use client";

import Loading from "@/app/loading";
import { useEffect, useState } from "react";

interface DraftWorkspaceProps {
  draft: string;
  title: string;
  generating?: boolean;
  handleNewDraft: () => void;
}

export default function DraftWorkspace({
  draft,
  title,
  generating = false,
  handleNewDraft,
}: DraftWorkspaceProps) {
  const [copyMessage, setCopyMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopyMessage("");
    setCopied(false);
  }, [draft]);

  async function copyDraft() {
    if (!draft.trim()) return;

    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setCopyMessage("Draft copied to clipboard.");
    } catch {
      setCopied(false);
      setCopyMessage(
        "Copy unavailable. Select the draft text and copy it manually.",
      );
    }
  }

  return (
    <section
      className={`draft-workspace ${
        draft ? "draft-workspace-filled" : "draft-workspace-empty"
      }`}
      aria-label={title}
    >
      <div className="draft-heading">
        <div className="draft-title-group">
          <div className="draft-document-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M8 13h8" />
              <path d="M8 17h8" />
            </svg>
          </div>

          <div className="draft-title-copy">
            <p className="section-eyebrow">YOUR WRITING SPACE</p>
            <h2>{title}</h2>
          </div>
          <span className={`draft-status ${draft ? "draft-status-ready" : ""}`}>
            <span />
            {generating ? "Writing" : draft ? "Draft ready" : "Awaiting input"}
          </span>
        </div>

        {draft && (
          <button
            type="button"
            className={`draft-copy-button ${
              copied ? "draft-copy-button-success" : ""
            }`}
            onClick={copyDraft}
          >
            {copied ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="8" y="8" width="13" height="13" rx="2" />
                <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
              </svg>
            )}

            <span>{copied ? "Copied" : "Copy draft"}</span>
          </button>
        )}

        {draft && !generating && (
          <button
            type="button"
            className="draft-copy-button draft-copy-button-new"
            onClick={handleNewDraft}
          >
            <span aria-hidden="true">＋</span>
            New draft
          </button>
        )}
      </div>

      <div className="draft-document">
        {draft ? (
          <textarea
            className="draft-textarea"
            aria-label={`${title} content`}
            value={draft}
            readOnly
            rows={18}
            spellCheck={false}
          />
        ) : (
          <div className="draft-empty-state">
            <div className="draft-empty-illustration" aria-hidden="true">
              <div className="draft-paper">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="draft-sparkle">✳</div>
            </div>

            <h3>Your next great pitch starts here.</h3>

            <p>
              Fill in the details on the left and generate your draft. Your
              writing will appear here, ready for review.
            </p>

            <div className="draft-empty-features">
              <span>
                <span className="draft-feature-check">✓</span>
                Easy to copy
              </span>
              <span>
                <span className="draft-feature-check">✓</span>
                Ready to review
              </span>
            </div>
          </div>
        )}
      </div>

      <footer className="draft-footer">
        <div className="draft-footer-status">
          <span
            className={`draft-status-indicator ${
              draft ? "draft-indicator-ready" : ""
            }`}
          />

          <span>{draft ? "Draft generated" : "Waiting for your input"}</span>
        </div>

        {draft && (
          <span className="draft-word-count">
            {draft.trim() ? draft.trim().split(/\s+/).length : 0} words
          </span>
        )}
      </footer>

      <p
        className={`draft-copy-feedback ${
          copyMessage ? "draft-copy-feedback-visible" : ""
        }`}
        aria-live="polite"
        role="status"
      >
        {copyMessage}
      </p>
    </section>
  );
}
