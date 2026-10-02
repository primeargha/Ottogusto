"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import SearchTabs from "./SearchTabs";
import SearchByCarView from "./SearchByCarView";
import SearchByOEView from "./SearchByOEView";
import SearchByCategoryView from "./SearchByCategoryView";
import { Text } from "@/components/ui/text";
import ActiveSavedCarIcon from "@/assets/og-search/star-circle.svg";
import InactiveSavedCarIcon from "@/assets/og-search/inactive-star-circle.svg";
import ActiveCarIcon from "@/assets/og-search/active-car.svg";
import InactiveCarIcon from "@/assets/og-search/inactive-car.svg";
import ActiveOEIcon from "@/assets/og-search/active-oe-ref.svg";
import InactiveOEIcon from "@/assets/og-search/inactive-oe-ref.svg";
import ActiveCategoryIcon from "@/assets/og-search/active-ads.svg";
import InactiveCategoryIcon from "@/assets/og-search/inactive-ads.svg";
import { useBranding } from "@/contexts/BrandingContext";
import { loggedInUserOGSearchIcons } from "@/constants";
import DesktopTabletViewOgSearch from "./DesktopTabletViewOgSearch";
import MobileViewOgSearch from "./MobileViewOgSearch";
import SearchBySavedCarView from "./SearchBySavedCarView";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useSavedCarsStore } from "@/stores/useSavedCarsStore";
import { useGetMySavedCarsQuery } from "@/hooks/garage";
import { useOgSearchTabStore } from "@/stores/useOgSearchTabStore";

export default function SearchPanel() {
  const { activeTab, setActiveTab } = useOgSearchTabStore();
  const { getLabel } = useBranding();
  const { isAuthenticated } = useAuthStore();
  const { resetSearch } = useSearchModalStore();
  const { data: savedCarsData } = useGetMySavedCarsQuery();

  useEffect(() => {
    // on load, reset the search
    resetSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated && savedCarsData?.data && savedCarsData?.data?.length > 0) {
      // setActiveTab("saved");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "saved":
        return <SearchBySavedCarView savedCarsData={savedCarsData?.data as any[]} />;
      case "car":
        return <SearchByCarView />;
      case "oe":
        return <SearchByOEView />;
      case "category":
        return <SearchByCategoryView />;
      default:
        return null;
    }
  };

  const SEARCH_TABS = [
    ...(isAuthenticated
      ? [
          {
            id: "saved",
            label: getLabel("search_by_saved_car"),
            icon: activeTab === "saved" ? ActiveSavedCarIcon : InactiveSavedCarIcon,
          },
        ]
      : []), // Ensures `false` isn't included
    {
      id: "car",
      label: getLabel("search_by_car"),
      icon: activeTab === "car" ? ActiveCarIcon : InactiveCarIcon,
    },
    {
      id: "oe",
      label: getLabel("search_by_oe"),
      icon: activeTab === "oe" ? ActiveOEIcon : InactiveOEIcon,
    },
    {
      id: "category",
      label: getLabel("search_by_category"),
      icon: activeTab === "category" ? ActiveCategoryIcon : InactiveCategoryIcon,
    },
  ];

  return (
    <>
      <DesktopTabletViewOgSearch
        // activeTab={activeTab}
        // setActiveTab={setActiveTab}
        renderTabContent={renderTabContent}
        SEARCH_TABS={SEARCH_TABS}
      />
      <MobileViewOgSearch
        // activeTab={activeTab}
        // setActiveTab={setActiveTab}
        renderTabContent={renderTabContent}
        SEARCH_TABS={SEARCH_TABS}
      />
    </>
  );
}
