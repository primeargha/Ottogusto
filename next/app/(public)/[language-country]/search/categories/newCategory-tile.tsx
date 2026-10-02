import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import Image from "next/image";
import engineImg from "@/assets/adv-search/categories/engine-image.png";
import { ArrowRight as FiArrowRight } from "lucide-react-native";

interface CategoryTileProps {
  category: any;
  setSelectedCategories: (category: any) => void;
  gotoStep: (step: number) => void;
  forOGSearch?: boolean;
  forLandingPage?: boolean;
  isLast?: boolean;
}

const SUBTITLE_KEYS_BY_ID: { [index: string]: any } = {
  "001": "category_sub_title_chassis",
  "003": "category_sub_title_engine",
  "005": "category_sub_title_cooling",
  "007": "category_sub_title_braking",
  "002": "category_sub_title_others",
  "004": "category_sub_title_body",
  "006": "category_sub_title_electrics",
};

const NewCatagoryTile = ({
  category,
  setSelectedCategories,
  gotoStep,
  forOGSearch = false,
  forLandingPage = false,
  isLast = true,
}: CategoryTileProps) => {
  const { getLocale, getLabel } = useBranding();
  const { openAdvSearch, appendToFilteredList } = useAdvancedSearchStore();

  const { closeOgSearchModal } = useSearchModalStore();

  const getTitle = () => {
    const { titles = [], name } = category;
    return titles[getLocale()] !== undefined ? category?.titles[getLocale()] : category.name;
  };
  const getTitleOf = (category: any) => {
    // title fix safe code
    if (!category) {
      return "";
    }
    const { titles = [], name } = category;
    return titles[getLocale()] !== undefined ? titles[getLocale()] : name;
  };

  if (forLandingPage) {
    return (
      <Pressable
        onPress={() => {
          openAdvSearch("og-search");
          setSelectedCategories(category);
          // appendToFilteredList(category, true);
          gotoStep(2);
        }}
      >
        <Box className="group flex w-full flex-row content-center items-center justify-evenly gap-2 rounded border border-[--accent-colors-dark] bg-[--background-white] py-[24px] pl-[12px] pr-[36px] hover:bg-[--hover-green-color]">
          <Box className="basis-2/6 items-center">
            <Image
              src={category.icon}
              height={72}
              width={72}
              alt={category.name}
              className="h-[72px] w-[72px]"
            />
          </Box>
          <Box className="basis-4/6 items-start">
            <Box className="fluid-catgoryies relative justify-start py-[3px] font-Overpass font-bold leading-snug text-color-primary-main">
              {getTitleOf(category)}
            </Box>
            <Box className="fluid-catgoryies-sub relative justify-center font-Overpass font-normal text-color-text-body">
              {getLabel(SUBTITLE_KEYS_BY_ID[category.id])}
            </Box>
          </Box>
        </Box>
      </Pressable>
    );
  }

  if (forOGSearch) {
    return (
      <>
        <Box className="visible mr-6 flex min-h-[130px] min-w-[206px] items-center justify-center overflow-hidden overflow-y-hidden rounded-md bg-gradient-to-bl from-green-700 to-emerald-900 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] between-0-640:hidden">
          <Pressable
            onPress={() => {
              openAdvSearch("og-search");
              setSelectedCategories(category);
              gotoStep(2);
            }}
            className="relative flex w-full"
          >
            {/* replace with 'category.icon' when its available in the src */}
            <Image
              src={engineImg}
              height={120}
              width={120}
              alt={category.name}
              className="absolute bottom-[-38px] left-1/2 h-[120px] w-[120px] -translate-x-1/2 items-center between-0-640:h-[120px] between-0-640:w-[120px]"
            />
            <Box className="absolute top-6 flex h-auto min-h-[48px] w-full flex-row items-center justify-between bg-[--background-white] px-3">
              <Text className="text-start font-Overpass text-base font-bold leading-[18px] text-[--Neutral-Black]">
                {getTitleOf(category)}
              </Text>
              <Box>
                <FiArrowRight className="text-lg text-[--secondary-colors-hover]" />
              </Box>
            </Box>
          </Pressable>
        </Box>
        {/* =====================For mobile view==============================           */}
        <Pressable
          onPress={() => {
            closeOgSearchModal();
            openAdvSearch("og-search");
            setSelectedCategories(category);
            gotoStep(3);
          }}
          className="min-h-[160px] rounded-b-md rounded-t-md shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] gtsm:hidden"
        >
          {/* replace with 'category.icon' when its available in the src */}
          <Image
            src={engineImg}
            alt="Engine Category"
            className="max-h-[100px] rounded-t-md bg-gradient-to-bl from-green-700 to-emerald-900 object-contain"
          />
          <div className="flex h-full flex-col rounded-b-md bg-white p-3">
            {" "}
            <Text className="font-Overpass text-[10px] font-bold text-gray-400">CATEGORY</Text>
            <Text className="text-start font-Overpass text-base font-bold leading-[18px] text-[--Neutral-Black]">
              {getTitleOf(category)}
            </Text>
          </div>
        </Pressable>
      </>
    );
  }

  return (
    <>
      {/* =====================For tablet/desktop viewmobile view==============================           */}
      <Pressable
        onPress={() => {
          setSelectedCategories(category);
          gotoStep(2);
        }}
        className={`visible p-[9px] ${isLast ? "basis-full" : "gtsm:basis-1/3"} between-0-640:hidden`}
      >
        <Box className="h-[140px] items-center justify-center rounded bg-white shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)]">
          <Image src={category.icon} alt={category.name} width={72} height={72} />
        </Box>
      </Pressable>

      {/* =====================For mobile view==============================           */}
      <Pressable
        onPress={() => {
          setSelectedCategories(category);
          gotoStep(2);
        }}
        className="my-[3px] w-full justify-center gtsm:hidden"
      >
        <Box className="inline-flex h-[78px] items-center justify-start gap-3 self-stretch bg-white p-3 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)]">
          {/* <Box className="absolute left-0 top-0 h-[78px] w-full rounded bg-white shadow-[0px_8px_26px_10px_rgba(0,0,0,0.10)]" /> */}
          <Box data-svg-wrapper className="absolute left-[22px] top-[9px]">
            <Image src={category.icon} alt="Engine Category" height={60} width={60} />
          </Box>
          <Box className="absolute left-[100px] top-[28px] font-Overpass text-xl font-bold leading-snug text-color-primary-main">
            {getTitleOf(category)}
          </Box>
        </Box>
      </Pressable>
    </>
  );
};

export default NewCatagoryTile;
