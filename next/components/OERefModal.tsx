import React, { useEffect, useRef, useState } from "react";
import { Box } from "./ui/box";
import { Text } from "./ui/text";
import CancelSquare from "@/assets/search/cancel-square.svg";
import Image from "next/image";
import { DEBOUNCE_DELAY, ogSearchIcons, SEARCH_CHARACTORS, searchIcons } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import { useMedia } from "@/hooks/useMedia";
import { OGTextSearch } from "./og-components/OGTextSearch";
import { OGButton } from "./og-components/OGButton";
import { useMmeStore } from "@/stores/useMmeStore";
import { IOeRefItem } from "@/types/oerefSearch";

import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildPartPdpHref } from "@/utils/build-part-pdp-url";
import { useUrlParams } from "@/hooks/useUrlParams";
import { applyOeSearchResultsNavigation } from "@/utils/oeSearchResultsFilters";
import useDebounce from "@/hooks/use-debounce";
import { getOeRef } from "@/services/search";
import { useClickOutside } from "@/hooks/useClickOutside";
const stripSpaces = (str: string) => str.replaceAll(" ", "");
interface OERefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OERefModal = ({ isOpen, onClose }: OERefModalProps) => {
  const { getLabel, getLocale } = useBranding();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isMobile = useMedia("(max-width: 639px)");
  const router = useRouter();
  const params = useParams();
  const localeCODE = getLocale();
  const menuRef = useRef<HTMLDivElement>(null);
  const { updateFilters } = useUrlParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(false);
  const [errormsg, setErrorMsg] = useState(false);
  useClickOutside(menuRef, () => {
    setOpenMenu(false);
  });
  const {
    partrefnumberwithoutsavedcar,
    setpartrefnumberwithoutsavedcar,
    partrefnumberdatawithoutsavedcar,
    setpartrefnumberdatawithoutsavedcar,
    resetpartrefnumberwithoutsavedcar,
    searchData,
    setOeReference,
  } = useMmeStore();
  const debouncedValue: any = useDebounce(partrefnumberwithoutsavedcar, DEBOUNCE_DELAY);
  useEffect(() => {
    // ✅ Exit early if value is too short, but keep the effect running
    if ((debouncedValue ?? "").length < SEARCH_CHARACTORS) {
      return;
    }
    // ✅ Always execute the API call inside useEffect
    // setIsSearching(true);
    getOeRef(debouncedValue)
      .then((response) => {
        setpartrefnumberdatawithoutsavedcar(response.data);
        setOpenMenu(true);
      })
      .catch((error) => {
        setpartrefnumberdatawithoutsavedcar(null);
        setErrorMsg(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);
  const handleSingleItemSelect = (selected: IOeRefItem) => {
    const part = selected;
    const locale = (params as Record<string, string>)?.["language-country"];
    const href = locale
      ? buildPartPdpHref(locale, part.id, {
          seoName: part?.brand ?? part.title[getLocale()] ?? part.name,
        })
      : null;
    if (href) router.push(href);
    resetpartrefnumberwithoutsavedcar();
  };
  // MultiSelect (Navigate to search results page)
  const handleAllItemsSelect = () => {
    applyOeSearchResultsNavigation(updateFilters, stripSpaces(partrefnumberwithoutsavedcar ?? ""), {
      sp: searchParams,
      languageCountrySegment: pathname?.split("/").filter(Boolean)[0],
    });
    setpartrefnumberwithoutsavedcar(null);
    setpartrefnumberdatawithoutsavedcar([]);
    //  resetSearch();
  };
  const SearchOeRef = () => {
    const parts = partrefnumberdatawithoutsavedcar ?? [];
    if (parts.length === 1) {
      // setIsNavigating(true);
      const part = parts[0];
      handleSingleItemSelect(part);
    }
    if (parts.length > 1) {
      // setIsNavigating(true);
      handleAllItemsSelect();
    }
  };
  const handleOeRefChange = (value: string) => {
    setpartrefnumberwithoutsavedcar(value);
    setpartrefnumberdatawithoutsavedcar(null);
    setOeReference(value);
    setErrorMsg(false);
  };
  const getSearchMessage = (apiFailed: boolean) => {
    if (apiFailed) {
      return getLabel("api_failed");
    }
    if ((partrefnumberwithoutsavedcar?.length ?? 0) < SEARCH_CHARACTORS) {
      return getLabel("oe_search_blank");
    }
    if (
      (partrefnumberwithoutsavedcar?.length ?? 0) >= SEARCH_CHARACTORS &&
      partrefnumberdatawithoutsavedcar?.length === 0
    ) {
      return getLabel("oe_ref_not_found");
    }
  };
  const modalclose = () => {
    onClose();
    setErrorMsg(false);
  };
  if (!isOpen) return null;
  return (
    <>
      <Box className="gtsm:block">
        <Box
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 ${isMobile ? "" : "p-6"}`}
        >
          <Box
            className={`z-[10000] w-full max-w-2xl overflow-hidden rounded-lg bg-color-background-l2 shadow-xl ${isMobile ? "relative min-h-dvh" : ""}`}
          >
            {/* Header */}
            <Box className={`border-b border-dotted border-purple-200 px-6 py-4`}>
              <Box className="flex flex-row items-center justify-between">
                <Text className="text-color-text-body body-bold-lg">
                  {" "}
                  {getLabel("oe_search_head")}
                </Text>

                <button onClick={modalclose}>
                  <Image src={CancelSquare} alt="Cancel" height={38} width={38} />
                </button>
              </Box>
            </Box>

            {/* Body */}
            <Box className="px-6 py-6 base:h-full gtsm:min-h-[360px]">
              <Box className="mb-3 text-center text-color-text-body body-medium-md">
                {getLabel("oe_ref_small_heading")}
              </Box>

              <Box className="relative base:h-full">
                <OGTextSearch
                  //   inputRef={inputRef}
                  placeholder={getLabel("enter_oe_ref")}
                  value={partrefnumberwithoutsavedcar ?? ""}
                  onChange={handleOeRefChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      SearchOeRef();
                    }
                  }}
                  className="h-18 flex w-full items-center gap-3 rounded border border-color-background-l8 bg-transparent p-6 text-lg text-color-text-body focus:outline-none"
                  autoFocus
                  autoComplete="on"
                  name="oe-ref-num"
                  id="oe-ref-num"
                  leftcomp={
                    <Image
                      src={searchIcons.aisearch}
                      alt="Advanced Search"
                      height={24}
                      width={24}
                    />
                  }
                />

                <Text
                  className={`mb-0 mt-2 overflow-hidden body-regular-sm ${(partrefnumberwithoutsavedcar?.length ?? 0) >= SEARCH_CHARACTORS ? "text-color-system-error-dark" : "text-color-text-body"}`}
                >
                  {getSearchMessage(errormsg)}
                </Text>
                {/* Dropdown toggle */}

                {/* Results */}
                {partrefnumberdatawithoutsavedcar !== null &&
                  partrefnumberdatawithoutsavedcar.length > 0 &&
                  openMenu && (
                    <div
                      className="absolute left-0 right-0 z-50 mt-1 max-h-60 min-w-[320px] overflow-y-auto rounded border bg-[#dee4e2] shadow-lg scrollbar-hide base:top-[11%] gtsm:top-[27%]"
                      ref={menuRef}
                    >
                      {partrefnumberdatawithoutsavedcar.slice(0, 4)?.map((result: IOeRefItem) => (
                        <div
                          key={result.id}
                          onClick={() => {
                            handleSingleItemSelect(result);
                            // setpartrefnumberwithoutsavedcar(result);
                            // setFilteredResults([]);
                          }}
                          className="cursor-pointer border-b p-2 last:border-b-0 hover:bg-[#e3e9e7]"
                        >
                          <span className="text-sm">{result.title[localeCODE]}</span>
                        </div>
                      ))}

                      {/* Show more option */}
                      {partrefnumberdatawithoutsavedcar.length > 4 && (
                        <div
                          className="cursor-pointer border-t border-gray-300 py-2 text-center body-regular-sm hover:bg-[#e3e9e7]"
                          onClick={handleAllItemsSelect}
                        >
                          {getLabel("show_more")} ({partrefnumberdatawithoutsavedcar.length - 4})
                        </div>
                      )}
                    </div>
                  )}

                <Box
                  className={`absolute bottom-0 flex w-full items-center justify-center ${isMobile ? "gap-3" : "mb-6"}`}
                >
                  <OGButton
                    size="large"
                    type="primary"
                    // isLoading={isNavigating}
                    disabled={
                      (partrefnumberwithoutsavedcar?.length ?? 0) < SEARCH_CHARACTORS ||
                      !partrefnumberdatawithoutsavedcar ||
                      (Array.isArray(partrefnumberdatawithoutsavedcar) &&
                        partrefnumberdatawithoutsavedcar.length === 0)
                    }
                    onClick={SearchOeRef}
                    className={`${isMobile ? "w-full" : "mt-6 w-28 min-w-28"} p-3`}
                    leftcomp={
                      <Image
                        src={ogSearchIcons.search}
                        alt="Advanced Search"
                        width={20}
                        height={20}
                      />
                    }
                  >
                    {getLabel("search")}
                  </OGButton>

                  <OGButton
                    type="outlined"
                    size="medium"
                    onClick={onClose}
                    className={`${isMobile ? "order-2 min-h-11 w-full" : "order-1 hidden"}`}
                  >
                    {getLabel("cancel")}
                  </OGButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default OERefModal;
