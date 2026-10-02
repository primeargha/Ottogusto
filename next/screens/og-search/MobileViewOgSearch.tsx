import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Button } from "@/components/ui/button";
import ActiveCarIcon from "@/assets/og-search/active-car.svg";
import InactiveCarIcon from "@/assets/og-search/inactive-car.svg";
import ActiveOEIcon from "@/assets/og-search/active-oe-ref.svg";
import InactiveOEIcon from "@/assets/og-search/inactive-oe-ref.svg";
import ActiveCategoryIcon from "@/assets/og-search/active-ads.svg";
import InactiveCategoryIcon from "@/assets/og-search/inactive-ads.svg";
import Image from "next/image";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuthStore } from "@/stores/useAuthStore";
import { loggedInUserOGSearchIcons } from "@/constants";
import DashboardIcon from "@/components/icons/DashboardIcon";
import WrenchIcon from "@/components/icons/WrenchIcon";
import SearchByNewCarIcon from "@/components/icons/SearchByNewCarIcon";
import { StarIcon } from "@/components/ui/icon";
import StartCircleIcon from "@/components/icons/StartCircleIcon";
import { useOgSearchTabStore } from "@/stores/useOgSearchTabStore";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function MobileViewOgSearch({
  renderTabContent,
  SEARCH_TABS,
}: {
  SEARCH_TABS: { id: string; label: string; icon: React.ReactNode }[];

  renderTabContent: () => React.ReactNode;
}) {
  const { getLabel } = useBranding();
  const { isAuthenticated } = useAuthStore();
  const { activeTab, setActiveTab } = useOgSearchTabStore();
  const router = useRouter();
  const params = useParams();
  const {
    ogSearchModalContent,
    setIsOgSearch,
    setOgSearchModalContent,
    isOgSearchModalOpen,
    openOgSearchModal,
    openModal,
    resetSearch,
  } = useSearchModalStore();

  const handleClick = (tab: string) => {
    {
      isAuthenticated
        ? setOgSearchModalContent(tab as "saved" | "car" | "category" | "oe")
        : setOgSearchModalContent(tab as "car" | "category" | "oe");
    }
    openOgSearchModal();

    setIsOgSearch(true);
  };

  const handleSearchByCar = async () => {
    resetSearch();
    const { getRouteLocaleString } = await import("@/helpers/UtilityHelper");
    const { Routes } = await import("@/config/routes");
    router.push(`${getRouteLocaleString(Routes.search, params)}`);
  };

  return (
    <Box className="flex h-[calc(100vh-100px)] w-full flex-col items-start justify-center px-[24px] md:hidden">
      <Box className="mx-auto mb-[40px] max-w-[219px]">
        <Text className="text-center font-Anton text-[28px] font-[400] leading-[40px] text-color-text-body">
          {getLabel("og_search_heading")}
        </Text>
      </Box>

      <Box className="mx-auto flex max-w-[264px] flex-col gap-[12px]">
        {isAuthenticated && (
          <Button
            onPress={() => handleClick("saved")}
            className="flex h-[60px] w-full flex-row items-center justify-start gap-[16px] rounded-[8px] border border-[--Primary-Colors-Main] bg-[--Brand-Pure-White] p-[12px]"
          >
            <StartCircleIcon />
            {/* <Image
              src={loggedInUserOGSearchIcons.inactiveSavedCarIcon}
              height={36}
              width={36}
              alt="saved car"
            /> */}
            <Text className="font-Overpass text-[20px] font-[700] leading-[22px] text-[--Primary-Colors-Main]">
              {getLabel("search_by_saved_car")}
            </Text>
          </Button>
        )}
        <Button
          onPress={handleSearchByCar}
          className="flex h-[60px] w-full flex-row items-center justify-start gap-[16px] rounded-[8px] border border-[--Primary-Colors-Main] bg-[--Brand-Pure-White] p-[12px]"
        >
          <SearchByNewCarIcon />
          {/* <Image src={InactiveCarIcon} height={36} width={36} alt="car" /> */}
          <Text className="font-Overpass text-[20px] font-[700] leading-[22px] text-[--Primary-Colors-Main]">
            {getLabel("search_by_car")}
          </Text>
        </Button>
        <Button
          onPress={() => handleClick("oe")}
          className="flex h-[60px] w-full flex-row items-center justify-start gap-[16px] rounded-[8px] border border-[--Primary-Colors-Main] bg-[--Brand-Pure-White] p-[12px]"
        >
          <WrenchIcon />
          {/* <Image src={InactiveOEIcon} height={36} width={36} alt="car" /> */}
          <Text className="font-Overpass text-[20px] font-[700] leading-[22px] text-[--Primary-Colors-Main]">
            {getLabel("search_by_oe_ref")}
          </Text>
        </Button>
        <Button
          onPress={() => handleClick("category")}
          className="flex h-[60px] w-full flex-row items-center justify-start gap-[16px] rounded-[8px] border border-[--Primary-Colors-Main] bg-[--Brand-Pure-White] p-[12px]"
        >
          <DashboardIcon />
          {/* <Image src={InactiveCategoryIcon} height={36} width={36} alt="car" /> */}
          <Text className="font-Overpass text-[20px] font-[700] leading-[22px] text-[--Primary-Colors-Main]">
            {getLabel("search_by_oe_category")}
          </Text>
        </Button>
      </Box>
    </Box>
  );
}
