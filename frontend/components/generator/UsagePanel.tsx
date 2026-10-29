import type { UsageCategory } from "@/types/api";

interface UsagePanelProps {
  title: string;
  usage: UsageCategory;
  loading: boolean;
  error?: string | null;
  onRefresh: () => void;
}

export default function UsagePanel({
  title,
  usage,
  loading,
  error,
  onRefresh,
}: UsagePanelProps) {
  const limit = Math.max(0, usage.limit);
  const used = Math.max(0, usage.used);
  const remaining = usage.remaining ?? Math.max(0, limit - used);

  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  const isLimitReached = limit > 0 && used >= limit;

  return (
    <section className="usage-panel" aria-labelledby="usage-title">
      <header className="usage-heading">
        <div className="usage-heading-copy">
          <span className="usage-eyebrow">
            <span className="usage-status-dot" aria-hidden="true" />
            YOUR USAGE
          </span>

          <h2 id="usage-title">{title}</h2>
          <p className="usage-description">
            Keep track of your available generations.
          </p>
        </div>

        <button
          type="button"
          className="usage-refresh"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh usage"
          title="Refresh usage"
        >
          <svg
            className={
              loading ? "usage-refresh-icon is-spinning" : "usage-refresh-icon"
            }
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 7v5h-5M4 17v-5h5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.6 9a7 7 0 0 1 11.7-2L20 12M4 12l2.7 5a7 7 0 0 0 11.7-2"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      {loading ? (
        <div className="usage-state" role="status" aria-live="polite">
          <span className="usage-loader" aria-hidden="true" />
          <span>Updating your usage…</span>
        </div>
      ) : error ? (
        <div className="usage-error" role="alert">
          <div className="usage-error-copy">
            <span className="usage-error-title">Unable to load usage</span>
            <p>{error}</p>
          </div>

          <button type="button" className="usage-retry" onClick={onRefresh}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="usage-metrics">
            <div>
              <p className="usage-metric-label">Generations used</p>
              <p className="usage-count">
                <strong>{used}</strong>
                <span> / {limit}</span>
              </p>
            </div>

            <span
              className={`usage-badge${isLimitReached ? " is-exhausted" : ""}`}
            >
              {isLimitReached
                ? "Limit reached"
                : `${Math.round(percentage)}% used`}
            </span>
          </div>

          <div
            className="usage-progress"
            role="progressbar"
            aria-label={`${title} usage`}
            aria-valuemin={0}
            aria-valuemax={limit || 1}
            aria-valuenow={Math.min(used, limit)}
            aria-valuetext={`${used} of ${limit} used`}
          >
            <div
              className="usage-progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <footer className="usage-footer">
            <span>Usage allowance</span>
            <span className="usage-remaining">
              <strong>{remaining}</strong>{" "}
              {remaining === 1 ? "generation" : "generations"} remaining
            </span>
          </footer>
        </>
      )}
    </section>
  );
}
