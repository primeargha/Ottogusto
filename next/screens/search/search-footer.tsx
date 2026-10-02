import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import QuickSearchIcon from "@/assets/search/quick-search.svg";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import SearchArea from "@/assets/search/search-area.svg";
import Image from "next/image";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Text } from "@/components/ui/text";
import checkIcon from "@/assets/search/checkmark.svg";
import { useBranding } from "@/contexts/BrandingContext";
import ActiveByCar from "@/assets/search/by-car-btn-icon.svg";
import EditCar from "@/assets/eb-panel/white-pencil-edit-icon.svg";

interface SearchFooterProps {
  onQuickSearch: () => void;
  onAdvancedSearch: () => void;
  onSearchByVin: () => void;
  handleAddEditCarToEB: () => void;
  isAddEditCarToEBDisabled: boolean;
}

const SearchFooter = ({
  onQuickSearch,
  onAdvancedSearch,
  onSearchByVin,
  handleAddEditCarToEB,
  isAddEditCarToEBDisabled,
}: SearchFooterProps) => {
  const { searchMode, carByVinResults, searchData, isOgSearch, vinValidation, isEB, ebMode } =
    useSearchModalStore();
  const { getLabel } = useBranding();

  const renderActionButtons = () => {
    if (isEB) {
      return (
        <Box className="w-full px-[24px] py-[12px]">
          <OGButton
            onClick={handleAddEditCarToEB}
            disabled={isAddEditCarToEBDisabled}
            type="primary"
            size="large"
            className="flex w-full p-[12px] font-Overpass text-[16px] font-normal leading-[18px] base:flex-1 gtsm:flex-auto"
            leftcomp={
              <Image
                src={ebMode === "add" ? ActiveByCar : EditCar}
                alt={ebMode === "add" ? "Add new car to EB" : "Edit car in EB"}
                height={20}
                width={20}
              />
            }
          >
            {ebMode === "add" ? getLabel("add_new_car_to_eb_btn") : getLabel("edit_car_in_eb_btn")}
          </OGButton>
        </Box>
      );
    }

    if (searchMode === "vehicle") {
      if (isOgSearch) {
        return (
          <OGButton
            onClick={onAdvancedSearch}
            disabled={!searchData?.make?.value}
            type="primary"
            size="large"
            className="mx-[12px] h-full w-full p-[12px] font-Overpass text-[16px] font-normal leading-[18px] gtsm:w-auto"
            leftcomp={
              <Image src={AdvancedSearchIcon} alt="Advanced Search" height={24} width={24} />
            }
          >
            {getLabel("select_category")}
          </OGButton>
        );
      }

      return (
        <Box className="flex h-full flex-row gap-[16px]">
          <OGButton
            onClick={onQuickSearch}
            disabled={!searchData?.make?.value}
            type="outlined"
            size="medium"
            leftcomp={<Image src={QuickSearchIcon} alt="Quick Search" height={20} width={20} />}
          >
            {getLabel("quick_search")}
          </OGButton>
          <OGButton
            onClick={onAdvancedSearch}
            disabled={!searchData?.make?.value}
            type="primary"
            size="medium"
            leftcomp={
              <Image src={AdvancedSearchIcon} alt="Advanced Search" height={20} width={20} />
            }
          >
            {getLabel("advanced_search")}
          </OGButton>
        </Box>
      );
    }

    // VIN search mode
    if (isOgSearch) {
      return (
        <OGButton
          onClick={onAdvancedSearch}
          type="primary"
          size="large"
          className="mx-[12px] h-full w-full p-[12px] font-Overpass text-[16px] font-normal leading-[18px] gtsm:w-auto"
          leftcomp={<Image src={AdvancedSearchIcon} alt="Advanced Search" height={24} width={24} />}
        >
          {getLabel("select_category")}
        </OGButton>
      );
    }

    if (carByVinResults.length > 0) {
      return (
        <Box className="flex h-full flex-row gap-[16px]">
          <OGButton
            onClick={onQuickSearch}
            disabled={carByVinResults.length === 0}
            type="outlined"
            size="large"
            className="flex p-[12px] font-Overpass text-[16px] font-normal leading-[18px] base:flex-1 gtsm:flex-auto"
            leftcomp={<Image src={QuickSearchIcon} alt="Quick Search" height={20} width={20} />}
          >
            {getLabel("quick_search")}
          </OGButton>
          <OGButton
            onClick={onAdvancedSearch}
            disabled={carByVinResults.length === 0}
            type="primary"
            size="large"
            className="flex p-[12px] font-Overpass text-[16px] font-normal leading-[18px] base:flex-1 gtsm:flex-auto"
            leftcomp={
              <Image src={AdvancedSearchIcon} alt="Advanced Search" height={20} width={20} />
            }
          >
            {getLabel("advanced_search")}
          </OGButton>
        </Box>
      );
    }

    const hasSearchData =
      searchData.make?.value ||
      searchData.model?.value ||
      searchData.type?.value ||
      searchData.year?.value;

    return (
      <OGButton
        onClick={onSearchByVin}
        disabled={searchMode === "vin" && !vinValidation.isValid}
        type="primary"
        size="large"
        className="mx-[12px] h-full w-full p-[12px] font-Overpass text-[16px] font-normal leading-[18px] gtsm:w-auto"
        leftcomp={
          <Image
            src={hasSearchData ? checkIcon : SearchArea}
            alt={hasSearchData ? "Verify" : "Search Area"}
            height={20}
            width={20}
          />
        }
      >
        {hasSearchData ? getLabel("lookup_vin") : getLabel("search_for_car")}
      </OGButton>
    );
  };

  return (
    <Box className="flex h-auto w-full flex-row items-center justify-center rounded-b-md bg-color-background-l2 shadow-[0px_2px_20px_10px_rgba(0,0,0,0.05)] base:mt-[24px] base:py-[12px] gtsm:mt-0 gtsm:py-[24px] gtlg:hidden">
      {renderActionButtons()}
    </Box>
  );
};

export default SearchFooter;
