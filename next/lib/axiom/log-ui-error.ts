import { getStoreDisplayName } from "./datasets";

export function logUiErrorToAxiom(error: Error & { digest?: string }): void {
  if (process.env.NEXT_PUBLIC_AXIOM_ENABLED !== "true") return;
  if (typeof window === "undefined") return;

  const fields: Record<string, unknown> = {
    type: "ui_error",
    store: getStoreDisplayName(),
    errorName: error.name || "Error",
    errorMessage: error.message || "Unknown error",
    stack: error.stack || "",
    pageUrl: window.location.href,
    route: window.location.pathname,
    digest: error.digest,
    source: "client",
    environment: process.env.NODE_ENV || "development",
  };

  void import("./log-ui-error-client").then(({ sendUiErrorToAxiomClient }) =>
    sendUiErrorToAxiomClient(fields),
  );
}
