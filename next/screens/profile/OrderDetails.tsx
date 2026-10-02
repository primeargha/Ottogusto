// @ts-nocheck
"use client";

import BackIcon from "@/components/icons/BackIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { CheckIcon, CircleIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from "@/components/ui/radio";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useEffect, useState } from "react";
import DeleteUserIcon from "@/components/icons/DeleteUserIcon";
import DeleteBinIcon from "@/components/icons/DeleteBinIcon";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useDeleteAccountMutation,
  useGetProfileInformationQuery,
  useUpdateHasLoggedInInformationMutation,
  useUpdateProfileInformationMutation,
} from "@/hooks/profile";
import { useGetOrderInvoice } from "@/hooks/orders";
import { Address, ProfileUpdatePayload } from "@/types/profile";
import { useQueryClient } from "@tanstack/react-query";
import { useToast, Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { getProfile } from "@/services/authService";
import { useModalStore } from "@/stores/useModalStore";
import Modal from "@/components/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import { vatLookup } from "@/services/profile";
import { getLocale } from "../landing/footer/language-selector";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { OGRadioGroup, OGRadioInput } from "@/components/og-components/OGRadioInput";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";
import { OGPhoneInput } from "@/components/og-components/OGPhoneInput";
import { OGButton } from "@/components/og-components/OGButton";
import { useCartStore } from "@/stores/useCartStore";
import InvoiceMethodcard from "../order-details/InvoiceMethodcard";
import Overviewcard from "../shoppingcart/overviewcard";
import Ordercard from "../order-details/ordercard";
import Productnavigation from "../productdetails/productnavigation";
import Overviewcardorderdetails from "./Overviewcardorderdetails";
import { useBranding } from "@/contexts/BrandingContext";
import {
  getdaysbetween,
  getLatestDeliveryDate,
  getRouteLocaleString,
} from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { allpaymentStatus } from "@/types/globalTypes";
import { useOrderStore } from "@/stores/useOrderStore";
// PERF: Removed moment — getdaysbetween now uses native Date
import { SimplePolicyLink } from "@/components/PolicyViewer";
import Typography from "@/components/og-components/Typography";
import Link from "next/link";
import { formatDateByLocale } from "@/utils/formatDate";
import { get } from "node:http";

// Street, house number, then bus/box as Bus-{buildingNumber}, then city, postal, country
const formatAddress = (
  street?: string,
  city?: string,
  state?: string,
  country?: string,
  postalCode?: string,
  houseNumber?: string,
  buildingNumber?: string,
) => {
  try {
    let streetPart = street || "";

    if (houseNumber && String(houseNumber).trim()) {
      streetPart += ` ${houseNumber}`;
    }

    if (buildingNumber && String(buildingNumber).trim()) {
      streetPart += ` Bus-${buildingNumber}`;
    }

    const parts = [streetPart, city || "", postalCode || "", country || ""];

    return parts.filter((part) => part).join(", ");
  } catch {
    let streetPart = street || "";
    if (houseNumber && String(houseNumber).trim()) {
      streetPart += ` ${houseNumber}`;
    }
    if (buildingNumber && String(buildingNumber).trim()) {
      streetPart += ` Bus-${buildingNumber}`;
    }
    const parts = [streetPart, city || "", postalCode || "", country || ""];
    return parts.filter((part) => part).join(", ");
  }
};

interface OrderDetailsScreenInterface {
  order_id?: string | number;
  data?: object;
}

export default function OrderDetails(props: OrderDetailsScreenInterface) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { locale, setLocale } = useLandingPageDataStore();
  const { getLabel } = useBranding();
  const { authUser, setAuthUser, logoutUser } = useAuthStore();
  const params = useParams();
  const toast = useToast();
  const localeCODE = getLocale();
  const currentLocale = getLocale(locale);
  const { resetEB, resetSearch, resetOgSearch } = useSearchModalStore();
  const { resetCart } = useCartStore();
  const { setOrderId } = useOrderStore();

  type ReturnStatusValue = "window_closed" | "delivered" | "not_delivered";
  const areAddressesEqual = (address1: any, address2: any): boolean => {
    // Check if both objects have same keys
    const keys1 = Object.keys(address1 ?? {});
    const keys2 = Object.keys(address2 ?? {});

    if (keys1.length !== keys2.length) {
      return false;
    }

    // Compare each property
    return keys1.every((key) => {
      if (address1[key] === null || address1[key] === undefined) {
        return address2[key] === null || address2[key] === undefined;
      }
      return address1[key] === address2[key];
    });
  };
  // Add this function to handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };
  // const handledisabled = (): boolean => {
  //   const { status, tracking } = props?.data ?? {};
  //   if (status === "Delivered"|| status.toLowerCase().includes("return")||status.toLowerCase().includes("refund")) {
  //     const latestdelivery = getLatestDeliveryDate(tracking);
  //     const difference = getdaysbetween(latestdelivery, moment());
  //     return difference > 14;
  //   }
  //   return true;
  // };
  /**
   * Maps the high-level return status bucket to whether the return CTA
   * should be disabled in the UI.
   */
  const handledisabled = (statusvalue: ReturnStatusValue): boolean => {
    if (statusvalue === "window_closed" || statusvalue === "not_delivered") {
      return true;
    } else {
      return false;
    }
  };
  //const isButtonDisabled = handledisabled();

  const handlereturn = () => {
    if (!isButtonDisabled) {
      setOrderId(params?.orderId);
      router.push(getRouteLocaleString(Routes.supportReturn, params));
    }
  };
  /**
   * Derives the high-level return status bucket from the order status and
   * latest delivery date, using a 14-day window for returns.
   */
  const statuscheck = (): ReturnStatusValue => {
    const { status, tracking } = props?.data ?? {};
    if (
      status === "Delivered" ||
      status === "Invoiced" ||
      status.toLowerCase().includes("return") ||
      status.toLowerCase().includes("refund")
    ) {
      const latestdelivery = getLatestDeliveryDate(tracking);
      const difference = getdaysbetween(latestdelivery, new Date());
      return difference > 14 ? "window_closed" : "delivered";
      // return difference > 14 ? "window_closed" : status=== "Returning" ? "window_closed" : "delivered";
    }
    return "not_delivered";
  };

  const statusvalue = statuscheck();
  const isButtonDisabled = handledisabled(statusvalue);
  // refer this file
  const areEqual = areAddressesEqual(props?.data?.shipping, props?.data?.billing);

  // if (isProfileLoading) return null;
  //const items = props?.data?.items || [];
  const items = (props?.data?.items ?? []).filter((item) => item.type === "Part");
  const paymentMethod =
    props?.data?.payments?.length > 0 && props?.data?.payments?.[0]?.paymentMethod
      ? props.data.payments[0].paymentMethod
      : null;
  const linkTextClass = `cursor-pointer body-regular-sm text-color-primary-main underline decoration-solid`;

  /**
   * Builds the localized header status label for the order detail page.
   * Mirrors the logic used in OrdersBox with branding keys under Order_*.
   */
  const getOrderHeaderStatusLabel = (
    status: string | undefined,
    trackingInfo: any,
  ): string | null => {
    if (status === "Delivered" || status === "Invoiced") {
      const latestDate = getLatestDeliveryDate(trackingInfo);
      const dateString = latestDate ? formatDateByLocale(latestDate, currentLocale?.locale) : "";
      // No DeliveryDate → hide the whole "Delivered on …" badge
      if (!dateString) return null;
      return getLabel("Order_deliveredon", { date: dateString });
    }

    if (!status) return null;

    const statusText = allpaymentStatus[status as keyof typeof allpaymentStatus] ?? status;

    // Example: statusText "Partially Refunded" -> key "Order_partially_refunded"
    return getLabel(`Order_${statusText.toLowerCase().replace(/\s/g, "_")}`);
  };

  const orderHeaderStatusLabel = getOrderHeaderStatusLabel(
    props?.data?.status,
    props?.data?.tracking,
  );

  return (
    <>
      <Box
        className={`relative flex h-full w-full base:pb-[10px] base:pt-[30px] gtsm:pt-[40px] gtlg:px-[40px] gtlg:pb-[38px] gtlg:pt-[40px]`}
      >
        <Box className="flex min-w-full flex-col gap-6 base:px-3 gtsm:px-3 gtlg:px-0">
          <Box className="flex w-full items-center justify-between bg-transparent base:h-auto base:flex-col base:gap-6 gtsm:flex-row gtsm:gap-0 gtlg:flex-row gtlg:gap-0">
            <Box className="flex h-full w-full flex-row items-center base:gap-3 gtsm:gap-3 gtsm:px-3 gtlg:gap-6 gtlg:px-0">
              <Typography type="h2" className="text-color-text-body" hasBack>
                {getLabel("Order_detailed_view", {
                  content: `${formatDateByLocale(props?.data?.createDate, currentLocale?.locale)}- #${props?.data?.id?.replace(/[{}]/g, "")}`,
                })}
              </Typography>
            </Box>

            {orderHeaderStatusLabel ? (
              <Box className="flex max-h-[32px] min-h-[52px] flex-shrink-0 items-center justify-center bg-color-hover-action-primary p-3 body-regular-sm base:w-full gtsm:w-auto gtlg:w-auto">
                {orderHeaderStatusLabel}
              </Box>
            ) : null}
          </Box>
          {/* orders card list */}
          <Box className="relative h-auto justify-between gap-3 rounded-[8px] base:mb-0 base:w-full base:flex-col gtsm:flex-row gtlg:w-full ml:flex ml:flex-row">
            <Box className="flex w-full flex-col gap-4 gtsm:pb-[12px] gtlg:pb-0">
              {/* {JSON.stringify(props?.data, null, 2)} */}
              {items?.map((item, index) => (
                <Ordercard
                  key={index}
                  id={item.id}
                  quantity={item.quantity}
                  name={item.name}
                  description={item.description || "Description"} // fallback
                  unitPriceIncVat={item.unitPriceIncVat}
                  image={item.image}
                />
              ))}
            </Box>

            <Box className="flex flex-col base:gap-3 gtsm:min-w-[350px] gtsm:gap-6 gtlg:min-w-[380px]">
              <Overviewcardorderdetails data={props?.data} />
              <InvoiceMethodcard
                paymentMethod={paymentMethod}
                status={props.data.status}
                id={props.data.id}
              />
            </Box>
          </Box>

          {/* delivery billing block */}
          <Box className="flex h-auto w-full items-start gap-3 rounded-[8px] border border-color-background-l8 bg-color-background-l2 p-6 shadow-[0px_8px_40px_0px_rgba(0,0,0,0.12)] base:flex-col gtsm:flex-col gtlg:flex-row">
            <Box className="flex h-full w-full flex-1 flex-col gap-3">
              <Box className="flex justify-start py-3">
                <Box className="text-color-text-body body-bold-lg">
                  {props.data.shippingMethod !== "Home delivery"
                    ? areAddressesEqual(props?.data?.shipping, props?.data?.billing)
                      ? getLabel("delivery_billing_address")
                      : props.data.shippingMethod === "PICKUP"
                        ? getLabel("wirehouse_address")
                        : getLabel("delivery_address")
                    : getLabel("pick_up_point")}
                </Box>
              </Box>
              <Box className="max-h-auto-h-[165px] flex h-full flex-col justify-between gap-3 rounded-[8px] bg-color-background-l3 p-6">
                {props?.data?.shipping?.name?.trim() !== "" ? (
                  <Box className="text-color-text-body body-bold-md">
                    {props?.data?.shipping?.name?.trim() || ""}
                  </Box>
                ) : null}
                <Box className="flex w-full flex-row text-color-text-body body-regular-sm">
                  {getLabel("address")}:&nbsp;
                  <span className="font-normal">
                    {formatAddress(
                      props?.data?.shipping?.street,
                      props?.data?.shipping?.city,
                      props?.data?.shipping?.state,
                      props?.data?.shipping?.country,
                      props?.data?.shipping?.postalCode,
                      props?.data?.shipping?.houseNumber,
                      props?.data?.shipping?.buildingNumber,
                    ) || "No address provided"}
                  </span>
                </Box>
                <Box
                  className={`${props?.data?.shipping?.phoneNumber ? null : "invisible"} flex w-full flex-row text-color-text-body body-regular-sm`}
                >
                  Phone:{" "}
                  <span className="font-normal">
                    {props?.data?.shipping?.phoneNumber || "No phone"}
                  </span>
                </Box>
                {/* <Box className="invisible">placeholder</Box> */}
              </Box>
            </Box>
            {!areAddressesEqual(props?.data?.shipping, props?.data?.billing) && (
              <Box className="flex h-full w-full flex-1 flex-col gap-3">
                <Box className="flex justify-start py-3">
                  <Box className="text-color-text-body body-bold-lg">
                    {getLabel("billing_address")}
                  </Box>
                </Box>
                <Box className="max-h-auto flex h-full min-h-[165px] flex-col justify-between gap-3 rounded-[8px] bg-color-background-l3 p-6">
                  {props?.data?.billing?.name?.trim() !== "" ? (
                    <Box className="text-color-text-body body-bold-md">
                      {props?.data?.billing?.name?.trim() || ""}
                    </Box>
                  ) : null}
                  <Box className="flex w-full flex-row text-color-text-body body-regular-sm">
                    Address:&nbsp;
                    <span className="w-full font-normal">
                      {formatAddress(
                        props?.data?.billing?.street,
                        props?.data?.billing?.city,
                        props?.data?.billing?.state,
                        props?.data?.billing?.country,
                        props?.data?.billing?.postalCode,
                        props?.data?.billing?.houseNumber,
                        props?.data?.billing?.buildingNumber,
                      ) || "No address provided"}
                    </span>
                  </Box>
                  <Box
                    className={`${props?.data?.billing?.phoneNumber ? null : "invisible"} flex w-full flex-row text-color-text-body body-regular-sm`}
                  >
                    Phone:{" "}
                    <span className="font-normal">
                      {props?.data?.billing?.phoneNumber || "No phone"}
                    </span>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* return box */}
          <ReturnSection
            statusValue={statusvalue}
            isButtonDisabled={isButtonDisabled}
            onStartReturn={handlereturn}
            linkTextClass={linkTextClass}
            apiStatus={props?.data?.status}
          />
        </Box>
      </Box>
    </>
  );
}

interface ReturnSectionProps {
  statusValue: ReturnStatusValue;
  isButtonDisabled: boolean;
  onStartReturn: () => void;
  linkTextClass: string;
  apiStatus?: string;
}

const ReturnSection = ({
  statusValue,
  isButtonDisabled,
  onStartReturn,
  linkTextClass,
  apiStatus,
}: ReturnSectionProps) => {
  const params = useParams();
  const { getLabel } = useBranding();

  return (
    <Box className="flex h-auto w-full items-start gap-3 rounded-[8px] border border-color-background-l8 bg-color-background-l2 p-6 shadow-[0px_8px_40px_0px_rgba(0,0,0,0.12)] base:flex-col gtsm:flex-col gtlg:flex-row">
      <Box className="flex h-full w-full flex-1 flex-col gap-3">
        <Box className="flex justify-start py-3">
          <Box className="text-color-text-body body-bold-lg">
            {statusValue === "window_closed"
              ? getLabel("return_window_closed")
              : getLabel("Return_order_title")}
          </Box>
        </Box>

        <Box className="flex w-full flex-col gap-4">
          <Box className="text-color-text-body body-regular-sm">
            {statusValue === "delivered"
              ? getLabel("return_order_text1")
              : statusValue === "not_delivered"
                ? getLabel("Return_windowdays_info")
                : getLabel("Return_windowpassed_info")}
          </Box>
          <Box className="text-color-text-body body-regular-sm">
            {statusValue === "delivered" ? (
              getLabel("return_order_text2")
            ) : statusValue === "not_delivered" ? (
              getLabel("Return_windowextra_info")
            ) : (
              <ReturnWindowPassed />
            )}
          </Box>
        </Box>
        {statusValue !== "window_closed" && (
          <>
            <Box className="flex cursor-pointer items-end justify-end base:w-full gtsm:w-full gtlg:max-w-[140px]">
              <OGButton
                type="primary"
                size="large"
                disabled={isButtonDisabled}
                onClick={onStartReturn}
                className="base:w-full gtsm:w-full gtlg:w-full"
              >
                {getLabel("start_return")}
              </OGButton>
            </Box>

            <Box className="py-[10px]">
              <Link
                href={getRouteLocaleString(Routes.returnPolicy, params)}
                className={linkTextClass}
              >
                {" "}
                {getLabel("Read_return_policy")}{" "}
              </Link>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

const ReturnWindowPassed = () => {
  const params = useParams();
  const { getLabel } = useBranding();
  const linkTextClass =
    "cursor-pointer body-bold-sm text-color-text-body underline decoration-solid";
  const labelTemplate = getLabel("Return_window_detailedinfo");
  const parts = labelTemplate.split("[policyLink]");
  return (
    <Box className="flex flex-row gap-2 text-black">
      {" "}
      {parts[0]}{" "}
      <Link href={getRouteLocaleString(Routes.returnPolicy, params)} className={linkTextClass}>
        {" "}
        {getLabel("return_policy")}{" "}
      </Link>{" "}
      {parts[1]}{" "}
    </Box>
  );
};
