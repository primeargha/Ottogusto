"use client";

import React, { Suspense, useState } from "react";
import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";
import CategoryL3DynamicHeader from "./CategoryL3DynamicHeader";
import NotFoundclient from "@/screens/not-found-client";

interface CategoryL3ClientShellProps {
  l1Title: string;
  l2Title: string;
  l3Title: string;
  l1Slug: string;
  l2Slug: string;
  l3Slug: string;
  partsLabel: string;
  partsHref: string;
  languageCountry: string;
  enableNewMmeBanner: boolean;
  children: React.ReactNode;
}

export default function CategoryL3ClientShell({
  l1Title,
  l2Title,
  l3Title,
  l1Slug,
  l2Slug,
  partsHref,
  languageCountry,
  enableNewMmeBanner,
  children,
}: CategoryL3ClientShellProps) {
  const [vinUrlInvalid, setVinUrlInvalid] = useState(false);

  if (vinUrlInvalid) {
    return <NotFoundclient />;
  }

  return (
    <Box className="bg-color-background-default">
      {/*
       * Suspense isolates useSearchParams() inside CategoryL3DynamicHeader so
       * ISR pages are not forced into BAILOUT_TO_CLIENT_SIDE_RENDERING for the
       * entire page. The static fallback renders the H1 immediately so there
       * is no layout shift for non-vehicle visitors (the majority of crawlers).
       */}
      <Suspense
        fallback={
          <Box className="gap-header-to-title gap-title-to-content section-standard">
            <Typography type="h1" className="text-color-text-emphasis typography-heading-01">
              {l3Title}
            </Typography>
          </Box>
        }
      >
        <CategoryL3DynamicHeader
          l1Title={l1Title}
          l2Title={l2Title}
          l3Title={l3Title}
          l1Slug={l1Slug}
          l2Slug={l2Slug}
          partsHref={partsHref}
          languageCountry={languageCountry}
          enableNewMmeBanner={enableNewMmeBanner}
          onVinInvalidChange={setVinUrlInvalid}
        />
      </Suspense>
      <Box className="flex w-full flex-col">
        <Box className="flex flex-col gap-content-to-footer">{children}</Box>
      </Box>
    </Box>
  );
}
