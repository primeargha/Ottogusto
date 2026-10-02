import { axiomApiServerLogger, isAxiomServerConfigured } from "./server";

export async function sendNetworkErrorToAxiomServer(
  fields: Record<string, unknown>,
): Promise<void> {
  if (!isAxiomServerConfigured() || !axiomApiServerLogger) return;

  axiomApiServerLogger.info("network_error", fields);
  await axiomApiServerLogger.flush();
}
