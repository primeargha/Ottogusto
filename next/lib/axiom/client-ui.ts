"use client";

import { Logger, ProxyTransport } from "@axiomhq/logging";

export const axiomUiClientLogger =
  process.env.NEXT_PUBLIC_AXIOM_ENABLED === "true"
    ? new Logger({
        transports: [new ProxyTransport({ url: "/api/axiom-ui", autoFlush: true })],
      })
    : null;
