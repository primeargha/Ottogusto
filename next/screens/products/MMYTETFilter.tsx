import React, { useState } from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionContent,
  AccordionContentText,
  AccordionIcon,
} from "@/components/ui/accordion";
import activeArrowUp from "@/public/assets/results/active-arrow-up.svg";
import activeArrowDown from "@/public/assets/results/active-arrow-down.svg";
import inactiveArrowDown from "@/public/assets/results/inactive-arrow-down.svg";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import { useBranding } from "@/contexts/BrandingContext";
import { OGButton } from "@/components/og-components/OGButton";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import MobileSearchDropdown from "../og-search/MobileSearchDropdown";

type BodyAccordionContentProps = {
  prefillDone: boolean | undefined;
  onSaveSuccess?: () => void | undefined;
};
// Body Accordion Content Component
const BodyAccordionContent = ({ prefillDone, onSaveSuccess }: BodyAccordionContentProps) => {
  const { searchData, searchResults, setSearchValue, updateSearchData, setSearchData } =
    useSearchModalStore();
  const { getLabel } = useBranding();

  // Custom onSelect for BODY fields
  const handleBodySelect =
    (field: "make" | "model" | "year" | "type") => (option: { key: string; value: string }) => {
      // Only call updateSearchData which has the smart logic
      // Don't override with setSearchData as it bypasses the smart logic
      if (typeof updateSearchData === "function") {
        updateSearchData(option);
      }
    };

  return (
    <Box className="flex flex-col">
      <MobileSearchDropdown
        label={getLabel("make")}
        placeholder={getLabel("add_make")}
        isVisible={true}
        value={searchData.make?.value || ""}
        options={searchResults}
        onSearch={setSearchValue}
        onSelect={handleBodySelect("make")}
        classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px] h-full"
        step={1}
      />

      <Box className="w-full border border-[--background-beige-800] shadow-[0px_4px_8px_rgba(0,0,0,0.05)]" />

      <MobileSearchDropdown
        label={getLabel("model")}
        placeholder={getLabel("add_model")}
        isVisible={!!searchData.make?.value}
        value={searchData.model?.value || ""}
        options={searchResults}
        onSearch={setSearchValue}
        onSelect={handleBodySelect("model")}
        classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px] h-full"
        step={2}
      />

      <Box className="w-full border border-[--background-beige-800] shadow-[0px_4px_8px_rgba(0,0,0,0.05)]" />

      <MobileSearchDropdown
        label={getLabel("year")}
        placeholder={getLabel("add_year")}
        isVisible={!!searchData.make?.value && !!searchData.model?.value}
        value={searchData.year?.value || ""}
        options={searchResults}
        onSearch={setSearchValue}
        onSelect={handleBodySelect("year")}
        classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px] h-full"
        step={3}
      />

      <Box className="w-full border border-[--background-beige-800] shadow-[0px_4px_8px_rgba(0,0,0,0.05)]" />

      <MobileSearchDropdown
        label={getLabel("type")}
        placeholder={getLabel("add_type")}
        isVisible={
          !!searchData.make?.value && !!searchData.model?.value && !!searchData.year?.value
        }
        value={searchData.type?.value || ""}
        options={searchResults}
        onSearch={setSearchValue}
        onSelect={handleBodySelect("type")}
        classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px] h-full"
        step={4}
      />
    </Box>
  );
};

