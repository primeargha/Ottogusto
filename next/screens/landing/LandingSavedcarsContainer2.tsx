"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Box } from "@/components/ui/box";
import placeHolderImg from "@/assets/placeholdercar.svg";
import placeHolderImgWhite from "@/assets/placeholdercarWhite.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import LeftArrow from "@/public/assets/icons/left-arrow.svg";
import RightArrow from "@/public/assets/Ottogusto/savedcarcarousal_rightArrow.svg";
import { useMedia } from "@/hooks/useMedia";
import DeleteCarIcon from "@/assets/eb-panel/delete-car-icon.svg";
import EditPencilIcon from "@/assets/eb-panel/pencil-car-name-edit-icon.svg";
import FavoriteCarIcon from "@/assets/eb-panel/fav-car-icon.svg";
import MarkedFavoriteCarIcon from "@/assets/eb-panel/marked-fav-car-icon.svg";
import FavoriteStarIcon from "@/assets/eb-panel/fav-star-icon.svg";
import OERefModal from "@/components/OERefModal";
import { useBranding } from "@/contexts/BrandingContext";
import { useMmeStore } from "@/stores/useMmeStore";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { buildPartsCatalogUrl } from "@/utils/categorySearchUrl";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useParams, useRouter } from "next/navigation";
import Typography from "@/components/og-components/Typography";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { Pressable } from "@/components/ui/pressable";
import { carouselImages, garageBayIcons, loggedInUserOGSearchIcons } from "@/constants";
import Modal from "@/components/Modal";
import { useModalStore } from "@/stores/useModalStore";
import { useAddUpdateMyCarsToEB, useDeleteCarFromEB } from "@/hooks/garage";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { OGButton } from "@/components/og-components/OGButton";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import { OGHeaderButton } from "@/components/og-components/OGHeaderButton";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE } from "@/config/store-constants";
import { HERO_BANNER_LABELS } from "@/data/branding/herobanner";
import Link from "next/link";
import { normalizeFooterPath } from "./footer/footerLinkUtils";
import { safeNextImageSrc, safeNextLinkHref } from "@/utils/translationDisplayMode";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";

interface SavedCar {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  typeId: string;
  typeName: string;
  engineId: string;
  engineName: string;
  id: string;
  name: string;
  year: number;
  makeModelTypeId: string;
  isFavorite: boolean;
  isNew: boolean;
  picture: string;
  data?: any;
  carId?: string | null;
}

/**
 * Utility function to check if the car name has been edited by the user.
 * Compares the concatenated backend fields with the actual name.
 * @param car - The saved car object
 * @returns true if the name has been edited, false otherwise
 */
const isCarNameEdited = (car: SavedCar): boolean => {
  // Helper function to normalize strings (remove all spaces and convert to uppercase)
  const normalize = (str: string) => str?.replace(/\s+/g, "")?.trim()?.toUpperCase();

  // Concatenate backend fields
  const backendName = `${car?.brandName} ${car?.modelName} ${car?.typeName} ${car?.engineName}`;

  // Normalize both strings for comparison
  const normalizedBackendName = normalize(backendName);
  const normalizedCarName = normalize(car?.name);

  // If they match, the name has NOT been edited
  return normalizedBackendName !== normalizedCarName;
};

interface LandingSavedcarsContainerProps2 {
  data: SavedCar[];
  onCarSelect?: (car: SavedCar) => void;
  selectedCar?: SavedCar | null | undefined;
  openDeleteModal?: () => void;
}

const currentStore =
  typeof window !== "undefined" ? getStoreFromDomain(window.location.href ?? "") : DEFAULT_STORE;

let bannerImgCount = Object.keys(HERO_BANNER_LABELS).length / 4;

// for Ottogusto don't show 5th banner
// if (currentStore === STORE_IDS.OTTOGUSTO) {
//   bannerImgCount -= 1;
// }

const carouselContent: { title: string; subtitle: string; image: string; imageUrl: string }[] = [];

for (let i = 1; i <= bannerImgCount; i++) {
  carouselContent.push({
    title: `hero_title_${i}`,
    subtitle: `hero_body_${i}`,
    image: `landing_page_hero_image_${i}`,
    imageUrl: `hero_url_${i}`,
  });
}

