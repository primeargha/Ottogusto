"use client";

import { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import NewSearchResultsCarSelectionBanner from "@/components/NewSearchResultsCarSelectionBanner";

type PdpE2ECarSelectionBannerProps = {
  partId: string;
  productName?: string | undefined;
  productTitle?: string | undefined;
  oeReference?: string | undefined;
  price?: number | null | undefined;
};

/** Client mount for E2E New banner on PDP (server page passes part/product meta). */
export default function PdpE2ECarSelectionBanner({
  partId,
  productName,
  productTitle,
  oeReference,
  price,
}: PdpE2ECarSelectionBannerProps) {
  const pathname = usePathname() ?? "";
  const params = useParams();
  const languageCountry = (params?.["language-country"] as string | undefined) ?? "";

  const applyBasePath = useMemo(() => {
    const pathOnly = pathname.split("?")[0] || "";
    if (pathOnly) return pathOnly;
    return languageCountry ? `/${languageCountry}` : "/";
  }, [languageCountry, pathname]);

  return (
    <NewSearchResultsCarSelectionBanner
      applyBasePath={applyBasePath}
      surface="pdp"
      partId={partId}
      productName={productName}
      productTitle={productTitle}
      oeReference={oeReference}
      price={price}
    />
  );
}
