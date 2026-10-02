"use client";

import { OGButton } from "@/components/og-components/OGButton";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Routes } from "@/config/routes";
import anotherCarIcon from "@/assets/og-search/anotherCarcardIcon.svg";
import {
  carouselImages,
  garageBayIcons,
  heroSection,
  loggedInUserOGSearchIcons,
} from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useAddUpdateMyCarsToEB, useGetMySavedCarsQuery } from "@/hooks/garage";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
// import { useSavedCarsStore } from "@/stores/useSavedCarsStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import { useSliderStore } from "@/stores/useSliderStore";
import FavoriteStarIcon from "@/assets/eb-panel/fav-star-icon.svg";
import formatEditSearchData from "@/utils/formatEditSearchData";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useMedia } from "@/hooks/useMedia";
import { useRouteStore } from "@/stores/useRouteStore";
import Typography from "@/components/og-components/Typography";
const truncateText = (text: string | undefined, maxLength: number): string => {
  if (text && text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text || "";
};
interface SearchResultsProps {
  item: any;
  isLastItem?: boolean;
  isHeroCart?: boolean;
  index?: number;
}
const defaultpointer = true;
const SearchResults: React.FC<SearchResultsProps> = ({ item, isLastItem, index }) => {
  const { getLabel } = useBranding();
  const router = useRouter();
  const params = useParams();
  const addAnotherCar = (item: any) => {
    router.push(getRouteLocaleString(Routes.garageBay, params));
  };
  return (
    <Box className="flex flex-wrap items-start gap-4">
      {/* Map through items and render DefaultSearchCard */}
      <DefaultSearchCard item={item} index={index} />

      {/* Last additional box */}
      {isLastItem && (
        <Box className="flex max-h-[158px] w-[400px] flex-col justify-start border-l border-[--neutral-chrome-600] px-6 gtsm:gap-3 gtlg:gap-0">
          <div className="flex min-h-[103px] flex-row items-center gap-3">
            <Image
              src={anotherCarIcon}
              height={52}
              width={52}
              alt="no car icon"
              className="2xl:h-8 2xl:w-8"
            />
            <div className="flex w-full flex-col">
              <Box className="pt-1 text-left font-Overpass text-lg font-bold leading-tight text-color-primary-main md:text-[14px] lg:text-[14px] xl:text-[14px] 2xl:pt-0 2xl:text-[12px]">
                {getLabel("og_search_another_car_heading")}
              </Box>
              <Box className="overflow-hidden font-Overpass text-base font-normal leading-[18px] text-color-primary-main md:text-[14px] lg:text-[14px] xl:text-[14px] 2xl:pt-0 2xl:text-[12px]">
                {getLabel("og_search_add_another_car_subtext")}
              </Box>
            </div>
          </div>
          {/* Add another car button */}
          <Box className="customButtonHeight flex w-auto">
            <Pressable
              onPress={() => {
                addAnotherCar(item);
              }}
              className="inline-flex h-full w-[140px] items-center justify-center gap-2.5 rounded border border-[--brand-piston-green] hover:bg-[--hover-green-color]"
            >
              <Box className="font-Overpass text-base font-normal leading-[18px] text-color-primary-main md:text-[14px] lg:text-[16px] xl:text-[16px] 2xl:text-[12px]">
                {getLabel("add_another_car")}
              </Box>
            </Pressable>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const MenuItem = ({
  id,
  item,
  isHeroCart = false,
  onClose,
}: {
  id: number;
  isHeroCart?: boolean;
  item: any;
  onClose: () => void;
}) => {
  const { getLabel } = useBranding();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const params = useParams();
  const { setIsEB, setEbMode, openModal } = useSearchModalStore();
  const { selectedCar, setSelectedCar } = useSelectedCarStore();

  const { mySavedCarsForSlider, setMySavedCarsForSlider } = useSliderStore();

  const router = useRouter();

  const { refetch: mySavedCarsRefetch } = useGetMySavedCarsQuery();
  const { mutate: updateMyCarsToEB, isPending: isUpdatingMyCarsToEB } = useAddUpdateMyCarsToEB({
    onSuccess: () => {
      mySavedCarsRefetch();
    },
    onError: (error: any) => {
      console.error("Error adding car to EB: ", error);
    },
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyPress(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [onClose]);

  const { refetch: savedCarsRefetch } = useGetMySavedCarsQuery();
  // const handleFavCarOld = (id: number, item: any) => {
  //   const index = mySavedCarsForSlider.findIndex((car) => car.id.toString() === id.toString());
  //   const oldCar = mySavedCarsForSlider[index];
  //   const isFavorite = oldCar?.isFavorite;

  //   if (index !== -1) {
  //     if (!isFavorite) {
  //       const updatedCars = mySavedCarsForSlider?.map((car) => ({
  //         ...car,
  //         isFavorite: car?.id === id,
  //       }));

  //       setMySavedCarsForSlider(updatedCars);

  //       const updateRequests = updatedCars?.map((car) => {
  //         return updateMyCarsToEB({
  //           id: car.id,
  //           isFavorite: car.id === id,
  //         });
  //       });

  //       Promise.all(updateRequests)
  //         .then(() => {})
  //         .catch((error) => {
  //           console.error("Failed to update favorite status in backend", error);
  //         });
  //     } else {
  //       const updatedCars = [...mySavedCarsForSlider];
  //       updatedCars[index] = { ...updatedCars[index], isFavorite: !updatedCars[index].isFavorite };

  //       setMySavedCarsForSlider(updatedCars);
  //       updateMyCarsToEB({
  //         id: oldCar.id,
  //         isFavorite: false,
  //       });
  //     }
  //   }
  // };

  const handleFavCar = (id: any, item: object) => {
    //@ts-ignore
    const index = mySavedCarsForSlider.findIndex((car) => car.id.toString() === id.toString());
    const oldCar = mySavedCarsForSlider[index];
    const isFavorite = oldCar?.isFavorite;

    updateMyCarsToEB({
      id: id,
      //@ts-ignore
      isFavorite: !item.isFavorite,
    });
  };

  const modifyGarage = (id: number, item: any) => {
    setSelectedCar(item);
    setIsEB(true);
    setEbMode("edit");

    router.push(`${getRouteLocaleString(Routes.garageBay, params)}`);
  };

  const handleFavoriteClick = () => {
    const currentFavState = item.isFavorite;
    const newFavState = !currentFavState;

    handleFavCar(id, item);

    onClose();
  };
  return (
    <Box
      ref={menuRef as any}
      className="absolute bottom-[-10px] right-0 mr-16 h-[120px] w-[220px] rounded-lg bg-color-background-l1 shadow-md 2xl:h-[80px]"
    >
      <Pressable
        onPress={handleFavoriteClick}
        className="flex h-[60px] flex-col items-start justify-start gap-1 rounded-lg px-1 py-1 hover:bg-[--hover-green-color] 2xl:h-[40px]"
      >
        <Box className="h-[50px] flex-row items-center gap-2 rounded-[14px] px-2 py-[15px] 2xl:h-[40px]">
          <Image
            src={loggedInUserOGSearchIcons.addFavourite}
            height={24}
            width={24}
            alt="add favourite"
          />
          <Box className="text-base font-normal leading-[18px] text-color-primary-main md:text-[14px] lg:text-[14px] xl:text-[16px]">
            {/* {getLabel("mark_as_favourite")} */}
            {item?.isFavorite ? getLabel("remove_as_favourite") : getLabel("mark_as_favourite")}
          </Box>
        </Box>
      </Pressable>
      <Pressable
        onPress={() => {
          modifyGarage(id, item);
          onClose();
        }}
        className="flex h-[60px] flex-col items-start justify-start gap-2 rounded-lg px-1 py-1 hover:bg-[--hover-green-color] 2xl:h-[40px]"
      >
        <Box className="h-[50px] flex-row items-center gap-2 rounded-[14px] px-2 py-[15px]">
          <Image
            src={isHeroCart ? heroSection.aiEdit : loggedInUserOGSearchIcons.edit}
            height={24}
            width={24}
            alt="edit"
          />
          <Box className="text-base font-normal leading-[18px] text-color-primary-main md:text-[14px] lg:text-[14px] xl:text-[16px]">
            {getLabel("modify_in_garageb_bay")}
          </Box>
        </Box>
      </Pressable>
    </Box>
  );
};

const DefaultSearchCard = ({ item, index }: { item: any; index?: number | undefined }) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const { getLabel } = useBranding();
  const router = useRouter();
  const { openAdvSearch, addToPreviousSearchesFromAdvSearch } = useAdvancedSearchStore();
  const { updateFilters } = useUrlParams();
  const [maxLength, setMaxLength] = useState(42);
  const { addToPreviousSearches, setSearchData, getMakeModelTypeId } = useSearchModalStore();
  const [isAdvancedSearchClicked, setIsAdvancedSearchClicked] = useState(false);
  const [localSearchData, setLocalSearchData] = useState({
    make: null,
    model: null,
    year: null,
    type: null,
  });

  const quickSearch = async (id: number, item: any) => {
    const sData = await formatEditSearchData(item);

    setSearchData(sData);

    const makeModelTypeId = item?.makeModelTypeId ?? (await getMakeModelTypeId());
    updateFilters(
      {
        makeModelTypeId,
        year: sData?.year?.value || null,
      },
      "/products",
    );
  };

  useEffect(() => {
    if (!isAdvancedSearchClicked) return;

    (async () => {
      try {
        const formattedSearchData = await formatEditSearchData(item);
        setLocalSearchData(formattedSearchData as any);
      } catch (error) {
        console.error("Error formatting car data:", error);
        setLocalSearchData({
          make: null,
          model: null,
          year: null,
          type: null,
        });
      } finally {
        setIsAdvancedSearchClicked(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvancedSearchClicked]);

  useEffect(() => {
    if (!localSearchData?.make) return;
    setSearchData({
      //@ts-ignore
      make: { key: localSearchData.make?.key, value: localSearchData.make?.value || "" },
      //@ts-ignore
      model: { key: localSearchData.model?.key, value: localSearchData.model?.value || "" },
      //@ts-ignore
      type: { key: localSearchData.type?.key, value: localSearchData.type?.value || "" },
      //@ts-ignore
      year: { key: localSearchData.model?.key, value: item?.year || "" },
    });

    openAdvSearch("og-search-saved-cars");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchData]); // Runs when localSearchData changes

  const advancedSearch = async (id: number, item: any) => {
    const sData = await formatEditSearchData(item);

    setSearchData(sData);

    setIsAdvancedSearchClicked(true);
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  useEffect(() => {
    const handleResize = () => {
      const isMediumScreen = window.matchMedia(
        "(min-width: 768px) and (max-width: 1024px)",
      ).matches;

      const isLargeScreen = window.matchMedia(
        "(min-width: 1025px) and (max-width: 1600px)",
      ).matches;

      if (isMediumScreen) {
        setMaxLength(32);
      } else if (isLargeScreen) {
        setMaxLength(35);
      } else {
        setMaxLength(41);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text || "";
  };

  return (
    <Box
      className={`responsiveJustify relative top-1 inline-flex min-h-[158px] w-[400px] flex-col items-start gap-[11px] ${index == 0 ? "pr-6" : "gtsm:px-5 gtlg:px-6"} md:w-[338px] lg:w-[400px] between-992-1024:w-[360px] ${defaultpointer ? "cursor-default" : null} ${index !== 0 ? "border-l border-[--neutral-chrome-600]" : ""}`}
    >
      <Box className="inline-flex items-start justify-start gap-4 self-stretch">
        <Box className="inline-flex flex-col items-start justify-center gap-2 self-stretch">
          {/* main heading */}
          <Box className="inline-flex flex-row items-center justify-start gap-[21px]">
            <Box className="font-Anton text-[28px] font-normal leading-10 text-color-text-body md:text-[20px] lg:text-[24px] xl:text-[24px] 2xl:text-[20px]">
              {truncateText(
                item?.name
                  ? (item?.name).toUpperCase()
                  : (item?.brandName + " " + item?.modelName).toUpperCase(),
                maxLength,
              )}
            </Box>
            {item.isFavorite && (
              <Box className="flex-shrink: 0 flex h-6 w-6 items-center justify-center rounded bg-[--Background-Favourite-Star] p-1">
                <Image
                  src={FavoriteStarIcon}
                  height={14}
                  width={14}
                  alt="star"
                  className="h-[14px] w-[14px]"
                />
              </Box>
            )}
          </Box>
          {/* 2nd line */}
          <Box className="h-[16px] self-stretch font-Overpass text-lg font-normal leading-tight text-color-text-body md:text-[14px] lg:text-[14px] xl:text-[14px] 2xl:text-[12px]">
            {item?.name ? (
              <>
                {item.brandName}&nbsp;{item.modelName}&nbsp;{item.typeName}
              </>
            ) : (
              item.typeName
            )}
            {/* {"INFO"} */}
          </Box>
          {/* 3rd line */}
          <Box className="inline-flex h-[16px] flex-row items-center justify-start gap-3 self-stretch">
            {item?.year && (
              <Box className="flex-row">
                {/* <span className="font-Overpass text-base font-normal leading-[18px] text-color-text-body md:text-[14px] lg:text-[14px] xl:text-[14px] 2xl:text-[12px]">
                  {getLabel("model_year")}&nbsp;
                </span> */}
                <span className="font-inter text-base font-bold uppercase leading-[18px] tracking-wide text-color-text-body md:text-[14px] lg:text-[14px] xl:text-[14px] 2xl:text-[12px]">
                  {item?.year}
                </span>
              </Box>
            )}

            {item.vin && (
              <Box className="flex flex-row items-center">
                <span className="font-Overpass text-base font-normal leading-[18px] text-color-text-body md:text-[14px] lg:text-[14px] xl:text-[14px] 2xl:text-[12px]">
                  {getLabel("vin")}&nbsp;
                </span>
                <span className="font-inter text-base font-bold uppercase leading-none tracking-wide text-color-text-body md:text-[14px] lg:text-[14px] xl:text-[14px] 2xl:text-[12px]">
                  {item.vin}
                </span>
              </Box>
            )}
            {/* {"MYV"} */}
          </Box>
        </Box>
      </Box>
      {/* Button group */}
      <Box className="relative w-full flex-row justify-between">
        <Pressable
          onPress={() => quickSearch(item.id, item)}
          className={`${index == 0 ? "gtsm:w-[135px] gtlg:w-[150px]" : "gtsm:w-[130px] gtlg:w-[140px]"} h-10 flex-row items-center justify-center rounded border border-color-primary-main bg-color-primary-main lg:h-11 between-992-1024:w-[125px] 2xl:h-8`}
        >
          <Image src={loggedInUserOGSearchIcons.quickSearch} height={24} width={24} alt="quick" />
          <Box className="text-white body-regular-sm">{getLabel("quick_search")}</Box>
        </Pressable>
        {/*  */}
        {/* need margin edit here */}
        <Pressable
          onPress={() => advancedSearch(item.id, item)}
          className={`${index == 0 ? "gtsm:w-[160px] gtlg:w-[175px]" : "gtsm:w-[145px] gtlg:w-[165px]"} h-10 flex-row items-center justify-center rounded border border-color-primary-main hover:bg-[--hover-green-color] md:h-10 lg:h-11 between-992-1024:w-[140px] 2xl:h-8`}
        >
          <Image src={loggedInUserOGSearchIcons.aiSearch} height={24} width={24} alt="ai search" />
          <Box className="text-color-primary-main body-regular-sm">
            {getLabel("advanced_search")}
          </Box>
        </Pressable>
      </Box>
    </Box>
  );
};

const HeroSectionSavedCard = ({ item, isHeroCart = false }: { item: any; isHeroCart: boolean }) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const { getLabel } = useBranding();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { updateFilters } = useUrlParams();
  const { openAdvSearch } = useAdvancedSearchStore();
  const { appendToNavigationHistory } = useRouteStore();
  const {
    addToPreviousSearches,
    resetSearch,
    setIsOgSearch,
    openModal,
    setSearchData,
    setFromRoute,
    getMakeModelTypeId,
    setOgSearchModalContent,
    openOgSearchModal,
    setCarByVinResults,
  } = useSearchModalStore();
  const [isAdvancedSearchClicked, setIsAdvancedSearchClicked] = useState(false);
  const [localSearchData, setLocalSearchData] = useState<any>({
    make: null,
    model: null,
    year: null,
    type: null,
  });

  const isMobile = useMedia("(max-width: 639px)");

  const quickSearch: any = async () => {
    const sData = await formatEditSearchData(item);

    setSearchData(sData);
    const makeModelTypeId = item?.makeModelTypeId ?? (await getMakeModelTypeId());

    appendToNavigationHistory(pathname ?? "");

    updateFilters(
      {
        makeModelTypeId,
        year: sData?.year?.value || null,
      },
      "/products",
    );
  };

  useEffect(() => {
    if (!isAdvancedSearchClicked) return;

    (async () => {
      try {
        const formattedSearchData = await formatEditSearchData(item);
        setLocalSearchData(formattedSearchData);
      } catch (error) {
        console.error("Error formatting car data:", error);
        setLocalSearchData({
          make: null,
          model: null,
          year: null,
          type: null,
        });
      } finally {
        setIsAdvancedSearchClicked(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvancedSearchClicked]);

  useEffect(() => {
    if (!localSearchData?.make) return;

    setSearchData({
      make: { key: localSearchData.make?.key, value: localSearchData.make?.value || "" },
      model: { key: localSearchData.model?.key, value: localSearchData.model?.value || "" },
      type: { key: localSearchData.type?.key, value: localSearchData.type?.value || "" },
      year: { key: localSearchData.model?.key, value: item?.year || "" },
    });

    if (isMobile) {
      setOgSearchModalContent("category");
      openOgSearchModal();
      setIsOgSearch(true);
    } else {
      openAdvSearch("og-search-saved-cars");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchData]); // Runs when localSearchData changes

  const advancedSearch = (id: number, item: any) => {
    setCarByVinResults([item]);

    router.push(`${getRouteLocaleString(Routes.categoriessearch, params)}`);
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  return (
    <>
      <Box
        className={`relative top-1 inline-flex h-[260px] w-[500px] flex-col items-start justify-start gap-[11px] ${defaultpointer ? "cursor-default" : null}`}
      >
        <Box className="inline-flex items-start justify-start gap-4 self-stretch">
          <Box className="inline-flex flex-row items-center justify-start gap-[21px]">
            {item?.picture && (
              <Box className="relative flex h-[100px] w-[100px] flex-row items-center justify-center">
                <Box className="absolute inset-0 [clip-path:polygon(20%_0,_100%_0,_100%_60%,_50%_100%,_0_100%,_0_10%)]" />

                <Box className="relative h-[100px] w-[100px] overflow-hidden [clip-path:polygon(20%_0,_100%_0,_100%_70%,_60%_100%,_0_100%,_0_10%)]">
                  <Image
                    src={item?.picture ? item?.picture : heroSection.car}
                    width={100}
                    height={100}
                    alt="Car"
                  />
                </Box>
              </Box>
            )}
            <Box className="inline-flex flex-col items-start justify-center gap-2 self-stretch">
              <Box className="inline-flex flex-row items-center justify-start gap-[21px]">
                <Box className="font-Anton text-[28px] font-normal leading-10 text-color-text-body md:text-[20px] lg:text-[24px] xl:text-[24px] 2xl:text-[20px]">
                  {/* {item?.name
                    ? (item?.name).toUpperCase().substring(0, 42) + "..."
                    : (item?.brandName + " " + item?.modelName).toUpperCase()} */}
                  {truncateText(
                    item?.name
                      ? (item?.name).toUpperCase()
                      : (item?.brandName + " " + item?.modelName).toUpperCase(),
                    42,
                  )}
                </Box>
                {item.isFavorite && (
                  <Box className="flex-shrink: 0 flex h-6 w-6 items-center justify-center rounded bg-[--Background-Favourite-Star] p-1">
                    <Image
                      src={loggedInUserOGSearchIcons.addFavourite}
                      height={14}
                      width={14}
                      alt="star"
                      className="h-[14px] w-[14px]"
                    />
                  </Box>
                )}
              </Box>
              <Box className="self-stretch font-Overpass text-lg font-normal leading-tight text-color-text-body md:text-[18px] lg:text-[18px] xl:text-[18px] 2xl:text-[12px]">
                {item?.name ? (
                  <>
                    {item.brandName}&nbsp;{item.modelName}&nbsp;{item.typeName}
                  </>
                ) : (
                  item.typeName
                )}
              </Box>
              <Box className="inline-flex flex-row items-center justify-start gap-3 self-stretch">
                <Box className="flex-row">
                  <span className="font-inter text-base font-bold uppercase leading-none tracking-wide text-color-text-body md:text-[16px] lg:text-[16px] xl:text-[16px] 2xl:pt-2 2xl:text-[16px]">
                    {item?.year}
                  </span>
                </Box>
                {item.vin && (
                  <Box className="flex-row">
                    <span className="font-Overpass text-base font-normal leading-[18px] text-color-text-body md:text-[16px] lg:text-[16px] xl:text-[16px] 2xl:pt-2 2xl:text-[16px]">
                      {getLabel("vin")}&nbsp;
                    </span>
                    <span className="font-inter text-base font-bold uppercase leading-none tracking-wide text-color-text-body md:text-[16px] lg:text-[16px] xl:text-[16px] 2xl:pt-2 2xl:text-[16px]">
                      {item?.vin}
                    </span>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="relative h-11 w-[82%] flex-row justify-between">
          <OGButton
            size="medium"
            type="primary"
            leftcomp={
              <Image
                src={loggedInUserOGSearchIcons.quickSearch}
                height={24}
                width={24}
                alt="quick"
              />
            }
            onClick={() => quickSearch(item.id, item)}
          >
            {getLabel("quick_search")}
          </OGButton>

          <OGButton
            size="medium"
            type="outlined"
            leftcomp={
              <Image
                src={loggedInUserOGSearchIcons.aiSearch}
                height={24}
                width={24}
                alt="ai search"
              />
            }
            onClick={() => advancedSearch(item.id, item)}
          >
            {getLabel("advanced_search")}
          </OGButton>

          {/* More Options Button */}
          <OGButton
            size="medium"
            type="outlined"
            className="p-[10px]"
            onClick={() => toggleMenu(item.id)}
          >
            <Image
              src={loggedInUserOGSearchIcons.moreInfo}
              height={24}
              width={24}
              alt="more info"
            />
          </OGButton>

          {/* Conditional Rendering of Menu */}
          {openMenuId === item.id && (
            <MenuItem
              id={item.id}
              item={item}
              isHeroCart={isHeroCart}
              onClose={() => setOpenMenuId(null)}
            />
          )}
        </Box>
      </Box>

      {/* Button to be shifted */}
    </>
  );
};

const MenuItemMobile = ({
  id,
  item,
  isHeroCart = false,
  onClose,
}: {
  id: number;
  isHeroCart?: boolean;
  item: any;
  onClose: () => void;
}) => {
  const { getLabel } = useBranding();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const params = useParams();
  const { selectedCar, setSelectedCar } = useSelectedCarStore();
  const { setIsEB, setEbMode, openModal } = useSearchModalStore();
  const { mySavedCarsForSlider, setMySavedCarsForSlider } = useSliderStore();

  const router = useRouter();

  const { refetch: mySavedCarsRefetch } = useGetMySavedCarsQuery();
  const { mutate: updateMyCarsToEB, isPending: isUpdatingMyCarsToEB } = useAddUpdateMyCarsToEB({
    onSuccess: () => {
      setTimeout(() => {
        mySavedCarsRefetch();
      }, 0);
    },
    onError: (error: any) => {
      console.error("Error adding car to EB: ", error);
    },
  });

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyPress(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [onClose]);

  // const handleFavCarOld = (id: number, item: any) => {
  //   const index = mySavedCarsForSlider.findIndex((car) => car.id.toString() === id.toString());
  //   const oldCar = mySavedCarsForSlider[index];
  //   const isFavorite = oldCar?.isFavorite;

  //   if (index !== -1) {
  //     if (!isFavorite) {
  //       const updatedCars = mySavedCarsForSlider?.map((car) => ({
  //         ...car,
  //         isFavorite: car.id === id,
  //       }));

  //       setMySavedCarsForSlider(updatedCars);

  //       const updateRequests = updatedCars?.map((car) => {
  //         return updateMyCarsToEB({
  //           id: car.id,
  //           isFavorite: car.id === id,
  //         });
  //       });

  //       Promise.all(updateRequests)
  //         .then(() => {})
  //         .catch((error) => {
  //           console.error("Failed to update favorite status in backend", error);
  //         });
  //     } else {
  //       const updatedCars = [...mySavedCarsForSlider];
  //       updatedCars[index] = { ...updatedCars[index], isFavorite: !updatedCars[index].isFavorite };

  //       setMySavedCarsForSlider(updatedCars);
  //       updateMyCarsToEB({
  //         id: oldCar.id,
  //         isFavorite: false,
  //       });
  //     }
  //   }
  // };

  const handleFavCar = (id: string | any, item: object) => {
    const index = mySavedCarsForSlider.findIndex(
      (car) => (car.id as any)?.toString() === id.toString(),
    );
    const oldCar = mySavedCarsForSlider[index];
    const isFavorite = oldCar?.isFavorite;

    updateMyCarsToEB({
      id: id,
      //@ts-ignore
      isFavorite: !item?.isFavorite,
    });
  };

  const modifyGarage = (id: number, item: any) => {
    setSelectedCar(item);
    setIsEB(true);
    setEbMode("edit");

    router.push(`${getRouteLocaleString(Routes.garageBay, params)}`);
  };

  return (
    <Box
      ref={menuRef as any}
      className="absolute bottom-[32px] right-0 mr-10 h-[90px] w-[220px] rounded-lg bg-color-background-l1 shadow-md 2xl:h-[80px]"
    >
      <Pressable
        onPress={() => {
          handleFavCar(id, item);
          onClose();
        }}
        className="flex h-[50px] flex-col items-start justify-start gap-1 rounded-lg px-1 py-1 hover:bg-[--hover-green-color]"
      >
        <Box className="h-[40px] flex-row items-center gap-2 rounded-[14px] px-2 py-[15px]">
          <Image
            src={loggedInUserOGSearchIcons.addFavourite}
            height={16}
            width={16}
            alt="add favourite"
          />
          <Box className="text-[14px] font-normal leading-[14px] text-color-primary-main">
            {/* {getLabel("mark_as_favourite")} */}
            {item?.isFavorite ? getLabel("remove_as_favourite") : getLabel("mark_as_favourite")}
          </Box>
        </Box>
      </Pressable>
      <Pressable
        onPress={() => {
          modifyGarage(id, item);
          onClose();
        }}
        className="bottom-[0px] flex h-[40px] flex-col items-start justify-start gap-1 rounded-lg hover:bg-[--hover-green-color]"
      >
        <Box className="h-[40px] flex-row items-center gap-2 rounded-lg px-4">
          <Image
            src={isHeroCart ? heroSection.aiEdit : loggedInUserOGSearchIcons.edit}
            height={16}
            width={16}
            alt="edit"
          />
          <Box className="text-[14px] font-normal leading-[14px] text-color-primary-main">
            {getLabel("modify_in_garageb_bay")}
          </Box>
        </Box>
      </Pressable>
    </Box>
  );
};

const HeroMobileSectionSavedCard = ({
  item,
  isHeroCart = false,
}: {
  item: any;
  isHeroCart: boolean;
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const { getLabel } = useBranding();
  const { updateFilters } = useUrlParams();
  const router = useRouter();
  const { openAdvSearch } = useAdvancedSearchStore();
  const {
    resetSearch,
    setIsOgSearch,
    openModal,
    setSearchData,
    setFromRoute,
    getMakeModelTypeId,
    setOgSearchModalContent,
    openOgSearchModal,
  } = useSearchModalStore();
  const [isAdvancedSearchClicked, setIsAdvancedSearchClicked] = useState(false);
  const [localSearchData, setLocalSearchData] = useState<any>({
    make: null,
    model: null,
    year: null,
    type: null,
  });
  const isMobile = useMedia("(max-width: 639px)");

  const quickSearch = async () => {
    const sData = await formatEditSearchData(item);

    setSearchData(sData);
    const makeModelTypeId = await getMakeModelTypeId();
    updateFilters(
      {
        makeModelTypeId,
        year: sData?.year?.value || null,
      },
      "/products",
    );
  };

  useEffect(() => {
    if (!isAdvancedSearchClicked) return;

    (async () => {
      try {
        const formattedSearchData = await formatEditSearchData(item);
        setLocalSearchData(formattedSearchData);
      } catch (error) {
        console.error("Error formatting car data:", error);
        setLocalSearchData({
          make: null,
          model: null,
          year: null,
          type: null,
        });
      } finally {
        setIsAdvancedSearchClicked(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvancedSearchClicked]);

  useEffect(() => {
    if (!localSearchData?.make) return;

    setSearchData({
      make: { key: localSearchData.make?.key, value: localSearchData.make?.value || "" },
      model: { key: localSearchData.model?.key, value: localSearchData.model?.value || "" },
      type: { key: localSearchData.type?.key, value: localSearchData.type?.value || "" },
      year: { key: localSearchData.model?.key, value: item?.year || "" },
    });

    if (isMobile) {
      setOgSearchModalContent("category");
      openOgSearchModal();
      setIsOgSearch(true);
    } else {
      openAdvSearch("og-search-saved-cars");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchData]); // Runs when localSearchData changes

  const advancedSearch = (id: number, item: any) => {
    setIsAdvancedSearchClicked(true);
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  return (
    <>
      <Box
        className={`relative inline-flex h-[233] w-[240px] flex-col items-center justify-center gap-[11px] ${defaultpointer ? "cursor-default" : null}`}
      >
        <Box className="inline-flex items-start justify-start gap-[5px] self-stretch">
          <Box className="inline-flex flex-row items-center justify-start">
            <Box className="inline-flex flex-col items-start justify-center gap-2 self-stretch">
              <Box className="inline-flex flex-row items-center justify-start gap-[21px]">
                <Box className="leading-18 font-Anton text-[18px] font-normal text-color-text-body">
                  {truncateText(
                    item?.name
                      ? (item?.name).toUpperCase()
                      : (item?.brandName + " " + item?.modelName).toUpperCase(),
                    20,
                  )}
                </Box>
                {item.isFavorite && (
                  <Box className="flex-shrink: 0 flex h-6 w-6 items-center justify-center rounded bg-[--Background-Favourite-Star] p-1">
                    <Image
                      src={loggedInUserOGSearchIcons.addFavourite}
                      height={14}
                      width={14}
                      alt="star"
                      className="h-[14px] w-[14px]"
                    />
                  </Box>
                )}
              </Box>
              <Box className="self-stretch font-Overpass text-[12px] text-sm font-normal leading-tight text-color-text-body">
                {item?.name ? (
                  <>
                    {item.brandName}&nbsp;{item.modelName}&nbsp;{item.typeName}
                  </>
                ) : (
                  item.typeName
                )}
                {/* {"INFO"} */}
              </Box>
              <Box className="inline-flex flex-row items-center justify-start self-stretch">
                <Box className="flex-row">
                  <span className="font-inter text-[12px] text-base font-bold uppercase leading-[18px] tracking-wide text-color-text-body">
                    {item?.year}
                  </span>
                </Box>
              </Box>
              {item.vin && (
                <Box className="inline-flex flex-row items-center justify-start self-stretch">
                  <Box className="flex flex-row items-center">
                    <span className="font-Overpass text-[12px] text-base font-normal leading-none text-color-text-body">
                      {getLabel("vin")}&nbsp;
                    </span>
                    <span className="pb-1 font-inter text-[12px] text-base font-bold uppercase leading-none tracking-wide text-color-text-body">
                      {item?.vin}
                    </span>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box className="relative h-11 w-[100%] flex-row justify-start gap-2">
          <Pressable
            onPress={() => advancedSearch(item.id, item)}
            className="h-8 w-[148px] flex-row items-center justify-center rounded border border-[--brand-piston-green] bg-color-primary-main p-1"
          >
            <Image src={heroSection.aiSearch} height={16} width={16} alt="ai search" />
            <Box className="gap-1 pl-2 font-Overpass text-[12px] text-sm font-medium leading-snug text-white">
              {getLabel("advanced_search")}
            </Box>
          </Pressable>

          {/* More Options Button */}
          <Pressable
            onPress={() => toggleMenu(item.id)}
            className="h-7 w-[32px] flex-row items-center justify-center rounded border border-[--brand-piston-green] p-2 hover:bg-[--hover-green-color] sm:w-[32px] md:mr-2"
          >
            <Image
              src={loggedInUserOGSearchIcons.moreInfo}
              height={24}
              width={24}
              alt="more info"
            />
          </Pressable>

          {/* Conditional Rendering of Menu */}
          {openMenuId === item.id && (
            <MenuItemMobile
              id={item.id}
              item={item}
              isHeroCart={isHeroCart}
              onClose={() => setOpenMenuId(null)}
            />
          )}
        </Box>
      </Box>
      {!isMobile && (
        <Box
          onClick={() => {
            resetSearch();
            setIsOgSearch(false);
            setFromRoute("saved-cars");
            //@ts-ignore
            router.push(getRouteLocaleString(Routes.search, params));
          }}
          className="relative bottom-[1px] z-10 w-[90%] shrink grow basis-0 cursor-pointer bg-[var(--color-beige-800)] pt-2 font-Overpass text-sm font-normal leading-tight text-color-primary-main"
        >
          {getLabel("search_for_new_carS")}
        </Box>
      )}
    </>
  );
};

interface GarageBaySavedCarProps {
  item: any;
  handleSelectCar?: (item: object, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  selectedCar?: object | null;
}

const GarageBaySavedCar: React.FC<GarageBaySavedCarProps> = ({
  item,
  handleSelectCar,
  selectedCar,
}) => {
  const { getLabel } = useBranding();
  //@ts-ignore
  const isActive = selectedCar?.id === item?.id;

  return (
    <Box
      key={item.id}
      onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!item) {
          return;
        }
        handleSelectCar?.(item, event);
      }}
      data-property-1="Pers"
      className={`flex-column relative mr-6 flex h-full flex-col items-center justify-center self-stretch rounded-lg p-3 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-color-primary-main ${isActive ? "bg-color-primary-main" : "bg-color-background-none hover:bg-color-hover-action-primary"}`}
    >
      {item?.isNew && (
        <Box
          data-property-1="Default"
          className="absolute -top-5 right-3 inline-flex items-center justify-start gap-2.5 rounded-lg bg-emerald-900 p-3"
        >
          <Box className="justify-start text-color-text-on-dark body-regular-sm">
            {getLabel("new")}
          </Box>
        </Box>
      )}
      <Box className="flex flex-col items-start justify-start gap-4 self-stretch">
        <Box className="inline-flex items-start justify-start gap-[5px] self-stretch">
          <Box className="inline-flex flex-row items-center justify-start gap-4">
            {item?.picture && (
              <Box className="relative flex h-[80px] w-[80px] items-center justify-center overflow-hidden">
                <Box className="absolute inset-0 bg-color-background-none [clip-path:polygon(20%_0,_100%_0,_100%_60%,_50%_100%,_0_100%,_0_10%)]" />

                <Box className="relative h-full w-full overflow-hidden [clip-path:polygon(20%_0,_100%_0,_100%_70%,_60%_100%,_0_100%,_0_10%)]">
                  <Image
                    src={item?.picture ? item?.picture : carouselImages.b}
                    width={100}
                    height={100}
                    alt="Car"
                    className="h-full w-full object-cover"
                  />
                </Box>
              </Box>
            )}
            <Box className="inline-flex flex-col items-start justify-center gap-2 self-stretch">
              <Box className="inline-flex flex-row items-center justify-start gap-[21px]">
                <Typography
                  type="h3"
                  className={`justify-start ${
                    isActive ? "text-color-text-on-dark" : "text-color-text-body"
                  }`}
                >
                  {item?.name || ""}
                </Typography>
                {item.isFavorite && (
                  <Box className="flex-shrink: 0 flex items-center justify-center rounded bg-color-secondary-main p-1">
                    <Image src={garageBayIcons.star} height={18} width={18} alt="star" />
                  </Box>
                )}
              </Box>
              <Box
                className={`justify-start self-start text-left body-regular-md ${
                  isActive ? "text-color-text-on-dark" : "text-color-text-body"
                }`}
              >
                {item?.name ? (
                  <>
                    {item.brandName}&nbsp;{item.modelName}&nbsp;{item.typeName}
                  </>
                ) : (
                  item.typeName
                )}
              </Box>
              <Box className="inline-flex flex-row items-center justify-start gap-4 self-stretch">
                <Box className="flex-row">
                  <span
                    className={`pb-1 uppercase leading-none tracking-wide body-bold-sm ${
                      isActive ? "text-color-text-on-dark" : "text-color-text-body"
                    }`}
                  >
                    {/* {item?.year} */}
                    2004
                  </span>
                </Box>
                {item.vin && (
                  <Box className="inline-flex flex-row items-center justify-start self-stretch">
                    <Box className="flex flex-row items-center">
                      <span
                        className={`leading-none body-regular-sm ${
                          isActive ? "text-color-text-on-dark" : "text-color-text-body"
                        }`}
                      >
                        {getLabel("vin")}&nbsp;
                      </span>
                      <span
                        className={`pb-1 uppercase leading-none tracking-wide body-bold-sm ${
                          isActive ? "text-color-text-on-dark" : "text-color-text-body"
                        }`}
                      >
                        {item?.vin || ""}
                      </span>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default function SavedCars({
  item,
  isLastItem = false,
  isHeroCart = false,
  isEngineBay = false,
  index,
  handleSelectCar,
  selectedCar,
  onMarkFavorite,
}: {
  item: any;
  isLastItem?: boolean;
  isHeroCart?: boolean;
  isEngineBay?: boolean;
  index?: number;
  handleSelectCar?: (item: object, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  selectedCar?: object | null;
  onMarkFavorite?: any;
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isHeroCart) {
    return isMobile ? (
      <HeroMobileSectionSavedCard item={item} isHeroCart={isHeroCart} />
    ) : (
      <HeroSectionSavedCard item={item} isHeroCart={isHeroCart} />
    );
  }

  return isEngineBay ? (
    //@ts-ignore
    <GarageBaySavedCar item={item} handleSelectCar={handleSelectCar} selectedCar={selectedCar} />
  ) : (
    <SearchResults item={item} isLastItem={isLastItem} index={index as any} />
  );
}
