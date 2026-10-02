import { buildCalculatePayload, type BuildCalculatePayloadParams } from "./calculatePayload";

export type BuildVinCheckPayloadParams = BuildCalculatePayloadParams & {
  vinNumber: string;
};

export function buildVinCheckPayload(params: BuildVinCheckPayloadParams): Record<string, unknown> {
  const { vinNumber, ...calculateParams } = params;
  const base = buildCalculatePayload(calculateParams);
  return {
    ...base,
    vinNumber: vinNumber.trim(),
    status: "New",
  };
}
