import { Box } from "@/components/ui/box";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DropdownIcon } from "@/screens/landing/footer/DropdownIcon";
import Link from "next/link";
import { useBranding } from "@/contexts/BrandingContext";
import { EmailIcon } from "./EmailIcon";
import { LinkText } from "@/components/ui/link";
import { CallIcon } from "./CallIcon";
import { DropdownIconUp } from "./DropdownUPIcon";
import { InstagramIcon } from "./InstagramIcon";
import { FacebookIcon } from "./FacebookIcon";
import { TikTokIcon } from "./TiltokIcon";
import { LinkedInIcon } from "./LinkedInIncon";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { CookieIcon } from "./CookieIcon";
import LangButtonPopUp from "./LangButtonPopup";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE } from "@/config/store-constants";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useParams } from "next/navigation";
import Typography from "@/components/og-components/Typography";
import { SimplePolicyLink } from "@/components/PolicyViewer";
import { FOOTER_LINKS_LABELS } from "@/data/branding/footerLinks";
import { isFeaturedMakesDiscoveryFooterLink, normalizeFooterPath } from "./footerLinkUtils";
import { safeNextLinkHref } from "@/utils/translationDisplayMode";
import { appendNavigationCarIdsToPartsHref } from "@/utils/categorySearchUrl";
import { useNavigationCarIds, useNavigationVin } from "@/hooks/useNavigationCarIds";
import YoutubeIcon from "./YoutubeIcon";
type Props = {
  openAccordions: string[];
  setOpenAccordions: React.Dispatch<React.SetStateAction<string[]>>;
};

