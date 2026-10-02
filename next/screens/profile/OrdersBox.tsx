"use client";
import { useMemo, useState } from "react";
import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { getLatestDeliveryDate, getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useParams, useRouter } from "next/navigation";
import { allpaymentStatus } from "@/types/globalTypes";
import { formatDateByLocale } from "@/utils/formatDate";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { getLocale } from "../landing/footer/language-selector";

/**
 * Props passed to the OrdersBox component from the profile/orders screen.
 */
interface OrderBoxProps {
  orderdate?: string;
  ordernumber?: number;
  items?: ItemsArray[];
  orderTotal?: string;
  orderStatus?: string;
  emailId?: string;
  orderId?: string;
  tracking?: any;
}

/**
 * Shape of a single order line item used in the list.
 */
interface ItemsArray {
  name?: string;
  quantity?: number;
  unitPrice?: number;
}

/**
 * Renders a single order card with status badge, items overview, totals and actions
 * for the profile "My Orders" page.
 */
export default function OrdersBox({
  orderdate,
  ordernumber,
  items,
  orderTotal,
  orderStatus,
  emailId,
  orderId,
  tracking,
}: OrderBoxProps) {
  const [expanded, setExpanded] = useState(false);
  const { getLabel } = useBranding();
  const router = useRouter();
  const { locale, setLocale } = useLandingPageDataStore();
  // const localeCODE = getLocale();
  const currentLocale = getLocale(locale);
  /**
   * Compute which items to show when the list is collapsed vs. expanded.
   */
  const { visibleItems, remainingCount, totalItems } = useMemo(() => {
    const MAX_COLLAPSED_ITEMS = 2;
    const safeItems = items ?? [];
    const total = safeItems.length;
    const visible = expanded ? safeItems : safeItems.slice(0, MAX_COLLAPSED_ITEMS);
    const remaining = Math.max(total - visible.length, 0);

    return {
      visibleItems: visible,
      remainingCount: remaining,
      totalItems: total,
    };
  }, [items, expanded]);

  const params = useParams();
  /** Navigate to the detailed order view. */
  const handleOrderDetails = () => {
    const detailsURL = `${getRouteLocaleString(Routes.orderDetails, params)}${orderId}/${emailId}`;
    router.push(detailsURL);
  };

  const statusCheck = orderStatus?.toLowerCase() ?? "";

  const isReturnType =
    statusCheck.startsWith("refund") ||
    statusCheck.startsWith("return") ||
    statusCheck.startsWith("partiallyrefunded");

  /** Navigate to the returns detail view when the order is a return/refund. */
  const handleReturnDetails = () => {
    if (!isReturnType) return;

    const detailsURL = `${getRouteLocaleString(Routes.returns, params)}${orderId}/${emailId}`;
    router.push(detailsURL);
  };

  /**
   * Builds the localized label shown inside the order status badge.
   *
   * For non-delivered statuses, the label key follows the pattern:
   *   Order_<status>
   * where <status> comes from allpaymentStatus, lowercased and spaces replaced by underscores.
   */
  const getOrderStatusLabel = (status: string | undefined, trackingInfo: any): string | null => {
    if (status === "Delivered" || status === "Invoiced") {
      const latestDate = getLatestDeliveryDate(trackingInfo);
      const dateString = latestDate ? formatDateByLocale(latestDate, currentLocale?.locale) : "";
      // No DeliveryDate → hide the whole "Delivered on …" badge
      if (!dateString) return null;
      return getLabel("Order_deliveredon", {
        date: dateString,
      });
    }

    const statusText = allpaymentStatus[status as keyof typeof allpaymentStatus] ?? status;

    // Example: statusText "Partially Refunded" -> key "Order_partially_refunded"
    return getLabel(`Order_${statusText.toLowerCase().replace(/\s/g, "_")}`);
  };

  /**
   * Maps order payment / return status to the appropriate background utility class
   * used by the status badge.
   */
  const backgroundchecker = (status: string | undefined) => {
    if (!status) {
      return "bg-color-hover-action-primary";
    }

    const normalizedStatus = status.toLowerCase();

    const paymentStatus = allpaymentStatus[status as keyof typeof allpaymentStatus] ?? status;

    if (paymentStatus === "Rejected" || normalizedStatus.includes("reject")) {
      return "bg-[--system-colors-error-light]";
    }
    // if (allpaymentStatus[orderStatus] ==="Created"|| allpaymentStatus[orderStatus] ==="Approved" || allpaymentStatus[orderStatus] ==="Refund Processed"){
    //   return "bg-[--System-Colors-Warning-Light]"
    // }
    // if (allpaymentStatus[orderStatus] ==="Delivered" && (orderStatus.toLowerCase().includes("return")||orderStatus.toLowerCase().includes("refund"))){
    //   return "bg-[--System-Colors-Warning-Light]"
    // }
    if (normalizedStatus.includes("return") || normalizedStatus.includes("refund")) {
      return "bg-[--System-Colors-Warning-Light]";
    }
    return "bg-color-hover-action-primary";
  };

  /**
   * Small presentational component that renders the colored status badge in the
   * card header.
   */
  const OrderStatusBadge = ({
    status,
    trackingInfo,
  }: {
    status: string | undefined;
    trackingInfo: any;
  }) => {
    const label = getOrderStatusLabel(status, trackingInfo);
    if (!label) return null;

    return (
      <Box
        className={`flex h-full items-center justify-center p-3 base:w-full gtsm:w-full gtlg:order-none gtlg:w-auto ${backgroundchecker(status)}`}
      >
        {label}
      </Box>
    );
  };

  /**
   * Renders the items overview list, the show more/less toggle and the order total.
   */
  const OrderItemsOverview = ({
    visibleItems,
    totalItems,
    remainingCount,
    expanded,
    onToggleExpanded,
    orderTotal,
  }: {
    visibleItems: ItemsArray[];
    totalItems: number;
    remainingCount: number;
    expanded: boolean;
    onToggleExpanded: () => void;
    orderTotal?: string;
  }) => (
    <Box className="flex w-full gap-6 base:flex-col gtsm:flex-col gtlg:flex-row">
      {/* Items list box */}
      <Box className="flex w-full flex-col gap-6">
        <Box className="w-full gap-3">
          <Box className="text-color-text-body body-bold-sm">{getLabel("orders_overview")}</Box>

          {visibleItems?.map((item, index) => (
            <Box key={index} className="text-color-text-body body-regular-sm">
              {item?.quantity} x {item?.name || "Item Name"}
            </Box>
          ))}

          {totalItems > visibleItems.length && remainingCount > 0 && (
            <Box
              // @ts-ignore
              onClick={onToggleExpanded}
              className="w-full cursor-pointer text-color-primary-main underline underline-offset-auto body-regular-sm"
            >
              {expanded ? "Show less" : `+${remainingCount} more parts`}
            </Box>
          )}
        </Box>
        <Box className="h-auto w-full flex-row gap-4">
          <Box className="text-color-text-body body-bold-lg">{getLabel("orders_total_cost")}</Box>
          <Box className="text-color-text-body body-bold-lg">{orderTotal}</Box>
        </Box>
      </Box>
    </Box>
  );

  /**
   * Renders primary and optional return-related actions for the order card.
   */
  const OrderActions = ({ isReturnType }: { isReturnType: boolean }) => (
    <Box className="flex w-full items-end justify-end base:flex-col base:gap-3 gtsm:flex-col gtsm:gap-4 gtlg:flex-row gtlg:gap-6">
      <Box
        className="flex cursor-pointer flex-nowrap items-end justify-end base:w-full gtsm:w-full gtlg:max-h-[45px] gtlg:w-auto gtlg:min-w-[150px]"
        // @ts-ignore
        onClick={handleOrderDetails}
      >
        <OGButton type="primary" size="large" className="base:w-full gtsm:w-full gtlg:w-full">
          {getLabel("orders_more_details")}
        </OGButton>
      </Box>
      {isReturnType && (
        <Box
          className="flex cursor-pointer flex-nowrap items-end justify-end base:w-full gtsm:w-full gtlg:max-h-[45px] gtlg:w-auto gtlg:min-w-[150px]"
          // @ts-ignore
          onClick={handleReturnDetails}
        >
          <OGButton type="outlined" size="large" className="base:w-full gtsm:w-full gtlg:w-full">
            {getLabel("return_more_details")}
          </OGButton>
        </Box>
      )}
    </Box>
  );

  // sprint-21 related changes shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
  return (
    <Box className="mb-3 flex h-auto w-full flex-col gap-6 rounded-[6px] border border-color-border-default bg-color-background-default p-6">
      {/* Box Heading */}
      <Box className="flex items-center base:gap-3 gtsm:flex-col gtsm:gap-3 gtlg:flex-row gtlg:justify-between">
        {/* This should come second on small screens (order-2), default order on large */}
        <Box className="my-3 w-auto text-color-text-body body-bold-md">
          {orderdate} - #{orderId}
        </Box>

        {/* This should come first on small screens (order-1), default order on large */}
        <OrderStatusBadge status={orderStatus} trackingInfo={tracking} />
      </Box>

      <OrderItemsOverview
        visibleItems={visibleItems}
        totalItems={totalItems}
        remainingCount={remainingCount}
        expanded={expanded}
        onToggleExpanded={() => setExpanded(!expanded)}
        orderTotal={orderTotal || ""}
      />

      <OrderActions isReturnType={isReturnType} />
    </Box>
  );
}
