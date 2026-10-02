"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import { OGAlert } from "@/components/og-components/OGAlert";

/**
 * CollectionPoint Component
 *
 * Displays the warehouse collection point information for "Warehouse Collection" payment type.
 * Includes:
 * - Heading: "Collection Point"
 * - Card with static warehouse address from translation labels
 * - Alert message with collection information
 *
 * Translation keys used:
 * - collection_point: Section heading
 * - warehouse.pickup.address: Warehouse address (e.g., "Tyunder Warehouse, Rue d'Ecosse 12, bte 12, Saint-Gilles, 1060, Belgium")
 * - warehouse.pickup.note: Additional pickup information (content to be confirmed)
 */
export const CollectionPoint: React.FC = () => {
  const { getLabel } = useBranding();

  return (
    <Box className="flex w-full flex-col gap-6">
      {/* Section Heading */}
      <Box className="text-color-text-emphasis typography-subtitle-01">
        {getLabel("collection_point")}
      </Box>

      {/* Address Card */}
      <Box className="w-full border border-color-border-brand p-6">
        {/* Warehouse Address */}
        <Text className="whitespace-pre-line text-color-text-body typography-body-02">
          {getLabel("warehouse.pickup.address")}
        </Text>
      </Box>

      {/* Alert Message - Additional pickup information */}
      <OGAlert title="" description={getLabel("warehouse.pickup.note")} variant="info" />
    </Box>
  );
};

export default CollectionPoint;
