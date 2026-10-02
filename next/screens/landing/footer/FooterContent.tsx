import Typography from "@/components/og-components/Typography";
import { Box } from "@/components/ui/box";
import React, { useEffect } from "react";
import { CallIcon } from "./CallIcon";
import { EmailIcon } from "./EmailIcon";
import { useBranding } from "@/contexts/BrandingContext";
import Link from "next/link";
// import { LinkText } from "@/components/ui/link";
import { InstagramIcon } from "./InstagramIcon";
import { FacebookIcon } from "./FacebookIcon";
import { TikTokIcon } from "./TiltokIcon";
import { LinkedInIcon } from "./LinkedInIncon";
import { CookieIcon } from "./CookieIcon";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import LangButtonPopUp from "./LangButtonPopup";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useParams } from "next/navigation";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE } from "@/config/store-constants";
import { Routes } from "@/config/routes";
// import { SimplePolicyLink } from "@/components/PolicyViewer";
import { FOOTER_LINKS_LABELS } from "@/data/branding/footerLinks";
import { isFeaturedMakesDiscoveryFooterLink, normalizeFooterPath } from "./footerLinkUtils";
import { safeNextLinkHref } from "@/utils/translationDisplayMode";
import { appendNavigationCarIdsToPartsHref } from "@/utils/categorySearchUrl";
import { useNavigationCarIds, useNavigationVin } from "@/hooks/useNavigationCarIds";
import YoutubeIcon from "./YoutubeIcon";
import OfferSubscribeEmail from "./OfferSubscribeEmail";

const FooterContent = () => {
  const { getLabel, getLocale } = useBranding();
  const { changeLocale } = useBranding();
  const { locale, setLocale, getLanguageCountryStringHeader, getFlag, openLanguageSelector } =
    useLandingPageDataStore();
  const params = useParams();
  const handleLanguageSelector = () => {
    openLanguageSelector();
  };

  const currentLocale =
    (params as Record<string, string>)?.["language-country"] ?? locale ?? getLocale() ?? "en-BE";

  const footerLinkCount = Object.keys(FOOTER_LINKS_LABELS).length / 2;
  const linkList: { textKey: string; urlKey: string }[] = [];

  for (let i = 1; i <= footerLinkCount; i++) {
    linkList.push({
      textKey: `footer_link_${i}`,
      urlKey: `footer_link_${i}_url`,
    });
  }

  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;
  useEffect(() => {
    changeLocale(locale.split("-")[0] || "en");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const linkTextClass = "typography-button-01 text-color-text-default no-underline px-4 py-2";
  const featuredMakesEnabled = getClientFeatureFlag("featured_makes_feature_flag");
  const navigationCarIds = useNavigationCarIds();
  const navigationVin = useNavigationVin();

  return (
    <Box className="flex w-full flex-col items-start gap-8 bg-transparent section-gutter layout-width-footer">
      {/* contact */}

      <Box className="flex w-[400px] max-w-[410px] bg-transparent">
        <OfferSubscribeEmail />
      </Box>
      <Box className="w-full border-b border-color-border-emphasis"></Box>
      <Box className="flex w-full flex-row items-start gap-space-lg bg-transparent">
        <Box className="flex flex-1 flex-col gap-space-lg">
          <Box className="flex flex-col items-start justify-center">
            <Typography className="p-4 text-color-text-emphasis typography-heading-04">
              {getLabel("contact")}
            </Typography>

            <Box className="flex flex-row items-center gap-3 px-4 py-2">
              <CallIcon className="text-color-icon-default" />
              <a
                target="_blank"
                href={`tel: ${getLabel("footer_info_telephone").replaceAll(" ", "")}`}
              >
                <Typography className="text-color-text-emphasis no-underline typography-button-01">
                  {getLabel("footer_info_telephone")}
                </Typography>
              </a>
            </Box>
            <Box className="flex flex-row items-center gap-3 px-4 py-2">
              <EmailIcon className="text-color-icon-default" />
              <a target="_blank" href={`mailto: ${getLabel("footer_info_mail")}`}>
                <Typography className="text-color-text-brand typography-link-02">
                  {currentStore === STORE_IDS.OTTOGUSTO
                    ? getLabel("footer_info_mail")
                    : getLabel("footer_info_mailQverde")}
                </Typography>
              </a>
            </Box>
          </Box>
          <Box className="flex flex-col">
            <Typography className="p-4 text-color-text-emphasis typography-heading-04">
              {getLabel("business_hours")}
            </Typography>
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
          </Box>
        </Box>

        {/* Explore Prods */}
        <Box className="flex flex-1 flex-col">
          <Typography className="p-4 text-color-text-emphasis typography-heading-04">
            {getLabel("explore_products")}
          </Typography>
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
        </Box>

        {/* About Ottogusto */}
        <Box className="flex flex-1 flex-col gap-space-lg">
          <Box className="flex flex-col">
            <Typography className="p-4 text-color-text-emphasis typography-heading-04">
              {currentStore === STORE_IDS.OTTOGUSTO
                ? getLabel("about_Ottogust")
                : getLabel("about_Qverde")}
            </Typography>
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
          </Box>

          {/* social connections section */}
          {getClientFeatureFlag("social_pages_feature_flag") && (
            <Box className={`flex flex-row items-center justify-between px-4`}>
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

          <Box className="flex flex-row justify-between px-4">
            <Box></Box>
            <Box className="flex flex-row gap-2">
              <LangButtonPopUp className="w-[128px]" />

              <Box
                className="cursor-pointer rounded-full border border-color-border-emphasis bg-white p-3"
                onClick={() => {
                  if (typeof window !== "undefined" && (window as any)?.Cookiebot) {
                    (window as any)?.Cookiebot?.show();
                  }
                }}
              >
                <CookieIcon className="text-color-icon-default" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FooterContent;
