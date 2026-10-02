import { Box } from "@/components/ui/box";

import { DISPLAY_LIST_NO, DISPLAY_OE_SEARCH_LIST_NO } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import { Pressable } from "@/components/ui/pressable";

interface Part {
  id: number;
  name: string;
  oeRef: string;
  text: string;
  title: { [key: string]: string };
}

interface DropdownListingProps {
  data: Part[];
  isMobile?: boolean;
  onSelect: (selectedItem: any) => void;
  onSearchAll?: () => void;
}

const DropdownListing: React.FC<DropdownListingProps> = ({
  data,
  onSelect,
  isMobile,
  onSearchAll,
}) => {
  const { getLabel, getLocale } = useBranding();
  const itemCount = data.length;

  const showMore: number = itemCount > DISPLAY_LIST_NO ? itemCount - DISPLAY_LIST_NO : 0;
  const truncateLength = isMobile ? 16 : 40;
  return (
    <Box className="left-0 z-50 w-full rounded-[4px] bg-[--brand-pure-white] pl-3 shadow-[0px_24px_65px_0px_rgba(20,20,43,0.16)]">
      {data?.length > 0 &&
        data.slice(0, DISPLAY_LIST_NO)?.map((item, index: number) => (
          <Box
            key={item.id}
            className="text-primary w-full cursor-pointer overflow-x-auto truncate whitespace-nowrap bg-[--brand-pure-white] p-3 font-Overpass font-normal text-color-text-body"
            onClick={() => onSelect(item)}
          >
            {item?.title[getLocale()] !== undefined ? (
              item?.title[getLocale()]
            ) : (
              <>
                {item.oeRef} -{" "}
                {item.name.length > truncateLength
                  ? `${item.name.substring(0, truncateLength)}...`
                  : item.name}
              </>
            )}
          </Box>
        ))}
      {data.length > DISPLAY_LIST_NO && (
        <Pressable onPress={onSearchAll}>
          <Box className="text-primary p-3 text-center font-Overpass text-[16px] leading-[18px] text-color-text-body underline">
            {getLabel("Search all ")}({data.length - DISPLAY_LIST_NO})
          </Box>
        </Pressable>
      )}
    </Box>
  );
};

export default DropdownListing;
