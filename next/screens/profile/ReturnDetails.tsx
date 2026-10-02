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
import Returncard from "./ReturnCard";
import ReturnInfoBlock from "./ReturnInfoBlock";
import OverviewcardReturndetails from "./OverviewcardReturndetails";
import InvoiceReturnMethodcard from "./InvoiceReturnMethodcard";
import { backgroundchecker } from "@/helpers/UtilityHelper";
import { allpaymentStatus } from "@/types/globalTypes";
import Typography from "@/components/og-components/Typography";
import { useGetOrderById } from "@/hooks/orders";

interface ReturnDetailsScreenInterface {
  order_id?: string | number;
  data?: object;
}

export default function ReturnDetails(props: ReturnDetailsScreenInterface) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { locale, setLocale } = useLandingPageDataStore();
  const { getLabel } = useBranding();
  const { authUser, setAuthUser, logoutUser } = useAuthStore();
  const params = useParams();
  const orderIdFromURL = params?.orderId || "";
  const toast = useToast();
  const currentLocale = getLocale(locale);
  const { resetEB, resetSearch, resetOgSearch } = useSearchModalStore();
  const { resetCart } = useCartStore();
  // const orderId = (params?.orderId as string) ?? "";
  const emailId = (params?.emailId as string) ?? "";

  const { data: paymentMethodDetails, isPending, error } = useGetOrderById(orderIdFromURL, emailId);

  // Add this function to handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };
  // to here
  // if (isProfileLoading) return null;
  const items = props?.data?.items.filter((item) => item.reason !== "DoNotReturn") || [];
  const paymentMethod =
    paymentMethodDetails?.payments?.length > 0 && paymentMethodDetails?.payments?.[0]?.paymentMethod
      ? paymentMethodDetails.payments[0].paymentMethod
      : null;
  const backgroundchecker = (orderStatus: any) => {
    if (
      allpaymentStatus[orderStatus] === "Rejected" ||
      orderStatus.toLowerCase().includes("reject")
    ) {
      return "bg-[--system-colors-error-light]";
    }
    // if (allpaymentStatus[orderStatus] ==="Created"|| allpaymentStatus[orderStatus] ==="Approved" || allpaymentStatus[orderStatus] ==="Refund Processed"){
    //   return "bg-[--System-Colors-Warning-Light]"
    // }
    // if (allpaymentStatus[orderStatus] ==="Delivered" && (orderStatus.toLowerCase().includes("return")||orderStatus.toLowerCase().includes("refund"))){
    //   return "bg-[--System-Colors-Warning-Light]"
    // }
    // if (orderStatus.toLowerCase().includes("return")||orderStatus.toLowerCase().includes("refund")) {
    //  return "bg-[--System-Colors-Warning-Light]"
    // }
    return "bg-color-system-warning-light";
  };

  console.log("items", items);
  return (
    <>
      <Box className="relative flex h-full w-full base:pb-[10px] base:pt-[40px] gtlg:px-[40px] gtlg:pb-[38px] gtlg:pt-[40px]">
        <Box className="flex min-w-full flex-col gap-6 base:px-3 gtsm:px-3 gtlg:px-0">
          <Box className="flex w-full items-center justify-between base:h-auto base:flex-col base:gap-6 gtsm:flex-row gtsm:gap-0 gtlg:h-[50px] gtlg:flex-row gtlg:gap-0">
            <Box className="flex h-full w-full flex-row items-center base:gap-3 gtsm:gap-3 gtsm:px-3 gtlg:gap-6 gtlg:px-0">
              <Typography type="h2" className="text-color-text-body" hasBack>
                {`Detailed view return: ${new Date(props?.data?.createDate).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )} - #${orderIdFromURL}`}
              </Typography>
            </Box>

            <Box
              className={`flex flex-shrink-0 items-center justify-center p-3 text-color-text-body body-regular-sm base:h-auto base:w-full gtsm:h-full gtsm:w-auto ${backgroundchecker(props?.data?.status)}`}
            >
              {props?.data?.status || ""}
            </Box>
          </Box>

          <Box className="relative h-auto justify-between gap-6 rounded-[8px] base:mb-0 base:mt-0 base:w-full base:flex-col gtsm:mt-0 gtsm:flex-row gtlg:mt-0 gtlg:w-full ml:flex ml:flex-row">
            <Box className="flex w-full flex-col gap-4 gtsm:pb-[12px] gtlg:pb-0">
              {items?.map((item, index) => (
                <Returncard
                  key={index}
                  id="OF000089"
                  quantity="1"
                  name={item?.name}
                  description={item?.description || "Description"} // fallback
                  unitPriceIncVat={item?.price}
                  image={item.image}
                  price={item?.price}
                />
              ))}
            </Box>

            <Box className="flex flex-col gap-6 gtsm:min-w-[350px] gtlg:min-w-[380px]">
              <OverviewcardReturndetails items={items} totalPrice={props?.data?.totalPrice} />
              <InvoiceReturnMethodcard
                paymentMethod={paymentMethod}
                id={paymentMethodDetails?.id}
              />
            </Box>
          </Box>

          {/* return box */}
          <ReturnInfoBlock bankaccount={props?.data?.accountName} iban={props?.data?.iban} />
        </Box>
      </Box>
    </>
  );
}
