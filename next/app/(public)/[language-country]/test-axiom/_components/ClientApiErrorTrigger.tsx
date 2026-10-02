"use client";

import { useState } from "react";
import { OGButton } from "@/components/og-components/OGButton";
import apiClient, { ApiError } from "@/config/api";

const TEST_API_PATH = "/parts/axiom-test-not-found-000";

export function ClientApiErrorTrigger() {
  const [status, setStatus] = useState<string | null>(null);

  const triggerApiError = async () => {
    setStatus("Calling API…");
    try {
      await apiClient.get(TEST_API_PATH);
      setStatus("Unexpected success — endpoint should not exist.");
    } catch (error) {
      if (error instanceof ApiError) {
        setStatus(`API error logged to Axiom (HTTP ${error.status}).`);
        return;
      }
      setStatus(
        `Network error logged to Axiom: ${error instanceof Error ? error.message : "Unknown"}`,
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <OGButton type="outlined" onClick={() => void triggerApiError()}>
        Client API error
      </OGButton>
      {status ? <p className="text-sm text-color-text-body">{status}</p> : null}
    </div>
  );
}
