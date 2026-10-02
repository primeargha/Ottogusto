"use client";

import { Logger, ProxyTransport } from "@axiomhq/logging";

export const axiomClientLogger =
  process.env.NEXT_PUBLIC_AXIOM_ENABLED === "true"
    ? new Logger({
        transports: [new ProxyTransport({ url: "/api/axiom", autoFlush: true })],
      })
    : null;
