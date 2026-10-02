"use client";
import { Accordion } from "@/components/ui/accordion";
import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";
import { Productfaqcard } from "../productfaqcard";
import CompatibleCarList from "./CompatibleCarList";
import { CarBrand } from "@/types/cars";

interface SavedCarCompatibilityListProps {
  /** Cars API path — matched saved cars grouped by make. */
  groupedSavedCars?: CarBrand[];
  /** Legacy MakeModelType path — single flat saved-cars accordion. */
  legacySavedCars?: CarBrand | null;
  sectionTitle: string;
}

/**
 * Saved cars that match this part.
 * New MME: section title + make accordions. Legacy: one flat "Saved Cars" accordion.
 */
export const SavedCarCompatibilityList = ({
  groupedSavedCars,
  legacySavedCars,
  sectionTitle,
}: SavedCarCompatibilityListProps) => {
  if (groupedSavedCars && groupedSavedCars.length > 0) {
    return (
      <Box className="flex w-full flex-col gap-space-xs">
        <Typography type="h2" className="text-color-text-body typography-heading-03">
          {sectionTitle}
        </Typography>
        <CompatibleCarList groupedCars={groupedSavedCars} />
      </Box>
    );
  }

  if (!legacySavedCars || legacySavedCars.items.length === 0) {
    return null;
  }

  return (
    <Box className="md:basis-2/3">
      <Accordion
        size="md"
        variant="filled"
        type="multiple"
        defaultValue={[`acr-${legacySavedCars.brandId}`]}
        isCollapsible={true}
        className="mx-0 mt-space-md w-full bg-transparent"
      >
        <Box className="flex flex-col gap-[12px]">
          <Productfaqcard car={legacySavedCars} />
        </Box>
      </Accordion>
    </Box>
  );
};

export default SavedCarCompatibilityList;
