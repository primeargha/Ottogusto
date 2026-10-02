import React, { useEffect, useState } from "react";

import Image from "next/image";
import { useMedia } from "@/hooks/useMedia";
import { useTabsStore } from "@/stores/useTabsStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { Box } from "../ui/box";

interface OGTabsProps {
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  items: any;
}

export const OGTabs: React.FC<OGTabsProps> = ({
  className = "",
  tabClassName = "",
  activeTabClassName = "bg-color-primary-main",
  inactiveTabClassName = "border border-color-primary-main",
  iconClassName = "h-5 w-5 mr-[12px]",
  labelClassName = "body-medium-sm",
  items,
}) => {
  const isMobile = useMedia("(max-width: 639px)");
  const { activeTab, tabs, setActiveTab } = useTabsStore();
  const deliveryMethodFlag = getClientFeatureFlag("delivery_method_flag");

  const [DisableDelivery, setDisableDelivery] = useState(false);
  const [DisableClickAndConnect, setDisableClickAndConnect] = useState(false);
  const [DisableWarehousePickup, setDisableWarehousePickup] = useState(false);

  useEffect(() => {
    items?.map((itm: any, indx: number) => {
      if (itm.shippingDelivery === false) {
        setDisableDelivery(true);
      }
      if (itm.shippingPickup === false) {
        setDisableClickAndConnect(true);
      }
      if (itm.shippingWarehouse === false) {
        setDisableWarehousePickup(true);
      }
    });
  }, [items]);

  return (
    <Box
      className={`flex w-full p-3 ${
        isMobile ? "h-auto flex-col" : "h-[60px] flex-row"
      } justify-between gap-3 rounded-[4px] bg-white p-3 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.05)] ${className}`}
    >
      {tabs?.map((tab) => {
        // Hide Click and Collect and Warehouse Pickup if delivery_method_flag is false
        if (!deliveryMethodFlag && (tab.id === "clickAndCollect" || tab.id === "warehousePickup")) {
          return null;
        }

        let isDisabled = false;
        if (tab.id === "homeDelivery") {
          isDisabled = DisableDelivery;
        }
        if (tab.id === "clickAndCollect") {
          isDisabled = DisableClickAndConnect;
        }
        if (tab.id === "warehousePickup") {
          isDisabled = DisableWarehousePickup;
        }
        return (
          <Box
            key={tab.id}
            onClick={() => {
              if (isDisabled) {
                return;
              }
              setActiveTab(tab.id);
            }}
            className={`gap flex h-[36px] w-full ${isDisabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"} flex-row items-center rounded-[4px] px-3 py-2 ${
              activeTab === tab.id ? activeTabClassName : inactiveTabClassName
            } ${tabClassName}`}
          >
            <Image
              src={activeTab === tab.id ? tab.icon.active : tab.icon.inactive}
              alt={tab.label}
              className={iconClassName}
            />
            <Box
              className={`${labelClassName} ${
                activeTab === tab.id ? "text-white" : "text-color-text-body"
              }`}
            >
              {isMobile && tab.label.length > 8 ? tab.label.split(" ")[0] : tab.label}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
