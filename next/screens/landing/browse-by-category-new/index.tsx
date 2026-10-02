"use client";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { useCheckForLandingPage } from "@/hooks/appHooks";
import useIpadDetection from "@/hooks/useIpadDetection";
import MainBlock from "./main-block";
import { useEffect } from "react";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";

type Props = {
  forceVisible?: boolean;
  noLeftNavSpace?: boolean;
};

const BrowseByCategoryNew = (props: Props) => {
  const { forceVisible = false, noLeftNavSpace = false } = props;
  const ifLandingPage = useCheckForLandingPage();
  const { getLabel } = useBranding();
  const isIpad = useIpadDetection();
  const { clearExpandedCategories } = useNewCategorySearchStore();

  useEffect(() => {
    clearExpandedCategories();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ifLandingPage && !forceVisible) {
    // return <p>We're on the root path!</p>;
    return null;
  }
  return (
    <Box
      id="browse-by-category"
      // className={`mt-0 overflow-x-hidden bg-[--background-neutral-chrome-200] py-0 md:py-[37px] ${isIpad ? "" : "lg:bg-[var(--color-beige-800)]"}`}
      className={`mt-0 overflow-x-hidden bg-color-background-default py-0 md:py-[37px]`}
    >
      <Box
        className={`${isIpad || noLeftNavSpace ? "" : `${getClientFeatureFlag("show_left_nav_flag") ? "" : "lg:ml-[36px]"}`} xs:pl-0 lg:pl-0`}
      >
        <Box className="min-h-[848px] content-center justify-center">
          <MainBlock />
        </Box>
      </Box>
    </Box>
  );
};

export default BrowseByCategoryNew;
