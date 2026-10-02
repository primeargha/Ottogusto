"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Heading } from "../ui/heading";
import { CloseIcon, Icon } from "../ui/icon";
import { Button, ButtonText } from "../ui/button";
import { Text } from "../ui/text";
import { Box } from "../ui/box";
import Image from "next/image";
import CancelSquare from "@/assets/search/cancel-square.svg";
import { OGButton } from "./OGButton";
import { OGRadioGroup, OGRadioInput } from "./OGRadioInput";
import { Controller, useForm } from "react-hook-form";
import { OGLinkButton } from "./OGLinkButton";
import Link from "@unitools/link";
import { ConfigFallback, DEFAULT_LOCALE, LanguageList } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import useRouter from "@unitools/router";
import { useRouteStore } from "@/stores/useRouteStore";
import { fetchIpApiCountryCode } from "@/lib/clientIp";
import { resolveInitialLocaleFromCountryCode } from "@/utils/initialLocaleFromIp";
import { LANG_COUNTRY_COMBINATIONS } from "@/config/locale-constants";
import { useCartStore } from "@/stores/useCartStore";
import { clearMmeApiCache } from "@/stores/useMmeStore";
import Typography from "./Typography";
import qverdeLogoDesktop from "@/assets/Qverde/qverdeDesktopLogo.svg";
import { CURRENT_STORE, DEFAULT_STORE, STORE_IDS } from "@/config/store-constants";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { detectPage } from "@/utils/detectPage";
import { countriesList } from "@/constants";
import {
  getManufacturersRouteSegmentForLang,
  getPartsRouteSegmentForLang,
  isCategoryPathSegment,
  isKnownManufacturersRouteSegment,
  isKnownPartsRouteSegment,
} from "@/config/url-segments";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  canAccessTranslationKeysLanguage,
  stripLocalePrefixFromPath,
  TRANSLATION_KEYS_LANG,
} from "@/utils/translationDisplayMode";
import { POST_LOGOUT_LOCALE_KEY } from "@/utils/localeCookie";
import { sanitizeLocaleSwitchQueryString } from "@/utils/seoUrlParams";

type Props = {};
const OGHeading = (props: { children: string; className?: string }) => {
  const { children, className } = props;
  return (
    <Typography
      type="h2"
      className={`justify-start text-color-text-body body-bold-lg ${className}`}
    >
      {children}
    </Typography>
  );
};

type ModalHeaderInterface = {
  showCloseButton?: boolean;
  onClose?: (callback?: any) => void;
  title: string;
};
const OGModalHeader = (props: ModalHeaderInterface) => {
  const { onClose, title, showCloseButton = true } = props;
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;
  return (
    <>
      <Box className="hidden h-[76px] flex-row items-center justify-between border-b p-[24px] gtsm:rounded-[8px] md:flex">
        <OGHeading>{title}</OGHeading>
        {showCloseButton && (
          <>
            {" "}
            <button onClick={onClose} className="hidden p-1 gtlg:block">
              <Image src={CancelSquare} alt="Cancel" height={38} width={38} />
            </button>
            {/* Tablet */}
            <button onClick={onClose} className="hidden p-1 gtsm:block gtlg:hidden">
              <Image src={CancelSquare} alt="Cancel" height={48} width={48} />
            </button>
            {/* Mobile View */}
            <button onClick={onClose} className="p-1 base:block gtsm:hidden">
              <Image src={CancelSquare} alt="Cancel" height={30} width={30} />
            </button>
          </>
        )}
      </Box>

      <Box className="relative flex max-h-20 w-full flex-row items-center justify-center px-6 pb-[16px] pt-[24px] md:hidden">
        {/* Centered Logo */}
        <Link href="/">
          <Box className={`flex w-[180px] items-center justify-center bg-contain bg-no-repeat`}>
            <Image
              src={
                currentStore === STORE_IDS.OTTOGUSTO
                  ? `/assets/ottogusto-logo.svg`
                  : qverdeLogoDesktop
              }
              alt="Logo"
              height={currentStore === STORE_IDS.OTTOGUSTO ? 40 : 26}
              width={currentStore === STORE_IDS.OTTOGUSTO ? 150 : 130}
            />
          </Box>
        </Link>

        {/* Button fixed to the right */}
        <button onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2 p-1">
          <Image src={CancelSquare} alt="Cancel" height={30} width={30} />
        </button>
      </Box>
      <div className="h-0 self-stretch opacity-20 outline outline-1 outline-offset-[-0.50px] outline-[--light-green-white]"></div>
    </>
  );
};

