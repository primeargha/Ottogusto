import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionContentText,
  AccordionIcon,
  AccordionContent,
} from "@/components/ui/accordion";
import { CheckIcon } from "@/components/ui/icon";
import { Divider } from "@/components/ui/divider";
import { ChevronUpIcon, ChevronDownIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useMedia } from "@/hooks/useMedia";
import { useGetManufacturerInformationQuery } from "@/hooks/products";
import { useBranding } from "@/contexts/BrandingContext";

export interface IManufacturer {
  id: string;
  name: string;
  type: "OEM" | string;
}

// Matches SingleCategorySidebarFilter.tsx's skeleton-row pattern right next
// to this component in the same sidebar/filter drawer.
const SKELETON_ROW_WIDTHS: string[] = ["w-3/5", "w-2/5", "w-4/5", "w-1/2", "w-3/5", "w-2/5"];

export default function ManufacturerDrop({
  availableManufacturerIds = [],
}: {
  availableManufacturerIds?: string[];
}) {
  const { filters, updateFilters } = useUrlParams();
  const { searchData } = useSearchModalStore();
  const isDesktop = useMedia("(min-width: 1200px)");
  const { getLabel } = useBranding();
  const { data: ManufacturerBrands, isPending: isManufacturersPending } =
    useGetManufacturerInformationQuery();
  const selectedManufacturerIds = useMemo(() => {
    const raw = (filters as any)?.manufacturerIds;
    if (!raw) return [] as string[];
    if (Array.isArray(raw)) {
      return raw
        .map((x) => (typeof x === "string" ? x : (x as any)?.id))
        .filter((x): x is string => typeof x === "string" && x.length > 0);
    }
    if (typeof raw === "string" && raw.length > 0) return [raw];
    return [] as string[];
  }, [filters]);

  const filteredManufacturers = useMemo(() => {
    const list: IManufacturer[] = (ManufacturerBrands as any)?.data || [];
    if (!availableManufacturerIds || availableManufacturerIds.length === 0) return list;
    const allow = new Set(availableManufacturerIds);
    return list.filter((m) => allow.has(m.id));
  }, [ManufacturerBrands, availableManufacturerIds]);

  const isSelected = useCallback(
    (manufacturerId: string): "yes" | "no" => {
      return selectedManufacturerIds.includes(manufacturerId) ? "yes" : "no";
    },
    [selectedManufacturerIds],
  );

  const handleToggle = useCallback(
    (manufacturerId: string, willSelect: boolean) => {
      const nextIds = willSelect
        ? Array.from(new Set([...selectedManufacturerIds, manufacturerId]))
        : selectedManufacturerIds.filter((id) => id !== manufacturerId);

      updateFilters(
        {
          manufacturerIds: nextIds.length > 0 ? nextIds : null,
          year: searchData?.year?.value || null,
        },
        "/products",
      );
    },
    [selectedManufacturerIds, updateFilters, searchData],
  );

  return (
    <Accordion
      size="lg"
      variant="unfilled"
      type="single"
      isCollapsible={true}
      isDisabled={false}
      className="mt-2 w-full"
      defaultValue={["a"]}
    >
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger className="px-0 py-3">
            {({ isExpanded }) => (
              <>
                <AccordionTitleText className="text-start">
                  {getLabel("manufacturer_brand")}
                </AccordionTitleText>
                {isExpanded ? (
                  <AccordionIcon as={ChevronUpIcon} aria-label="Collapse manufacturer brands" />
                ) : (
                  <AccordionIcon as={ChevronDownIcon} aria-label="Expand manufacturer brands" />
                )}
              </>
            )}
          </AccordionTrigger>
        </AccordionHeader>
        <Divider />
        <AccordionContent className="mt-[10px] px-0">
          {/* <Divider /> */}
          <Box className="mt-4 w-full gap-2">
            {isManufacturersPending &&
              SKELETON_ROW_WIDTHS.map((widthClass, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Box key={index} className="w-full py-2">
                  <Box
                    className={`animate-pulse h-4 ${widthClass} rounded bg-color-background-emphasis`}
                  />
                </Box>
              ))}
            {!isManufacturersPending &&
              filteredManufacturers?.map((brand: IManufacturer) => {
                return (
                  <OGCheckboxInput
                    key={brand.id}
                    className="cursor-pointer"
                    label={brand.name}
                    value={brand.id}
                    // Manufacturer filter is NOT a checkbox source-of-truth; selection is URL-driven (ID-only).
                    // We still use this UI component, but clicks must translate to URL updates.
                    onChange={(nextSelected) => handleToggle(brand.id, nextSelected)}
                    selected={isSelected(brand.id)}
                  />
                );
              })}
          </Box>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
