import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { CheckIcon, CloseIcon, Icon } from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import { categoryIcons } from "@/constants";
import { ScrollView } from "@/components/ui/scroll-view";
import { PartsCategoryInterface, useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useBranding } from "@/contexts/BrandingContext";
import { Pressable } from "@/components/ui/pressable";
import { Badge } from "@/components/ui/badge";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { set } from "zod";
import { OGButton } from "@/components/og-components/OGButton";
import { OGCheckbox } from "@/components/og-components/OGCheckbox";
import OGPill from "@/components/og-components/OGPill";
import { useMedia } from "@/hooks/useMedia";
import { useUrlParams } from "@/hooks/useUrlParams";
import { pickPrimaryCategoryId } from "@/utils/categorySearchUrl";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import { useCategories } from "@/contexts/CategoriesContext";
import { flattenTree, getTitleOfCategory } from "@/helpers/UtilityHelper";
import { getCategories } from "@/services/advancedSearchService";
import AdvSearchHeader from "./adv-search-header";
import CategoryList from "./category-list";
import MobileL2L3Block from "./mobile-l2-l3-block";

const DottedDivider = () => {
  return <Box className="mb-6 mt-3 border-2 border-dotted"></Box>;
};

export const L1CategoriesBlock = () => {
  const {
    fetchL1Categories,
    L1Categories,
    gotoStep,
    setSelectedCategories,
    addToPreviousSearchesFromAdvSearch,
  } = useAdvancedSearchStore();
  // useEffect(()=>{
  // },[]);
  // return <></>;
  return (
    <CategoryList
      categories={L1Categories}
      gotoStep={gotoStep}
      setSelectedCategories={(data: any) => {
        setSelectedCategories(data);
        // should be added once the search/quick search is clicked
        // addToPreviousSearchesFromAdvSearch([data]);
      }}
    />
  );
};

/**
 * Renders L2 Categories
 * @returns
 */
const L2CategoriesBlock = () => {
  const { appendToFilteredList, ifPartialSelected, inFilteredList, L2Categories } =
    useAdvancedSearchStore();
  const l2listRef = useRef<any>(null);
  const { getLabel, getLocale } = useBranding();
  const getTitleOf = (category: any) => {
    // title fix safe code
    if (!category) {
      return "";
    }
    const { titles = [], name } = category;
    return titles[getLocale()] !== undefined ? titles[getLocale()] : name;
  };

  const handleL3CategorySelection = () => {
    // Preserve scroll position
    //@ts-ignore
    const scrollTop: number = l2listRef.current?.scrollTop || l2listRef?.scrollTop || 0;

    // Restore scroll position after state update
    setTimeout(() => {
      if (l2listRef.current) {
        l2listRef.current.scrollTop = scrollTop;
      }
    }, 0);
  };
  useEffect(() => {}, []);
  return (
    <ScrollView ref={l2listRef} className="h-full w-full px-[27px] pt-[24px]">
      {L2Categories?.map((l2cat, index) => {
        return (
          <Box key={index}>
            <OGCheckbox
              type="title"
              selected={inFilteredList(l2cat.id)}
              partial={ifPartialSelected(l2cat.id)}
              value={l2cat}
              disabled={false}
              defaultIsChecked={inFilteredList(l2cat.id) || ifPartialSelected(l2cat.id)}
              onChange={(e) => {
                appendToFilteredList(l2cat, e);
                handleL3CategorySelection();
              }}
              label={getTitleOf(l2cat)}
            />
            <Box className="line-clamp-2 grid grid-cols-3 pl-[12px] pt-[16px] text-[16px] between-0-640:grid-cols-1">
              {l2cat.children?.map((subcat: any, indx: number) => {
                let translatedLabel = subcat.name;
                if (!!subcat?.titles) {
                  translatedLabel =
                    subcat?.titles[getLocale()] !== undefined
                      ? subcat?.titles[getLocale()]
                      : subcat.name;
                }
                return (
                  <Box className="my-[8px]" key={indx}>
                    <OGCheckbox
                      key={subcat.id}
                      disabled={inFilteredList(subcat.parentId)}
                      defaultIsChecked={
                        inFilteredList(subcat.parentId) || inFilteredList(subcat.id)
                      }
                      className="my-3 p-0"
                      onChange={(e) => {
                        appendToFilteredList(subcat, e);
                        handleL3CategorySelection();
                      }}
                      label={translatedLabel}
                      selected={inFilteredList(subcat.parentId) || inFilteredList(subcat.id)}
                      partial={false}
                    />
                  </Box>
                );
              })}
            </Box>
            <DottedDivider />
          </Box>
        );
      })}
    </ScrollView>
  );
};

