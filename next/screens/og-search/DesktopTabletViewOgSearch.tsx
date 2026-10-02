import React, { useEffect } from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import resetIcon from "@/assets/og-search/reset.svg";
import { Button } from "@/components/ui/button";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { ogSearchIcons } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import { useOESearchStore } from "@/stores/useOESearchStore";
import { useOgSearchTabStore } from "@/stores/useOgSearchTabStore";
import SearchTabs from "./SearchTabs";
import OGTabsGenric from "@/components/og-components/OGTabsGenric";
import { useMedia } from "@/hooks/useMedia";

export default function DesktopTabletViewOgSearch({
  renderTabContent,
  SEARCH_TABS,
}: {
  SEARCH_TABS: { id: string; label: string; icon: React.ReactNode }[];

  renderTabContent: () => React.ReactNode;
}) {
  const { activeTab, setActiveTab } = useOgSearchTabStore();
  const { getLabel } = useBranding();
  const { resetSearch, searchData, setIsOgSearch, searchMode } = useSearchModalStore();
  const { resetOESearch, isInputFilled } = useOESearchStore();
  const isTablet = useMedia("(min-width: 640px) and (max-width: 1023px)");

  const getTopValue = () => {
    if (activeTab === "saved") {
      return "top-[4px] ml:top-[6px] 2xl:top-[2px]";
    }
    if (activeTab === "car") {
      if (searchMode === "vin") {
        return "top-[3px] 2xl:top-[5px]";
      }
      return "top-[4px] ml:top-[5px] 2xl:top-[12px]";
    }
    if (activeTab === "category") {
      return "top-[1px] ml:top-[3px] 2xl:top-[2px]";
    }
    if (activeTab === "oe") {
      return "top-[3px] ml:top-[4px] 2xl:top-[1px]";
    }
  };

  useEffect(() => {
    if (activeTab !== "oe") {
      resetOESearch();
    }
  }, [activeTab, resetOESearch]);

  return (
    <Box
      className={`mx-auto min-h-screen flex-col items-start base:hidden md:flex md:justify-center md:pt-[200px] lg:pt-[100px] gtlg:px-0 2xl:pt-[350px]`}
    >
      <Box className="between mx-auto mb-16 base:mt-[220px] gtsm:mt-0 gtsm:pl-20 md:ml-0 md:mt-[-500px] lg:mt-[-220px] between-992-1024:pl-[180px] 2xl:mt-[-500px] between-1280-1599:pl-[310px] between-1024-1215:pl-[210px] between-1216-1270:pl-[310px]">
        <Text className="text-center font-Anton text-[44px] font-[400] leading-[52px] text-color-text-body 2xl:text-[72px] 2xl:leading-[84px]">
          {getLabel("og_search_heading")}
        </Text>
      </Box>

      {/* master bloack */}
      <Box
        className={`relative-card masterBlockWidth base:hidden gtsm:flex gtsm:h-[275px] between-1280-1599:mx-auto ${
          activeTab === "category" ? "2xl:h-[250px]" : "2xl:h-[250px]"
        }`}
      >
        <Box className="floating-tabs floatingTabsWidth !bg-transparent gtsm:h-[64px]">
          <Box className="w-full rounded-[8px] bg-white p-[10px] md:mb-1 gtlg:mb-1 ml:mb-1 2xl:mb-0 2xl:h-[70px]">
            <Box className="flex h-full w-auto flex-row items-center justify-center gap-3">
              <OGTabsGenric
                data={SEARCH_TABS}
                activeTab={activeTab}
                onTabChange={(tabId) => {
                  setActiveTab(tabId);
                  setIsOgSearch(true); // need for step 5 view
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box
          className={`content-panel stageWidth mt-4 gtsm:h-[200px] ${
            activeTab === "category" ? "2xl:h-[200px]" : "2xl:h-[200px]"
          }`}
        >
          <Box className="flex w-full flex-row">
            <Box className="no-cut-1 gtsm:w-[40px]" />
            <Box className="cutout" />
            <Box className="no-cut-2 gtsm:w-[40px] ml:w-[45px] 2xl:w-[228px]" />
          </Box>
          <Box className={`px-10 pt-5 ${activeTab === "category" ? "2xl:py-0" : ""}`}>
            {renderTabContent()}
          </Box>

          {/* 2 line section */}
          <Box className="relative hidden h-[1.4rem] w-full items-center justify-between bg-transparent px-8 pt-4 gtsm:flex gtsm:flex-row">
            <Image
              src={ogSearchIcons.line}
              alt="line"
              height={44}
              width={6}
              className={`absolute left-[20px] z-10 h-[44px] cursor-pointer ${getTopValue()}`}
            />
            <Image
              src={ogSearchIcons.line}
              alt="line"
              height={44}
              width={6}
              className={`absolute right-[20px] z-10 h-[44px] cursor-pointer ${getTopValue()}`}
            />
          </Box>

          <Box className="handCardTop absolute left-0 z-0 flex h-fit w-full max-w-[1000] flex-row items-center rounded-lg bg-color-background-l3">
            <Box className="py-3 pl-10 base:pr-9 gtsm:pr-9 gtlg:pr-10">
              {/* color change text */}
              <Text className="inline break-words pl-2 text-color-primary-main text-single-100-regular">
                <Text className="inline text-color-primary-main body-bold-sm">
                  {getLabel("og_search_note_heading")}
                </Text>{" "}
                {activeTab === "car"
                  ? getLabel("og_search_note_body_for_by_car")
                  : activeTab === "oe"
                    ? getLabel("og_search_note_body_for_oe")
                    : getLabel("og_search_note_body_for_by_categories")}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
