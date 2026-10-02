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
import CategoryTile from "../landing/browse-by-category-new/category-tile";
import { PartsCategoryInterface } from "@/stores/useAdvancedSearchStore";
import { getTitleOfCategory } from "@/helpers/UtilityHelper";
import { useCategories } from "@/contexts/CategoriesContext";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";
import MainBlock from "../landing/browse-by-category-new/main-block";

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
      const cardWidth = 280; // Fixed card width in pixels
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

    // Prevent text selection during drag
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;

      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Multiply by 2 for faster scrolling
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

  const [isFirstSlide, setIsFirstSlide] = useState(true);

  // changes Arrow disabled state on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setIsFirstSlide(scrollContainerRef.current.scrollLeft <= 100);
      }
    };

    const refCurrent = scrollContainerRef.current;
    if (refCurrent) {
      refCurrent.addEventListener("scroll", handleScroll);
      // Set initial state
      setIsFirstSlide(refCurrent.scrollLeft <= 100);
    }
    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  if (forLandingPage) {
    return (
      <Box className="grid grid-cols-1 gap-[24px] bg-green-600 md:grid-cols-2">
        {categories?.map((category, indx) => {
          return (
            <CatagoryTile
              key={indx}
              category={category}
              gotoStep={gotoStep}
              setSelectedCategories={setSelectedCategories}
              forOGSearch={forOGSearch}
              forLandingPage={true}
              id={category.id}
              parentId={category.parentId}
              title={category.name}
              handleExpand={() => {}}
            />
          );
        })}
        {/* Last Tile for with content */}
        <Box className="flex w-full flex-row content-center items-center">
          <Box className="relative line-clamp-1 w-full content-center items-center text-center font-Anton text-[22px] font-normal leading-7 text-color-primary-main">
            {/* Master that machine of yours.
            <br />
            One of a kind — just like you. */}
            {getLabel("categorysection_btf_tagline")}
          </Box>
        </Box>
      </Box>
    );
  }

  const handlePrevCategory = () => {
    if (scrollContainerRef.current) {
      const element = scrollContainerRef.current;
      //@ts-ignore
      const oneSlide = element.scrollWidth % element.parentElement.clientWidth;
      const scrollAmount = oneSlide;

      const containerWidth = element.scrollLeft;
      const moveBy = element.scrollLeft + scrollAmount;
      if (ContainerWidthMax - containerWidth <= window.innerWidth - oneSlide) {
        setDisableNext(true);
      } else {
        setDisableNext(false);
      }
      const left = element.scrollLeft - scrollAmount;
      element.scrollTo({
        left: left,
        behavior: "smooth",
      });
      setTimeout(() => {
        const hasNoLeftScrollSpace = element.scrollLeft <= 0;
        setIsFirstSlide(hasNoLeftScrollSpace);
      }, 100);
    }
  };
  const handleNextCategory = () => {
    if (scrollContainerRef.current) {
      const element = scrollContainerRef.current;
      //@ts-ignore
      const oneSlide = element.scrollWidth % element.parentElement.clientWidth;
      const scrollAmount = oneSlide;

      const containerWidth = element.scrollLeft;
      const moveBy = element.scrollLeft + scrollAmount;
      element.scrollTo({
        left: moveBy,
        behavior: "smooth",
      });

      setTimeout(() => {
        // debugger;
        // Use setTimeout to ensure scrollLeft is updated after smooth scroll
        const hasNoRightScrollSpace =
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 216;
        console.error();
        const diff = element.scrollWidth - 216 - (element.scrollLeft + element.clientWidth);

        setDisableNext(hasNoRightScrollSpace && diff <= -208); // should be 216 but 208 for better UX
      }, 800);
    }
  };

  const isRightArrowDisabled = () => {
    return false;
  };

  if (forOGSearch) {
    return (
      <Box>
        <>
          <Pressable
            onPress={handlePrevCategory}
            disabled={isFirstSlide}
            className={`absolute left-[-32px] top-[calc(50%-20px)] z-30 -translate-y-1/2 xs:hidden lg:block ${
              isFirstSlide ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <Image src={LeftArrow} alt="left-arrow" height={30} width={30} />
          </Pressable>

          <Pressable
            onPress={handleNextCategory}
            disabled={DisableNext}
            className={`absolute right-[-32px] top-[calc(50%-20px)] z-30 -translate-y-1/2 xs:hidden lg:block ${
              DisableNext ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <Image src={RightArrow} alt="right-arrow" height={30} width={30} />
          </Pressable>
        </>
        <Box
          ref={scrollContainerRef as any}
          className={`mt-0 w-full select-none overflow-x-auto px-4 py-[0px] scrollbar-hide ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            //@ts-ignore
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          {/* Add Arrows over here */}
          <Box className="pr-4 base:mt-4 base:grid base:grid-cols-2 base:gap-4 base:pb-8 gtsm:flex gtsm:flex-row gtsm:flex-nowrap gtlg:mt-0 gtlg:flex gtlg:gap-0 gtlg:pb-[0px]">
            {categories?.map((category, indx) => {
              // return <>{JSON.stringify(category,null,2)}</>
              return (
                <NewCatagoryTile
                  key={category.id}
                  category={category}
                  gotoStep={gotoStep}
                  setSelectedCategories={setSelectedCategories}
                  forOGSearch={forOGSearch}
                />
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  }

  // advanced search new model using this block
  return (
    <Box className="h-full w-full overflow-hidden overflow-y-auto scrollbar-hide base:mt-4 gtsm:mt-2 gtlg:mt-2">
      {/* <Box className=""> */}
      <MainBlock columnCount={1} noWrap={true} phoneColumnCount={1} showDescription={false} />
    </Box>
  );
  // advanced search old model using this block
  // return (
  //   <Box className="h-full w-full overflow-hidden overflow-y-auto scrollbar-hide base:mt-4 gtsm:mt-2 gtlg:mt-2">
  //     <Box className="base:mt-4 base:grid base:grid-cols-2 base:gap-4 base:pb-8 gtsm:mt-2 gtsm:flex gtsm:flex-col gtsm:flex-nowrap gtlg:mt-2 gtlg:flex gtlg:flex-row gtlg:flex-wrap gtlg:gap-[10px] gtlg:pb-[0px]">
  //       {/* <Box className="base:grid gap-4 flex flex-col flex-nowrap"> */}
  //       {CategoryNestedList?.map((category: PartsCategoryInterface, indx: number) => {
  //         // debugger;
  //         const isLast = categories.length === indx + 1;
  //         return (
  //           <CategoryTile
  //             key={category.id}
  //             id={category.id}
  //             parentId={category.parentId}
  //             title={getTitleOfCategory(category, locale)}
  //             subcategories={category.children}
  //             handleExpand={({ id }) => {
  //               setL1CatExpanded(id);
  //             }}
  //             expanded={L1CatExpanded?.startsWith(category.id)}
  //             showDescription={false}
  //           />
  //         );
  //         // return (
  //         //   <CatagoryTile
  //         //     category={category}
  //         //     gotoStep={gotoStep}
  //         //     setSelectedCategories={setSelectedCategories}
  //         //     isLast={isLast}
  //         //   />
  //         // );
  //       })}
  //     </Box>
  //   </Box>
  // );
};

export default CategoryList;
