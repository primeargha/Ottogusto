"use client";
import { Box } from "@/components/ui/box";
import React, { useEffect, useState } from "react";
import { VisaIcon } from "./assets/VisaIcon";
import { MasterCardIcon } from "./assets/MasterCardIcon";
import { BancontactIcon } from "./assets/BancontactIcon";
import { ApplePayIcon } from "./assets/ApplePayIcon";
import { OBIcon } from "./assets/OBIcon";
import { GPayIcon } from "./assets/GPayIcon";
import { IDealIcon } from "./assets/IDealIcon";
import { PayConiIcon } from "./assets/PayConicIcon";
import { WeroIcon } from "./assets/WeroIcon";
import Typography from "@/components/og-components/Typography";
import Image from "next/image";
import qverdeLogo from "@/assets/Qverde/qverdelogo.svg";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import banContactsvg from "./assets/bancontactIcon.svg";
import { SimplePolicyLink } from "@/components/PolicyViewer";
import { useBranding } from "@/contexts/BrandingContext";
import Link from "next/link";
import { LinkText } from "@/components/ui/link";
import { Routes } from "@/config/routes";
import { useParams } from "next/navigation";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE } from "@/config/store-constants";
import { QverdeIcon } from "./assets/QverdeIcon";
import { OttogustoIcon } from "./assets/OttogustoIcon";
import { useMedia } from "@/hooks/useMedia";
import { Divider } from "@/components/ui/divider";
import PhoneCash from "./assets/Phonecash";
import P24pay from "./assets/P24pay";
import MBPay from "./assets/MBPay";
import ZPay from "./assets/ZPay";
import { OGButton } from "@/components/og-components/OGButton";
import { CrossIconModal } from "@/components/icons/CrossIconModal";
import BecomTrustmarkBadge from "@/components/trustprofile/BecomTrustmarkBadge";
import { SHOW_BECOM_QUALITY_MARK } from "@/config/trustprofile";

