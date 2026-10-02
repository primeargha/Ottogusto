"use client";

// PERF: Slimmed down global-error — was 3.6 MiB because it imported the entire app shell.
// A global error page only shows during catastrophic failures; it should be minimal.
import { useEffect } from "react";
import { logUiErrorToAxiom } from "@/lib/axiom/log-ui-error";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    logUiErrorToAxiom(error);

    // Dynamically import Sentry browser SDK to avoid pulling in server-side deps
    if (process.env.NEXT_PUBLIC_SENTRY_ENABLED) {
      import("@sentry/react")
        .then((Sentry) => {
          Sentry.captureException(error);
        })
        .catch(() => {
          // Sentry not available, silently fail
        });
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          backgroundColor: "#f7f7f3",
          margin: 0,
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            maxWidth: "480px",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", color: "#1a1a1a", marginBottom: "0.5rem" }}>
            Something went wrong!
          </h1>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            We apologize for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#006341",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
