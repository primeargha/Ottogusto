import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { DISPLAY_LIST_NO } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";

// Define the interface for the data structure
interface Part {
  id: number | string;
  name: string;
  oeRef: string;
  text: string;
  title: { [key: string]: string }; // Assuming `title` is an object with language keys
}

// Define the props interface for OgDropdownListing
interface OgDropdownListingProps {
  data: Part[]; // Accepts an array of Part objects
  isMobile?: boolean;
  onSelect: (selectedValue: any) => void; // ✅ Ensure this prop is used
  searchAll?: () => void;
}

const OgDropdownListing: React.FC<OgDropdownListingProps> = ({
  data,
  onSelect,
  isMobile = false,
  searchAll,
}) => {
  const { getLabel, getLocale } = useBranding();
  const itemCount = data.length;
  const showMore: number = itemCount > DISPLAY_LIST_NO ? itemCount - DISPLAY_LIST_NO : 0;

  return (
    <Box
      className={`gtlg:w[107%] absolute -left-[40px] top-[108px] z-20 max-h-[225px] max-w-[1350px] rounded bg-white p-4 shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)] md:top-[108px] md:w-[111.5%] lg:top-[108px] lg:w-[110.5%] between-992-1024:w-[111.8%] ml:w-[109%] xl:top-[108px] xl:w-[107%] 2xl:top-[60px] 2xl:w-[107%] between-1280-1599:top-[108px] between-1280-1599:w-[109%]`}
    >
      {/* List Container with limited height */}
      <Box className="max-h-[150px] overflow-y-auto">
        <ul className="list-none space-y-2">
          {data.length > 0 &&
            data.slice(0, DISPLAY_LIST_NO)?.map((item, index: number) => (
              <li
                key={item.id}
                className="line-clamp-1 w-[284px] cursor-pointer pl-6 pt-1 font-Overpass text-base font-medium uppercase leading-[18px] text-[--Text-green]"
                onClick={() => onSelect(item)} // ✅ Corrected `onClick`
              >
                {item?.title[getLocale()] !== undefined ? item?.title[getLocale()] : item?.name}
              </li>
            ))}
        </ul>
      </Box>

      {/* Divider */}
      <Box className="mt-3 h-0 w-[100%] border border-[--primary-colors-primary-dark] opacity-20"></Box>

      {/* Show More Button - Redirect to First Product */}
      {showMore > 0 && (
        <Pressable
          className="cursor-pointer pt-4 text-center font-Overpass text-base font-medium leading-[18px] text-color-primary-main underline"
          onPress={() => {
            if (searchAll) {
              searchAll();
            }
          }} // ✅ Redirect on click
        >
          {getLabel(`Show More (${showMore})`)}
        </Pressable>
      )}
    </Box>
  );
};

export default OgDropdownListing;
