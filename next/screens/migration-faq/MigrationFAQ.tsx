"use client";

import React from "react";
import { useMigrationFAQ } from "@/hooks/migration-faq";
// import { parseHtmlToString } from "../return-policy/ReturnPolicy";
import { STORE_IDS } from "@/config/store-constants";
import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";
import { Spinner } from "@/components/ui/spinner";
import { useBranding } from "@/contexts/BrandingContext";

interface MigrationFAQProps {
  languageCode?: string;
  store?: string;
}

export default function MigrationFAQ({
  languageCode = "en",
  store = STORE_IDS.QVERDE,
}: MigrationFAQProps) {
  const { data: htmlString, isLoading, isError } = useMigrationFAQ(languageCode, store);
  const { getLabel } = useBranding();

  return (
    <Box className="flex h-full w-full flex-col items-center justify-center bg-color-background-default pb-[10px] gap-content-to-footer gap-header-to-title gtlg:px-[38px]">
      {/* ✅ HEADING — ALWAYS RENDERS */}
      <Box className="flex w-full flex-row items-center section-gutter gap-title-to-content layout-width-text">
        <Typography type="h1" className="text-color-text-body typography-heading-01">
          {getLabel("migration_FAQ")}
        </Typography>
      </Box>
      {/*  */}
      {/* CONTENT AREA */}
      <Box
        className={`${isError && (isLoading || !isLoading) && ""} flex min-h-[90vh] w-full section-gutter layout-width-text`}
      >
        {isLoading && (
          <Box className="flex h-full w-full flex-col items-center justify-center gap-4">
            <Typography className="text-center text-color-text-muted">
              {getLabel("loading_FAQ")}
            </Typography>
            <Spinner size="small" />
          </Box>
        )}

        {isError && !isLoading && (
          <Box className="flex h-full w-full items-center justify-center">
            <Typography className="text-center text-color-text-danger">
              {getLabel("faq_unavailable_text")}
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && htmlString && (
          <div className="migration-faq w-full" dangerouslySetInnerHTML={{ __html: htmlString }} />
        )}
      </Box>
    </Box>
  );
}
