"use client";

import { axiomClientLogger } from "./client";

export function sendNetworkErrorToAxiomClient(fields: Record<string, unknown>): void {
  if (!axiomClientLogger) return;

  axiomClientLogger.info("network_error", fields);
}