const PaymentCompanyFooter = () => {
  const { getLabel } = useBranding();
  const params = useParams();
  const isMobile = useMedia("(max-width: 719px)");
  const [viewAllOpenModal, setViewAllOpenModal] = useState(false);
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;
  const linkTextClass = `typography-button-02 text-color-text-inverse no-underline`;
  useEffect(() => {
    if (!viewAllOpenModal) return;

    const handleWheel = () => {
      setViewAllOpenModal(false);
    };

    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [viewAllOpenModal]);
  return (
    <Box
      className={`flex w-full items-center justify-center gap-3 bg-transparent ${!isMobile && "pt-space-sm"} pb-space-lg layout-width-footer`}
    >
      {isMobile ? (
        <Box className="flex w-full flex-col items-center justify-center gap-3">
          <Box className="flex w-full flex-row items-center justify-between px-space-md">
            <VisaIcon className="text-white" />
            <MasterCardIcon className="text-white" />
            <Image
              src={banContactsvg}
              className="h-12 w-auto"
              alt="Bancontact"
              title="Bancontact"
            />
            <ApplePayIcon className="text-white opacity-80" />
          </Box>

          <Box className="flex w-full flex-row items-center justify-between px-space-md">
            <GPayIcon className="text-white opacity-80" />
            <OBIcon className="text-white" />
            <IDealIcon className="text-white" />
            <WeroIcon className="text-white opacity-80" />
          </Box>

          <Box className="flex w-full flex-row items-center justify-between px-space-md">
            <PhoneCash className="text-white" />
            <P24pay className="text-white" />
            <MBPay className="text-white" />
            <ZPay className="text-white" />
          </Box>

          <Typography
            className="cursor-pointer text-color-text-inverse typography-button-02 hover:text-color-text-accent"
            onClick={() => setViewAllOpenModal(true)}
          >
            {getLabel("view_more_payment_methods")}
          </Typography>
        </Box>
      ) : (
        <Box className="flex w-full flex-row items-center justify-between px-space-md">
          <VisaIcon className="text-white" />
          <MasterCardIcon className="text-white" />
          <Image src={banContactsvg} className="h-12 w-auto" alt="Bancontact" title="Bancontact" />
          <ApplePayIcon className="text-white opacity-80" />

          <GPayIcon className="text-white opacity-80" />
          <OBIcon className="text-white" />
          <IDealIcon className="text-white" />
          {/* <PayConiIcon className="text-white" /> */}
          <WeroIcon className="text-white opacity-80" />
          <PhoneCash className="text-white" />
          <P24pay className="text-white" />
          <MBPay className="text-white" />
          <ZPay className="text-white" />
          <Typography
            className="cursor-pointer text-color-text-inverse typography-button-02 hover:text-color-text-accent"
            onClick={() => setViewAllOpenModal(true)}
          >
            {getLabel("view_more_payment_methods")}
          </Typography>
        </Box>
      )}

      {viewAllOpenModal && (
        <Box
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setViewAllOpenModal(false)}
        >
          <Box
            className="relative w-full max-w-xl overflow-hidden rounded-[8px] bg-color-background-default shadow-xl"
            //@ts-ignore
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Box className="flex w-full">
              <Box className="flex flex-col items-start justify-center border-b border-color-border-default">
                <Box className="w-full border-b border-color-border-default">
                  <Box className="flex w-full flex-row justify-between px-6 py-4">
                    <Typography className="mt-1 text-start text-color-text-body typography-subtitle-01">
                      {getLabel("modal_paymentmethods_title")}
                    </Typography>
                    <Box
                      className="cursor-pointer rounded-md bg-color-background-default p-2 hover:bg-color-background-emphasis"
                      // @ts-ignore
                      onClick={() => setViewAllOpenModal(false)}
                    >
                      <CrossIconModal className="text-color-text-emphasis" />
                    </Box>
                  </Box>
                </Box>
                <Box className="flex w-full items-start justify-start px-6 py-8">
                  <Typography className="text-start text-color-text-muted typography-body-02">
                    {getLabel("modal_paymentmethods_body")}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box className="bg-color-background-default p-6">
              <Box className="flex w-full flex-row justify-end gap-3">
                <OGButton
                  type="primary"
                  size="medium"
                  className="flex w-auto"
                  onClick={() => setViewAllOpenModal(false)}
                >
                  {getLabel("modal_paymentmethods_cta")}
                </OGButton>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Divider line */}
      <Box className="h-[1px] w-full bg-footer-divider"></Box>

      <Box
        className={`flex w-full items-center ${!isMobile && "px-space-md"} base:flex-col base:justify-center gtsm:flex-row gtsm:justify-between gtlg:flex-row gtlg:justify-between`}
      >
        {/* image and address group */}
        <Box
          className={`flex max-w-full gap-space-lg ${
            isMobile ? "w-full flex-col items-center" : "flex-row items-center"
          }`}
        >
          <Box className="flex flex-row items-center gap-space-lg">
            <Box className="flex flex-row items-center">
              {currentStore === STORE_IDS.OTTOGUSTO ? (
                <OttogustoIcon className="text-white" />
              ) : (
                <Image
                  src={qverdeLogo}
                  alt="Qverde logo"
                  title="Qverde"
                  className="h-full w-full bg-contain"
                />
              )}
            </Box>

            <Box className="flex flex-col gap-[6px]">
              <Box className="flex w-auto flex-row gap-[6px]">
                <Typography className="text-color-text-inverse typography-caption">
                  {currentStore === STORE_IDS.OTTOGUSTO
                    ? getLabel(STORE_IDS.OTTOGUSTO)
                    : getLabel(STORE_IDS.QVERDE)}
                </Typography>

                <Box className="min-h-6 w-[1px] border border-footer-divider"></Box>
                <Typography className="text-color-text-inverse typography-caption">
                  {currentStore === STORE_IDS.OTTOGUSTO
                    ? getLabel("VATtextQttogustoBE")
                    : getLabel("VATtextQverdeBE")}
                </Typography>
                {/*  */}
                {currentStore !== STORE_IDS.OTTOGUSTO && (
                  <>
                    <Box className="min-h-6 w-[1px] border border-footer-divider"></Box>
                    <Typography className="text-color-text-inverse typography-caption">
                      {getLabel("VATtextQverdeNL")}
                    </Typography>
                  </>
                )}
              </Box>
              <Typography className="text-color-text-inverse typography-caption">
                {getLabel("footer_address")}
              </Typography>
              <Typography className="text-color-text-inverse typography-caption">
                {currentStore === STORE_IDS.OTTOGUSTO
                  ? getLabel("belgiumaddress")
                  : getLabel("qverdeAddress")}
              </Typography>
            </Box>
          </Box>
          {currentStore === STORE_IDS.OTTOGUSTO && SHOW_BECOM_QUALITY_MARK && (
            <BecomTrustmarkBadge />
          )}
        </Box>

        {isMobile && <Box className="my-space-md h-[1px] w-full bg-footer-divider"></Box>}

        {/* terms and cond. group */}
        <Box className="flex flex-col gap-space-xs">
          <Box className="flex w-auto flex-wrap items-center justify-end gap-3 base:flex-col gtsm:flex-row gtlg:flex-row">
            <Box className="flex justify-end px-4 py-2">
              <SimplePolicyLink policyType="terms" className={linkTextClass}>
                {getLabel("terms_n_conditions_head")}
              </SimplePolicyLink>
            </Box>
            <Box className="px-4 py-2">
              <Link href={getRouteLocaleString(Routes.returnPolicy, params)}>
                <Typography className={linkTextClass}>{getLabel("return_policy")}</Typography>
              </Link>
            </Box>
            <Box className="flex justify-end px-4 py-2">
              {/* <Typography className="text-color-text-inverse typography-button-02">
                Shipping Policy
              </Typography> */}

              <SimplePolicyLink policyType="shipping" className={linkTextClass}>
                {getLabel("shipping_policy")}
              </SimplePolicyLink>
            </Box>
            <Box className="flex justify-end px-4 py-2">
              <SimplePolicyLink policyType="privacy" className={linkTextClass}>
                {getLabel("privacy_policy")}
              </SimplePolicyLink>
            </Box>
            <Box className="flex justify-end px-4 py-2">
              <SimplePolicyLink policyType="cookies" className={linkTextClass}>
                {getLabel("cookie_policy")}
              </SimplePolicyLink>
            </Box>
          </Box>
          <Box className="flex flex-row items-center justify-between">
            {!isMobile && <Box></Box>}
            <Typography className="text-center text-color-text-inverse typography-caption">
              {currentStore === STORE_IDS.OTTOGUSTO ? (
                <>
                  {getLabel("company_name_copyrightO")}{" "}
                  <span className="underline">{getLabel("cp2Digital")}</span>{" "}
                  {getLabel("all_rights_reserved")}
                </>
              ) : (
                <>
                  {getLabel("company_name_copyrightQ")}{" "}
                  <span className="underline">{getLabel("cp2Digital")}</span>{" "}
                  {getLabel("all_rights_reserved")}
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentCompanyFooter;
