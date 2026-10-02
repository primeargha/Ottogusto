// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://911488d6dfb6c0baa56b95cbf7aa4454@o4510233091899392.ingest.de.sentry.io/4510234639728720",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,

  // Filter out non-API requests from traces
  beforeSendTransaction: (transaction: any) => {
    const url = transaction.name || "";

    // Skip image requests, static assets, and Next.js internal routes
    if (
      url.includes("/_next/image") ||
      url.includes("cdn.ottogusto.group") ||
      url.includes(".jpg") ||
      url.includes(".png") ||
      url.includes(".webp") ||
      url.includes(".gif") ||
      url.includes(".svg") ||
      url.includes("/_next/static") ||
      url.includes("/favicon.ico")
    ) {
      return null; // Don't send this transaction
    }

    return transaction;
  },
});
