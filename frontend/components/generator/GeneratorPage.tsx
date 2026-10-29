"use client";

import { useState, type FormEvent } from "react";
import { generateCoverLetter, generateProposal } from "@/lib/api";
import { useUsage } from "@/hooks/use-usage";
import type {
  GeneratorDocumentType,
  GenerateResponse,
  ProposalLength,
  Tone,
} from "@/types/api";
import UsagePanel from "./UsagePanel";
import DraftWorkspace from "./DraftWorkspace";

interface GeneratorPageProps {
  documentType: GeneratorDocumentType;
}

function extractDraft(data: GenerateResponse): string {
  // The API's canonical, fully assembled draft.
  if (typeof data.full_text === "string" && data.full_text.trim()) {
    return data.full_text.trim();
  }

  // Handle other supported string response fields.
  const candidates = [
    data.content,
    data.proposal,
    data.cover_letter,
    data.text,
    data.message,
  ];

  const result = candidates.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );

  if (result) return result.trim();

  // Fallback: assemble the structured proposal sections.
  if (data.proposal && typeof data.proposal === "object") {
    const proposal = data.proposal as Record<string, unknown>;

    const sections = [
      proposal.opening,
      proposal.understanding,
      proposal.approach,
      proposal.relevant_evidence,
      proposal.questions,
      proposal.closing,
    ];

    return sections
      .map((section) => {
        if (typeof section === "string") return section.trim();

        if (Array.isArray(section)) {
          return section
            .filter(
              (item): item is string =>
                typeof item === "string" && item.trim().length > 0,
            )
            .join("\n");
        }

        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return "";
}

export default function GeneratorPage({ documentType }: GeneratorPageProps) {
  const isProposal = documentType === "proposal";
  const heading = isProposal ? "Proposal generator" : "Cover letter generator";

  const description = isProposal
    ? "Turn a project brief into a thoughtful proposal that connects your expertise to the client's goals."
    : "Create a compelling cover letter that highlights your relevant skills and makes your experience clear.";

  const SAMPLE_JOB_DESCRIPTION = `Project: Build an AI-Powered Proposal Writing Platform

We are looking for a skilled full-stack developer to build and improve a SaaS platform that helps freelancers create personalized client proposals and cover letters.

Project requirements:
- Build a responsive, modern interface using Next.js and React.
- Develop reliable backend APIs using Python and FastAPI.
- Integrate AI-powered text generation for tailored proposals and cover letters.
- Create reusable form components with input validation and clear error handling.
- Connect the frontend to backend endpoints and handle loading states.
- Write maintainable code and test important user workflows.

Ideal candidate:
- Experience with Next.js, TypeScript, React, Python, and FastAPI.
- Familiarity with REST APIs and AI integrations.
- Strong attention to usability, performance, and code quality.
- Clear communication and a collaborative approach.

Deliverables:
A functional, responsive application with proposal and cover-letter generation, editable drafts, and a clean user experience.

Please include your relevant experience, examples of similar projects, your proposed approach, and an estimated timeline.`;

  const { usage, loading, error: usageError, refresh } = useUsage();

  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<ProposalLength>("medium");

  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUsage = isProposal ? usage.proposals : usage.cover_letters;

  const toneOptions = [
    { label: "Professional", value: "professional" },
    { label: "Friendly", value: "friendly" },
    { label: "Confident", value: "confident" },
    { label: "Technical", value: "technical" },
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (generating) return;

    setError(null);
    setDraft("");
    setGenerating(true);

    const skillsList = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const portfolioList = portfolio
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const result = isProposal
        ? await generateProposal({
            job_description: jobDescription,
            skills: skillsList,
            experience_summary: experience,
            portfolio_evidence: portfolioList,
            hourly_rate: hourlyRate,
            tone,
            length,
          })
        : await generateCoverLetter({
            job_description: jobDescription,
            skills: skillsList,
            tone,
          });

      const generatedDraft = extractDraft(result);

      if (!generatedDraft) {
        console.error("Unexpected generation response:", result);
        throw new Error(
          "The API returned successfully, but its response format was not recognized.",
        );
      }

      setDraft(generatedDraft.trim());
      void refresh();
    } catch (err) {
      console.error("Draft generation failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while generating your draft.",
      );
    } finally {
      setGenerating(false);
    }
  }

  function handleNewDraft() {
    console.log("New draft clicked");

    if (generating) return;

    setDraft("");
    setError(null);
    setJobDescription("");
    setSkills("");
    setExperience("");
    setPortfolio("");
    setHourlyRate("");
    setTone("professional");
    setLength("medium");
  }

  return (
    <main className="page-container generator-page">
      <header className="generator-intro">
        <div className="generator-breadcrumb">
          <span className="breadcrumb-home">WORKSPACE</span>
          <span className="breadcrumb-separator">/</span>
          <span>{isProposal ? "PROPOSALS" : "COVER LETTERS"}</span>
        </div>

        <div className="generator-heading-row">
          <div className="generator-heading-copy">
            <div className="generator-eyebrow">
              <span className="generator-eyebrow-dot" />
              AI WRITING STUDIO
            </div>

            <h1>{heading}</h1>
            <p>{description}</p>
          </div>

          <div className="generator-heading-badge">
            <span className="generator-badge-icon">✳</span>
            <span>
              <strong>Made for your next move</strong>
              <small>Draft. Refine. Send.</small>
            </span>
          </div>
        </div>
      </header>

      <div className="generator-grid">
        <div className="generator-form-column">
          <form className="generator-form" onSubmit={handleSubmit}>
            <div className="form-card">
              <div className="form-card-heading">
                <span className="form-section-number">01</span>
                <div>
                  <h2>Tell us about the opportunity</h2>
                  <p>Start with the details that matter most.</p>
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="job-description">
                  Job description
                  <span className="field-required">Required</span>
                </label>

                <textarea
                  id="job-description"
                  className="generator-textarea job-description-input"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the job post or project brief here. Include the client's goals, requirements and expectations..."
                  required
                  rows={7}
                  maxLength={5000}
                />

                <div className="field-meta">
                  <span>Include as much relevant context as you can.</span>
                  <span>{jobDescription.length.toLocaleString()} / 5,000</span>
                </div>

                <div className="sample-description-actions">
                  <button
                    type="button"
                    className="sample-description-button"
                    onClick={() => setJobDescription(SAMPLE_JOB_DESCRIPTION)}
                  >
                    <span aria-hidden="true">✳</span>
                    Load sample description
                  </button>

                  <span className="sample-description-hint">
                    Try an example to see how Prolance AI works.
                  </span>
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="skills">
                  Relevant skills
                  <span className="field-required">Required</span>
                </label>

                <textarea
                  id="skills"
                  className="generator-textarea"
                  value={skills}
                  onChange={(event) => setSkills(event.target.value)}
                  placeholder="e.g. React, Shopify, API integration, project management..."
                  required
                  rows={3}
                  maxLength={5000}
                />

                <span className="field-hint">
                  Focus on skills that match the opportunity.
                </span>
              </div>
            </div>

            {isProposal && (
              <div className="form-card">
                <div className="form-card-heading">
                  <span className="form-section-number">02</span>
                  <div>
                    <h2>Showcase your experience</h2>
                    <p>Give your proposal specific, relevant evidence.</p>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="experience">
                    Experience summary
                    <span className="field-required">Required</span>
                  </label>

                  <textarea
                    id="experience"
                    className="generator-textarea"
                    value={experience}
                    onChange={(event) => setExperience(event.target.value)}
                    placeholder="Describe relevant work, years of experience, expertise or achievements..."
                    required
                    rows={4}
                    maxLength={10000}
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="portfolio">
                    Portfolio & project evidence
                    <span className="field-optional">Optional</span>
                  </label>

                  <textarea
                    id="portfolio"
                    className="generator-textarea"
                    value={portfolio}
                    onChange={(event) => setPortfolio(event.target.value)}
                    placeholder="Add relevant projects, case studies, results or portfolio URLs..."
                    rows={3}
                    maxLength={10000}
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="hourly-rate">
                    Hourly rate
                    <span className="field-optional">Optional</span>
                  </label>

                  <input
                    id="hourly-rate"
                    className="generator-input"
                    type="text"
                    value={hourlyRate}
                    onChange={(event) => setHourlyRate(event.target.value)}
                    placeholder="e.g. $30/hour"
                    maxLength={100}
                  />

                  <span className="field-hint">
                    Leave blank if pricing is not relevant.
                  </span>
                </div>
              </div>
            )}

            <div className="form-card">
              <div className="form-card-heading">
                <span className="form-section-number">
                  {isProposal ? "03" : "02"}
                </span>
                <div>
                  <h2>Make it sound like you</h2>
                  <p>Choose the style that suits this opportunity.</p>
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="tone">Writing tone</label>

                <select
                  id="tone"
                  className="generator-select"
                  value={tone}
                  onChange={(event) => setTone(event.target.value as Tone)}
                >
                  {toneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <span className="field-hint">
                  {tone === "professional" &&
                    "Clear, polished and business-focused."}
                  {tone === "friendly" &&
                    "Warm, approachable and conversational."}
                  {tone === "confident" &&
                    "Direct, assured and focused on your strengths."}
                  {tone === "technical" &&
                    "Precise, detail-oriented and focused on technical expertise."}
                </span>
              </div>

              {isProposal && (
                <div className="field-group">
                  <label htmlFor="length">Draft length</label>

                  <div className="length-options">
                    {(
                      [
                        {
                          value: "short",
                          label: "Short",
                          detail: "Brief & direct",
                        },
                        {
                          value: "medium",
                          label: "Medium",
                          detail: "Balanced detail",
                        },
                        {
                          value: "long",
                          label: "Long",
                          detail: "More context",
                        },
                      ] as const
                    ).map((option) => (
                      <label
                        key={option.value}
                        className={`length-option ${
                          length === option.value ? "length-option-active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="length"
                          value={option.value}
                          checked={length === option.value}
                          onChange={() => setLength(option.value)}
                        />
                        <span className="length-option-label">
                          {option.label}
                        </span>
                        <span className="length-option-detail">
                          {option.detail}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="generator-error" role="alert">
                <span className="generator-error-icon">!</span>
                <div>
                  <strong>We couldn't generate your draft</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div className="generator-submit-area">
              <button
                type="submit"
                className="button-primary generator-submit"
                disabled={generating || loading}
                aria-busy={generating}
              >
                <span>
                  {generating
                    ? "Creating your draft..."
                    : `Generate ${isProposal ? "proposal" : "cover letter"}`}
                </span>
                {!generating && <span aria-hidden="true">↗</span>}
              </button>

              <p className="generator-submit-note">
                AI-assisted writing. Review and edit before sending.
              </p>
            </div>
          </form>
        </div>

        <aside className="generator-output-column">
          {/* <div className="draft-panel-heading">
            <div>
              <span className="section-eyebrow">YOUR WORKSPACE</span>
              <h2>Your draft</h2>
            </div>
            <span
              className={`draft-status ${draft ? "draft-status-ready" : ""}`}
            >
              <span />
              {generating
                ? "Writing"
                : draft
                  ? "Draft ready"
                  : "Awaiting input"}
            </span>
          </div> */}

          <div className="generator-usage">
            <UsagePanel
              title={isProposal ? "Proposal usage" : "Cover letter usage"}
              usage={currentUsage}
              loading={loading}
              error={usageError}
              onRefresh={() => void refresh()}
            />
          </div>

          <div className="draft-workspace-wrapper">
            <DraftWorkspace
              title={isProposal ? "Proposal draft" : "Cover letter draft"}
              draft={draft}
              generating={generating}
              handleNewDraft={handleNewDraft}
            />
          </div>
          {/* <button
            type="button"
            className="sample-description-button"
            onClick={handleNewDraft}
          >
            <span aria-hidden="true">＋</span>
            New draft
          </button> */}

          <div className="draft-guidance">
            <span className="draft-guidance-icon">✳</span>
            <div>
              <strong>Your experience, your final say.</strong>
              <p>
                Check names, claims, links and project details. Personalize your
                draft before sharing it with a client or employer.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
