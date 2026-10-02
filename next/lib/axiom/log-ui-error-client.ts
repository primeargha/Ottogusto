"use client";

import { axiomUiClientLogger } from "./client-ui";

export function sendUiErrorToAxiomClient(fields: Record<string, unknown>): void {
  if (!axiomUiClientLogger) return;

  axiomUiClientLogger.info("ui_error", fields);
}
