import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import QuickSearchIcon from "@/assets/search/quick-search.svg";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import SearchArea from "@/assets/search/search-area.svg";
import Image from "next/image";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import { OGButton } from "@/components/og-components/OGButton";
import { Icon } from "@/components/ui/icon";

interface SearchFooterProps {
  onQuickSearch: () => void;
  onAdvancedSearch: () => void;
  onSearchByVin: () => void;
}

const OgSearchFooter = ({ onQuickSearch, onAdvancedSearch, onSearchByVin }: SearchFooterProps) => {
  const { getLabel } = useBranding();
  const { searchMode, searchData, isOgSearch, vinValidation } = useSearchModalStore();

  return (
    <Box className="flex h-[118px] w-full flex-row items-center justify-center bg-[--neutral-beige-400] px-4 py-6 shadow-[0px_2px_20px_10px_rgba(0,0,0,0.05)] gtlg:hidden">
      {/* <pre>{JSON.stringify(searchData, null, 2)}</pre> */}
      <Box className="flex w-full flex-row justify-evenly gap-2">
        <Box className="base:hidden gtsm:flex gtsm:flex-1 gtsm:flex-row"></Box>
        {searchMode === "vehicle" ? (
          <>
            {/* <Button
              //@ts-ignores
              onPress={onQuickSearch}
              disabled={!searchData?.make?.value}
              className={`inline-flex h-[56px] flex-1 items-center justify-center gap-[10px] rounded-[4px] border border-[--brand-piston-green] bg-white px-[10px] py-[10px] gtsm:flex-auto gtlg:hover:bg-[--hover-green-color] ${searchData?.make?.value ? "opacity-100" : "opacity-30"}`}
            >
              <Image src={QuickSearchIcon} alt="Quick Search" height={24} width={24} />
              <span className="font-overpass whitespace-nowrap font-medium leading-[22px] text-color-primary-main base:text-[16px] gtsm:text-[20px]">
                {getLabel("quick_search")}
              </span>
            </Button> */}
            <OGButton
              type="outlined"
              onClick={onQuickSearch}
              disabled={!searchData?.make?.value}
              leftcomp={<Image src={QuickSearchIcon} alt="Quick Search" height={24} width={24} />}
              // className={`inline-flex h-[56px] flex-1 items-center justify-center gap-[10px] rounded-[4px] border border-[--brand-piston-green] bg-white px-[10px] py-[10px] gtsm:flex-auto gtlg:hover:bg-[--hover-green-color] ${searchData?.make?.value ? "opacity-100" : "opacity-30"}`}
            >
              {getLabel("quick_search")}
            </OGButton>
            {/* <Button
              //@ts-ignores
              onPress={onAdvancedSearch}
              disabled={!searchData?.make?.value}
              className={`inline-flex h-[56px] flex-1 items-center justify-center gap-[10px] rounded-[4px] border border-[--brand-piston-green] bg-color-primary-main px-[10px] py-[10px] gtsm:flex-auto gtlg:hover:bg-[--hover-text-color] ${searchData?.make?.value ? "opacity-100" : "opacity-30"}`}
            >
              <Image src={AdvancedSearchIcon} alt="Advanced Search" height={24} width={24} />
              <span className="font-overpass whitespace-nowrap font-medium leading-[22px] text-white base:text-[16px] gtsm:text-[20px]">
                {getLabel("advanced_search")}
              </span>
            </Button> */}
            <OGButton
              type="primary"
              onClick={onAdvancedSearch}
              disabled={!searchData?.make?.value}
              leftcomp={
                <Image src={AdvancedSearchIcon} alt="Advanced Search" height={24} width={24} />
              }
            >
              {getLabel("advanced_search")}
            </OGButton>
          </>
        ) : (
          <Button
            //@ts-ignores
            onPress={onSearchByVin}
            disabled={vinValidation.isValid ? false : true}
            className={`inline-flex h-[56px] w-full flex-1 items-center justify-center gap-[10px] rounded-[4px] border border-[--brand-piston-green] bg-color-primary-main px-[10px] py-[10px] gtsm:flex-auto ${vinValidation.isValid ? "opacity-100" : "opacity-30"}`}
          >
            <Image src={AdvancedSearchIcon} alt="Advanced Search" height={24} width={24} />
            <Text className="font-overpass whitespace-nowrap font-medium leading-[22px] text-white base:text-[16px] gtsm:text-[20px]">
              {getLabel("search")}
            </Text>
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OgSearchFooter;
