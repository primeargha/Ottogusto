import { Box } from "@/components/ui/box";
import CategoryCarSelectionBannerSkeleton from "@/components/CategoryCarSelectionBannerSkeleton";
import { getServerFeatureFlag } from "@/utils/server-feature";
import {
  CategoryBrandsSectionSkeleton,
  CategoryHeroSkeleton,
  CategoryL2SectionSkeleton,
  CategoryL3GridSkeleton,
  CategoryLearnAndFAQSkeleton,
  CategoryTopPartsSkeleton,
  RecentlyViewedSkeleton,
} from "./CategorySkeletons";

type CategoryLoadingLevel = "l1" | "l2" | "l3";

interface CategoryPageLoadingProps {
  level: CategoryLoadingLevel;
}

export default function CategoryPageLoading({ level }: CategoryPageLoadingProps) {
  const isLegacyMmeSearchEnabled = getServerFeatureFlag("mme_feature_flag");
  const isNewMmeSearchEnabled = getServerFeatureFlag("new_mme_feature_flag");

  return (
    <Box className="bg-color-background-default">
      {isNewMmeSearchEnabled && <CategoryCarSelectionBannerSkeleton />}
      {isLegacyMmeSearchEnabled && !isNewMmeSearchEnabled && (
        <Box className="w-full border-b border-t border-color-border-positive bg-color-background-positive-muted">
          <Box className="section-base base:py-4 gtsm:py-6">
            <Box className="animate-pulse h-12 w-full rounded bg-color-background-emphasis" />
          </Box>
        </Box>
      )}

      <Box className="flex w-full flex-col">
        <Box className="flex flex-col gap-content-to-footer">
          <Box className="flex w-full flex-col gap-stack">
            <CategoryHeroSkeleton />

            {level === "l1" && <CategoryL2SectionSkeleton />}
            {level === "l2" && <CategoryL3GridSkeleton />}
            {level === "l3" && <CategoryTopPartsSkeleton />}

            <CategoryBrandsSectionSkeleton />
            <CategoryLearnAndFAQSkeleton />
            <RecentlyViewedSkeleton />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
