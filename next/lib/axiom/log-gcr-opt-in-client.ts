"use client";

import { axiomUiClientLogger } from "./client-ui";

/**
 * Diagnostics for the Google Customer Reviews opt-in. Production is the only
 * environment where the module can run, since dev domains are not claimed in
 * Merchant Center — so every skip path needs to be visible without a screen-share.
 * Never pass the customer email here.
 */
export function logGcrOptInToAxiomClient(fields: Record<string, unknown>): void {
  if (!axiomUiClientLogger) return;

  axiomUiClientLogger.info("gcr_opt_in", fields);
}
