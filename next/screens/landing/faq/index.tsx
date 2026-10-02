"use client";
import {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Box } from "@/components/ui/box";
// import { Divider } from "@/components/ui/divider";
// import { ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { useBranding } from "@/contexts/BrandingContext";
// import { FAQs_LABELS } from "@/data/branding/faqs";
import {
  FaqCategoryNodeInterface,
  FaqQuestionAnswerNodeInterface,
  useFAQStore,
} from "@/stores/useFAQStore";
import { MinusIcon, PlusIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
// import PreviousSearchCarousel from "../previous-search-carousel";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useCheckForLandingPage } from "@/hooks/appHooks";
import useIpadDetection from "@/hooks/useIpadDetection";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import OGLayoutXL from "@/components/og-components/OGLayoutXL";
import Typography from "@/components/og-components/Typography";
import { useMedia } from "@/hooks/useMedia";

type Props = {};

const FAQ_QnA_Card = ({ que }: { que: FaqQuestionAnswerNodeInterface }) => {
  const { getLabel } = useBranding();
  return (
    <>
      <AccordionItem value={`acr-${que.question}`}>
        <AccordionHeader className="rounded-[6px] border border-color-border-default bg-color-background-default hover:bg-color-background-default">
          <AccordionTrigger>
            {({ isExpanded }) => (
              <>
                <AccordionTitleText
                  size="sm"
                  className="text-color-text-default typography-heading-03"
                >
                  {getLabel(que.question)}
                </AccordionTitleText>
                {isExpanded ? (
                  <MinusIcon />
                ) : (
                  // <AccordionIcon as={MinusIcon} className="ml-3" />
                  // <AccordionIcon as={PlusIcon} className="ml-3" />
                  <PlusIcon />
                )}
              </>
            )}
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <AccordionContentText className="font-Overpass text-[16px] font-normal not-italic leading-4 text-[--brand-tarmac-black] text-single-100-regular">
            {getLabel(que.answer)}
          </AccordionContentText>
        </AccordionContent>
      </AccordionItem>
      {/* <Divider /> */}
      <Box className="h-[24px]"></Box>
    </>
  );
};

const FaqCategoryMobileTile = (props: any) => {
  const { getLabel } = useBranding();
  const { changeFaqSelectedCategory } = useFAQStore();

  const isActive = false;
  const { category } = props;
  return (
    <Pressable
      onPress={() => {
        changeFaqSelectedCategory(props);
      }}
      className=""
    >
      <Box
        className={`justify-start text-[${isActive ? "--brand-traffic-light-green" : "--brand-tarmac-black"}] font-Overpass text-base font-bold leading-[18px] hover:text-[--primary-colors-primary-hover]`}
      >
        {getLabel(category)}
      </Box>
    </Pressable>
  );
};

const FaqNavigateCategoriesBlockMobile = ({
  data,
  SelectedFAQCategory,
}: {
  data: FaqCategoryNodeInterface[];
  SelectedFAQCategory: FaqCategoryNodeInterface;
}) => {
  const { getLabel } = useBranding();
  const { changeFaqSelectedCategory } = useFAQStore();

  // Add Embla carousel setup
  const options: EmblaOptionsType = {
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
    dragFree: true,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  return (
    <Box className="overflow-hidden pb-4 pt-14" ref={emblaRef as any}>
      {/* <pre>{JSON.stringify(FaqDATA, null, 2)}</pre> */}
      <Box className="flex flex-row">
        {data?.map((faq, indx: number) => {
          const isActive = faq.category === SelectedFAQCategory.category;
          return (
            <Box key={indx} className="flex-shrink-0 gap-3 py-[12px] pr-[20px]">
              <Pressable
                onPress={() => {
                  changeFaqSelectedCategory(faq);
                }}
              >
                {/* <Box className="inline-flex items-center justify-start gap-2.5 self-stretch py-3"> */}
                <Box
                  className={`justify-center text-nowrap ${isActive ? "text-color-primary-main" : "text-color-text-body hover:text-color-hover-action-primary"} body-bold-sm`}
                >
                  {getLabel(faq.category)}
                </Box>
                {/* </Box> */}
              </Pressable>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const FaqNavigateCategoriesBlock = ({
  data,
  SelectedFAQCategory,
}: {
  data: FaqCategoryNodeInterface[];
  SelectedFAQCategory: FaqCategoryNodeInterface;
}) => {
  const { getLabel } = useBranding();
  const { changeFaqSelectedCategory } = useFAQStore();
  return (
    <Box className="mt-6 flex flex-col items-start justify-start gap-2">
      {/* <pre>{JSON.stringify(FaqDATA, null, 2)}</pre> */}
      {data?.map((faq, indx: number) => {
        const isActive = faq.category === SelectedFAQCategory.category;
        return (
          <Box key={indx} className="inline-flex items-center justify-start gap-2.5">
            <Pressable
              onPress={() => {
                changeFaqSelectedCategory(faq);
              }}
            >
              <Box className="inline-flex items-center justify-start gap-2.5 self-stretch p-3">
                {isActive && (
                  <Typography
                    className={`justify-center text-button-primary-bg-default typography-button-01`}
                  >
                    {getLabel(faq.category)}
                  </Typography>
                )}
                {!isActive && (
                  <Typography
                    className={`justify-center text-color-text-default typography-button-01`}
                  >
                    {getLabel(faq.category)}
                  </Typography>
                )}
              </Box>
            </Pressable>
          </Box>
        );
      })}
    </Box>
  );
};

const FaqSection = ({
  isSupportPage = false,
  forceVisible = false,
  noLeftNavSpace = false,
}: {
  isSupportPage?: boolean;
  forceVisible?: boolean;
  noLeftNavSpace?: boolean;
}) => {
  const { getLabel } = useBranding();
  const isIpad = useIpadDetection();
  const { changeFaqSelectedCategory } = useFAQStore();
  const ifLandingPage = useCheckForLandingPage();
  const { SelectedFAQCategory, TotalFAQCategories, TotalQustionsInEachCategory } = useFAQStore();
  const [FaqData, setFaqData] = useState<FaqCategoryNodeInterface[]>([]);
  const isMobile = useMedia("(max-width: 639px)");
  // Create FAQ DataStructure
  const FAQ_DATA = (): FaqCategoryNodeInterface[] | [] => {
    let faq_array: FaqCategoryNodeInterface[] = [];

    // Will build FAQ categories
    for (let i: number = 0; i < TotalFAQCategories; i++) {
      let questions_array: FaqQuestionAnswerNodeInterface[] = [];

      // Will build QuestionNodes for specific categories
      for (let j: number = 0; j < TotalQustionsInEachCategory; j++) {
        let questionNode: FaqQuestionAnswerNodeInterface = {
          question: `faq_category_${i + 1}_que_${j + 1}`,
          answer: `faq_category_${i + 1}_ans_${j + 1}`,
          isExpanded: false,
        };
        questions_array.push(questionNode);
      }
      let faq = {
        category: `faq_category_${i + 1}`,
        questions: questions_array,
      };
      faq_array.push(faq);
    }
    return faq_array;
  };

  useEffect(() => {
    const faq_array = FAQ_DATA();
    setFaqData(faq_array);
    if (faq_array.length > 0 && SelectedFAQCategory.category === "") {
      changeFaqSelectedCategory(faq_array[0] as FaqCategoryNodeInterface);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ifLandingPage && !forceVisible) {
    // return <p>We're on the root path!</p>;
    return null;
  }

  return (
    <Box className="flex w-full bg-color-background-default gap-stack">
      <Box className="w-full"></Box>
      <Box className="section-standard">
        <Box className="h-[1px] w-full bg-color-border-default" />
      </Box>
      <OGLayoutXL>
        <Box className="flex gtsm:flex-row">
          <Box className="md:basis-1/3">
            {/* Title block */}
            <Box className="flex flex-col gap-3 overflow-visible">
              <Typography
                type="h2"
                className="relative justify-start overflow-visible pt-[0.12em] text-color-text-emphasis typography-heading-02"
              >
                {getLabel("faq_main_title_new")}
              </Typography>
              {/*  */}
              <Typography className="relative justify-center text-color-text-muted typography-body-01">
                {getLabel("faq_main_subtitle_new")}
              </Typography>
            </Box>

            {/* NavigationTabs block for md or greater */}
            <Box className="hidden md:block">
              <FaqNavigateCategoriesBlock
                data={FaqData}
                SelectedFAQCategory={SelectedFAQCategory}
              />
            </Box>
            {/* NavigationTabs block for xs mobile */}
            <Box className="md:hidden">
              <FaqNavigateCategoriesBlockMobile
                data={FaqData}
                SelectedFAQCategory={SelectedFAQCategory}
              />
            </Box>
          </Box>

          {/* Questions block on the right */}
          <Box className="md:basis-2/3">
            <Accordion
              size="md"
              variant="filled"
              type="single"
              isCollapsible={true}
              isDisabled={false}
              className="mx-0 my-5 w-full bg-color-background-default"
            >
              {SelectedFAQCategory.questions?.map((que, indx) => {
                // debugger;
                return <FAQ_QnA_Card key={indx} que={que} />;
              })}
            </Accordion>

            {/* <pre>{JSON.stringify(SelectedFAQCategory, null, 2)}</pre> */}
            {/* <pre>{JSON.stringify(FAQ_DATA(), null, 2)}</pre> */}
          </Box>
        </Box>
      </OGLayoutXL>
    </Box>
  );
};

export default FaqSection;
