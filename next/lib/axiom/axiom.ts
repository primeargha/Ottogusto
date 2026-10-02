import { Axiom } from "@axiomhq/js";

/** EU Central 1 — required when the org/dataset is on eu-central-1 (not US default). */
export const AXIOM_EU_EDGE_URL = "https://eu-central-1.aws.edge.axiom.co";

/** US East 1 — use when the org/dataset is on us-east-1. */
export const AXIOM_US_EDGE_URL = "https://us-east-1.aws.edge.axiom.co";

let axiomClient: Axiom | null = null;

/**
 * Edge ingest base URL. Must be passed as `edgeUrl` (not `url`) in the SDK:
 * - edgeUrl → /v1/ingest/{dataset}
 * - url     → /v1/datasets/{dataset}/ingest (legacy api.axiom.co only)
 */
export function getAxiomEdgeUrl(): string {
  return process.env.AXIOM_EDGE_URL?.trim() || process.env.AXIOM_URL?.trim() || AXIOM_EU_EDGE_URL;
}

export function getAxiomClient(): Axiom | null {
  const token = process.env.AXIOM_TOKEN;
  if (!token) return null;

  if (!axiomClient) {
    axiomClient = new Axiom({
      token,
      edgeUrl: getAxiomEdgeUrl(),
    });
  }

  return axiomClient;
}
