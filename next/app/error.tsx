"use client";

import { useEffect } from "react";
// PERF: Removed unused static HeaderRow import + unused Suspense/useLayoutEffect
// HeaderRowWithNoSSR was also unused (commented out in JSX)
import { Box } from "@/components/ui/box";
import { ErrorTemplate } from "@/components/og-components/ErrorTemplate";
import { useBranding } from "@/contexts/BrandingContext";
import { logUiErrorToAxiom } from "@/lib/axiom/log-ui-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { getLabel } = useBranding();

  useEffect(() => {
    // PERF: Dynamic Sentry import — avoids bundling ~50KB+ in the error chunk
    if (process.env.NEXT_PUBLIC_SENTRY_ENABLED) {
      import("@sentry/nextjs").then((Sentry) => {
        Sentry.captureException(error);
      });
    }
    console.error(error);
    logUiErrorToAxiom(error);
  }, [error]);

  return (
    <Box className="flex min-h-screen flex-col">
      {/* <HeaderRow /> */}
      {/* TODO: uncomment this */}
      {/* <Suspense fallback={<Box className="h-[75px]">Loading...</Box>}>
        <HeaderRowWithNoSSR />
      </Suspense> */}

      <ErrorTemplate
        title={getLabel("error_page_title") || "Something went wrong!"}
        description={
          getLabel("error_page_description") ||
          "We apologize for the inconvenience. Our team has been notified."
        }
        buttonLabel={getLabel("error_page_retry") || "Try again"}
        onButtonClick={() => {
          if (reset) {
            reset();
          }
          window.location.href = "/";
        }}
      />
    </Box>
  );
}
