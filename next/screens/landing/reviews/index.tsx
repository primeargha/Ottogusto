"use client";
import { Box } from "@/components/ui/box";
import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import { useBranding } from "@/contexts/BrandingContext";
import { generateReviewsData, ReviewInterface } from "@/data/branding/reviews";
import { useCheckForLandingPage } from "@/hooks/appHooks";
import useIpadDetection from "@/hooks/useIpadDetection";
import { safeNextImageSrc } from "@/utils/translationDisplayMode";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import Typography from "@/components/og-components/Typography";

const DotButton = ({ selected, onClick }: { selected: boolean; onClick: () => void }) => (
  <button
    className={`mx-1 transition-all ${
      selected
        ? "h-[10px] w-[24px] rounded-[32px] bg-[--brand-traffic-light-green]"
        : "h-[10px] w-[10px] rounded-[32px] bg-color-primary-main"
    }`}
    type="button"
    onClick={onClick}
  />
);

type ReviewsProps = {
  forceVisible?: boolean;
  noLeftNavSpace?: boolean;
  containerClassName?: string;
};

export default function Reviews({
  forceVisible = false,
  noLeftNavSpace = false,
  containerClassName,
}: ReviewsProps) {
  const { getLabel } = useBranding();
  const isIpad = useIpadDetection();
  const [mounted, setMounted] = useState(false);
  const [reviewsData, setReviewsData] = useState<ReviewInterface[]>([]);
  const ifLandingPage = useCheckForLandingPage();

  // Fixed Embla carousel options
  const options: EmblaOptionsType = {
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    loop: false,
    startIndex: 0,
    slidesToScroll: 1,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onDotButtonClick = (index: number) => {
    if (!emblaApi) return;
    emblaApi.scrollTo(index);
  };

  useEffect(() => {
    setMounted(true);
    setReviewsData(generateReviewsData());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
      setTimeout(() => {
        emblaApi.scrollTo(0, true);
      }, 100);
    };

    onInit();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
    };
  }, [emblaApi]);

  if (!ifLandingPage && !forceVisible) {
    return null;
  }

  let containerClass = `${isIpad ? "" : `${getClientFeatureFlag("show_left_nav_flag") ? "lg:ml-[220px]" : ""}`}`;
  if (noLeftNavSpace) {
    containerClass = `mx-[38px] lg:pl-0`;
  }

  if (!getClientFeatureFlag("testimonials_feature_flag")) {
    return null;
  }

  return (
    <Box
      className={`overflow-x-hidden bg-color-background-l2 pb-[60px] pt-[60px] ${containerClassName}`}
    >
      <Box className={`${containerClass} base:mx-3 gtsm:mx-[38px] lg:pl-0`}>
        {/* Header section */}
        <div className="mb-8 flex flex-col items-center">
          <Typography type="h2" className="mb-4 text-center text-color-text-body">
            {getLabel("reviews_main_title_new")}
          </Typography>
          <Text className="text-center text-color-text-body body-regular-md">
            {getLabel("reviews_main_subtitle_new")}
          </Text>
        </div>

        {/* Carousel section */}
        {mounted && (
          <div className="w-full">
            <div className="embla overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex">
                {reviewsData?.map((review, index) => (
                  <div
                    key={review.id}
                    className="embla__slide flex-[0_0_auto] cursor-grabbing base:w-[280px] base:max-w-[281px] gtsm:w-[311px] gtsm:max-w-[312px] gtlg:w-[390px] gtlg:max-w-[391px]"
                    style={{
                      marginRight: index === reviewsData.length - 1 ? "0" : "16px",
                    }}
                  >
                    <Box className="h-full cursor-default rounded-[4px] border border-color-background-l8 bg-color-background-l3 p-6 shadow-sm">
                      <Box className="mb-2 flex w-full flex-row">
                        {[...Array(5)]?.map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            {i < Number(getLabel(review.rating_key)) ? (
                              <Image
                                src="/assets/icons/star.svg"
                                height={28}
                                width={28}
                                alt="star"
                              />
                            ) : (
                              <Image
                                src="/assets/icons/star.svg"
                                height={28}
                                width={28}
                                alt="star"
                              />
                            )}
                          </span>
                        ))}
                      </Box>
                      <Text className="mb-4 text-color-text-body body-regular-sm">
                        {getLabel(review.content_key)}
                      </Text>
                      <Box className="mt-4 flex flex-row justify-between">
                        <Box className="flex flex-row gap-2">
                          <Box className="flex min-h-[48px] min-w-[48px] items-center justify-center">
                            <Image
                              src={safeNextImageSrc(getLabel(review.image_key) || "")}
                              height={48}
                              width={48}
                              alt="review"
                              className="rounded-full object-cover"
                            />
                          </Box>
                          <Box className="flex flex-col">
                            <Text className="text-color-primary-main body-bold-sm">
                              {getLabel(review.name_key)}
                            </Text>
                            <Text className="text-color-accent-dark body-regular-sm">
                              {getLabel(review.designation_key)}
                            </Text>
                          </Box>
                        </Box>
                        <Box>
                          <Image
                            src={"/assets/icons/Quote.svg"}
                            height={48}
                            width={48}
                            alt="review"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </div>
                ))}
              </div>
            </div>

            {/* Dot indicators */}
            {mounted && scrollSnaps.length > 1 && (
              <div className="mt-6 flex justify-center">
                {scrollSnaps?.map((_, index) => (
                  <DotButton
                    key={index}
                    selected={index === selectedIndex}
                    onClick={() => onDotButtonClick(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Box>
    </Box>
  );
}