export default function LandingSavedcarsContainer2({
  data: dataProp,
  onCarSelect,
  selectedCar,
}: LandingSavedcarsContainerProps2) {
  const { getLabel, getLocale } = useBranding();
  const params = useParams();
  const router = useRouter();
  // ✅ Use SavedCarsContext as the source of truth (data prop is kept for backward compatibility)
  const { savedCars: savedCarsFromContext, refreshSavedCars } = useSavedCars();
  // Use context data if available, otherwise fall back to prop (for backward compatibility)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = savedCarsFromContext || dataProp || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRefModal, setShowRefModal] = useState(false);
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === data.length - 1;
  const isMobile = useMedia("(max-width: 639px)");
  const isTablet = useMedia("(min-width: 640px) and (max-width: 1023px)");
  const isSmallMobile = useMedia("(max-width: 380px)");
  const { openModal, closeModal, isOpen } = useModalStore();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slidesContainerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [slideOffsets, setSlideOffsets] = useState<number[]>([]);
  const [maxTranslate, setMaxTranslate] = useState<number>(0);
  const [carToDelete, setCarToDelete] = useState<any>(null);
  const { locale } = useLandingPageDataStore();
  const currentLocale =
    (params as Record<string, string>)?.["language-country"] ?? locale ?? getLocale() ?? "en-BE";
  const favoriteCallbackRef = useRef<(() => void) | null>(null);
  const addUpdateMyCarsMutation = useAddUpdateMyCarsToEB({
    onSuccess: (data: any, variables: any) => {
      // ✅ Refresh saved cars from context (single API call instead of multiple invalidations)
      refreshSavedCars();

      if (variables?.id && selectedSavedCarInLandingPage?.id === variables.id) {
        if (data?.data) {
          setSelectedSavedCarInLandingPage(data.data);
        } else {
          if (selectedSavedCarInLandingPage) {
            setSelectedSavedCarInLandingPage({
              ...selectedSavedCarInLandingPage,
              isFavorite: variables?.isFavorite ?? selectedSavedCarInLandingPage.isFavorite,
            });
          }
        }
      }

      if (favoriteCallbackRef.current) {
        favoriteCallbackRef.current();
        favoriteCallbackRef.current = null;
      }
    },
    onError: () => {
      if (favoriteCallbackRef.current) {
        favoriteCallbackRef.current();
        favoriteCallbackRef.current = null;
      }
    },
  });
  const updateMyCarsToEB = (payload: { id: string; isFavorite?: boolean }) => {
    (addUpdateMyCarsMutation.mutate as (variables: any) => void)(payload);
  };
  const { mutateAsync: deleteCarAsync, isPending: isDeletingCar } = useDeleteCarFromEB();

  const touchStartX = useRef<number | null | undefined>(null);
  const touchEndX = useRef<number | null | undefined>(null);
  const isDragging = useRef(false);
  const minSwipeDistance = 50;
  const {
    resetpartrefnumberwithoutsavedcar,
    selectedSavedCarInLandingPage,
    setSelectedSavedCarInLandingPage,
  } = useMmeStore();

  // Track which data we have already preselected for (by first car id) so we don't overwrite user choice on refresh
  const hasPreselectedForCurrentDataRef = useRef<string | null>(null);

  // Preselect first car when data first becomes available (before paint to avoid flash)
  useLayoutEffect(() => {
    if (!data?.length) {
      hasPreselectedForCurrentDataRef.current = null;
      return;
    }
    const dataKey = data[0]?.id ?? "";
    if (hasPreselectedForCurrentDataRef.current === dataKey) {
      return;
    }
    setSelectedSavedCarInLandingPage(data[0]);
    hasPreselectedForCurrentDataRef.current = dataKey;
  }, [data, setSelectedSavedCarInLandingPage]);

  // Keep selection in sync when data changes while preserving current selection when possible
  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    if (selectedSavedCarInLandingPage) {
      const matchingCar = data.find(
        (car) => String(car.id) === String(selectedSavedCarInLandingPage.id),
      );

      if (matchingCar) {
        if (matchingCar !== selectedSavedCarInLandingPage) {
          setSelectedSavedCarInLandingPage(matchingCar);
        }
        return;
      }
    }

    setSelectedSavedCarInLandingPage(data[0]);
  }, [data, selectedSavedCarInLandingPage, setSelectedSavedCarInLandingPage]);

  useEffect(() => {
    const updateMeasurements = () => {
      const vp = viewportRef.current;
      const container = slidesContainerRef.current;
      if (!vp || !container) return;

      const viewportWidth = vp.clientWidth;
      const totalWidth = container.scrollWidth;

      const offsets = slideRefs.current.map((el) => (el ? el.offsetLeft : 0));
      setSlideOffsets(offsets);

      setMaxTranslate(Math.max(0, totalWidth - viewportWidth));
    };

    updateMeasurements();

    const ro = new ResizeObserver(() => {
      updateMeasurements();
    });

    if (viewportRef.current) ro.observe(viewportRef.current);
    if (slidesContainerRef.current) ro.observe(slidesContainerRef.current);

    slideRefs.current.forEach((el) => {
      if (el) ro.observe(el);
    });

    window.addEventListener("resize", updateMeasurements);
    window.addEventListener("load", updateMeasurements);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateMeasurements);
      window.removeEventListener("load", updateMeasurements);
    };
  }, [data, isMobile, isTablet]);

  const handlePrev = () => {
    if (!isFirstSlide) setCurrentIndex((prev) => prev - 1);
  };

  const handlemodalclose = () => {
    setShowRefModal(false);
    resetpartrefnumberwithoutsavedcar();
  };

  const handleNext = () => {
    if (!isLastSlide) setCurrentIndex((prev) => prev + 1);
  };

  const handleAddAnotherCar = () => {
    useMmeStore.getState().openMmeModal(1);
    useMmeStore.getState().setSearchMode("manually");
  };

  const handleFindCarParts = () => {
    const car = selectedSavedCarInLandingPage;
    const carsApiId = car?.carId?.trim() || car?.data?.carId?.trim() || "";
    const lang = (params as Record<string, string>)?.["language-country"] ?? currentLocale;

    if (carsApiId && lang) {
      router.push(buildPartsCatalogUrl(lang, carsApiId));
      return;
    }

    router.push(getRouteLocaleString(Routes.categorySelection, params));
  };

  const handleToggleFavorite = (car: SavedCar, onComplete?: () => void) => {
    favoriteCallbackRef.current = onComplete ?? null;
    updateMyCarsToEB({
      id: car.id,
      isFavorite: !car.isFavorite,
    });
  };

  const handleCarSelection = (car: SavedCar) => {
    if (onCarSelect) {
      onCarSelect(car);
    } else {
      setSelectedSavedCarInLandingPage(car);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartX.current = e.targetTouches[0]?.clientX;
    touchEndX.current = null;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchEndX.current = e.targetTouches[0]?.clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = () => {
    if (!isMobile || touchStartX.current == null || touchEndX.current == null) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !isLastSlide) {
      handleNext();
    } else if (isRightSwipe && !isFirstSlide) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
    isDragging.current = false;
  };

  let translate = 0;
  if (slideOffsets.length > 0) {
    const desired = slideOffsets[currentIndex] ?? 0;
    translate = Math.min(desired, maxTranslate);
  } else {
    const approximateSlideWidth = isMobile ? 340 : isTablet ? 510 : 561;
    translate = Math.min(
      currentIndex * approximateSlideWidth,
      Math.max(
        0,
        (data?.length ?? 0) * approximateSlideWidth - (viewportRef.current?.clientWidth ?? 0),
      ),
    );
  }

  const handleDeleteConfirm = async () => {
    if (!carToDelete?.id) return;
    try {
      await deleteCarAsync(carToDelete.id);
      closeModal();
      setCarToDelete(null);
      await refreshSavedCars();
    } catch (error: any) {
      console.error("Error deleting car:", error);
    }
  };

  const [currentIndexofImg, setCurrentIndexofImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndexofImage((prevIndex) => (prevIndex + 1) % carouselContent.length);
    }, 15_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      className={`${!getClientFeatureFlag("vin_feature_flag") ? "w-full" : "min-w-[370px]"} flex base:flex-col base:gap-0 gtsm:h-full gtsm:flex-col gtsm:gap-6 gtlg:h-[309px] gtlg:max-h-[310px] gtlg:flex-row gtlg:gap-6`}
    >
      {/* saved cars block */}
      <Box
        className={`flex w-full flex-col rounded-md border border-color-border-emphasis base:order-2 gtsm:h-full gtsm:max-h-[310px] gtsm:min-h-0 ${data.length > 1 ? "gtlg:min-w-[588px] gtlg:max-w-[590px]" : "gtlg:min-w-[496px] gtlg:max-w-[500px]"} `}
      >
        <Box
          className={`relative flex w-full flex-col gap-6 overflow-hidden rounded-t-md bg-white ${data?.length > 1 ? "px-6" : "base:px-4 gtsm:px-6 gtlg:px-6"} pb-4 pt-6 base:h-auto gtsm:h-full gtlg:h-full`}
        >
          <Box className="text-color-text-body typography-heading-01">
            {getLabel("search_car_parts_for")}
          </Box>

          {/* carousel wrapper (viewport) */}
          <Box
            className="relative w-full gtsm:max-h-[120px] gtsm:min-h-[88px] gtlg:max-h-[116px] gtlg:min-h-[88px]"
            ref={viewportRef as any}
          >
            {/* slides container */}
            <Box
              ref={slidesContainerRef as any}
              className="flex flex-row transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${translate}px)`,
              }}
              //@ts-ignore
              onTouchStart={handleTouchStart}
              //@ts-ignore
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {data?.map((car, idx) => (
                <Box
                  key={car.id}
                  // register slide element for measurement
                  ref={(el: any) => (slideRefs.current[idx] = el)}
                  className={`flex flex-shrink-0 flex-row items-center ${data?.length > 1 ? "" : "w-full"}`}
                >
                  <Landingsavedcar2
                    car={car}
                    data={data}
                    isSelected={(selectedCar || selectedSavedCarInLandingPage)?.id === car.id}
                    onSelect={() => handleCarSelection(car)}
                    // setCarToDelete={handle22delete}
                    onToggleFavorite={(onComplete) => handleToggleFavorite(car, onComplete)}
                    openDeleteModal={() => {
                      openModal();
                      setCarToDelete(car);
                    }}
                  />
                  {idx < data.length - 1 && (
                    <>
                      <Box className="base:w-2 md:w-2" />
                    </>
                  )}
                </Box>
              ))}
            </Box>

            {/* Left arrow */}
            {translate > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-1 top-[50%] z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-color-background-neutral-emphasis"
              >
                <Image
                  src={RightArrow}
                  alt="left-arrow"
                  width={36}
                  height={36}
                  className="scale-x-[-1]"
                />
              </button>
            )}

            {/* Right arrow */}
            {translate < maxTranslate && (
              <Box className="absolute right-1 top-[50%] z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-color-background-neutral-emphasis">
                <button
                  onClick={handleNext}
                  className="flex h-full w-full items-center justify-center rounded-full"
                >
                  <Image src={RightArrow} alt="right-arrow" width={28} height={28} />
                </button>
              </Box>
            )}
          </Box>
        </Box>

        {/* bottom group */}
        <Box className="relative z-0 flex w-full items-center justify-between rounded-b-md border-t border-color-border-default bg-white base:h-auto base:flex-col base:px-4 base:py-3 gtsm:max-h-[75px] gtsm:min-h-[74px] gtsm:flex-row gtsm:px-6 gtsm:py-4 gtlg:max-h-[75px] gtlg:min-h-[74px] gtlg:px-6 gtlg:py-4">
          {/* 2 buttons group */}
          <Box className="flex h-full base:order-1 base:w-full base:flex-col base:gap-2 gtsm:order-2 gtsm:w-auto gtsm:flex-row gtsm:gap-3 gtlg:gap-3">
            <OGButton
              type="outlined"
              onClick={handleAddAnotherCar}
              className="base:order-2 base:w-full gtsm:w-auto gtlg:order-1 gtlg:w-auto"
            >
              {getLabel("other_car")}
            </OGButton>
            <OGButton
              onClick={handleFindCarParts}
              className="base:order-1 base:w-full gtsm:w-auto gtlg:order-2 gtlg:w-auto"
            >
              {getLabel("find_car_parts")}
            </OGButton>
          </Box>

          {/* part ref. number text */}
          <Box className="base:order-1 gtsm:order-1 gtsm:mb-0">
            <OGButton
              type="ghost"
              className="cursor-pointer text-color-primary-main"
              onClick={() => setShowRefModal(true)}
            >
              {getLabel("search_by_part_reference_number")}
            </OGButton>
          </Box>
        </Box>

        <OERefModal isOpen={showRefModal} onClose={handlemodalclose} />
        <Modal
          width="max-w-md"
          containerClassName="z-[1000]"
          modalClassName="rounded-[8px] bg-color-background-l2 w-full gtsm:min-w-[600px] h-auto p-6"
          backdropClass="bg-black bg-opacity-50"
          showCloseButton={false}
          contentClassName="px-0 py-0"
          footerClassName="bg-color-background-l2 gtsm:pb-0"
          footerComponent={
            <Box className="mt-4 flex w-full flex-row justify-center gap-4">
              <Button
                onPress={() => {
                  closeModal();
                  setCarToDelete(null);
                }}
                className="flex h-[42px] w-[74px] items-center rounded-[4px] border border-color-primary-main bg-transparent p-[10px] hover:bg-color-primary-disabled"
              >
                <Text className="text-color-primary-main body-regular-sm">
                  {getLabel("cancel")}
                </Text>
              </Button>
              <Button
                className="h-[42px] rounded-[4px] bg-button-danger-bg-default px-5 py-2 hover:bg-button-danger-bg-hover"
                onPress={handleDeleteConfirm}
                isDisabled={!carToDelete || isDeletingCar}
              >
                <Text className="text-center text-color-text-on-dark body-regular-sm">
                  {getLabel("delete")}
                </Text>
              </Button>
            </Box>
          }
        >
          <Box className="flex flex-col items-center justify-center gap-4">
            <Box className="flex items-center justify-center rounded-[8px] bg-color-system-warning-extra-light p-3">
              <Image
                src={`/assets/eb-panel/alert-triangle.svg`}
                height={62}
                width={62}
                alt="delete"
              />
            </Box>

            <Text className="text-center text-color-text-body body-bold-md">
              {getLabel("delete_car_confirmation")}
            </Text>
            <Text className="text-color-text-body body-regular-sm">
              {getLabel("action_undone")}
            </Text>
          </Box>
        </Modal>
      </Box>

      {/* images block */}
      <Box
        className={`w-full ${!isMobile ? "gtsm:h-[265px] gtsm:max-h-[266px] gtlg:min-h-full" : "max-h-[180px] min-h-[180px] base:pb-3 gtsm:pb-0 gtlg:pb-0"} base:order-1 gtsm:order-1 gtlg:order-2`}
      >
        <Box className="relative h-full min-h-0 w-full items-start justify-end overflow-hidden base:py-4 base:pl-4 gtlg:py-6 gtlg:pl-8">
          {/* Carousel Images Container */}
          <Box className="absolute inset-0">
            {carouselContent.map((node, index) => {
              const rawUrl = getLabel(node.imageUrl, { locale: currentLocale });
              const href = normalizeFooterPath(rawUrl, currentLocale);
              return (
                <Box
                  key={index}
                  className="absolute inset-0 cursor-pointer transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(${(index - currentIndexofImg) * 100}%)`,
                  }}
                  // onClick={() => {
                  //   const url = getLabel(node.imageUrl);
                  //   if (url) window.open(url, "_blank", "noopener,noreferrer");
                  // }}
                >
                  <Link href={safeNextLinkHref(href)} key={index}>
                    <Image
                      src={safeNextImageSrc(getLabel(node.image))}
                      alt={getLabel(node.subtitle)}
                      fill
                      priority={index === 0}
                      className="cursor-pointer object-cover object-center opacity-100"
                      sizes="100vw"
                    />
                  </Link>
                </Box>
              );
            })}

            <Box className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            {/* STATIC BOTTOM-RIGHT CLIPPED SHAPE */}
            <Box className="border-3 pointer-events-none absolute bottom-[-1px] right-[-1px] z-[10] h-[66px] w-[106px] border-color-border-default bg-color-border-default [clip-path:polygon(0_100%,100%_100%,100%_0)]" />
          </Box>

          {/* Foreground Content */}
          <Box className="relative z-10 flex w-full flex-col gap-2">
            <Typography className="text-color-text-inverse typography-heading-02">
              {carouselContent[currentIndexofImg] &&
                getLabel(carouselContent[currentIndexofImg].title)}
            </Typography>

            <Typography className="text-color-text-inverse typography-subtitle-01">
              {carouselContent[currentIndexofImg] &&
                getLabel(carouselContent[currentIndexofImg].subtitle)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* Landingsavedcar component with selection functionality */
const Landingsavedcar2 = ({
  car,
  isSelected,
  onSelect,
  //setCarToDelete,
  onToggleFavorite,
  data,
  openDeleteModal,
}: {
  car: SavedCar;
  isSelected: boolean;
  onSelect: () => void;
  //setCarToDelete: (car: any) => void;
  onToggleFavorite: (onComplete: () => void) => void;
  data: SavedCar[];
  openDeleteModal: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    setSelectedSavedCarInLandingPage,
    setSearchMode,
    openMmeModal,
    setIsEB,
    setEbMode,
    generateMmeSearchData,
    setIsEditFromLandingPage,
  } = useMmeStore();
  const { setSelectedCar } = useSelectedCarStore();
  const [openMenu, setOpenMenu] = useState(false);
  useClickOutside(menuRef, () => {
    setOpenMenu(false);
  });
  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };
  const { getLabel } = useBranding();
  const { openModal, closeModal, isOpen } = useModalStore();
  const router = useRouter();
  const params = useParams();
  const handleEditAddress = async (car: SavedCar) => {
    setSelectedSavedCarInLandingPage(car);
    setSelectedCar(car as any);

    setSearchMode("manually");
    setIsEB(true);
    setIsEditFromLandingPage(true);
    setEbMode("edit");
    openMmeModal(1);

    if (car.makeModelTypeId) {
      try {
        await generateMmeSearchData(car.makeModelTypeId);
      } catch (error) {
        console.error("Error preloading MME data for edit:", error);
      }
    }
  };
  const [isDeskTopMenuOpen, setisDeskTopMenuOpen] = useState(false);

  // Check if the car name has been edited by the user
  const isEditedName = isCarNameEdited(car);

  useEffect(() => {
    function handleScroll() {
      if (openMenu) {
        setOpenMenu(false);
      }
    }

    // Listen to window scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Optional: Listen to scrollable containers
    const scrollable = document.querySelector(".scroll-container");
    scrollable?.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      scrollable?.removeEventListener("scroll", handleScroll);
    };
  }, [openMenu]);

  return (
    <Box
      className={`group flex h-full w-full cursor-pointer flex-row justify-between rounded-[8px] p-[16px] ${
        data?.length > 1
          ? "gtsm:min-w-[370px] gtsm:max-w-[372px] gtlg:min-w-[290px] gtlg:max-w-[292px]"
          : "w-full"
      } ${
        isSelected
          ? "bg-color-background-visited-emphasis"
          : "border-bg-color-border-emphasis border bg-color-background-emphasis hover:bg-color-background-visited-emphasis"
      } `}
      onClick={onSelect}
    >
      {/* car details */}
      <Box className="relative flex w-full flex-col">
        <Box className="relative flex w-full flex-row items-center justify-between base:h-[50%] gtsm:h-[50%] gtlg:h-[50%]">
          <Box className="flex flex-row items-center gap-2">
            <Typography
              type="h2"
              className={` ${isSelected ? "text-white" : "text-color-text-body group-hover:text-white"} line-clamp-1 typography-heading-02`}
            >
              {`${car.brandName} ${car.modelName}` || "Car name"}
              {/* {car?.brandName + " " + car.brandName || "Car name"} */}
            </Typography>
            {car.isFavorite && (
              <Box className="flex max-h-[30px] min-h-[30px] min-w-[30px] max-w-[30px] items-center justify-center rounded bg-color-secondary-disabled">
                <Image src={FavoriteStarIcon} alt="favorite" width={20} height={20} />
              </Box>
            )}
          </Box>{" "}
          <>
            <Menu
              offset={5}
              // onClick={openMenu}
              // isOpen={isDeskTopMenuOpen}
              isOpen={openMenu}
              // onOpenChange={isDeskTopMenuOpen}
              disabledKeys={["Settings"]}
              ref={menuRef as any}
              className="absolute right-[1px] top-1 z-[999] rounded-md bg-white shadow-md"
              trigger={({ ...triggerProps }) => (
                <Pressable
                  {...triggerProps}
                  onPress={() => {
                    toggleMenu();
                  }}
                  className="relative h-[24px] w-[24px] flex-row items-center justify-center"
                >
                  {/* default gray icon */}
                  <Image
                    src={loggedInUserOGSearchIcons.moreInfo}
                    height={24}
                    width={24}
                    alt="more info"
                    className={`${isSelected ? "hidden" : "block group-hover:hidden"}`}
                  />

                  {/* white hover/selected icon */}
                  <Image
                    src={loggedInUserOGSearchIcons.moreInfoWhite}
                    height={24}
                    width={24}
                    alt="more info hover"
                    className={`${isSelected ? "block" : "hidden group-hover:block"}`}
                  />
                </Pressable>
              )}
            >
              {/* FAVORITE */}
              <MenuItem>
                <Pressable
                  onPress={() => {
                    onToggleFavorite(() => setOpenMenu(false));
                  }}
                  className="z-[999] flex w-[220px] flex-col justify-start gap-1 rounded-t-md"
                >
                  <Box className="flex flex-row items-center gap-2 px-[15px] py-0">
                    <Image
                      src={car.isFavorite ? MarkedFavoriteCarIcon : FavoriteCarIcon}
                      height={20}
                      width={20}
                      alt="favorite car"
                    />
                    <Box className="text-[14px] font-normal leading-[18px] text-color-text-body">
                      {car.isFavorite
                        ? getLabel("remove_favorite_btn")
                        : getLabel("select_favorite_btn")}
                    </Box>
                  </Box>
                </Pressable>
              </MenuItem>

              {/* EDIT */}
              <MenuItem>
                <Pressable
                  onPress={() => {
                    setOpenMenu(false);
                    handleEditAddress(car);
                  }}
                  className="z-[999] flex w-[220px] flex-col justify-start gap-1 rounded-none"
                >
                  <Box className="flex flex-row items-center gap-2 px-[15px] py-0">
                    <Image src={EditPencilIcon} height={20} width={20} alt="edit car" />
                    <Box className="text-[14px] font-normal leading-[18px] text-color-text-body">
                      {getLabel("edit_car_in_garage")}
                    </Box>
                  </Box>
                </Pressable>
              </MenuItem>

              {/* DELETE */}
              <MenuItem>
                <Pressable
                  onPress={() => {
                    setOpenMenu(false);
                    openDeleteModal();
                    //  setCarToDelete(car);
                  }}
                  className="z-[999] flex w-[220px] flex-col justify-start gap-2 rounded-b-lg"
                >
                  <Box className="flex flex-row items-center gap-2 px-[15px] py-0">
                    <Image src={DeleteCarIcon} height={20} width={20} alt="delete" />
                    <Box className="text-[14px] font-normal leading-[18px] text-color-text-body">
                      {getLabel("delete")}
                    </Box>
                  </Box>
                </Pressable>
              </MenuItem>
            </Menu>
          </>
          {/* {openMenu && (
              <Box ref={menuRef} className="absolute right-0 top-12 z-[999]">
                <MenuItem2
                  id={car.id}
                  item={car}
                  onClose={() => setOpenMenu(false)}
                  handleEditAddress={handleEditAddress}
                  handleDeleteAddress={() => {}}
                  onToggleFavorite={onToggleFavorite}
                  openDeleteModal={() => {
                    openModal();
                    setCarToDelete(car);
                  }}
                />
              </Box>
            )} */}
        </Box>
        <Box
          className={`flex h-full w-full flex-col items-center ${isEditedName ? "justify-between" : "justify-around"}`}
        >
          {isEditedName && (
            <Box
              className={`w-full text-wrap body-regular-md ${isSelected ? "text-white" : "text-color-text-body group-hover:text-white"}`}
            >
              {`${car?.brandName} ${car?.modelName} ${car?.typeName}` || "Car name"}
            </Box>
            // <Typography
            //   type="h2"
            //   className={` ${isSelected ? "text-white" : "text-color-text-body group-hover:text-white"} line-clamp-1`}
            // >
            //   {`${car.brandName} ${car.modelName} ${car.typeName}` || "Car name"}
            //   {/* {car?.name || "Car name"} */}
            // </Typography>
          )}

          <Typography
            className={`line-clamp-1 w-full text-wrap typography-body-02 ${isSelected ? "text-color-text-inverse" : "text-color-text-default group-hover:text-white"}`}
          >
            {/* "engine name" */}
            {car.engineName || "Engine details"}
          </Typography>
        </Box>

        {getClientFeatureFlag("vin_feature_flag") && car.id && (
          <Box className="flex items-start base:flex-col base:gap-3 gtsm:flex-row gtsm:gap-4">
            {/* <Box
              className={`body-bold-sm ${isSelected ? "text-white" : "text-color-text-body group-hover:text-white"}`}
            >
              {getLabel("model_year")} {car.year || "Year"}
            </Box> */}

            {getClientFeatureFlag("vin_feature_flag") && car.id && (
              <Box
                className={`body-bold-sm ${isSelected ? "text-white" : "text-color-text-body group-hover:text-white"}`}
              >
                {getLabel("vin")}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
