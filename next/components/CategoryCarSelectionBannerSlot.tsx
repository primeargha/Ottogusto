"use client";

import dynamic from "next/dynamic";

import CategoryCarSelectionBannerSkeleton from "@/components/CategoryCarSelectionBannerSkeleton";
import { getClientFeatureFlag } from "@/utils/theme-utils";

const CategoryCarSelectionBanner = dynamic(
  () => import("@/components/CategoryCarSelectionBanner"),
  {
    ssr: false,
    loading: () => <CategoryCarSelectionBannerSkeleton />,
  },
);

export default function CategoryCarSelectionBannerSlot() {
  if (!getClientFeatureFlag("new_mme_feature_flag")) {
    return null;
  }

  return <CategoryCarSelectionBanner />;
}
