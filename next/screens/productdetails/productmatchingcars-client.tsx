"use client";
import React from "react";
import { Box } from "@/components/ui/box";
import { useParams } from "next/navigation";
import { CarBrand, CarItem } from "@/types/cars";
import { useBranding } from "@/contexts/BrandingContext";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import CheckCompatibility from "./components/CheckCompatibility";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import Productcompatibilityverify from "./productcompatibilityverify";
import ProductcompatibilityverifyLegacy from "./productcompatibilityverify-legacy";
import { OGAlert } from "@/components/og-components/OGAlert";
import SavedCarCompatibilityList from "./components/SavedCarCompatibilityList";
import CompatibleCarList from "./components/CompatibleCarList";
import {
  isCompatibleCarSectionEnabled,
  isNewMmeFeatureEnabledForCountry,
} from "@/utils/legacyCarCompatibility";
import { usePartCompatibleCarsQuery } from "@/hooks/usePartCompatibleCars";
import { useUserCarsApiIdsForCompatibility } from "@/hooks/useUserCarsApiIdsForCompatibility";
import {
  buildSavedCompatibleGroups,
  groupCompatibleCarsByMake,
  toCarBrandGroups,
} from "@/utils/partCompatibleCars";

const ProductMatchingCarsClient = ({
  product,
  matchingcars,
}: {
  product?: any;
  matchingcars: any;
}) => {
  const params = useParams();
  const partId = params?.partid as string | null;
  const { getLabel } = useBranding();
  const { savedCars: savedCarsFromContext } = useSavedCars();

  // This component only ever mounts client-side (dynamic import with
  // ssr: false in page.tsx), so `window` is always available on the very
  // first render — no need to gate these behind a post-mount `isMounted`
  // flip, which previously forced an extra client-only re-render/layout
  // switch unrelated to actual data loading.
  const compatibleSectionEnabled = isCompatibleCarSectionEnabled();
  const useCarsApiPath = isNewMmeFeatureEnabledForCountry();

  const { data: partCompatibleResponse, isPending: isPartCompatibleLoading } =
    usePartCompatibleCarsQuery(useCarsApiPath && compatibleSectionEnabled ? partId : null);
  const savedCarApiIds = useUserCarsApiIdsForCompatibility();

  const allSavedCarsData = React.useMemo(() => {
    if (!savedCarsFromContext || savedCarsFromContext.length === 0) {
      return { data: [] };
    }
    return { data: savedCarsFromContext };
  }, [savedCarsFromContext]);

  /**
   * Groups car items by brand name and merges year ranges for the same model/type.
   * If the user is authenticated and has saved cars, it separates them into a "Saved" group.
   *
   * @param data - Array of matching car items
   * @returns Object containing savedCars and groupedCars
   */
  const groupByBrand = (
    data: CarItem[],
  ): { savedCars: CarBrand | null; groupedCars: CarBrand[] } => {
    const savedCarFeatureFlag = getClientFeatureFlag("saved_car_feature_flag");
    const grouped: Record<string, CarBrand> = {};

    const savedCarIds = new Set(
      allSavedCarsData?.data?.map((car: any) => String(car.makeModelTypeId)) || [],
    );

    const matchingCarIds = new Set(data.map((item) => String(item.id)));

    // 3. Prepare the "Saved Cars" list for the user
    let savedcars: CarBrand | null = null;
    if (savedCarFeatureFlag && allSavedCarsData?.data && allSavedCarsData.data.length > 0) {
      savedcars = {
        brandId: "saved-cars",
        brandName: getLabel("Productdetailed_saved_carlist") || "",
        isSaved: true,
        items: allSavedCarsData.data.map((item: any) => {
          const ifInMatchingList = [matchingCarIds].some((a: any) => {
            return a.has(item.makeModelTypeId);
          });

          return {
            ...item,
            isMatching: ifInMatchingList,
          };
        }),
      };
    }

    data.forEach((item) => {
      const isUserSaved = savedCarIds.has(String(item.id));
      if (isUserSaved && savedCarFeatureFlag) {
        return;
      }

      const { brandId, brandName, modelName, typeName, year } = item;
      const makemodelType = `${modelName} ${typeName}`;

      if (!grouped[brandName]) {
        grouped[brandName] = { brandId, brandName, items: [] };
      }

      grouped[brandName].items.push({
        ...item,
        makemodelType,
        year,
      });
    });

    const mergedyear = Object.values(grouped).map((brand) => {
      const brandgrouped = new Map<string, any>();

      for (const item of brand.items) {
        const extendedItem = item as CarItem & { makemodelType: string };
        const key = extendedItem.id;

        brandgrouped.set(key, { ...item, yearStart: item.year, yearEnd: item.year });
      }

      return {
        ...brand,
        items: Array.from(brandgrouped.values()),
      };
    });

    return {
      savedCars: savedcars,
      groupedCars: mergedyear,
    };
  };

  const savedCarFeatureFlag = getClientFeatureFlag("saved_car_feature_flag");

  const newMmeCompatibility = React.useMemo(() => {
    if (!useCarsApiPath || !compatibleSectionEnabled) {
      return { savedGroups: [] as CarBrand[], allGroups: [] as CarBrand[] };
    }

    const compatibleCars = [...(partCompatibleResponse?.data ?? [])];
    const savedGroups = savedCarFeatureFlag
      ? toCarBrandGroups(buildSavedCompatibleGroups(savedCarApiIds, compatibleCars), {
          isSaved: true,
        })
      : [];
    const allGroups = toCarBrandGroups(groupCompatibleCarsByMake(compatibleCars));

    return { savedGroups, allGroups };
  }, [
    useCarsApiPath,
    compatibleSectionEnabled,
    partCompatibleResponse?.data,
    savedCarApiIds,
    savedCarFeatureFlag,
  ]);

  // Compatible cars accordions — gated by compatible_car_section_flag (see docs/new-car-compatibility-with-cars.md).
  // Guaranteed VIN Verification: hidden when E2E VIN banner owns PDP fit check (flag on).
  const hideMidPdpVinVerify = getClientFeatureFlag("end_to_end_vin_flow_feature_flag");
  const useVinApiFlow = getClientFeatureFlag("checkout_vin_api_flow_feature_flag");

  const renderMidPdpVinVerify = (showPotentialCompatibilitySection: boolean) =>
    useVinApiFlow ? (
      <Productcompatibilityverify
        data={product}
        partId={partId ?? ""}
        showPotentialCompatibilitySection={showPotentialCompatibilitySection}
      />
    ) : (
      <ProductcompatibilityverifyLegacy
        data={product}
        showPotentialCompatibilitySection={showPotentialCompatibilitySection}
      />
    );

  if (!compatibleSectionEnabled) {
    if (hideMidPdpVinVerify) return null;
    return (
      <Box className="flex w-full flex-col">
        <Box className="mb-16 h-[1px] w-full bg-color-border-default" />
        {renderMidPdpVinVerify(false)}
      </Box>
    );
  }

  if (useCarsApiPath) {
    const { savedGroups, allGroups } = newMmeCompatibility;
    const showPotentialCompatibilitySection =
      isPartCompatibleLoading || savedGroups.length > 0 || allGroups.length > 0;
    const savedCarsTitle = getLabel("Productdetailed_saved_carlist") || "Saved Cars";

    return (
      <Box className="flex w-full flex-col">
        <Box className="w-full flex-col gap-stack">
          {getClientFeatureFlag("engine_trim_feature_flag") && (
            <CheckCompatibility partId={partId} />
          )}
          <Box className="mb-16 h-[1px] w-full bg-color-border-default" />
        </Box>

        {!hideMidPdpVinVerify && renderMidPdpVinVerify(showPotentialCompatibilitySection)}

        {isPartCompatibleLoading && <CompatibleCarList groupedCars={[]} isLoading />}

        {!isPartCompatibleLoading && showPotentialCompatibilitySection && (
          <Box className="flex w-full flex-col gap-space-md">
            <SavedCarCompatibilityList
              groupedSavedCars={savedGroups}
              sectionTitle={savedCarsTitle}
            />
            <CompatibleCarList groupedCars={allGroups} />
            <Box className="w-full">
              <OGAlert
                variant="info"
                title=""
                description={getLabel("compatible_Car_info_note") || ""}
              />
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  const matchingData: CarItem[] = Array.isArray(matchingcars?.data) ? matchingcars.data : [];

  // Legacy MakeModelType path
  const { savedCars, groupedCars } = groupByBrand(matchingData);
  const showPotentialCompatibilitySection =
    groupedCars.length > 0 || (savedCars != null && savedCars.items.length > 0);

  return (
    <Box className="flex w-full flex-col">
      <Box className="w-full flex-col gap-stack">
        {getClientFeatureFlag("engine_trim_feature_flag") && <CheckCompatibility partId={partId} />}
        <Box className="mb-16 h-[1px] w-full bg-color-border-default" />
      </Box>

      {!hideMidPdpVinVerify && renderMidPdpVinVerify(showPotentialCompatibilitySection)}

      {showPotentialCompatibilitySection && (
        <Box className="flex w-full flex-col gap-space-md">
          <SavedCarCompatibilityList legacySavedCars={savedCars} sectionTitle="" />
          <CompatibleCarList groupedCars={groupedCars} />
          <Box className="w-full">
            <OGAlert
              variant="info"
              title=""
              description={getLabel("compatible_Car_info_note") || ""}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProductMatchingCarsClient;
