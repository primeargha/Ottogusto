"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { View } from "react-native";
import Image from "next/image";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Menu, MenuItem } from "@/components/ui/menu";
import Typography from "@/components/og-components/Typography";
import { OGButton } from "@/components/og-components/OGButton";
import DeleteCarConfirmModal from "@/components/DeleteCarConfirmModal";
import { HERO_CAR_SELECT_EVENT } from "@/constants/heroCars";
import { useLandingHeroCarStore } from "@/stores/useLandingHeroCarStore";
import { clearGuestSelectionClearedFlag } from "@/utils/searchedCarIdsSession";
import { useModalStore } from "@/stores/useModalStore";
import { useBranding } from "@/contexts/BrandingContext";
import { useMedia } from "@/hooks/useMedia";
import { useClickOutside } from "@/hooks/useClickOutside";
import { loggedInUserOGSearchIcons } from "@/constants";
import RightArrow from "@/public/assets/Ottogusto/savedcarcarousal_rightArrow.svg";
import DeleteCarIcon from "@/assets/eb-panel/delete-car-icon.svg";
import EditPencilIcon from "@/assets/eb-panel/pencil-car-name-edit-icon.svg";

export type HeroCarDataItem = {
  id: string;
  carId: string;
  title: string;
  subtitle?: string;
  /** E2E: VIN when this saved car originated from Search by VIN. */
  vin?: string | null;
};

type HeroCarDataCardProps = {
  cars: HeroCarDataItem[];
  onOpenOtherCar: () => void;
  onFindCarParts: (carId: string) => void;
  onDeleteCar?: (item: HeroCarDataItem) => void | Promise<void>;
  onEditCar?: (item: HeroCarDataItem) => void;
};

type HeroSavedCarSlideProps = {
  car: HeroCarDataItem;
  isSelected: boolean;
  multiCar: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onRequestDelete?: () => void;
  showMenu: boolean;
};