/**
 * Renders right section of selected filters
 * @returns
 */
let maxPillCount = 3;
export const SelectedFiltersBlock = () => {
  const { getLabel } = useBranding();
  const { data: nestedMasterCategoryList } = useCategories();
  const { searchData } = useSearchModalStore();
  const [ShowAllPills, setShowAllPills] = useState(false);
  const isMobile = useMedia("(max-width: 640px)");
  const {
    appendToFilteredList,
    // selectedCategories,
    filteredList,
    cleanSelectededCategories,
    L2Categories,
    gotoStep,
  } = useAdvancedSearchStore();

  const {
    SelectedCategories: selectedCategories,
    removeFromSelectedCategories,
    clearSelectedCategories,
  } = useCategorySearchStore();
  const { getLocale } = useBranding();
  const getTitle = (category: any) => {
    if (!category) {
      return "";
    }
    const { titles = [], name } = category;
    return titles[getLocale()] !== undefined ? titles[getLocale()] : name;
  };
  const FilterSectionTitle = () => {
    if (searchData.make == null) {
      return;
    }
    return (
      <OGPill
        label={`${searchData.make?.value || ""} ${searchData.model?.value || ""} ${searchData.type?.value || ""} ${searchData.year?.value || ""}`}
      />
    );
  };
  const getTitleCombined = useMemo(() => {
    // debugger;
    return (category: { parentId: string }) => {
      if (selectedCategories.length == 0) {
        return "";
      }
      if (category.parentId !== "root") {
        const patentCategory = flattenTree(nestedMasterCategoryList as any, "children").find(
          // @ts-ignore
          (itm) => itm?.id === category.parentId,
        );
        if (!patentCategory) {
          return `${getTitle(category)}`;
        }
        return `${getTitle(patentCategory)} - ${getTitle(category)}`;
      }
      return `${getTitle(category)}`;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L2Categories, selectedCategories]);

  const getPillsData = () => {
    let data: { label: string; remove?: () => void }[] = [];
    // debugger;

    // First Pill of Car details (Non Removable)
    if (searchData.make?.value) {
      data.push({
        label: `${searchData.make?.value || ""} ${searchData.model?.value || ""} ${searchData.type?.value || ""} ${searchData.year?.value || ""}`,
      });
    }

    if (selectedCategories.length > 0) {
      selectedCategories?.map((cat: any, indx: number) => {
        if (!cat.name) {
          return;
        }
        // if (isMobile && indx > 0) {
        //   return;
        // }

        data.push({
          label: getTitleCombined(cat) || "",
          remove: () => {
            // appendToFilteredList(cat, false); // Not needed anymore
            removeFromSelectedCategories(cat.id || "");
          },
        });
      });
    }

    return data;
  };

  useEffect(() => {
    // maxPillCount = 2;
    clearSelectedCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className={`px-[12px] ${isMobile ? "" : ""} pb between-0-640:mb-2`}>
      <Text className="font-Overpass text-xl font-bold leading-snug text-[--filter-pill-text-color] xs:hidden">
        {getLabel("selected_filters")}
        {/* {step} */}
      </Text>

      <Box className="flex flex-row flex-wrap gap-3 overflow-auto pb-[24px] md:max-h-[100%] md:pt-[24px]">
        {getPillsData()?.map((itm, indx) => {
          if (!ShowAllPills && indx > maxPillCount) {
            return null;
          }
          //@ts-ignore
          return <OGPill key={indx} label={itm.label} onRemove={itm.remove || undefined} />;
        })}
        {selectedCategories.length > maxPillCount && !ShowAllPills && (
          <OGPill
            label={`+${selectedCategories.length - maxPillCount}`}
            onShowMore={() => {
              setShowAllPills(true);
            }}
          />
        )}
        {ShowAllPills && (
          <Pressable
            className="mx-[6px] justify-center"
            onPress={() => {
              setShowAllPills(false);
            }}
          >
            <Box className="text-sm text-[--Primary-Colors-Main] underline">
              {getLabel("minimise_filter")}
            </Box>
          </Pressable>
        )}
      </Box>
    </Box>
  );
};

/**
 * Renders bottom footer button
 * @param param0
 * @returns
 */
const FooterBlock = ({ isMobile }: { isMobile: boolean }) => {
  const { getLabel } = useBranding();
  const { getMakeModelTypeId, searchData, carByVinResults } = useSearchModalStore();
  const { updateFilters } = useUrlParams();
  const { selectedCar } = useSelectedCarStore();
  const { addToPreviousSearchesFromAdvSearch, filteredList, closeAdvSearch } =
    useAdvancedSearchStore();
  const { SelectedCategories: selectedCategories, appendToSelectedCategories } =
    useCategorySearchStore();
  const handleAdvSearch = () => {
    // go to filter page with Latest L1/L2/L3 selected and MMYT id
    const makeModelTypeId = selectedCar?.makeModelTypeId || getMakeModelTypeId(); // OD-817
    // return;

    let combinedCategoriesL1nL2L3 = [...selectedCategories, ...filteredList];
    // if filteredList is empty the show L1
    const categoryIdsToSend = filteredList.length > 1 ? filteredList : combinedCategoriesL1nL2L3;
    const catIdList = categoryIdsToSend?.map((itm) => {
      if (itm.id.length <= 3 && categoryIdsToSend.length === 1) {
        appendToSelectedCategories(itm as PartsCategoryInterface);
        return itm.id;
      }
      // if only L1 selected then ignore this otherwise ignore L1 selection
      if (itm.id.length <= 3 && categoryIdsToSend.length <= 2) {
        return;
      }
      appendToSelectedCategories(itm as PartsCategoryInterface);
      return itm.id;
    });
    const makeModelTypeIdFinal = makeModelTypeId || carByVinResults[0]?.id || null;

    const categoryIdToSend = pickPrimaryCategoryId(
      catIdList.filter((id): id is string => typeof id === "string"),
    );

    // If no Car selected --> via OGSearch Page and SearchByCategories tab
    if (!makeModelTypeId) {
      updateFilters(
        {
          categoryId: categoryIdToSend,
        },
        "/products",
      );
      setTimeout(() => {
        closeAdvSearch();
      }, 2000);
      return;
    }

    updateFilters(
      {
        makeModelTypeId: makeModelTypeIdFinal,
        categoryId: categoryIdToSend,
        year: searchData?.year?.value || null,
      },
      "/products",
      undefined,
      true,
    );

    // addToPreviousSearchesFromAdvSearch([...filteredList, ...selectedCategories]);
    setTimeout(() => {
      closeAdvSearch();
    }, 2000);
  };
  return (
    <Box
      className={`${isMobile ? "bg-stone-100 p-3 shadow-[0px_-5px_20px_0px_rgba(0,0,0,0.12)]" : "px-3"} gtsm:rounded-[8px]`}
    >
      <OGButton
        size="medium"
        type="primary"
        onClick={handleAdvSearch}
        className="w-full"
        leftcomp={
          <Image
            src={"/assets/icons/ai-search-02.png"}
            alt="Advanced Search"
            width={20}
            height={20}
          />
        }
      >
        {getLabel("search")}
      </OGButton>
    </Box>
  );
};

/**
 * Will toggle left section based on Step Value
 * @param param0
 * @returns
 */
const StepBlock = ({ step }: { step: number }) => {
  const { selectedCategories, fetchCategoriesOf, L2Categories } = useAdvancedSearchStore();
  if (step == 1 || step == 2) {
    return <L1CategoriesBlock />;
    // return <Step1 />;
  }

  // For mobile and OGSearch
  if (step == 3) {
    // fetchCategoriesOf(selectedCategories[0].id);

    // const { data } = await getCategories(selectedCategories[0].id);
    //@ts-ignore
    return <MobileL2L3Block categories={L2Categories} id={selectedCategories[0].id} />;
  }
  // if (step == 2) {
  //   return <L2CategoriesBlock />;
  //   // return <Step2 />;
  // }
};

/**
 * Left main container that shows loader untill API call and then renders the L1,L2,L3 selection boxes
 * @param param0
 * @returns
 */
const MainContainerBlock = ({ step }: { step: number }) => {
  const { isFetchingData } = useAdvancedSearchStore();
  const { getLabel } = useBranding();
  const isMobile = useMedia("(max-width: 640px)");
  return (
    <Box className={`h-full ${isMobile ? "" : ""}`}>
      {isFetchingData ? (
        <Box className="h-[100vh] w-full content-center items-center justify-center">
          <Spinner size="large" color="#0a4932" />
          <></>
        </Box>
      ) : (
        <Box className="mt-0 px-[12px]">
          <Box className={`${isMobile ? "mt-1" : ""}`}></Box>
          <StepBlock step={step} />
        </Box>
      )}
    </Box>
  );
};

export const AdvancedSearchModal = () => {
  const { getLabel, getLocale } = useBranding();
  const isMobile = useMedia("(max-width: 640px)");
  const {
    isAdvSearchOpen,
    closeAdvSearch,
    gotoStep,
    step,
    selectedCategories,
    setSelectedCategories,
    cleanSelectededCategories,
    fetchL1Categories,
    setL1CategoriesFromNested,
    L1Categories,
    openVia,
  } = useAdvancedSearchStore();
  const { data: nestedCategories } = useCategories();
  const { setIsOgSearch, setOgSearchModalContent, openOgSearchModal, openModal } =
    useSearchModalStore();
  const backFromAdvSearch = () => {
    // if (step > 1) {
    //   cleanSelectededCategories();
    //   gotoStep(step - 1);
    // } else {
    //   closeAdvSearch(() => {
    //     openModal();
    //     setSelectedCategories([]);
    //   });
    // }
    setOgSearchModalContent("category");
    openOgSearchModal();
    setIsOgSearch(true);
  };

  useEffect(() => {
    if (!isAdvSearchOpen || step > 1) return;
    if (L1Categories.length > 0) return;
    if (nestedCategories?.length) {
      setL1CategoriesFromNested(nestedCategories);
    } else {
      fetchL1Categories();
    }
  }, [
    isAdvSearchOpen,
    step,
    L1Categories.length,
    nestedCategories,
    setL1CategoriesFromNested,
    fetchL1Categories,
  ]);

  if (!isAdvSearchOpen) {
    return null;
  }

  return (
    <Box className="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
      <Box className="w-full base:h-full gtsm:min-h-[865px] gtsm:pl-[30px] gtsm:pr-[30px]">
        <Box className="h-full w-full rounded-[8px] bg-color-background-l2 gtsm:mx-auto gtsm:mb-[104px] gtsm:mt-[110px] gtsm:h-fit gtsm:max-w-[1222px]">
          {/* Modal Header here */}
          {/* @ts-ignore */}
          <AdvSearchHeader
            labelText={
              selectedCategories?.length > 0
                ? getTitleOfCategory(selectedCategories[0], getLocale())
                : undefined
            }
            onClose={closeAdvSearch}
            onBack={backFromAdvSearch}
            getLabel={getLabel}
            openVia={openVia}
            step={step}
          />

          {/* =====================For mobile view==============================           */}
          <Box className="h-full gtsm:hidden">
            {/* Selected Filters */}
            <SelectedFiltersBlock />

            {/* Main selection container */}
            <MainContainerBlock step={step} />

            {/* Footer Button */}
            <FooterBlock isMobile={isMobile} />
          </Box>

          {/* =====================For tablet/desktop view==============================           */}
          <Box className="visible mb-[24px] grid grid-cols-12 between-0-640:hidden">
            <Box className="col-span-8 justify-between">
              <MainContainerBlock step={step} />
            </Box>
            <Box className="col-span-4 flex flex-col place-content-between justify-between md:border-l-2 md:border-[--neutral-chrome-600]">
              <SelectedFiltersBlock />
              <FooterBlock isMobile={isMobile} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