const FooterContentMobile = ({ openAccordions, setOpenAccordions }: Props) => {
  const { getLabel, getLocale } = useBranding();
  const params = useParams();
  const isContactOpen = openAccordions?.includes("contact");
  const isExploreOpen = openAccordions?.includes("explore");
  const isHoursOpen = openAccordions?.includes("hours");
  const isAboutOpen = openAccordions?.includes("about");
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;
  const linkTextClass = "typography-button-01 text-color-text-default no-underline px-4 py-2";

  const currentLocale =
    (params as Record<string, string>)?.["language-country"] ?? getLocale() ?? "en-BE";

  const footerLinkCount = Object.keys(FOOTER_LINKS_LABELS).length / 2;
  const linkList: { textKey: string; urlKey: string }[] = [];

  for (let i = 1; i <= footerLinkCount; i++) {
    linkList.push({
      textKey: `footer_link_${i}`,
      urlKey: `footer_link_${i}_url`,
    });
  }

  const featuredMakesEnabled = getClientFeatureFlag("featured_makes_feature_flag");
  const navigationCarIds = useNavigationCarIds();
  const navigationVin = useNavigationVin();

  return (
    <Box className="w-full gap-2 bg-transparent px-3 pb-8 pt-4">
      <Accordion
        type="multiple"
        isCollapsible
        value={openAccordions}
        onValueChange={setOpenAccordions}
        className="w-full gap-2 bg-transparent"
      >
        {/* 1️⃣ Contact */}
        <AccordionItem value="contact" className="bg-transparent">
          <AccordionHeader>
            <AccordionTrigger
              className={`${isContactOpen ? "" : "border-b border-color-border-default"} px-4 py-3`}
            >
              {({ isExpanded }) => (
                <Box className="flex w-full flex-row items-center justify-between">
                  <Typography className="text-color-text-emphasis typography-heading-04">
                    {getLabel("contact")}
                  </Typography>
                  {isExpanded ? (
                    <DropdownIconUp className="text-color-icon-default" />
                  ) : (
                    <DropdownIcon className="text-color-icon-default" />
                  )}
                </Box>
              )}
            </AccordionTrigger>
          </AccordionHeader>

          <AccordionContent className="mt-0 px-0 pb-0">
            {/* <Typography className="p-4 typography-heading-04">{getLabel("contact")}</Typography> */}

            <Box className="flex flex-row items-center justify-start gap-3 px-4 py-2">
              <CallIcon className="text-color-icon-default" />
              <Link href={`tel:${getLabel("footer_info_telephone").replaceAll(" ", "")}`}>
                <Typography className="text-color-text-emphasis no-underline typography-button-01">
                  {getLabel("footer_info_telephone")}
                </Typography>
              </Link>
            </Box>

            <Box className="flex flex-row items-center justify-start gap-3 px-4 py-2">
              <EmailIcon className="text-color-icon-default" />
              <Link href={`mailto:${getLabel("footer_info_mail")}`}>
                <Typography className="text-color-text-brand typography-link-02">
                  {currentStore === STORE_IDS.OTTOGUSTO
                    ? getLabel("footer_info_mail")
                    : getLabel("footer_info_mailQverde")}
                </Typography>
              </Link>
            </Box>
          </AccordionContent>
        </AccordionItem>
        {/* 2️⃣ Explore products */}
        <AccordionItem value="explore" className="bg-transparent">
          <AccordionHeader>
            <AccordionTrigger
              className={`${isExploreOpen ? "" : "border-b border-color-border-default"} px-4 py-3`}
            >
              {({ isExpanded }) => (
                <Box className="flex w-full flex-row items-center justify-between">
                  <Typography className="text-color-text-emphasis typography-heading-04">
                    {getLabel("explore_products")}
                  </Typography>

                  {isExpanded ? (
                    <DropdownIconUp className="text-color-icon-default" />
                  ) : (
                    <DropdownIcon className="text-color-icon-default" />
                  )}
                </Box>
              )}
            </AccordionTrigger>
          </AccordionHeader>

          <AccordionContent className="mt-0 px-0 pb-0">
            {linkList.map((item, index) => {
              const rawUrl = getLabel(item.urlKey, { locale: currentLocale });
              const href = appendNavigationCarIdsToPartsHref(
                normalizeFooterPath(rawUrl, currentLocale),
                navigationCarIds,
                navigationVin,
              );

              if (!featuredMakesEnabled && isFeaturedMakesDiscoveryFooterLink(item, href)) {
                return null;
              }

              return (
                <Link href={href} key={index}>
                  <Typography className="px-4 py-2 text-color-text-default typography-button-01">
                    {getLabel(item.textKey)}
                  </Typography>
                </Link>
              );
            })}
            {/* <Typography className="px-4 py-2 text-color-text-emphasis typography-button-01">
              Link n3
            </Typography>
            <Typography className="px-4 py-2 text-color-text-emphasis typography-button-01">
              Link n4
            </Typography>
            <Typography className="px-4 py-2 text-color-text-emphasis typography-button-01">
              Link n5
            </Typography> */}
          </AccordionContent>
        </AccordionItem>
        {/* 3️⃣ Business Hours */}
        <AccordionItem value="hours" className="bg-transparent">
          <AccordionHeader>
            <AccordionTrigger
              className={`${isHoursOpen ? "" : "border-b border-color-border-default"} px-4 py-3`}
            >
              {({ isExpanded }) => (
                <Box className="flex w-full flex-row items-center justify-between">
                  <Typography className="text-color-text-emphasis typography-heading-04">
                    {getLabel("business_hours")}
                  </Typography>

                  {isExpanded ? (
                    <DropdownIconUp className="text-color-icon-default" />
                  ) : (
                    <DropdownIcon className="text-color-icon-default" />
                  )}
                </Box>
              )}
            </AccordionTrigger>
          </AccordionHeader>

          <AccordionContent className="mt-0 px-0 pb-0">
            <Box className="flex flex-col px-4 py-2">
              <Typography className="text-color-text-default typography-body-strong-02">
                {getLabel("monday_friday")}
                <span className="text-color-text-muted typography-body-02">
                  {getLabel("monday_friday_hours")}{" "}
                </span>
              </Typography>
              <Typography className="text-color-text-default typography-body-strong-02">
                {getLabel("saturday_sunday")}{" "}
                <span className="text-color-text-muted typography-body-02">
                  {" "}
                  {getLabel("closed")}
                </span>
              </Typography>
            </Box>
          </AccordionContent>
        </AccordionItem>
        {/* 4️⃣ About Ottogusto */}
        <AccordionItem value="about" className="bg-transparent">
          <AccordionHeader>
            <AccordionTrigger
              className={`${isAboutOpen ? "" : "border-b border-color-border-default"} px-4 py-3`}
            >
              {({ isExpanded }) => (
                <Box className="flex w-full flex-row items-center justify-between">
                  <Typography className="text-color-text-emphasis typography-heading-04">
                    {currentStore === STORE_IDS.OTTOGUSTO
                      ? getLabel("about_Ottogust")
                      : getLabel("about_Qverde")}
                  </Typography>

                  {isExpanded ? (
                    <DropdownIconUp className="text-color-icon-default" />
                  ) : (
                    <DropdownIcon className="text-color-icon-default" />
                  )}
                </Box>
              )}
            </AccordionTrigger>
          </AccordionHeader>

          <AccordionContent className="mt-0 px-0 pb-0">
            <Link href={getRouteLocaleString(Routes.aboutUs, params)}>
              <Typography className={linkTextClass}>{getLabel("about_us")}</Typography>
            </Link>
            <Link
              href={safeNextLinkHref(getLabel("aboutus_careers_cta_link"))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography className={linkTextClass}>{getLabel("careers")}</Typography>
            </Link>
            <Link href={`${getRouteLocaleString(Routes.support, params)}`}>
              <Typography className={linkTextClass}>{getLabel("contact_us")}</Typography>
            </Link>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Box className="flex w-full flex-col gap-space-lg">
        {getClientFeatureFlag("social_pages_feature_flag") && (
          <Box className="flex flex-row items-center justify-between px-4">
            {currentStore === STORE_IDS.OTTOGUSTO ? (
              <>
                <Box className="p-2">
                  <Link
                    href={safeNextLinkHref(getLabel("footer_instagram_url"))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <InstagramIcon className="text-color-icon-emphasis" />
                  </Link>
                </Box>

                <Box className="p-2">
                  <Link
                    href="https://www.facebook.com/profile.php?id=61566264514984"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FacebookIcon className="text-color-icon-emphasis" />
                  </Link>
                </Box>

                <Box className="p-2">
                  <Link
                    href="https://www.tiktok.com/@ottogusto.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TikTokIcon className="text-color-icon-emphasis" />
                  </Link>
                </Box>

                <Box className="p-2">
                  <Link
                    href={safeNextLinkHref(getLabel("footer_linkedin_url"))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkedInIcon className="text-color-icon-emphasis" />
                  </Link>
                </Box>

                <Box className="p-2">
                  <Link
                    href={safeNextLinkHref(getLabel("footer_youtube_url"))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <YoutubeIcon className="text-color-icon-emphasis" />
                  </Link>
                </Box>
              </>
            ) : (
              <>
                <Box className="p-2">
                  <Link
                    href={safeNextLinkHref(getLabel("footer_instagram_url"))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <InstagramIcon className="text-color-icon-emphasis" />
                  </Link>
                </Box>

                <Box className="p-2">
                  <Link
                    href="https://www.facebook.com/QVerde.nl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FacebookIcon className="text-color-icon-emphasis" />
                  </Link>
                </Box>

                <Box className="p-2"></Box>
                <Box className="p-2"></Box>
                <Box className="p-2"></Box>
              </>
            )}
          </Box>
        )}

        <Box className="flex flex-row gap-2">
          <LangButtonPopUp className="w-full" />
          <Box
            onClick={() => {
              if (typeof window !== "undefined" && (window as any)?.Cookiebot) {
                (window as any)?.Cookiebot?.show();
              }
            }}
            className="max-h-12 min-h-12 min-w-12 max-w-12 cursor-pointer rounded-full border border-color-border-emphasis bg-white p-3"
          >
            <CookieIcon className="text-color-icon-default" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FooterContentMobile;