const OGLanguageSelectionModel = (props: Props) => {
  const { getLabel, changeLocale } = useBranding();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sanitizedQuery = sanitizeLocaleSwitchQueryString(
    searchParams?.toString() ? `?${searchParams.toString()}` : "",
  );
  const fullPathWithQuery = `${pathname}${sanitizedQuery}`;
  const { ShowLanguageSelector, closeLanguageSelector, openLanguageSelector, locale, setLocale } =
    useLandingPageDataStore();
  const authUser = useAuthStore((s) => s.authUser);
  const { user: auth0User } = useAuth0();
  const canShowKeyLanguage = canAccessTranslationKeysLanguage(authUser, auth0User?.email);

  const visibleLanguageList = useMemo(
    () =>
      canShowKeyLanguage
        ? LanguageList
        : LanguageList.filter((lang) => lang.code !== TRANSLATION_KEYS_LANG),
    [canShowKeyLanguage],
  );

  const localeLanguage = (
    locale.split("-")[0] ??
    DEFAULT_LOCALE.split("-")[0] ??
    "en"
  ).toLowerCase();
  const safeLocaleLanguage =
    localeLanguage === TRANSLATION_KEYS_LANG && !canShowKeyLanguage ? "en" : localeLanguage;

  const defaultLangNCountry = {
    language: safeLocaleLanguage,
    country: (locale.split("-")[1] ?? DEFAULT_LOCALE.split("-")[1] ?? "BE").toUpperCase(),
  };
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, dirtyFields },
  } = useForm<{ language: string; country: string }>({
    defaultValues: defaultLangNCountry,
  });

  const [SelectedCountry, setSelectedCountry] = useState("");

  // NOTE: Do not auto-seed `localStorage.locale` from the URL on first paint.
  // First-visit locale comes from IP detection (see bootstrap effect below).
  // BE/LU still need an empty localStorage so the modal can open; NL/FR/unknown
  // persist automatically. Returning users keep their saved preference.

  useEffect(() => {
    if (sessionStorage.getItem(POST_LOGOUT_LOCALE_KEY)) return;

    const storedLocale = localStorage.getItem("locale");
    const pathLocale = pathname?.split("/")[1];

    if (storedLocale && pathLocale && storedLocale !== pathLocale) {
      // Update locale with path value
      setLocale(pathLocale);

      const [language, country] = pathLocale ? pathLocale.split("-") : DEFAULT_LOCALE.split("-");
      changeLocale(language ?? "en");

      // Update form values
      setValue("language", language ?? "en");
      setValue("country", country?.toUpperCase() ?? "BE");
      localStorage.setItem("locale", pathLocale);
    }
  }, [pathname, setLocale, setValue, changeLocale]);

  /** Persist locale the same way manual Save does (localStorage + cookie). */
  const persistLocaleChoice = (localeString: string) => {
    localStorage.setItem("locale", localeString);
    document.cookie = `locale=${encodeURIComponent(localeString)}; path=/; max-age=31536000; SameSite=Lax`;
  };

  // First-visit IP bootstrap: auto-apply NL/FR/unknown; show modal only for BE/LU.
  // Saved preferences always win — never overwrite localStorage.locale from IP.
  useEffect(() => {
    const bootstrapInitialLocale = async () => {
      try {
        if (sessionStorage.getItem(POST_LOGOUT_LOCALE_KEY)) return;

        const savedLocale = localStorage.getItem("locale");
        if (savedLocale) {
          // Returning user: keep preference, ensure modal stays closed
          closeLanguageSelector();
          return;
        }

        const countryCode = await fetchIpApiCountryCode();
        const decision = resolveInitialLocaleFromCountryCode(countryCode);

        setLocale(decision.locale);
        setValue("country", decision.country);
        setValue("language", decision.language);

        if (decision.showModal) {
          // Belgium / Luxembourg: preselect and let the user confirm or change
          openLanguageSelector();
          return;
        }

        // NL / FR / unsupported: apply preference automatically.
        // Critical for SEO: never hard-navigate away from a URL that already has a
        // valid locale (Googlebot / shared links / hreflang). Only rewrite the path
        // when there is no usable locale segment (e.g. bare "/").
        persistLocaleChoice(decision.locale);
        changeLocale(decision.language);
        closeLanguageSelector(decision.locale);

        const pathLocale = pathname?.split("/")[1] ?? "";
        const pathHasValidLocale = Boolean(
          pathLocale && LANG_COUNTRY_COMBINATIONS.includes(pathLocale),
        );

        if (pathHasValidLocale) {
          // Keep crawled / bookmarked locale URLs stable — store preference only.
          if (pathLocale !== decision.locale) {
            persistLocaleChoice(pathLocale);
            setLocale(pathLocale);
            changeLocale(pathLocale.split("-")[0] || decision.language);
          }
          return;
        }

        if (pathLocale && pathLocale !== decision.locale) {
          const pathSuffix = (pathname || "").replace(/^\/[^/]+/, "") || "";
          const query = sanitizeLocaleSwitchQueryString(
            searchParams?.toString() ? `?${searchParams.toString()}` : "",
          );
          clearMmeApiCache();
          // Hard navigate so the path↔storage sync effect cannot revert
          // localStorage back to the old URL locale before soft-nav settles.
          window.location.replace(`/${decision.locale}${pathSuffix}${query}`);
        }
      } catch {
        // Fail open: Belgium + English, no modal (same as unknown country)
        const fallback = resolveInitialLocaleFromCountryCode(null);
        if (!localStorage.getItem("locale")) {
          persistLocaleChoice(fallback.locale);
          setLocale(fallback.locale);
          changeLocale(fallback.language);
          closeLanguageSelector(fallback.locale);
        }
      }
    };

    void bootstrapInitialLocale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedLanguage = watch("language");

  useEffect(() => {
    if (canShowKeyLanguage) return;
    if (selectedLanguage === TRANSLATION_KEYS_LANG) {
      setValue("language", "en");
    }
  }, [canShowKeyLanguage, selectedLanguage, setValue]);

  useEffect(() => {
    const { unsubscribe } = watch((value) => {});
    return () => unsubscribe();
  }, [watch]);

  const getLocaleRemovedPath = (pathString: string | null) => {
    try {
      if (!pathString) {
        return pathString;
      }
      return stripLocalePrefixFromPath(pathString);
    } catch (error) {
      throw error;
    }
  };

  const isPdpLikePath = (pathWithoutQuery: string) => {
    const rawSegments = (pathWithoutQuery || "").replace(/^\/+/, "").split("/");
    const partsRoute = rawSegments[0] || "";
    if (!isKnownPartsRouteSegment(partsRoute)) return false;
    // Exclude category listing structures under parts route.
    const second = rawSegments[1] || "";
    if (isCategoryPathSegment(second)) return false;
    // PDP-like routes have at least one trailing segment (partid-only malformed or manufacturer+partid).
    return rawSegments.length >= 2;
  };

  const { appendToNavigationHistory, navigationHistory } = useRouteStore();
  const handleSaveCountryLang = async () => {
    const data = watch(); // or we have to use FinalData

    if (!data.language || !data.country) return;

    changeLocale(data.language);
    const newLocaleString = `${data.language}-${data.country}`;
    localStorage.setItem("locale", newLocaleString);
    document.cookie = `locale=${encodeURIComponent(newLocaleString)}; path=/; max-age=31536000; SameSite=Lax`;

    closeLanguageSelector(newLocaleString);

    // Signal cart/checkout to recalculate prices when locale changes (shopping cart, checkout)
    // useCartStore.getState().setiscartchanged(true);

    const localeString = localStorage.getItem("locale");
    if (localeString) {
      const currentPathname = pathname || "/";
      const pageType = detectPage(currentPathname);

      // For category L1/L2/L3 pages and brand+L3 pages, use the server-side redirect helper
      // to get fully localized slugs (the L3 slug is locale-specific, unlike the brand slug —
      // a plain segment swap below would carry the old-locale L3 slug over and 404).
      if (
        pageType === "category-l1" ||
        pageType === "category-l2" ||
        pageType === "category-l3" ||
        pageType === "car-part-brand-l3"
      ) {
        try {
          const encodedFromPath = encodeURIComponent(fullPathWithQuery);
          const res = await fetch(
            `/api/category-locale-redirect?fromPath=${encodedFromPath}&toLocale=${encodeURIComponent(localeString)}`,
          );
          const json = (await res.json()) as { redirectPath?: string };
          const redirectPath = json.redirectPath || fullPathWithQuery;

          clearMmeApiCache();
          window.location.href = redirectPath;
          return;
        } catch (error) {
          console.error(
            "[OGLanguageSelectionModel] category redirect failed, falling back:",
            error,
          );
          // Fall through to legacy behavior below
        }
      }

      const actualPath = getLocaleRemovedPath(fullPathWithQuery);
      const pathWithoutQuery = actualPath?.split("?")[0] ?? "";
      const isLocaleOnlyPath = /^\/[a-z]{2}$/.test(pathWithoutQuery);
      const queryPart = actualPath?.includes("?")
        ? sanitizeLocaleSwitchQueryString(actualPath.slice(actualPath.indexOf("?")))
        : "";
      const selectedLocale = `${(data.language || "en").toLowerCase()}-${(data.country || "BE").toUpperCase()}`;
      const selectedPartsRoute = getPartsRouteSegmentForLang(data.language || "en");
      const selectedManufacturersRoute = getManufacturersRouteSegmentForLang(data.language || "en");

      // Car Part Brands list / brand / brand+L3 — swap localized segment on lang change.
      {
        const rawSegments = pathWithoutQuery.replace(/^\/+/, "").split("/").filter(Boolean);
        const currentManufacturersRoute = rawSegments[0] || "";
        if (
          rawSegments.length >= 1 &&
          rawSegments.length <= 3 &&
          isKnownManufacturersRouteSegment(currentManufacturersRoute)
        ) {
          const rest = rawSegments.slice(1).join("/");
          const nextPath = rest
            ? `/${selectedLocale}/${selectedManufacturersRoute}/${rest}${queryPart}`
            : `/${selectedLocale}/${selectedManufacturersRoute}${queryPart}`;
          appendToNavigationHistory(nextPath);
          clearMmeApiCache();
          router.navigate(nextPath);
          return;
        }
      }

      // Category catalog root (/{locale}/{parts-segment}[?...]) should translate the parts segment
      // on language switch, while preserving existing L1/L2/L3 and PDP behavior below.
      if (pageType === "category-catalog") {
        const rawSegments = pathWithoutQuery.replace(/^\/+/, "").split("/");
        const currentPartsRoute = rawSegments[0] || "";
        if (isKnownPartsRouteSegment(currentPartsRoute)) {
          const nextPath = `/${selectedLocale}/${selectedPartsRoute}${queryPart}`;
          appendToNavigationHistory(nextPath);
          clearMmeApiCache();
          router.navigate(nextPath);
          return;
        }
      }

      if (isPdpLikePath(pathWithoutQuery)) {
        const rawSegments = pathWithoutQuery.replace(/^\/+/, "").split("/");
        const pdpTail = rawSegments.slice(1).join("/");
        const pdpPath = `/${selectedLocale}/${selectedPartsRoute}/${pdpTail}${queryPart}`;
        appendToNavigationHistory(pdpPath);
        clearMmeApiCache();
        router.navigate(pdpPath);
        return;
      }

      const newPath = isLocaleOnlyPath
        ? `/${selectedLocale}${queryPart}`
        : `/${selectedLocale}${actualPath}`;
      appendToNavigationHistory(newPath);

      clearMmeApiCache();
      router.navigate(newPath);
      return;
    }
  };

  const closeModal = () => {
    closeLanguageSelector();
  };
  if (!ShowLanguageSelector) {
    return null;
  }
  const showClose = () => {
    // Generate all language-country combinations (e.g. en-BE)
    const combinations = Object.keys(countriesList || {}).flatMap((countryCode) =>
      visibleLanguageList.map((lang) => `${lang.code}-${countryCode.toUpperCase()}`),
    );

    const localeFromLocalStorage = localStorage.getItem("locale");

    if (combinations.includes(localStorage.getItem("locale") || "")) {
      return true;
    }
    return false;
  };
  return (
    <Box className="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
      <Box className="w-full base:h-full gtsm:min-h-[865px] gtsm:pl-[30px] gtsm:pr-[30px]">
        <Box className="h-full w-full rounded-[8px] bg-white gtsm:mx-auto gtsm:mb-[104px] gtsm:mt-[110px] gtsm:h-fit gtsm:max-w-[652px]">
          <OGModalHeader
            title={getLabel("language_selector_title")}
            onClose={closeModal}
            showCloseButton={showClose()}
          />
          <ModalBody className="overflow-hidden p-[24px] py-0">
            <Box className="pb-[20px]">
              <OGHeading className="text-black">{getLabel("country_selection")}</OGHeading>
              <Box className="pt-[24px]">
                <Controller
                  control={control}
                  name="country"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <OGRadioGroup
                      key={"country-selector"}
                      value={value}
                      onChange={(val) => {
                        onChange(val);
                        const countryCode = val.toLocaleLowerCase();
                        if (
                          Object.keys(ConfigFallback.defaults).includes(countryCode) &&
                          SelectedCountry === ""
                        ) {
                          const langToBeSelected = ConfigFallback.defaults?.[countryCode] ?? "en";
                          setSelectedCountry(langToBeSelected);
                          setValue("language", langToBeSelected);
                        }
                      }}
                      onBlur={() => {
                        onBlur();
                        //   handleSubmit(onSubmit)();
                      }}
                      isInvalid={!!errors.country}
                      error={errors.country?.message ?? ""}
                      isReadOnly={false}
                      className="flex flex-grow flex-row flex-wrap"
                    >
                      {Object.keys(countriesList || {})?.map((key, indx) => {
                        const country = countriesList[key] || "";
                        const flagUrl = `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/flags/${key}.svg`;
                        return (
                          <Box key={indx} className="min-w-[190px] basis-3/12 flex-row gap-3">
                            <OGRadioInput
                              key={`country-${key}`}
                              value={key.toUpperCase()}
                              label={country}
                              isInvalid={!!errors.country}
                              state={false ? "disabled" : "default"}
                            />
                            {key === "eu" ? (
                              <Image
                                src={`/assets/flags/eu.webp`}
                                alt={country}
                                width={27}
                                height={20}
                                unoptimized
                              />
                            ) : (
                              <Image
                                src={flagUrl}
                                alt={country}
                                width={27}
                                height={20}
                                unoptimized
                              />
                            )}
                          </Box>
                        );
                      })}
                    </OGRadioGroup>
                  )}
                />
              </Box>
            </Box>

            <Box className="pt-[20px]">
              <OGHeading className="text-black">{getLabel("language_selection")}</OGHeading>
              <Box className="pt-[24px]">
                <Controller
                  control={control}
                  name="language"
                  defaultValue={SelectedCountry}
                  render={({ field: { onChange, value, onBlur } }) => (
                    <OGRadioGroup
                      key={"language-selector"}
                      value={value}
                      onChange={(val) => {
                        onChange(val);
                      }}
                      onBlur={() => {
                        // onBlur();
                        // handleSubmit(onSubmit)();
                      }}
                      isInvalid={!!errors.language}
                      error={errors.language?.message ?? ""}
                      isReadOnly={false}
                      className="flex flex-col"
                    >
                      {visibleLanguageList.map((lang, indx) => {
                        return (
                          <Box key={indx} className="">
                            <OGRadioInput
                              key={`lang-${lang.code}`}
                              value={lang.code}
                              label={lang.title}
                              isInvalid={!!errors.language}
                              state={false ? "disabled" : "default"}
                            />
                          </Box>
                        );
                      })}
                    </OGRadioGroup>
                  )}
                />
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter className="rounded-b-[8px] bg-color-background-l2 px-[24px] py-[12px] shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.12)]">
            <OGButton
              onClick={handleSaveCountryLang}
              type="primary"
              size="medium"
              className="w-full"
            >
              {getLabel("save_language_setting")}
            </OGButton>
          </ModalFooter>
        </Box>
      </Box>
    </Box>
  );
};

export default OGLanguageSelectionModel;
