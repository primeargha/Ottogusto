"use client";

import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { useBranding } from "@/contexts/BrandingContext";
import NewCatagoryTile from "./newCategory-tile";
import { useCallback, useEffect, useRef, useState } from "react";
import CatagoryTile from "./category-tile";
import { Pressable } from "@/components/ui/pressable";
import LeftArrow from "@/public/assets/icons/left-arrow.svg";
import RightArrow from "@/public/assets/icons/right-arrow.svg";
import Image from "next/image";

import { PartsCategoryInterface } from "@/stores/useAdvancedSearchStore";
import { getTitleOfCategory } from "@/helpers/UtilityHelper";
import { useCategories } from "@/contexts/CategoriesContext";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";
import MainBlock from "./main-block";

type Props = {
  categories: PartsCategoryInterface[];
  gotoStep: (step: number) => void;
  setSelectedCategories: (data: any) => void;
  forOGSearch?: boolean;
  forLandingPage?: boolean;
  disableNextCallback?: (val: any) => void;
};

const CategoryList = (props: Props) => {
  const { getLabel, getLocale } = useBranding();
  let { data: CategoryNestedList, isPending } = useCategories();
  const { L1CatExpanded, setL1CatExpanded, setL2CatExpanded } = useNewCategorySearchStore();
  const locale = getLocale();
  const {
    categories,
    gotoStep,
    setSelectedCategories,
    forOGSearch = false,
    forLandingPage = false,
    disableNextCallback,
  } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [transformValue, setTransformValue] = useState("translateX(0)");
  const [isMounted, setIsMounted] = useState(false);

  const [ContainerWidthMax, setContainerWidthMax] = useState(216 * categories.length);
  const [DisableNext, setDisableNext] = useState(false);
  useEffect(() => {
    if (disableNextCallback) {
      disableNextCallback(DisableNext);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DisableNext]);

  useEffect(() => {
    if (typeof window !== "undefined" && isMounted) {
      const cardWidth = 280;
      const containerWidth = window.innerWidth;
      const pixelMove = currentIndex * cardWidth;
      setTransformValue(`translateX(-${pixelMove}px)`);
    }
  }, [currentIndex, isMounted]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);

    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;

      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
      const containerWidth = scrollContainerRef.current.scrollLeft;
      if (ContainerWidthMax - containerWidth < window.innerWidth - 216) {
        setDisableNext(true);
      } else {
        setDisableNext(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDragging, startX, scrollLeft],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Box className="h-full w-full overflow-hidden overflow-y-auto bg-color-background-default scrollbar-hide base:mt-4 gtsm:mt-2 gtsm:px-8 gtlg:mt-2 between-0-640:px-2">
      <MainBlock columnCount={1} noWrap={true} phoneColumnCount={1} showDescription={false} />
    </Box>
  );
};

export default CategoryList;