// Engine Accordion Content Component
const EngineAccordionContent = () => {
  const { searchData, setSearchData, addToPreviousSearches } = useSearchModalStore();
  const { getLabel } = useBranding();

  // Get dropdown arrays from global state
  const engineSize = useSearchModalStore((s) => s.engineSize);
  const fuel = useSearchModalStore((s) => s.fuel);
  const powerHp = useSearchModalStore((s) => s.powerHp);

  // Convert global state arrays to dropdown options format
  const ccOptions = engineSize?.map((cc: any) => ({ key: cc, value: cc }));
  const hpOptions = powerHp?.map((hp: any) => ({ key: hp, value: hp }));
  const fuelOptions = fuel?.map((fuelItem: any) => ({ key: fuelItem, value: fuelItem }));

  const handleEngineSelect = (field: "cc" | "fuel" | "hp", value: string) => {
    const updatedData = { ...searchData, [field]: value };
    setSearchData(updatedData);
  };

  return (
    <Box className="relative z-[99999] ml-0 mt-[2px] px-0 pb-4">
      <Box className="flex flex-col gap-0">
        {/* CC Dropdown */}
        <MobileSearchDropdown
          label={getLabel("cc")}
          placeholder={getLabel("add_cc")}
          isVisible={true}
          value={searchData.cc || ""}
          options={ccOptions}
          onSearch={() => {}} // No search for simple dropdowns
          onSelect={(data) => handleEngineSelect("cc", data.value)}
          classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px] h-full"
          step={5}
        />

        {/* Fuel Dropdown */}
        <MobileSearchDropdown
          label={getLabel("fuel")}
          placeholder={getLabel("add_fuel")}
          isVisible={true}
          value={searchData.fuel || ""}
          options={fuelOptions}
          onSearch={() => {}} // No search for simple dropdowns
          onSelect={(data) => handleEngineSelect("fuel", data.value)}
          classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px] h-full"
          step={5}
        />

        {/* HP Dropdown */}
        <MobileSearchDropdown
          label={getLabel("hp")}
          placeholder={getLabel("add_hp")}
          isVisible={true}
          value={searchData.hp || ""}
          options={hpOptions}
          onSearch={() => {}} // No search for simple dropdowns
          onSelect={(data) => handleEngineSelect("hp", data.value)}
          classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px] h-full"
          step={5}
        />
      </Box>
    </Box>
  );
};

// Trim Accordion Content Component
const TrimAccordionContent = () => {
  const { searchData, setSearchData } = useSearchModalStore();
  const { getLabel } = useBranding();

  // Get dropdown arrays from global state
  const body = useSearchModalStore((s) => s.body);
  const doors = useSearchModalStore((s) => s.doors);
  const variant = useSearchModalStore((s) => s.variant);

  // Convert global state arrays to dropdown options format
  const bodyOptions = body?.map((bodyItem: any) => ({ key: bodyItem, value: bodyItem }));
  const doorsOptions = doors?.map((doorsItem: any) => ({ key: doorsItem, value: doorsItem }));
  const variantOptions = variant?.map((variantItem: any) => ({
    key: variantItem,
    value: variantItem,
  }));

  const handleTrimSelect = (field: "body" | "doors" | "variant", value: string) => {
    const updatedData = { ...searchData, [field]: value };
    setSearchData(updatedData);
  };

  return (
    <Box className="flex flex-col">
      <Box className="flex flex-col gap-0">
        {/* Body Dropdown */}
        <MobileSearchDropdown
          label={getLabel("Frame")}
          placeholder={getLabel("add_frame")}
          isVisible={true}
          value={searchData.body || ""}
          options={bodyOptions}
          onSearch={() => {}} // No search for simple dropdowns
          onSelect={(data) => handleTrimSelect("body", data.value)}
          classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px] h-full"
          step={6}
        />

        {/* Doors Dropdown */}
        <MobileSearchDropdown
          label={getLabel("doors")}
          placeholder={getLabel("add_doors")}
          isVisible={true}
          value={searchData.doors || ""}
          options={doorsOptions}
          onSearch={() => {}} // No search for simple dropdowns
          onSelect={(data) => handleTrimSelect("doors", data.value)}
          classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px] h-full"
          step={6}
        />

        {/* Variant Dropdown */}
        <MobileSearchDropdown
          label={getLabel("variant")}
          placeholder={getLabel("add_variant")}
          isVisible={true}
          value={searchData.variant || ""}
          options={variantOptions}
          onSearch={() => {}} // No search for simple dropdowns
          onSelect={(data) => handleTrimSelect("variant", data.value)}
          classNames="border-l border-[--primary-colors-primary-dark] min-h-[46px] flex flex-row items-center pl-[12px] h-full"
          step={6}
        />
      </Box>
    </Box>
  );
};

// imp desktop MMYTP new comp.

