"use client";

import { Box } from "@/components/ui/box";
import { OGRadioGroup, OGRadioInput } from "@/components/og-components/OGRadioInput";
import { currencyFormat } from "@/helpers/UtilityHelper";
import { useCartStore } from "@/stores/useCartStore";

export interface DeliveryMethodSelectorProps {
  activeTab: string;
  onChange: (value: string) => void;
  standardDeliveryShippingFee: number;
  shippingfee: number;
  getLabel: (key: string) => string;
  localeCODE: string;
  showWarehouseOption: boolean;
}

export function DeliveryMethodSelector({
  activeTab,
  onChange,
  standardDeliveryShippingFee,
  shippingfee,
  getLabel,
  localeCODE,
  showWarehouseOption,
}: DeliveryMethodSelectorProps) {
  const { deliveryTime } = useCartStore();

  return (
    <Box className="flex flex-col gap-space-xl rounded-[4px] border border-color-border-default base:p-space-sm gtsm:px-space-xl gtsm:py-space-lg">
      <Box className="text-color-text-emphasis typography-heading-03">
        {getLabel("delivery_or_collect")}
      </Box>
      <Box className="flex w-full flex-col">
        <OGRadioGroup value={activeTab} onChange={onChange} className="flex w-full flex-col gap-0">
          {/* STANDARD DELIVERY */}
          <Box
            // @ts-ignore
            onClick={() => onChange("homeDelivery")}
            className={`cursor-pointer border transition-all ${
              activeTab === "homeDelivery"
                ? "border-2 border-color-border-brand"
                : "border border-color-border-default hover:border-2 hover:border-color-border-brand"
            }`}
          >
            <Box className="flex w-full flex-col gap-space-sm p-space-md">
              <Box className="flex flex-row items-center justify-between">
                <OGRadioInput value="homeDelivery" label={getLabel("standard_delivery")} />
                <Box className="text-color-text-emphasis typography-body-strong-01">
                  {currencyFormat(standardDeliveryShippingFee || shippingfee, localeCODE)}
                </Box>
              </Box>
              <Box className="ml-7 text-color-text-muted typography-body-02">
                {getLabel("checkout_delivery")} {deliveryTime}
              </Box>
            </Box>
          </Box>

          {/* WAREHOUSE COLLECTION */}
          {showWarehouseOption && (
            <Box
              // @ts-ignore
              onClick={() => onChange("warehousePickup")}
              className={`cursor-pointer border transition-all ${
                activeTab === "warehousePickup"
                  ? "border-2 border-color-border-brand"
                  : "border border-color-border-default hover:border hover:border-color-border-brand"
              }`}
            >
              <Box className="flex w-full flex-col gap-space-sm p-space-md">
                <Box className="flex flex-row items-center justify-between">
                  <OGRadioInput value="warehousePickup" label={getLabel("warehosue_collection")} />
                  <Box className="text-color-text-emphasis typography-body-strong-01">
                    {getLabel("Free")}
                  </Box>
                </Box>
                <Box className="ml-7 text-color-text-muted typography-body-02">
                  {getLabel("warehousePickup_description")}
                </Box>
              </Box>
            </Box>
          )}
        </OGRadioGroup>
      </Box>
    </Box>
  );
}
