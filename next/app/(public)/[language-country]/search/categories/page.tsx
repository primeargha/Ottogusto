"use client";
import { Box } from "@/components/ui/box";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import SearchByCarHeader from "@/screens/search-by-car/search-header";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import useRouter from "@unitools/router";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useMedia } from "@/hooks/useMedia";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";
import { OgSearchModal } from "@/screens/og-search/OgSearchModal";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Routes } from "@/config/routes";
import { useRouteStore } from "@/stores/useRouteStore";
import { askConfirmation } from "@/utils/confirmation";
import { useBranding } from "@/contexts/BrandingContext";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";

type Props = {};

const CategoriesSelectionPage = (props: Props) => {
  const router = useRouter();
  const params = useParams();
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel } = useBranding();

  // Use the new search store
  const { resetSearch } = useNewSearchModalStore();

  const { navigationHistory } = useRouteStore();
  // Header close handler

  const clearSelectedCategories = useCategorySearchStore((s) => s.clearSelectedCategories);

  const handleClose = () => {
    // If came from OG search page then back to it otherwise pitstop
    if (navigationHistory[0]?.includes("/og-search/")) {
      router.push(getRouteLocaleString(Routes.ogSearch, params));
    } else {
      showCloseConfirmation(
        () => {
          clearSelectedCategories();
          router.push(getRouteLocaleString(Routes.pitStop, params));
        },
        () => {
          // Do nothing
        },
      );
    }
  };

  const { openOgSearchModal, setOgSearchModalContent } = useSearchModalStore();
  useEffect(() => {
    if (isMobile) {
      openOgSearchModal();
      setOgSearchModalContent("category");
    } else {
      // closeOgSearchModal;
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showCloseConfirmation = (yesCallback: () => void, noCallback: () => void) => {
    askConfirmation(
      getLabel("SearchCarCloseWarning_Title"), // title
      getLabel("SearchCarCloseWarning_Subtext"), // body
      "confirm",
      () => {
        yesCallback();
      },
      () => {
        noCallback();
      },
      getLabel("SearchCarCloseWarning_CancelButtonTxt"),
      getLabel("SearchCarCloseWarning_ConfirmButtonTxt"),
    );
  };

  return (
    <>
      {isMobile ? (
        <Box className="min-h-auto flex flex-col gap-8 bg-white pt-[72px]">
          <SearchByCarHeader handleClose={handleClose} />
          <OgSearchModal
            onModalClose={() => {
              router.back();
            }}
            // onModalClose="sadfsdf"
          ></OgSearchModal>
        </Box>
      ) : (
        <Box className="hidden gtsm:flex gtsm:min-h-screen gtsm:flex-row gtsm:bg-gray-50 gtsm:pt-[72px]">
          <SearchByCarHeader handleClose={handleClose} />
          <LeftColumn />
          <RightColumn noScroll />
        </Box>
      )}
    </>
  );
};

export default CategoriesSelectionPage;