const MMYTETFilter = ({
  prefillDone,
  onSaveSuccess,
}: {
  prefillDone?: boolean | undefined;
  onSaveSuccess?: () => void | undefined;
}) => {
  const [openItem, setOpenItem] = useState<string | null | any>(null);

  // Check if engine_trim feature flag is enabled
  const isEngineTrimEnabled = getClientFeatureFlag("engine_trim_feature_flag");

  // Use the old store for step management
  const currentStep = useSearchModalStore((s) => s.currentStep);
  const setCurrentStep = useSearchModalStore((s) => s.setCurrentStep);
  const searchData = useSearchModalStore((s) => s.searchData);
  const getLabel = useBranding().getLabel;

  // Get dropdown arrays from global state
  const engineSize = useSearchModalStore((s) => s.engineSize);
  const fuel = useSearchModalStore((s) => s.fuel);
  const powerHp = useSearchModalStore((s) => s.powerHp);
  const body = useSearchModalStore((s) => s.body);
  const doors = useSearchModalStore((s) => s.doors);
  const seats = useSearchModalStore((s) => s.seats);
  const variant = useSearchModalStore((s) => s.variant);
  const fetchEngineTrimData = useSearchModalStore((s) => s.fetchEngineTrimData);
  const getMakeModelTypeId = useSearchModalStore((s) => s.getMakeModelTypeId);
  const addToPreviousSearches = useSearchModalStore((s) => s.addToPreviousSearches);

  // Sync with new store
  const setNewSearchData = useNewSearchModalStore((s) => s.setSearchData);

  // Fetch engine/trim data when searchData changes for steps 1-4
  const lastMmtIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const run = async () => {
      // Fetch engine/trim data when searchData changes for steps 1-4
      if (currentStep >= 1 && currentStep <= 4) {
        try {
          // Get mmtId from URL first, then fallback to getMakeModelTypeId
          let mmtId: string | null = null;
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            mmtId = params.get("makeModelTypeId");
          }

          // If no URL parameter, use the function
          if (!mmtId) {
            mmtId = getMakeModelTypeId();
          }

          // Prevent duplicate API calls for the same mmtId
          if (mmtId && mmtId !== lastMmtIdRef.current) {
            lastMmtIdRef.current = mmtId;
            await fetchEngineTrimData(mmtId);
          } else if (mmtId) {
          }
        } catch (error) {
          console.error("❌ Error fetching engine/trim data:", error);
        }
      }
    };
    run();
  }, [currentStep, searchData, getMakeModelTypeId, fetchEngineTrimData]);

  // Sync searchData with new store whenever it changes
  React.useEffect(() => {
    // Convert old store format to new store format
    const newStoreData = {
      make: searchData.make,
      model: searchData.model,
      year: searchData.year,
      type: searchData.type,
      cc: searchData.cc || "",
      fuel: searchData.fuel || "",
      hp: searchData.hp || "",
      body: searchData.body || "",
      doors: searchData.doors || "",
      variant: searchData.variant || "",
    };

    // Get current new store data to compare
    const currentNewStoreData = useNewSearchModalStore.getState().searchData;

    // Only sync if the data is actually different to prevent infinite loops
    const isDataDifferent = JSON.stringify(newStoreData) !== JSON.stringify(currentNewStoreData);

    if (isDataDifferent) {
      setNewSearchData(newStoreData);
    } else {
    }
  }, [searchData, setNewSearchData]);

  // Helper to get dash-separated summary for each group
  const getGroupSummary = (group: "body" | "engine" | "trim") => {
    if (group === "body") {
      const vals = [
        searchData.make?.value,
        searchData.model?.value,
        searchData.year?.value,
        searchData.type?.value,
      ].filter(Boolean);
      if (vals.length === 0) return "Add Body";
      const joined = vals.join("-");
      return joined.length > 15 ? joined.slice(0, 15) + "..." : joined;
    }
    if (group === "engine") {
      const vals = [searchData.cc, searchData.hp, searchData.fuel].filter(Boolean);
      if (vals.length === 0) return "Add Engine";
      const joined = vals.join("-");
      return joined.length > 15 ? joined.slice(0, 15) + "..." : joined;
    }
    if (group === "trim") {
      const vals = [searchData.body, searchData.doors, searchData.variant].filter(Boolean);
      if (vals.length === 0) return "Add Trim";
      const joined = vals.join("-");
      return joined.length > 15 ? joined.slice(0, 15) + "..." : joined;
    }
    return "";
  };

  const handleItemToggle = (value: string | string[] | undefined) => {
    // Set step based on which accordion is being opened
    let itemKey = Array.isArray(value) ? value[0] : value;
    if (itemKey === "body") setCurrentStep(1);
    else if (itemKey === "engine") setCurrentStep(5);
    else if (itemKey === "trim") setCurrentStep(6);

    // Handle closing case (when value is undefined, empty array, or empty string)
    if (!value || (Array.isArray(value) && value.length === 0) || value === "") {
      setOpenItem(null);
      return;
    }

    // Extract the string value from array or use string directly
    const valueStr = Array.isArray(value) ? value[0] : value;

    // If the extracted value is empty or falsy, close the accordion
    if (!valueStr || valueStr === "") {
      setOpenItem(null);
      return;
    }

    // Handle opening case - toggle between the value and null
    const newOpenItem = openItem === valueStr ? null : valueStr;

    setOpenItem(newOpenItem);
  };

  // Determine which accordion is active based on current step (same logic as LeftPanel.tsx)
  const getActiveAccordion = () => {
    if (currentStep >= 1 && currentStep <= 4) return "body";
    if (currentStep === 5) return "engine";
    if (currentStep === 6) return "trim";
    return null;
  };

  const getArrowIcon = (itemKey: string) => {
    const isOpen = openItem === itemKey;
    const isActive = getActiveAccordion() === itemKey;

    if (isOpen && isActive) {
      return activeArrowUp;
    } else if (!isOpen && isActive) {
      return activeArrowDown;
    } else {
      return inactiveArrowDown;
    }
  };

  // Helper functions to check if groups have data (same as LeftPanel.tsx)
  const hasBodyGroupData = () => {
    return (
      !!searchData.make?.value ||
      !!searchData.model?.value ||
      !!searchData.year?.value ||
      !!searchData.type?.value
    );
  };

  const hasEngineGroupData = () => {
    return !!searchData.cc || !!searchData.fuel || !!searchData.hp;
  };

  const hasTrimGroupData = () => {
    return !!searchData.body || !!searchData.doors || !!searchData.variant;
  };

  const { updateFilters } = useUrlParams();
  // For change detection (same as MMYTFilter)
  const initialSearchDataRef = React.useRef(searchData);
  const hasSetInitialRef = React.useRef(false);
  React.useEffect(() => {
    if (prefillDone && !hasSetInitialRef.current) {
      initialSearchDataRef.current = searchData;
      hasSetInitialRef.current = true;
    }
    if (!prefillDone) {
      hasSetInitialRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillDone]);
  const isChanged = JSON.stringify(searchData) !== JSON.stringify(initialSearchDataRef.current);
  const isTrulyChanged = prefillDone && hasSetInitialRef.current && isChanged;

  // Search button logic (same as MMYTFilter, but with extra fields)
  const handleFilterProductsByMMYTET = React.useCallback(async () => {
    let makeModelTypeId: string | null = null;
    if (typeof getMakeModelTypeId === "function") {
      makeModelTypeId = getMakeModelTypeId();
    }
    updateFilters({
      makeModelTypeId,
      year: searchData.year?.value || null,
      cc: searchData.cc || undefined || null,
      fuel: searchData.fuel || undefined || null,
      hp: searchData.hp || undefined || null,
      body: searchData.body || undefined || null,
      doors: searchData.doors || undefined || null,
      variant: searchData.variant || undefined || null,
    });
    // addToPreviousSearches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, updateFilters, getMakeModelTypeId, addToPreviousSearches]);

  return (
    <Box className="mb-[24px] flex w-full flex-col gap-[24px] base:mt-[24px] ml:mt-0 ml:h-auto">
      <Box className="relative">
        {/* Vertical line on the left */}
        <Box className="absolute left-0 top-0 h-full w-[2px] bg-[--l2-l3-categories-title]" />

        <Accordion
          key={openItem || "closed"}
          type="single"
          //@ts-ignore
          collapsible
          value={openItem || undefined}
          onValueChange={handleItemToggle}
          className="relative z-[99999] space-y-0"
        >
          {/* Body Accordion Item */}
          <AccordionItem value="body" className="border-none">
            <AccordionHeader className="ml-0">
              <AccordionTrigger
                className={`relative flex min-h-[48px] items-center border-l border-[--l2-l3-categories-title] px-0 py-4 ${openItem === "body" ? "justify-center" : "justify-between"}`}
              >
                {/* need to fix UI here */}
                <Text
                  className={`ml-3 font-bold ${getActiveAccordion() === "body" ? "text-[--l2-l3-categories-title]" : "text-[--text-white-light]"}`}
                >
                  Body
                </Text>
                {openItem !== "body" &&
                  ((
                    <>
                      <Text className="text-[--text-white-light]">{getGroupSummary("body")}</Text>
                      <Image
                        src={getArrowIcon("body")}
                        alt="arrow"
                        width={20}
                        height={20}
                        className="transition-all duration-200"
                      />
                    </>
                  ) as any)}

                {openItem === "body" && (
                  <Image
                    src={getArrowIcon("body")}
                    alt="arrow"
                    width={20}
                    height={20}
                    className="absolute right-0 transition-all duration-200"
                  />
                )}
              </AccordionTrigger>
            </AccordionHeader>
            {openItem && (
              <AccordionContent className="relative z-[99999] ml-0 mt-[2px] px-0 pb-4">
                <BodyAccordionContent
                  prefillDone={prefillDone}
                  onSaveSuccess={onSaveSuccess as any}
                />
              </AccordionContent>
            )}
          </AccordionItem>

          {/* Only show Engine and Trim accordions if engine_trim feature flag is enabled */}
          {isEngineTrimEnabled && (
            <>
              {/* 8px gap between groups */}
              <div className="h-2" />

              {/* Engine Accordion Item */}
              <AccordionItem value="engine" className="border-none">
                <AccordionHeader className="ml-0">
                  <AccordionTrigger
                    className={`relative flex min-h-[48px] items-center border-l border-[--l2-l3-categories-title] px-0 py-4 ${openItem === "engine" ? "justify-center" : "justify-between"}`}
                  >
                    <Text
                      className={`ml-3 font-bold ${getActiveAccordion() === "engine" ? "text-[--l2-l3-categories-title]" : "text-[--text-white-light]"}`}
                    >
                      Engine
                    </Text>

                    {openItem !== "engine" &&
                      ((
                        <>
                          <Text className="text-[--text-white-light]">
                            {getGroupSummary("engine")}
                          </Text>
                          <Image
                            src={getArrowIcon("engine")}
                            alt="arrow"
                            width={20}
                            height={20}
                            className="transition-all duration-200"
                          />
                        </>
                      ) as any)}
                    {openItem === "engine" && (
                      <Image
                        src={getArrowIcon("engine")}
                        alt="arrow"
                        width={20}
                        height={20}
                        className="absolute right-0 transition-all duration-200"
                      />
                    )}
                  </AccordionTrigger>
                </AccordionHeader>
                {openItem && (
                  <AccordionContent className="relative z-[99999] ml-0 mt-[2px] px-0 pb-4">
                    <EngineAccordionContent />
                  </AccordionContent>
                )}
              </AccordionItem>

              {/* 8px gap between groups */}
              <div className="h-2" />

              {/* Trim Accordion Item */}
              <AccordionItem value="trim" className="border-none">
                <AccordionHeader className="ml-0">
                  <AccordionTrigger
                    className={`relative flex min-h-[48px] items-center border-l border-[--l2-l3-categories-title] px-0 py-4 ${openItem === "trim" ? "justify-center" : "justify-between"}`}
                  >
                    <Text
                      className={`ml-3 font-bold ${getActiveAccordion() === "trim" ? "text-[--l2-l3-categories-title]" : "text-[--text-white-light]"}`}
                    >
                      Trim
                    </Text>
                    {openItem !== "trim" &&
                      ((
                        <>
                          <Text className="text-[--text-white-light]">
                            {getGroupSummary("trim")}
                          </Text>
                          <Image
                            src={getArrowIcon("trim")}
                            alt="arrow"
                            width={20}
                            height={20}
                            className="transition-all duration-200"
                          />
                        </>
                      ) as any)}
                    {openItem === "trim" && (
                      <Image
                        src={getArrowIcon("trim")}
                        alt="arrow"
                        width={20}
                        height={20}
                        className="absolute right-0 transition-all duration-200"
                      />
                    )}
                  </AccordionTrigger>
                </AccordionHeader>
                {openItem && (
                  <AccordionContent className="relative z-[99999] ml-0 mt-[2px] px-0 pb-4">
                    <TrimAccordionContent />
                  </AccordionContent>
                )}
              </AccordionItem>
            </>
          )}
        </Accordion>
      </Box>

      {/* Search Button */}
      <Box className="mt-4">
        <OGButton
          onClick={handleFilterProductsByMMYTET}
          className="w-full ml:flex"
          leftcomp={<Image src={AdvancedSearchIcon} alt="Save" height={20} width={20} />}
          disabled={!searchData.make?.value || !isTrulyChanged}
        >
          {getLabel("search")}
        </OGButton>
      </Box>
    </Box>
  );
};

export default MMYTETFilter;
