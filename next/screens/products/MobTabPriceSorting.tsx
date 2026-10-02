import { useEffect } from "react";

import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionIcon,
  AccordionContent,
} from "@/components/ui/accordion";
import { ChevronUpIcon, ChevronDownIcon } from "@/components/ui/icon";
import { Divider } from "@/components/ui/divider";
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from "@/components/ui/radio";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useMedia } from "@/hooks/useMedia";
import { useFilterStore } from "@/stores/useFilter";
import { useBranding } from "@/contexts/BrandingContext";

export default function MobTabPriceSorting() {
  const { updateFilters } = useUrlParams();
  const { searchData } = useSearchModalStore();
  const isDesktop = useMedia("(min-width: 1200px)");
  const { order, setOrder } = useFilterStore();
  const { getLabel } = useBranding();
  // Handler for when radio value changes
  const handleSortChange = (value: string) => {
    // Get current year from URL to preserve it
    const currentUrl = new URLSearchParams(window.location.search);
    const currentYear = currentUrl.get("year");

    if (isDesktop) {
      updateFilters(
        {
          order: value as "ASC" | "DESC" | "priority",
          year: currentYear, // Use year from URL instead of store
        },
        "/products",
      );
    } else {
      setOrder(value as "ASC" | "DESC" | "priority");
    }
  };

  return (
    <Accordion
      size="lg"
      variant="unfilled"
      type="single"
      isCollapsible={true}
      isDisabled={false}
      className="w-full"
      defaultValue={["a"]}
    >
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger className="px-0 py-3">
            {({ isExpanded }) => (
              <>
                <AccordionTitleText className="text-start">
                  {getLabel("sorting")}
                </AccordionTitleText>
                {isExpanded ? (
                  <AccordionIcon as={ChevronUpIcon} />
                ) : (
                  <AccordionIcon as={ChevronDownIcon} />
                )}
              </>
            )}
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent className="mt-0 gap-6 pl-1 pr-1">
          <Divider />
          {/* Single RadioGroup to ensure only one option can be selected */}
          <RadioGroup value={order} onChange={handleSortChange} className="flex flex-col gap-6">
            <Radio value="priority" size="md" isInvalid={false} isDisabled={false}>
              <RadioIndicator className="cursor-pointer">
                <RadioIcon
                  className={
                    order === "priority" ? "bg-color-primary-main" : "bg-color-background-none"
                  }
                />
              </RadioIndicator>
              <RadioLabel className="cursor-pointer text-color-text-body body-regular-sm">
                {getLabel("sort_by")} {getLabel("sort_availability")}
              </RadioLabel>
            </Radio>

            <Radio value="ASC" size="md" isInvalid={false} isDisabled={false}>
              <RadioIndicator className="cursor-pointer">
                <RadioIcon
                  className={order === "ASC" ? "bg-color-primary-main" : "bg-color-background-none"}
                />
              </RadioIndicator>
              <RadioLabel className="cursor-pointer text-color-text-body body-regular-sm">
                {getLabel("price")} {getLabel("low_high")}
              </RadioLabel>
            </Radio>

            <Radio value="DESC" size="md" isInvalid={false} isDisabled={false}>
              <RadioIndicator className="cursor-pointer">
                <RadioIcon
                  className={
                    order === "DESC" ? "bg-color-primary-main" : "bg-color-background-none"
                  }
                />
              </RadioIndicator>
              <RadioLabel className="cursor-pointer text-color-text-body body-regular-sm">
                {getLabel("price")} {getLabel("high_low")}
              </RadioLabel>
            </Radio>
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
