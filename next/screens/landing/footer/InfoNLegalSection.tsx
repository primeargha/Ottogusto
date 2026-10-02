"use client";
import { Box } from "@/components/ui/box";
import React, { useEffect, useState } from "react";

type Props = {};

import LogoWhite from "./assets/logo-white.png";
import ottogustoLogo from "@/assets/Ottogusto/ottogustologo.svg";
import qverdeLogo from "@/assets/Qverde/qverdelogo.svg";
import MasterICO from "./assets/mastercard.svg";
import VisaICO from "./assets/visa.svg";
import PayconicICO from "./assets/payconic.svg";
import IdealICO from "./assets/iDeal.svg";
import BanContactICO from "./assets/bancontact.svg";
import gpay from "@/assets/gpay.svg";
import applepay from "@/assets/applePay.svg";
import obPay from "@/assets/OBpay.svg";
import weropay from "@/assets/wero.svg";
import qverdeLogoDesktop from "@/assets/Qverde/qverdeDesktopLogo.svg";
import Image from "next/image";
import { FORCE_iPAD } from "@/config/app";
import { Link, LinkText } from "@/components/ui/link";
import { useBranding } from "@/contexts/BrandingContext";
import { useParams } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { safeNextLinkHref } from "@/utils/translationDisplayMode";
import { Routes } from "@/config/routes";
import { SimplePolicyLink } from "@/components/PolicyViewer";
import { useAuthStore } from "@/stores/useAuthStore";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE } from "@/config/store-constants";
// import { Image } from "@/components/ui/image";

const LegalLinks = () => {
  const { getLabel } = useBranding();
  const linkTextClass = `body-regular-sm text-white no-underline`;
  const params = useParams();
  return (
    <Box className="inline-flex h-auto w-[302px] flex-col items-start justify-start gap-[12px]">
      <Box className="text-white body-bold-md">{getLabel("footer_legal_links_head")}</Box>

      {/* Functional Policy Links */}
      <SimplePolicyLink policyType="terms" className={linkTextClass}>
        {getLabel("terms_n_conditions_head")}
      </SimplePolicyLink>
      <Link href={getRouteLocaleString(Routes.returnPolicy, params)}>
        <LinkText className={linkTextClass}>{getLabel("return_policy")}</LinkText>
      </Link>

      <SimplePolicyLink policyType="shipping" className={linkTextClass}>
        {getLabel("shipping_policy")}
      </SimplePolicyLink>

      <SimplePolicyLink policyType="privacy" className={linkTextClass}>
        {getLabel("privacy_policy")}
      </SimplePolicyLink>

      <SimplePolicyLink policyType="cookies" className={linkTextClass}>
        {getLabel("cookie_policy")}
      </SimplePolicyLink>
    </Box>
  );
};
const OurCompany = () => {
  const { getLabel } = useBranding();
  const params = useParams();
  const linkTextClass = `body-regular-sm text-white no-underline`;
  return (
    <Box className="inline-flex h-[130px] w-[302px] flex-col items-start justify-start gap-[12px]">
      <Box className="text-white body-bold-md">{getLabel("our_company")}</Box>
      <Link href={getRouteLocaleString(Routes.aboutUs, params)}>
        <LinkText className={linkTextClass}>{getLabel("about_us")}</LinkText>
      </Link>
      <Link href={safeNextLinkHref(getLabel("aboutus_careers_cta_link"))} isExternal={true}>
        <LinkText className={linkTextClass}>{getLabel("careers")}</LinkText>
      </Link>
      {/* <Link>
        <LinkText className={linkTextClass}>{getLabel("brand_story")}</LinkText>
      </Link> */}
    </Box>
  );
};

