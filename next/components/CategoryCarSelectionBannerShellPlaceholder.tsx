"use client";

import { useEffect, useState } from "react";

import CategoryCarSelectionBannerSkeleton from "@/components/CategoryCarSelectionBannerSkeleton";
import CategoryCarSelectionBannerSlot from "@/components/CategoryCarSelectionBannerSlot";
import { getClientFeatureFlag } from "@/utils/theme-utils";

type CategoryCarSelectionBannerShellPlaceholderProps = {
  /** From `getServerFeatureFlag("new_mme_feature_flag")` on category SEO pages. */
  enableNewMmeBanner: boolean;
};

/**
 * Shows the fixed-height banner skeleton on first paint (before hydration / chunk load),
 * then swaps to the dynamic new-MME banner when the client flag matches.
 */
export default function CategoryCarSelectionBannerShellPlaceholder({
  enableNewMmeBanner,
}: CategoryCarSelectionBannerShellPlaceholderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!enableNewMmeBanner) {
    return null;
  }

  if (!isMounted) {
    return <CategoryCarSelectionBannerSkeleton />;
  }

  if (!getClientFeatureFlag("new_mme_feature_flag")) {
    return null;
  }

  return <CategoryCarSelectionBannerSlot />;
}
