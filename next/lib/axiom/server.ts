import { Logger, AxiomJSTransport } from "@axiomhq/logging";
import { nextJsFormatters } from "@axiomhq/nextjs";
import { getAxiomClient } from "./axiom";
import { getApiDataset, getUiDataset } from "./datasets";

function createServerLogger(dataset: string | undefined): Logger | null {
  const axiomClient = getAxiomClient();
  if (!axiomClient || !dataset) return null;

  return new Logger({
    transports: [new AxiomJSTransport({ axiom: axiomClient, dataset })],
    formatters: nextJsFormatters,
  });
}

export const axiomApiServerLogger = createServerLogger(getApiDataset());
export const axiomUiServerLogger = createServerLogger(getUiDataset());

/** @deprecated Use axiomApiServerLogger */
export const axiomServerLogger = axiomApiServerLogger;

/**
 * During `next build` static generation, Axiom ingest uses `cache: "no-store"` and
 * triggers DYNAMIC_SERVER_USAGE (e.g. sitemap-pages.xml, api routes). Skip server
 * logging in that phase; runtime (`next start`) is unaffected.
 */
function isNextProductionBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function isAxiomServerConfigured(): boolean {
  if (isNextProductionBuildPhase()) return false;
  return process.env.NEXT_PUBLIC_AXIOM_ENABLED === "true" && axiomApiServerLogger !== null;
}

export function isAxiomUiServerConfigured(): boolean {
  if (isNextProductionBuildPhase()) return false;
  return process.env.NEXT_PUBLIC_AXIOM_ENABLED === "true" && axiomUiServerLogger !== null;
}
