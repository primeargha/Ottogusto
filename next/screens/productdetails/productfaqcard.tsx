"use client";

import {
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Box } from "@/components/ui/box";
import { MinusIcon, PlusIcon } from "lucide-react-native";
import Image from "next/image";
import ticko1 from "../../public/assets/icons/tick-01.svg";
import unread1 from "../../public/assets/icons/check-unread-01.svg";
import { CarBrand, CarItem } from "@/types/cars";
import Typography from "@/components/og-components/Typography";
import { CustomTooltip } from "@/components/og-components/OGtooltip";
import { useBranding } from "@/contexts/BrandingContext";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import GreenCircleTick from "./GreenCircleTick";
import GrayQuestionIcon from "./GrayQuestionIcon";

/**
 * Renders a detailed tooltip content for a CarItem.
 * Displays engine specs, power, year range, and other vehicle technical data.
 *
 * @param {Object} props - Component props
 * @param {CarItem} props.item - The vehicle item data to display
 */
const ItemTooltipContent = ({ item }: { item: CarItem }) => {
  return (
    <Box className="flex min-w-[280px] flex-col gap-2 p-3">
      {/* Car Image (if available) */}
      {item.image && (
        <Box className="relative mb-2 h-32 w-full overflow-hidden rounded-md border border-color-border-default">
          <Image
            src={item.image}
            alt={`${item.brandName} ${item.modelName}`}
            fill
            className="object-cover"
            unoptimized
          />
        </Box>
      )}

      {/* Brand and Model Header */}
      <Box className="flex flex-col border-b border-color-border-default pb-2">
        <Typography type="h4" className="text-color-text-title text-sm font-bold">
          {item.brandName} {item.modelName}
        </Typography>
        <Typography className="text-xs italic text-color-text-body">{item.typeName}</Typography>
      </Box>

      {/* Technical Specifications Grid */}
      <Box className="grid grid-cols-2 gap-x-4 gap-y-1">
        <Typography className="text-[10px] uppercase text-color-text-placeholder">
          Engine
        </Typography>
        <Typography className="text-right text-[10px] text-color-text-body">
          {item.engineName || item.engine || "-"}
        </Typography>

        <Typography className="text-[10px] uppercase text-color-text-placeholder">Power</Typography>
        <Typography className="text-right text-[10px] text-color-text-body">
          {item.powerHp ? `${item.powerHp} HP / ${item.powerKw} kW` : "-"}
        </Typography>

        <Typography className="text-[10px] uppercase text-color-text-placeholder">Year</Typography>
        <Typography className="text-right text-[10px] text-color-text-body">
          {item.yearmerged ? `${item.yearStart} - ${item.yearEnd}` : item.year}
        </Typography>

        <Typography className="text-[10px] uppercase text-color-text-placeholder">
          Body / Doors
        </Typography>
        <Typography className="text-right text-[10px] text-color-text-body">
          {(item as any).body || "-"} {(item as any).doors ? `/ ${(item as any).doors}D` : ""}
        </Typography>

        <Typography className="text-[10px] uppercase text-color-text-placeholder">Seats</Typography>
        <Typography className="text-right text-[10px] text-color-text-body">
          {(item as any).seats || "-"}
        </Typography>

        <Typography className="text-[10px] uppercase text-color-text-placeholder">
          Gearbox
        </Typography>
        <Typography className="text-right text-[10px] text-color-text-body">
          {(item as any).gearBox || "-"}
        </Typography>

        <Typography className="text-[10px] uppercase text-color-text-placeholder">
          Transmission
        </Typography>
        <Typography className="text-right text-[10px] text-color-text-body">
          {(item as any).transmissionType || "-"}
        </Typography>

        <Typography className="text-[10px] uppercase text-color-text-placeholder">
          Engine Code
        </Typography>
        <Typography className="text-right text-[10px] text-color-text-body">
          {(item as any).engineCode || "-"}
        </Typography>

        <Typography className="text-[10px] uppercase text-color-text-placeholder">
          Cylinders
        </Typography>
        <Typography className="text-right text-[10px] text-color-text-body">
          {item.cylinders || "-"}
        </Typography>

        <Typography className="text-[10px] uppercase text-color-text-placeholder">
          Capacity
        </Typography>
        <Typography className="text-right text-[10px] text-color-text-body">
          {item.cylinderCapacity ? `${item.cylinderCapacity}cc` : "-"}
        </Typography>
      </Box>

      {/* Optional Version Name */}
      {item.versionName && (
        <Box className="mt-1 border-t border-color-border-default pt-1">
          <Typography className="text-[10px] leading-tight text-color-text-body">
            <span className="uppercase text-color-text-placeholder">Version:</span>{" "}
            {item.versionName}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/**
 * Renders a single row for a car item with a tooltip and compatibility icon.
 *
 * @param {Object} props - Component props
 * @param {CarItem} props.item - The car item data
 * @param {boolean} [props.isSaved] - Whether this item is from a saved car list
 */
const CarItemRow = ({ item, isSaved }: { item: CarItem; isSaved?: boolean }) => {
  const { getLabel } = useBranding();

  const label = item.displayLine?.trim() ? (
    item.displayLine
  ) : isSaved ? (
    ((item as any).name ?? (
      <>
        {item.brandName}&nbsp;{item.modelName}&nbsp;{item.typeName}&nbsp;{item.year}
      </>
    ))
  ) : (
    <>
      {item.modelName}&nbsp;&nbsp;{item.typeName}&nbsp;&nbsp;
      {item.engineName || item.engine}
    </>
  );

  const usesVerifiedMatchIcon = Boolean(item.displayLine?.trim());
  const showUnverified = usesVerifiedMatchIcon
    ? item.isMatching === false
    : isSaved && item.isMatching === false;

  const potentialMatchLabel = getLabel("potential_match");

  const compatibilityIcon = showUnverified ? (
    <CustomTooltip content={potentialMatchLabel} iconAnchorOnMobile>
      <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center">
        <GrayQuestionIcon className="h-6 w-6 flex-shrink-0 text-color-icon-default" />
      </span>
    </CustomTooltip>
  ) : (
    <GreenCircleTick className="h-6 w-6 flex-shrink-0 text-color-icon-positive" />
  );

  const content = (
    <>
      <Box className="flex-shrink-0">{compatibilityIcon}</Box>
      <Typography className="min-w-0 flex-1 text-color-text-default typography-body-01">
        {label}
      </Typography>
    </>
  );

  return (
    <Box className="flex flex-row items-start gap-3 gtsm:items-center gtsm:gap-[10px]">
      {content}
    </Box>
  );

  // With tooltip of car details in it
  // return isMounted ? (
  //   <Tooltip
  //     placement="top"
  //     trigger={({ onPress, collapsable, ...otherProps }: any) => (
  //       <div {...otherProps} onClick={onPress} className="flex flex-row items-center gap-[10px]">
  //         {content}
  //       </div>
  //     )}
  //   >
  //     <TooltipContent className="rounded-lg border border-color-border-default bg-color-background-default shadow-xl">
  //       <ItemTooltipContent item={item} />
  //     </TooltipContent>
  //   </Tooltip>
  // ) : (
  //   <div className="flex flex-row items-center gap-[10px]">{content}</div>
  // );
};

/**
 * A presentational component that renders the accordion item for a car brand.
 * Shows the brand name (or generic title) in the header and the list of compatible cars in the content.
 *
 * @param {Object} props - Component props
 * @param {CarBrand} props.car - The CarBrand object containing items to display
 */
export const Productfaqcard = ({ car }: { car: CarBrand }) => {
  return (
    <AccordionItem
      value={`acr-${car.brandId}`}
      className="rounded-[6px] border border-color-border-default bg-color-background-default transition-colors"
    >
      <AccordionHeader className="pb-0 text-color-text-emphasis typography-heading-04 hover:bg-color-background-default">
        <AccordionTrigger className="px-space-lg py-space-md">
          {({ isExpanded }) => {
            return (
              <>
                {/* <Typography type="h3" className="text-color-text-emphasis typography-heading-04"> */}
                {car?.brandName}
                {/* </Typography> */}
                <AccordionIcon as={isExpanded ? MinusIcon : PlusIcon} className="ml-3" />
              </>
            );
          }}
        </AccordionTrigger>
      </AccordionHeader>

      {/* @ts-ignore - AccordionContent has type issues with children */}
      <AccordionContent className="mt-0 px-space-lg pb-space-md">
        <div className="flex flex-col gap-space-md">
          {car?.items?.map((item, index) => (
            <CarItemRow key={`${item.id}-${index}`} item={item} isSaved={car.isSaved || false} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
