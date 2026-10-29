"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <main className="page-container">
      <section className="error-panel" role="alert">
        <h1>Something went wrong</h1>
        <p>The page could not be displayed.</p>
        <button className="button-primary" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
