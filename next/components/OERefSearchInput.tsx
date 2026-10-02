"use client";

import { useBranding } from "@/contexts/BrandingContext";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useUrlParams } from "@/hooks/useUrlParams";
import { applyOeSearchResultsNavigation } from "@/utils/oeSearchResultsFilters";
import { useMmeStore } from "@/stores/useMmeStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { IOeRefItem } from "@/types/oerefSearch";
import { useNavigationCarIds } from "@/hooks/useNavigationCarIds";

import React, { useEffect, useRef, useState } from "react";
import { Routes } from "@/config/routes";
import slugify from "slugify";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildPartPdpHref } from "@/utils/build-part-pdp-url";
import { Box } from "./ui/box";
import { DEBOUNCE_DELAY, SEARCH_CHARACTORS } from "@/constants";
import useDebounce from "@/hooks/use-debounce";
import { getOeRef } from "@/services/search";
import { useClickOutside } from "@/hooks/useClickOutside";
const stripSpaces = (str: string) => str.replaceAll(" ", "");
// THIS COMPONENT WILL BE USED FOR OE REFERENCE SEARCH INPUT
export default function OERefSearchInput({
  shouldSearch,
  setShouldSearch,
}: {
  shouldSearch: boolean;
  setShouldSearch: (v: boolean) => void;
}) {
  const [localOeRefValue, setLocalOeRefValue] = useState("");
  const [errormsg, setErrorMsg] = useState(false);
  const {
    partrefnumberwithoutsavedcar,
    setpartrefnumberwithoutsavedcar,
    partrefnumberdatawithoutsavedcar,
    setpartrefnumberdatawithoutsavedcar,
    searchData,
    setOeReference,
  } = useMmeStore();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => {
    setOpenMenu(false);
  });
  const [filteredResults, setFilteredResults] = useState<string[]>([]);
  const debouncedValue = useDebounce(partrefnumberwithoutsavedcar, DEBOUNCE_DELAY);
  const { addOERefToPreviousSearches } = useSearchModalStore();
  const router = useRouter();
  const params = useParams();
  const { getLocale, getLabel } = useBranding();
  const localeCODE = getLocale();
  const { updateFilters } = useUrlParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const navigationCarIds = useNavigationCarIds();
  // Handle OE Reference input change
  // const handleOeRefChange = (value: string) => {
  //   setLocalOeRefValue(value.toUpperCase());
  // };

  // Handle OE Reference search
  const handleOeRefSearch = async () => {
    if (!localOeRefValue.trim()) {
      return;
    }

    try {
      // TODO: Implement OE Reference search functionality
    } catch (error) {
      console.error("OE Reference search error:", error);
    }
  };

  const handleOeRefChange = (value: string) => {
    setpartrefnumberwithoutsavedcar(value);
    setpartrefnumberdatawithoutsavedcar(null);
    setOeReference(value);
    setErrorMsg(false);
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

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleOeRefSearch();
    }
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

  useEffect(() => {
    // ✅ Exit early if value is too short, but keep the effect running
    if ((debouncedValue ?? "").length < SEARCH_CHARACTORS) {
      return;
    }
    // ✅ Always execute the API call inside useEffect
    // setIsSearching(true);
    getOeRef(debouncedValue ?? "")
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
  useEffect(() => {
    if (shouldSearch) {
      SearchOeRef();
      setShouldSearch(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldSearch]);
  const handleSingleItemSelect = (selected: IOeRefItem) => {
    const part = selected;
    const locale = (params as Record<string, string>)?.["language-country"];
    const href = locale
      ? buildPartPdpHref(locale, part.id, {
          seoName: part?.brand ?? part.title[getLocale()] ?? part.name,
          carIds: navigationCarIds,
        })
      : null;
    if (href) router.push(href);
    setpartrefnumberwithoutsavedcar(null);
    setpartrefnumberdatawithoutsavedcar(null);
  };
  const handleAllItemsSelect = () => {
    applyOeSearchResultsNavigation(updateFilters, stripSpaces(partrefnumberwithoutsavedcar ?? ""), {
      sp: searchParams,
      languageCountrySegment: pathname?.split("/").filter(Boolean)[0],
      extra: { carIds: navigationCarIds.length > 0 ? navigationCarIds : null },
    });
    setpartrefnumberwithoutsavedcar(null);
    setpartrefnumberdatawithoutsavedcar([]);
    //  resetSearch();
  };
  const getSearchMessage = (apiFailed: boolean) => {
    const length = partrefnumberwithoutsavedcar?.length ?? 0;

    if (apiFailed) {
      return getLabel("api_failed");
    }

    // Case 1: empty input
    if (length === 0) {
      return "";
    }

    // Case 2: input exists but too short (1–4)
    if (length < SEARCH_CHARACTORS) {
      return getLabel("oe_search_blank");
    }

    // Case 3: input long enough but no results
    if (length >= SEARCH_CHARACTORS && partrefnumberdatawithoutsavedcar?.length === 0) {
      return getLabel("oe_ref_not_found");
    }

    return "";
  };
  return (
    <div className="max-w-[300px] space-y-4">
      <div className="relative border-l border-button-outline-border pl-3">
        <div className="mb-2">
          <label htmlFor="oe-ref-input" className="block text-gray-700 body-bold-sm">
            {getLabel("part_reference_number")}
          </label>
        </div>

        <div className="relative flex gap-2">
          <input
            id="oe-ref-input"
            type="text"
            value={partrefnumberwithoutsavedcar ?? ""}
            onChange={(e) => handleOeRefChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                SearchOeRef();
              }
            }}
            placeholder={getLabel("enter_part_reference_number")}
            className="flex-1 border-none bg-transparent px-0 py-2 body-regular-sm focus:outline-none"
            autoFocus
          />
        </div>

        {/* Dropdown results */}
        {partrefnumberdatawithoutsavedcar !== null &&
          partrefnumberdatawithoutsavedcar.length > 0 &&
          openMenu && (
            <div
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 min-w-[320px] overflow-y-auto rounded border bg-[#dee4e2] shadow-lg scrollbar-hide"
              ref={menuRef}
            >
              {partrefnumberdatawithoutsavedcar.slice(0, 4)?.map((result: IOeRefItem) => (
                <div
                  key={result.id}
                  onClick={() => {
                    handleSingleItemSelect(result);
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
      </div>
      <Box
        className={`mb-0 overflow-hidden text-sm ${(partrefnumberwithoutsavedcar?.length ?? 0) >= SEARCH_CHARACTORS ? "text-color-system-error-dark" : "text-color-system-success-dark"}`}
      >
        {getSearchMessage(errormsg)}
      </Box>
    </div>
  );
}
