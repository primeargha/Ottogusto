import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import slugify from "slugify";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import SearchIcon from "./SearchIcon";
import { HEADER_LINKS } from "@/data/branding/ribbonLinks";
import Typography from "@/components/og-components/Typography";
import { IOeRefItem } from "@/types/oerefSearch";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { normalizeFooterPath } from "../landing/footer/footerLinkUtils";
import { useNavigationCarIds, useNavigationVin } from "@/hooks/useNavigationCarIds";
import { appendNavigationCarIdsToPartsHref } from "@/utils/categorySearchUrl";
import { useMmeStore } from "@/stores/useMmeStore";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { buildPartPdpHref } from "@/utils/build-part-pdp-url";
import { useUrlParams } from "@/hooks/useUrlParams";
import { applyOeSearchResultsNavigation } from "@/utils/oeSearchResultsFilters";
import { DEBOUNCE_DELAY, HEADER_SEARCH_CHARACTORS } from "@/constants";
import { getOeRef } from "@/services/search";
import useDebounce from "@/hooks/use-debounce";
import { detectPage } from "@/utils/detectPage";
import { useMedia } from "@/hooks/useMedia";
import { OGHeaderButton } from "@/components/og-components/OGHeaderButton";
import { OGSearchInput } from "@/components/og-components/SearchInputHeader/OGSearchInput";
import CrossIcon from "./CrossIcon";

