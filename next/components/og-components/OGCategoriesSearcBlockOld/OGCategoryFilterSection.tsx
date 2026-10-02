"use client";
import React, { useRef } from "react";
import OGCategoriesSearcBlock from ".";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";

type Props = {};

const OGCategoryFilterSection = (props: Props) => {
  const sliderRef = useRef();
  return (
    <Accordion
      size="lg"
      variant="unfilled"
      type="single"
      isCollapsible={true}
      isDisabled={false}
      className="w-full"
    >
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger className="px-0">
            {({ isExpanded }: { isExpanded: boolean }) => (
              <>
                <AccordionTitleText className="text-start">Categor-ies</AccordionTitleText>
                {isExpanded ? (
                  <AccordionIcon as={ChevronUpIcon} />
                ) : (
                  <AccordionIcon as={ChevronDownIcon} />
                )}
              </>
            )}
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent className="gap-6 pl-[5px] pr-[5px]">
          <OGCategoriesSearcBlock />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default OGCategoryFilterSection;
