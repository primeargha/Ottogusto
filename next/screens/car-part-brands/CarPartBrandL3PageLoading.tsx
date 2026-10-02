import { Box } from "@/components/ui/box";
import CategoryCarSelectionBannerSkeleton from "@/components/CategoryCarSelectionBannerSkeleton";
import { CategoryTopPartsSkeleton } from "@/screens/category/CategorySkeletons";
import { getServerFeatureFlag } from "@/utils/server-feature";

/**
 * Full-page skeleton for Brand × L3 — mirrors category L3 parts-area skeleton
 * (`CategoryTopPartsSkeleton`) plus brand header chrome, same pattern as
 * `CategoryPageLoading` + `car-parts/.../[l3]/loading.tsx`.
 */
export default function CarPartBrandL3PageLoading() {
  const isNewMmeEnabled = getServerFeatureFlag("new_mme_feature_flag");
  const isLegacyMmeEnabled = getServerFeatureFlag("mme_feature_flag");

  return (
    <Box className="flex w-full flex-col bg-color-background-default" aria-hidden>
      {isNewMmeEnabled ? (
        <CategoryCarSelectionBannerSkeleton />
      ) : (
        isLegacyMmeEnabled && (
          <Box className="w-full border-b border-t border-color-border-positive bg-color-background-positive-muted">
            <Box className="section-standard base:py-4 gtsm:py-6">
              <Box className="animate-pulse h-12 w-full rounded bg-color-background-emphasis" />
            </Box>
          </Box>
        )
      )}

      <Box className="flex w-full flex-col gap-content-to-footer base:gap-6 gtsm:gap-6 gtlg:gap-8">
        <Box className="section-standard">
          <Box className="flex min-h-[36px] items-center gap-2 py-space-sm gtsm:min-h-0">
            <Box className="animate-pulse h-3 w-10 rounded bg-color-background-emphasis" />
            <Box className="h-3 w-2 rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-3 w-28 rounded bg-color-background-emphasis" />
            <Box className="h-3 w-2 rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-3 w-24 rounded bg-color-background-emphasis" />
            <Box className="h-3 w-2 rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-3 w-20 rounded bg-color-background-emphasis" />
          </Box>
        </Box>

        <Box className="flex flex-col gap-space-md section-standard">
          <Box className="flex flex-row items-center gap-4">
            <Box className="animate-pulse h-6 w-6 rounded bg-color-background-emphasis" />
            <Box className="animate-pulse h-9 w-72 max-w-full rounded bg-color-background-emphasis" />
          </Box>
          <Box className="space-y-2">
            <Box className="animate-pulse bg-color-background-muted h-4 w-full rounded" />
            <Box className="animate-pulse bg-color-background-muted h-4 w-5/6 rounded" />
            <Box className="animate-pulse bg-color-background-muted h-4 w-2/3 rounded" />
          </Box>
        </Box>

        {/* Same parts grid skeleton as category L3 `CategoryTopPartsSkeleton` */}
        <CategoryTopPartsSkeleton hideHeading />
      </Box>
    </Box>
  );
}
