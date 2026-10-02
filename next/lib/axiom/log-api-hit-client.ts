"use client";

import { axiomClientLogger } from "./client";

export function sendApiHitToAxiomClient(fields: Record<string, unknown>): void {
  if (!axiomClientLogger) return;

  axiomClientLogger.info("backend_api_hit", fields);
}