const Support = () => {
  const { getLabel } = useBranding();
  const { isAuthenticated } = useAuthStore();
  const params = useParams();
  const ComplaintsCategoryID = isAuthenticated ? 8 : 7;

  const linkTextClass = `body-regular-sm text-white no-underline`;
  return (
    <Box className="inline-flex w-[302px] flex-col items-start justify-start gap-[12px]">
      <Box className="text-white body-bold-md">{getLabel("support")}</Box>
      <Link href={`${getRouteLocaleString(Routes.support, params)}`}>
        <LinkText className={linkTextClass}>{getLabel("contact_us")}</LinkText>
      </Link>
      <Link
        // href={`${getRouteLocaleString(Routes.support, params)}?categoryId=${ComplaintsCategoryID}`}
        href={`${getRouteLocaleString(Routes.support, params)}complaints`}
      >
        <LinkText className={linkTextClass}>{getLabel("complaints")}</LinkText>
      </Link>
    </Box>
  );
};

const InfoNLegalSection = (props: Props) => {
  const { getLabel } = useBranding();
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;
  return (
    <Box className="grid max-w-[1400px] gap-2 md:grid-cols-12">
      <Box className="pt-[12px] md:col-span-4">
        <Box className="inline-flex h-auto max-w-[364px] flex-col items-start justify-start gap-[12px]">
          <Box data-svg-wrapper>
            {/* <Image source={{uri: '/assets/logo.svg'}} alt="MasterCard" size="full" className="aspect-[120/29] w-[120px] h-[29px]" /> */}
            {currentStore === STORE_IDS.OTTOGUSTO ? (
              <Image
                src={ottogustoLogo}
                alt="Ottogusto logo"
                title="Ottogusto"
                className="h-full w-full bg-contain"
              />
            ) : (
              <Image
                src={qverdeLogo}
                alt="Qverde logo"
                title="Qverde"
                className="h-full w-full bg-contain"
              />
            )}
            {/* need logo changes here */}
          </Box>
          <Box className="text-white body-regular-sm">{getLabel("footer_address_line1")}</Box>
          <Box className="text-white body-regular-sm">{getLabel("footer_address_line2")}</Box>
          <Link href={`mailto: ${getLabel("footer_info_mail")}}`}>
            <LinkText className="text-white underline body-regular-sm">
              {getLabel("footer_info_mail")}
            </LinkText>
          </Link>
          <Link href={`tel: ${getLabel("footer_info_telephone").replaceAll(" ", "")}`}>
            <LinkText className="text-white underline body-regular-sm">
              {getLabel("footer_info_telephone")}
            </LinkText>
          </Link>
          <Box
            data-svg-wrapper
            className="relative flex w-full flex-row flex-wrap items-center gap-2"
          >
            <Image
              src={MasterICO}
              alt="MasterICO"
              title="Mastercard"
              className="h-[25.88px] w-[38.82px] cursor-pointer"
            />
            <Image
              src={VisaICO}
              alt="VisaICO"
              title="Visa"
              className="h-[25.88px] w-[38.82px] cursor-pointer"
            />
            <Image
              src={PayconicICO}
              alt="PayconicICO"
              title="Payconic"
              className="h-[25.88px] w-[38.82px] cursor-pointer"
            />
            <Image
              src={IdealICO}
              alt="IdealICO"
              title="iDEAL"
              className="h-[25.88px] w-[38.82px] cursor-pointer"
            />
            <Image
              src={BanContactICO}
              alt="BanContactICO"
              title="Bancontact"
              className="h-[25.88px] w-[38.82px] cursor-pointer"
            />
            <Image
              src={weropay}
              alt="weropay"
              title="WeroPay"
              className="h-[25.88px] w-[25.88px] cursor-pointer"
            />
            <Image
              src={applepay}
              alt="applepay"
              title="Apple Pay"
              className="h-[25.88px] w-[25.88px] cursor-pointer"
            />
            <Image
              src={gpay}
              alt="GPay"
              title="Google Pay"
              className="h-[25.88px] w-[25.88px] cursor-pointer"
            />
            <Image
              src={obPay}
              alt="obPay"
              title="Open Banking Pay"
              className="h-[25.88px] w-[25.88px] cursor-pointer"
            />
          </Box>
        </Box>
      </Box>
      <Box className="pt-[12px] md:col-span-3">
        <LegalLinks />
      </Box>
      <Box className="pt-[12px] md:col-span-3">
        <OurCompany />
      </Box>
      <Box className="pt-[12px] md:col-span-2">
        <Support />
      </Box>
    </Box>
  );
};

export default InfoNLegalSection;