const OGHeaderSearchLinks = ({
  setIsMenuOpen,
}: {
  setIsMenuOpen?: (open: boolean) => void | undefined;
}) => {
  const { getLabel, getLocale } = useBranding();
  const { locale, setLocale, getLanguageCountryStringHeader, getFlag, openLanguageSelector } =
    useLandingPageDataStore();
  const localeCODE = getLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigationCarIds = useNavigationCarIds();
  const navigationVin = useNavigationVin();

  const {
    partRefNumberWithOutSavedCar,
    setPartRefNumberWithoutSavedCar,
    partrefnumberdatawithoutsavedcar,
    setpartrefnumberdatawithoutsavedcar,
    searchData,
    setOeReference,
  } = useMmeStore();
  const debouncedValue = useDebounce(partRefNumberWithOutSavedCar, DEBOUNCE_DELAY);
  const [openMenu, setOpenMenu] = useState(false);
  const { updateFilters } = useUrlParams();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => {
    setOpenMenu(false);
  });
  const isMobile = useMedia("(max-width: 640px)");

  useEffect(() => {
    if ((debouncedValue ?? "").length < HEADER_SEARCH_CHARACTORS) {
      return;
    }

    let cancelled = false;

    getOeRef(debouncedValue ?? "")
      .then((response) => {
        if (cancelled) return;
        setpartrefnumberdatawithoutsavedcar(response.data);
        setOpenMenu(true);
      })
      .catch(() => {
        if (cancelled) return;
        setpartrefnumberdatawithoutsavedcar(null);
      });

    return () => {
      cancelled = true;
    };
    // pathname: invalidate in-flight OE suggestions after client navigation (same header instance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, pathname]);
  const headerLinkCount = Object.keys(HEADER_LINKS).length / 2;
  const linkList: { text: string; url: string }[] = [];
  // const [errormsg, setErrorMsg] = useState(false);
  for (let i = 1; i <= headerLinkCount; i++) {
    const textKey = `header_link_${i}_text`;
    const urlKey = `header_link_${i}_url`;
    linkList.push({
      text: textKey,
      url: urlKey,
    });
  }
  const params = useParams();
  const currentLocale =
    (params as Record<string, string>)?.["language-country"] ?? locale ?? getLocale() ?? "en-BE";
  const stripSpaces = (str: string) => str.replaceAll(" ", "");
  const handleOeRefChange = (value: string) => {
    setPartRefNumberWithoutSavedCar(value);
    setpartrefnumberdatawithoutsavedcar(null);
    setOeReference(value);
    // setErrorMsg(false);
    // const val = value.toUpperCase();
    // setLocalOeRefValue(val);
    // setpartrefnumberwithoutsavedcar(val);

    // // 🔍 substring filter
    // if (val.trim()) {
    //   const matches = PART_REFERENCES.filter((ref) => ref.includes(val));
    //   setFilteredResults(matches);
    // } else {
    //   setFilteredResults([]);
    // }
  };
  const handleAllItemsSelect = () => {
    setOpenMenu(false);
    applyOeSearchResultsNavigation(updateFilters, stripSpaces(partRefNumberWithOutSavedCar ?? ""), {
      sp: searchParams,
      languageCountrySegment: pathname?.split("/").filter(Boolean)[0],
      navigateOptions: { appendAllowedTrackingQueryParams: true },
    });
    setIsMenuOpen?.(false);
    setPartRefNumberWithoutSavedCar(null);
    setpartrefnumberdatawithoutsavedcar([]);
    //  resetSearch();
  };
  const handleSingleItemSelect = (selected: IOeRefItem) => {
    setOpenMenu(false);
    const part = selected;
    const locale = (params as Record<string, string>)?.["language-country"];
    const makeModelTypeId = searchParams?.get("makeModelTypeId") ?? null;
    const href = locale
      ? buildPartPdpHref(locale, part.id, {
          seoName: part?.brand ?? part.title[getLocale()] ?? part.name,
          makeModelTypeId,
        })
      : null;
    if (href) router.push(href);
    if (isMobile) {
      setIsMenuOpen?.(false);
    }
    setPartRefNumberWithoutSavedCar(null);
    setpartrefnumberdatawithoutsavedcar(null);
  };
  const SearchOeRef = () => {
    const parts = partrefnumberdatawithoutsavedcar ?? [];
    const inputValue = partRefNumberWithOutSavedCar?.trim() ?? "";

    if (inputValue.length < HEADER_SEARCH_CHARACTORS) {
      return;
    }
    setOpenMenu(false);

    // 👇 No results — redirect with whatever the user typed
    if (parts.length === 0) {
      applyOeSearchResultsNavigation(updateFilters, stripSpaces(inputValue), {
        sp: searchParams,
        languageCountrySegment: pathname?.split("/").filter(Boolean)[0],
        navigateOptions: { appendAllowedTrackingQueryParams: true },
      });
      setIsMenuOpen?.(false);
      setPartRefNumberWithoutSavedCar(null);
      setpartrefnumberdatawithoutsavedcar([]);
      return;
    }

    if (parts.length === 1) {
      const part = parts[0];
      handleSingleItemSelect(part);
      setOpenMenu(false);
    }

    if (parts.length > 1) {
      handleAllItemsSelect();
      setOpenMenu(false);
    }
  };

  // const getSearchMessage = (apiFailed: boolean) => {
  //   const length = partRefNumberWithOutSavedCar?.length ?? 0;

  //   if (apiFailed) {
  //     return getLabel("api_failed");
  //   }

  //   // Case 1: empty input
  //   if (length === 0) {
  //     return "";
  //   }

  //   // Case 2: input exists but too short (1–4)
  //   // if (length < SEARCH_CHARACTORS) {
  //   //   return getLabel("oe_search_blank");
  //   // }

  //   // Case 3: input long enough but no results
  //   if (length >= SEARCH_CHARACTORS && partrefnumberdatawithoutsavedcar?.length === 0) {
  //     return getLabel("oe_ref_not_found");
  //   }

  //   return "";
  // };

  return (
    <>
      <Box className="flex h-auto w-full flex-row items-center justify-start gap-space-md section-standard">
        {/* search bar */}
        <Box className="flex flex-1 cursor-pointer items-center justify-start base:w-full gtsm:w-[360px] gtsm:min-w-[360px] gtsm:max-w-[360px] gtlg:w-[360px] gtlg:min-w-[360px] gtlg:max-w-[360px]">
          <OGSearchInput
            title=""
            value={partRefNumberWithOutSavedCar ?? ""}
            onChange={(val) => {
              const sanitized = val.replace(/[^a-zA-Z0-9 ,.\-]/g, "");
              handleOeRefChange(sanitized);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                SearchOeRef();
              }
            }}
            onSubmitEditing={SearchOeRef}
            placeholder={getLabel("header_search_placeholder")}
            state={"default"}
            maxLength={50}
            mandatory={false}
            icon={
              partRefNumberWithOutSavedCar ? (
                <CrossIcon
                  className="text-color-icon-default"
                  width={15}
                  onClick={() => handleOeRefChange("")}
                />
              ) : (
                <SearchIcon className="text-color-icon-default" />
              )
            }
          />
          {/* <Box
            className={`mb-0 overflow-hidden text-sm ${(partRefNumberWithOutSavedCar?.length ?? 0) >= SEARCH_CHARACTORS ? "text-color-system-error-dark" : "text-color-system-success-dark"}`}
          >
            {getSearchMessage(errormsg)}
          </Box> */}
          {partrefnumberdatawithoutsavedcar !== null &&
            partrefnumberdatawithoutsavedcar.length > 0 &&
            openMenu && (
              <Box
                className="max-h-auto absolute left-0 right-0 top-full z-20 mt-1 min-w-[320px] overflow-y-auto rounded border bg-[#dee4e2] shadow-lg scrollbar-hide"
                ref={menuRef as any}
              >
                {partrefnumberdatawithoutsavedcar.slice(0, 5)?.map((result: IOeRefItem) => (
                  <Box
                    key={result.id}
                    onClick={() => {
                      handleSingleItemSelect(result);
                    }}
                    className="cursor-pointer border-b p-2 last:border-b-0 hover:bg-[#e3e9e7]"
                  >
                    <span className="text-sm">{result.title[localeCODE]}</span>
                  </Box>
                ))}

                {/* Show more option */}
                {partrefnumberdatawithoutsavedcar.length > 5 && (
                  <Box
                    className="cursor-pointer border-t border-gray-300 py-2 text-center body-regular-sm hover:bg-[#e3e9e7]"
                    onClick={handleAllItemsSelect}
                  >
                    {getLabel("show_more")} ({partrefnumberdatawithoutsavedcar.length - 5})
                  </Box>
                )}
              </Box>
            )}
        </Box>

        {/* links group */}
        <Box className="flex snap-x snap-mandatory flex-row gap-2 overflow-x-auto scrollbar-hide base:hidden gtsm:flex gtlg:flex">
          {linkList.map((item, index) => {
            const rawUrl = getLabel(item.url, { locale: currentLocale });
            const href = appendNavigationCarIdsToPartsHref(
              normalizeFooterPath(rawUrl, currentLocale),
              navigationCarIds,
              navigationVin,
            );

            return (
              <Link href={href} key={index} className="shrink-0 snap-start">
                <OGHeaderButton
                  key={index}
                  hasLabel={true}
                  text={getLabel(item.text)}
                  state="enabled"
                  texthoverClass={
                    index === 0
                      ? "text-header-badge-dot-bg whitespace-nowrap"
                      : "text-header-action-text whitespace-nowrap"
                  }
                  className=""
                />
              </Link>
            );
          })}
        </Box>
      </Box>
    </>
  );
};

export default OGHeaderSearchLinks;