function HeroSavedCarSlide({
  car,
  isSelected,
  multiCar,
  onSelect,
  onEdit,
  onRequestDelete,
  showMenu,
}: HeroSavedCarSlideProps) {
  const { getLabel } = useBranding();
  const menuRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState(false);

  useClickOutside(menuRef, () => setOpenMenu(false));

  useEffect(() => {
    const handleScroll = () => {
      if (openMenu) setOpenMenu(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [openMenu]);

  const stopMenuEvent = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <Box
      className={`group flex h-full min-h-[72px] w-full min-w-0 max-w-full cursor-pointer flex-row justify-between rounded-[8px] p-3 gtsm:min-h-[72px] gtlg:min-h-[80px] ${
        isSelected
          ? "bg-color-background-visited-emphasis"
          : "border border-color-border-emphasis bg-color-background-emphasis hover:bg-color-background-visited-emphasis"
      }`}
      onClick={onSelect}
    >
      <Box className="relative flex w-full flex-col justify-between">
        <Box className="relative flex w-full flex-row items-center justify-between">
          <Typography
            type="h2"
            className={`line-clamp-1 typography-heading-02 ${
              isSelected ? "text-white" : "text-color-text-body group-hover:text-white"
            }`}
          >
            {car.title || "Car"}
          </Typography>

          {showMenu && (onEdit || onRequestDelete) && (
            <Menu
              offset={5}
              isOpen={openMenu}
              ref={menuRef as any}
              className="absolute right-0 top-0 z-[999] rounded-md bg-white shadow-md"
              trigger={({ ...triggerProps }) => (
                <Pressable
                  {...triggerProps}
                  onPress={(e) => {
                    stopMenuEvent(e as unknown as React.SyntheticEvent);
                    setOpenMenu((prev) => !prev);
                  }}
                  className="relative z-10 flex h-6 w-6 items-center justify-center"
                >
                  <Image
                    src={loggedInUserOGSearchIcons.moreInfo}
                    height={24}
                    width={24}
                    alt="more info"
                    className={`${isSelected ? "hidden" : "block group-hover:hidden"}`}
                  />
                  <Image
                    src={loggedInUserOGSearchIcons.moreInfoWhite}
                    height={24}
                    width={24}
                    alt="more info"
                    className={`${isSelected ? "block" : "hidden group-hover:block"}`}
                  />
                </Pressable>
              )}
            >
              {onEdit && (
                <MenuItem>
                  <Pressable
                    onPress={(e) => {
                      stopMenuEvent(e as unknown as React.SyntheticEvent);
                      setOpenMenu(false);
                      onEdit();
                    }}
                    className="flex w-[220px] flex-col justify-start gap-1 rounded-none"
                  >
                    <Box className="flex flex-row items-center gap-2 px-[15px] py-2">
                      <Image src={EditPencilIcon} height={20} width={20} alt="edit car" />
                      <Box className="text-[14px] font-normal leading-[18px] text-color-text-body">
                        {getLabel("edit_car_in_garage") !== "edit_car_in_garage"
                          ? getLabel("edit_car_in_garage")
                          : getLabel("edit_car") !== "edit_car"
                            ? getLabel("edit_car")
                            : "Edit"}
                      </Box>
                    </Box>
                  </Pressable>
                </MenuItem>
              )}
              {onRequestDelete && (
                <MenuItem>
                  <Pressable
                    onPress={(e) => {
                      stopMenuEvent(e as unknown as React.SyntheticEvent);
                      setOpenMenu(false);
                      onRequestDelete();
                    }}
                    className="flex w-[220px] flex-col justify-start gap-1 rounded-b-lg"
                  >
                    <Box className="flex flex-row items-center gap-2 px-[15px] py-2">
                      <Image src={DeleteCarIcon} height={20} width={20} alt="delete" />
                      <Box className="text-[14px] font-normal leading-[18px] text-color-text-body">
                        {getLabel("delete") !== "delete" ? getLabel("delete") : "Delete"}
                      </Box>
                    </Box>
                  </Pressable>
                </MenuItem>
              )}
            </Menu>
          )}
        </Box>

        {car.subtitle ? (
          <Typography
            className={`mt-2 line-clamp-2 typography-body-02 ${
              isSelected
                ? "text-color-text-inverse"
                : "text-color-text-default group-hover:text-white"
            }`}
          >
            {car.subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export default function HeroCarDataCard({
  cars,
  onOpenOtherCar,
  onFindCarParts,
  onDeleteCar,
  onEditCar,
}: HeroCarDataCardProps) {
  const { getLabel } = useBranding();
  const isMobile = useMedia("(max-width: 639px)");
  const isTablet = useMedia("(min-width: 640px) and (max-width: 1023px)");

  const safeCars = useMemo(() => cars.filter((c) => c.carId && c.id), [cars]);
  const count = safeCars.length;
  const multiCar = count > 1;

  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carToDelete, setCarToDelete] = useState<HeroCarDataItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { openModal, closeModal } = useModalStore();

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slidesContainerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [slideOffsets, setSlideOffsets] = useState<number[]>([]);
  const [maxTranslate, setMaxTranslate] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;
  const hasPreselectedRef = useRef<string | null>(null);

  const title =
    getLabel("search_car_parts_for") !== "search_car_parts_for"
      ? getLabel("search_car_parts_for")
      : "Search car parts for";

  const selectedCar = useMemo(
    () => safeCars.find((c) => c.id === selectedCarId) ?? safeCars[0] ?? null,
    [safeCars, selectedCarId],
  );

  const setSelectedCarsApiId = useLandingHeroCarStore((s) => s.setSelectedCarsApiId);

  useEffect(() => {
    const id = selectedCar?.carId || selectedCar?.id || null;
    // Homepage hero always has a default selected car — that reactivates guest
    // active selection (after Deselect) so outbound nav / banners get carIds again.
    if (id) {
      clearGuestSelectionClearedFlag();
    }
    setSelectedCarsApiId(id);
  }, [selectedCar?.carId, selectedCar?.id, setSelectedCarsApiId]);

  useLayoutEffect(() => {
    if (!safeCars.length) {
      hasPreselectedRef.current = null;
      setSelectedCarId(null);
      return;
    }
    const dataKey = safeCars.map((c) => c.id).join(",");
    if (hasPreselectedRef.current === dataKey) return;

    setSelectedCarId(safeCars[0]!.id);
    setCurrentIndex(0);
    hasPreselectedRef.current = dataKey;
  }, [safeCars]);

  useEffect(() => {
    if (!safeCars.length) {
      setSelectedCarId(null);
      setCurrentIndex(0);
      return;
    }

    if (selectedCarId && safeCars.some((c) => c.id === selectedCarId)) {
      return;
    }

    setSelectedCarId(safeCars[0]!.id);
    setCurrentIndex((prev) => Math.min(prev, safeCars.length - 1));
  }, [safeCars, selectedCarId]);

  useEffect(() => {
    const onSelectCar = (event: Event) => {
      const carId = (event as CustomEvent<{ carId?: string }>).detail?.carId?.trim();
      if (!carId || !safeCars.length) return;

      const index = safeCars.findIndex((c) => c.id === carId || c.carId === carId);
      if (index < 0) return;

      const car = safeCars[index]!;
      setSelectedCarId(car.id);
      setCurrentIndex(index);
      clearGuestSelectionClearedFlag();
      setSelectedCarsApiId(car.carId || car.id);
    };

    window.addEventListener(HERO_CAR_SELECT_EVENT, onSelectCar);
    return () => window.removeEventListener(HERO_CAR_SELECT_EVENT, onSelectCar);
  }, [safeCars, setSelectedCarsApiId]);

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

    const ro = new ResizeObserver(updateMeasurements);
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
  }, [safeCars, isMobile, isTablet]);

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex >= Math.max(count - 1, 0);

  let translate = 0;
  if (slideOffsets.length > 0) {
    const desired = slideOffsets[currentIndex] ?? 0;
    translate = Math.min(desired, maxTranslate);
  } else if (multiCar) {
    const approximateSlideWidth = isMobile ? 340 : isTablet ? 510 : 561;
    translate = Math.min(
      currentIndex * approximateSlideWidth,
      Math.max(0, count * approximateSlideWidth - (viewportRef.current?.clientWidth ?? 0)),
    );
  }

  const showPrevArrow = multiCar && translate > 0;
  const showNextArrow = multiCar && translate < maxTranslate;

  const handlePrev = useCallback(() => {
    if (!isFirstSlide) setCurrentIndex((prev) => prev - 1);
  }, [isFirstSlide]);

  const handleNext = useCallback(() => {
    if (!isLastSlide) setCurrentIndex((prev) => prev + 1);
  }, [isLastSlide]);

  const handleSelectCar = useCallback(
    (car: HeroCarDataItem, index: number) => {
      setSelectedCarId(car.id);
      setCurrentIndex(index);
      clearGuestSelectionClearedFlag();
      setSelectedCarsApiId(car.carId || car.id);
    },
    [setSelectedCarsApiId],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !multiCar) return;
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !multiCar) return;
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (!isMobile || !multiCar || touchStartX.current == null || touchEndX.current == null) {
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance && !isLastSlide) handleNext();
    else if (distance < -minSwipeDistance && !isFirstSlide) handlePrev();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const openDeleteModal = (car: HeroCarDataItem) => {
    setCarToDelete(car);
    openModal();
  };

  const closeDeleteModal = () => {
    closeModal();
    setCarToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!carToDelete || !onDeleteCar) return;
    setIsDeleting(true);
    try {
      await onDeleteCar(carToDelete);
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!count) {
    return null;
  }

  return (
    <Box className="flex h-full min-h-0 w-full max-w-full flex-col rounded-md border border-color-border-emphasis bg-color-background-default base:min-h-0 gtsm:min-h-0">
      <Box
        className={`relative flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-t-md bg-white ${multiCar ? "px-6" : "px-4 gtsm:px-6"} pb-4 pt-4 gtsm:gap-3 gtsm:pt-4`}
      >
        <Box className="line-clamp-1 shrink-0 truncate text-color-text-body typography-heading-01">
          {title}
        </Box>

        <Box
          className="relative h-full min-h-[72px] w-full flex-1 gtsm:min-h-[72px] gtlg:min-h-[80px]"
          ref={viewportRef as RefObject<View & HTMLDivElement>}
        >
          <Box
            ref={slidesContainerRef as RefObject<View & HTMLDivElement>}
            className="flex h-full flex-row items-stretch transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${translate}px)` }}
            onTouchStart={handleTouchStart as any}
            onTouchMove={handleTouchMove as any}
            onTouchEnd={handleTouchEnd as any}
          >
            {safeCars.map((car, idx) => (
              <Box
                key={car.id}
                ref={(el) => {
                  slideRefs.current[idx] = el as HTMLDivElement | null;
                }}
                className={`flex h-full shrink-0 flex-row items-stretch ${multiCar ? "w-[88%] max-w-full" : "w-full"}`}
              >
                <HeroSavedCarSlide
                  car={car}
                  multiCar={multiCar}
                  isSelected={selectedCar?.id === car.id}
                  onSelect={() => handleSelectCar(car, idx)}
                  showMenu={Boolean(onEditCar || onDeleteCar)}
                  {...(onEditCar ? { onEdit: () => onEditCar(car) } : {})}
                  {...(onDeleteCar ? { onRequestDelete: () => openDeleteModal(car) } : {})}
                />
                {idx < count - 1 && <Box className="w-2 shrink-0" />}
              </Box>
            ))}
          </Box>

          {showPrevArrow && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous car"
              className="absolute left-1 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-color-background-neutral-emphasis"
            >
              <Image
                src={RightArrow}
                alt="previous"
                width={28}
                height={28}
                className="scale-x-[-1]"
              />
            </button>
          )}

          {showNextArrow && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next car"
              className="absolute right-1 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-color-background-neutral-emphasis"
            >
              <Image src={RightArrow} alt="next" width={28} height={28} />
            </button>
          )}
        </Box>
      </Box>

      <Box className="relative z-0 flex w-full shrink-0 flex-row items-center justify-end gap-2 rounded-b-md border-t border-color-border-default bg-white px-4 py-3 gtsm:max-h-[74px] gtsm:min-h-[74px] gtsm:gap-3 gtsm:px-6 gtsm:py-3 gtlg:max-h-[75px] gtlg:min-h-[75px]">
        <Box className="flex w-full flex-row items-center justify-end gap-2 gtsm:w-auto gtsm:gap-3">
          <OGButton
            type="outlined"
            onClick={onOpenOtherCar}
            className="base:flex-1 gtsm:w-auto gtsm:flex-none"
          >
            {getLabel("other_car") !== "other_car" ? getLabel("other_car") : "Other car"}
          </OGButton>
          <OGButton
            type="primary"
            onClick={() => {
              if (!selectedCar?.carId) return;
              clearGuestSelectionClearedFlag();
              setSelectedCarsApiId(selectedCar.carId);
              onFindCarParts(selectedCar.carId);
            }}
            disabled={!selectedCar?.carId}
            className="base:flex-1 gtsm:w-auto gtsm:flex-none"
          >
            {getLabel("find_car_parts") !== "find_car_parts"
              ? getLabel("find_car_parts")
              : "Find car parts"}
          </OGButton>
        </Box>
      </Box>

      {onDeleteCar && (
        <DeleteCarConfirmModal
          isOpen={Boolean(carToDelete)}
          isDeleting={isDeleting}
          onCancel={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </Box>
  );
}
