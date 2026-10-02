import { axiomApiServerLogger, isAxiomServerConfigured } from "./server";

export async function sendApiHitToAxiomServer(fields: Record<string, unknown>): Promise<void> {
  if (!isAxiomServerConfigured() || !axiomApiServerLogger) return;

  axiomApiServerLogger.info("backend_api_hit", fields);
  await axiomApiServerLogger.flush();
}
