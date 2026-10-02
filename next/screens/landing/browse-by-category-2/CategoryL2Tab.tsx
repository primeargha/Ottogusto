import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { useBranding } from "@/contexts/BrandingContext";
import { formatTitle, getTitleOfCategory } from "@/helpers/UtilityHelper";
import { PartsCategoryInterface } from "@/stores/useAdvancedSearchStore";
import React, { useRef, useEffect } from "react";
import CategoryL3Card from "./CategoryL3Card";
import Typography from "@/components/og-components/Typography";

interface Props {
  items?: PartsCategoryInterface[];
  onClick: (category: PartsCategoryInterface) => void;
  onL2Click: (category: PartsCategoryInterface) => void;
  selectCategory?: PartsCategoryInterface;
}

const CategoryL2Tab = (props: Props) => {
  const { items, onClick, onL2Click, selectCategory } = props;
  const { getLocale } = useBranding();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedTabRef = useRef<HTMLDivElement>(null);
  const measurementFrameRef = useRef<number | null>(null);

  // const handleL2Press = (cat: PartsCategoryInterface) => {
  //   onClick(cat);
  // };

  useEffect(() => {
    const container = scrollContainerRef.current;
    const selectedTab = selectedTabRef.current;
    if (!container || !selectedTab) {
      return;
    }

    if (measurementFrameRef.current !== null) {
      cancelAnimationFrame(measurementFrameRef.current);
    }

    measurementFrameRef.current = window.requestAnimationFrame(() => {
      measurementFrameRef.current = null;
      const containerRect = container.getBoundingClientRect();
      const tabRect = selectedTab.getBoundingClientRect();

      const scrollLeft = container.scrollLeft;
      const tabLeft = tabRect.left - containerRect.left + scrollLeft;
      const tabRight = tabRect.right - containerRect.left + scrollLeft;

      const runScrollAnimation = (targetScrollLeft: number) => {
        const startPosition = container.scrollLeft;
        const distance = targetScrollLeft - startPosition;
        const duration = 600;
        let startTimestamp: number | null = null;

        const animationScroll = (currentTime: number) => {
          if (startTimestamp === null) startTimestamp = currentTime;

          const progress = Math.min((currentTime - startTimestamp) / duration, 1);
          const easeInOutCubic = (t: number) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const currentPosition = startPosition + distance * easeInOutCubic(progress);
          container.scrollTo({ left: currentPosition });

          if (progress < 1) {
            window.requestAnimationFrame(animationScroll);
          }
        };

        window.requestAnimationFrame(animationScroll);
      };

      if (tabLeft < scrollLeft) {
        runScrollAnimation(tabLeft - 16);
      } else if (tabRight > scrollLeft + containerRect.width) {
        runScrollAnimation(tabRight - containerRect.width + 16);
      }
    });

    return () => {
      if (measurementFrameRef.current !== null) {
        cancelAnimationFrame(measurementFrameRef.current);
        measurementFrameRef.current = null;
      }
    };
  }, [selectCategory?.id]);

  return (
    <Box>
      <Box
        //@ts-ignore
        ref={scrollContainerRef}
        className="overflow-x-hidden scroll-smooth scrollbar-hide base:mx-[-12px] md:mx-0"
      >
        <Box className="flex w-full flex-row p-0">
          {items?.map((cat: PartsCategoryInterface) => {
            const ifSelected = selectCategory?.id === cat.id;
            const typoClass = `flex-1 justify-start text-center ${ifSelected ? "text-color-text-brand" : "text-color-text-default"} typography-body-strong-01 hover:text-color-text-brand`;
            // debugger;
            return (
              //             <div data-selected?="yes" data-state="rest" class="min-w-28 px-4 py-1 border-b-2 border-emerald-800 inline-flex justify-center items-center gap-2.5">
              //     <div class="min-w-20 p-3 rounded-md flex justify-center items-center gap-2.5">
              //         <div class="flex-1 text-center justify-start text-emerald-800 text-base font-semibold font-Overpass leading-6">Engine</div>
              //     </div>
              // </div>
              <Pressable
                key={cat.id}
                onPress={() => {
                  onClick(cat);
                }}
                //@ts-ignore
                ref={ifSelected ? selectedTabRef : null}
                className={`inline-flex min-w-28 items-center justify-center gap-2.5 border-b border-color-border-default px-4 py-1 hover:border-b-2 hover:border-color-border-focus ${ifSelected ? "border-b-2 border-color-border-focus" : ""} `}
              >
                <Box className="flex min-w-20 items-center justify-center gap-2.5 rounded-md p-3">
                  <Typography className={typoClass}>
                    {/* {getTitleOfCategory(cat, getLocale())
                      ?.toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())} */}
                    {formatTitle(getTitleOfCategory(cat, getLocale()), getLocale() as any)}
                  </Typography>
                </Box>
              </Pressable>
            );
          })}
        </Box>
      </Box>
      {/* need to make changes here */}
      <Box className="grid w-full grid-gap-listing base:grid-cols-2 base:py-3 gtsm:grid-cols-4 gtsm:py-0 gtsm:pt-8 gtlg:py-0 gtlg:pt-8">
        {selectCategory?.children?.map((l3Cat, index) => {
          return (
            // <Pressable
            //   key={l3Cat.id}
            //   onPress={() => {
            //     onL2Click(l3Cat);
            //   }}
            // >
            <CategoryL3Card
              key={l3Cat.id}
              onClick={() => {
                onL2Click(l3Cat);
              }}
              data={l3Cat}
            />
            // </Pressable>
          );
        })}
      </Box>
    </Box>
  );
};

export default CategoryL2Tab;
