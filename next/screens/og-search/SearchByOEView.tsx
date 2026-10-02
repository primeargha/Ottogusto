"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import useRouter from "@unitools/router";
import { useBranding } from "@/contexts/BrandingContext";
import {
  DEBOUNCE_DELAY,
  DISPLAY_LIST_NO,
  ogSearchIcons,
  SEARCH_CHARACTORS,
  searchIcons,
} from "@/constants";
import { getOeRef } from "@/services/search";
import useDebounce from "@/hooks/use-debounce";
import useDeviceType from "../oe-search/device-type";
import InputBox from "../oe-search/input-box";
import OgDropdownListing from "./OgDextopDropdown";
import { useOESearchStore } from "@/stores/useOESearchStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useSearchPartsMutation } from "@/hooks/search";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { applyOeSearchResultsNavigation } from "@/utils/oeSearchResultsFilters";
import { buildPartPdpHref } from "@/utils/build-part-pdp-url";
import { Routes } from "@/config/routes";
import { OGButton } from "@/components/og-components/OGButton";
import slugify from "slugify";

interface PartItem {
  id: string;
  name: string;
  brand?: string;
  oeRef: string;
  text: string;
  title: Record<string, string>;
}

type Part = {
  id: number | string;
  name: string;
  oeRef: string;
  text: string;
  title: { [key: string]: string }; // Assuming `title` is an object with language keys
};

export default function SearchByOEView() {
  const { getLabel, getLocale } = useBranding();
  const { addOERefToPreviousSearches } = useSearchModalStore();
  const deviceType = useDeviceType();
  const [value, setValue] = useState("");
  const [parts, setParts] = useState<PartItem[]>([]);
  const [partsCount, setPartsCount] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateFilters } = useUrlParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const debouncedValue = useDebounce(value, DEBOUNCE_DELAY);
  const [isOpen, setIsOpen] = useState(true);
  const [errorMsg, setErrorMsg] = useState(false);
  const [IsNavigating, setIsNavigating] = useState(false);
  const params = useParams();
  const language = params?.["language-country"] as string;
  const lang = language.split("-")[0];
  const [selectedValue, setselectedValue] = useState("");
  const { searchValue, setSearchValue, resetOESearch } = useOESearchStore();
  const { searchData } = useSearchModalStore();
  const [IsSearching, setIsSearching] = useState(false);
  const { mutate: searchpart } = useSearchPartsMutation({
    onSuccess: async (data: any) => {
      if (data.data.totalCount === 1) {
        const part = data.data.parts[0];
        const href = language
          ? buildPartPdpHref(language, part?.id, {
              seoName: part?.name ?? part?.title ?? undefined,
            })
          : null;
        if (href) router.push(href);
      } else {
        applyOeSearchResultsNavigation(updateFilters, selectedValue, {
          sp: searchParams,
          languageCountrySegment: pathname?.split("/").filter(Boolean)[0],
          extra: { year: searchData?.year?.value || null },
        });
      }
      setselectedValue("");
      setSearchValue("");
      setValue(selectedValue);
      setDropdownOpen(false);
    },
    onError: (error: any) => {},
  });
  useEffect(() => {
    if (debouncedValue.length < SEARCH_CHARACTORS) {
      setDropdownOpen(false);
      setParts([]);
      setPartsCount(false);
      return;
    }

    setIsSearching(true);
    getOeRef(debouncedValue)
      .then((response) => {
        addOERefToPreviousSearches({
          OERef: debouncedValue,
          parts: response.data,
        });
        if (response?.data?.length > 0) {
          setParts(response.data as PartItem[]);
          setDropdownOpen(true);
          setPartsCount(true);
        } else {
          setParts([]);
          setPartsCount(false);
          setDropdownOpen(false);
        }
        setIsSearching(false);
      })
      .catch((error) => {
        setParts([]);
        setPartsCount(false);
        setDropdownOpen(false);
        setErrorMsg(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]); // ✅ Always runs in the same order

  useEffect(() => {
    setValue(searchValue);
  }, [searchValue]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      if (typeof window !== "undefined") {
        window.addEventListener("keydown", handleKeyDown);
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      setIsSearching(false);
      resetOESearch();
      setValue("");
      setSearchValue("");
      setselectedValue("");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!isOpen) return null; // Don't render modal if it's not open

  const handleAdvSearch = () => {
    applyOeSearchResultsNavigation(updateFilters, value.replaceAll(" ", ""), {
      sp: searchParams,
      languageCountrySegment: pathname?.split("/").filter(Boolean)[0],
      extra: { year: searchData?.year?.value || null },
    });
    resetOESearch();
  };

  const handleInputClick = () => {
    if (deviceType === "mobile" || deviceType === "tablet") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleInputChange = (newValue: string) => {
    const val = newValue.replaceAll(" ", "");
    setValue(val);
    setSearchValue(val);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && value.trim() && !ifSearchBtnDisabled()) {
      if (parts.length === 1) {
        setIsNavigating(true);
        handleSingleItemSelect(parts[0] as PartItem);
      } else {
        handleAllItemsSelect();
      }
    }
  };

  const SearchOeRef = () => {
    if (parts.length === 1) {
      setIsNavigating(true);
      const part = parts[0];
      handleSingleItemSelect(part as PartItem);
    } else {
      setIsNavigating(false);
      handleAllItemsSelect();
    }
  };

  const handleSingleItemSelect = (selected: PartItem) => {
    setIsNavigating(true);
    const part = selected;
    const locale = (params as Record<string, string>)?.["language-country"];
    const href = locale
      ? buildPartPdpHref(locale, part.id, {
          seoName: part?.brand ?? part.title[getLocale()] ?? part.name,
        })
      : null;
    if (href) router.push(href);
    setselectedValue(selected.oeRef);
  };

  const handleAllItemsSelect = () => {
    applyOeSearchResultsNavigation(updateFilters, value.replaceAll(" ", ""), {
      sp: searchParams,
      languageCountrySegment: pathname?.split("/").filter(Boolean)[0],
      extra: { year: searchData?.year?.value || null },
    });
    resetOESearch();
    setValue("");
    setSearchValue("");
  };

  const getSearchMessage = (
    value: string,
    partsAvailable: boolean,
    apiFailed: boolean,
    parts: PartItem[],
  ) => {
    switch (true) {
      case apiFailed:
        return getLabel("api_failed");

      case value.length >= SEARCH_CHARACTORS:
        return partsAvailable && parts.length > 0
          ? getLabel("oe_search_blank")
          : getLabel("oe_ref_not_found");

      case value.length > 0 && value.length < SEARCH_CHARACTORS:
        return getLabel("oe_search_warning");

      default:
        return getLabel("oe_search_blank");
    }
  };

  const itemCount = parts?.length;
  const showMore: number = itemCount > DISPLAY_LIST_NO ? itemCount - DISPLAY_LIST_NO : 0;

  const ifSearchBtnDisabled = (): boolean => {
    if (value.length < SEARCH_CHARACTORS) {
      return true;
    }

    if (IsSearching) {
      return true;
    }

    if (parts.length <= 0) {
      return true;
    }

    return false;
  };

  return (
    <Box className="mt-7 h-[218px] w-full rounded-lg bg-white gtsm:text-gray-500">
      {/* Input Box */}
      <InputBox
        inputRef={inputRef}
        placeholder={getLabel("enter_oe_ref_to_search")}
        className="w-full bg-transparent py-2 text-lg font-bold leading-relaxed text-color-primary-main placeholder:text-color-text-disabled placeholder:opacity-30 focus:outline-none"
        value={value}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onTouchStart={handleInputClick}
        onKeyDown={handleKeyDown}
        autoFocus={true}
        autoComplete="on"
        name="oe-ref-num"
        id="oe-ref-num"
      />

      <Box className="relative flex w-full flex-row items-start">
        <Box className="absolute mt-2">
          <Image
            src={
              value.length >= SEARCH_CHARACTORS
                ? partsCount
                  ? searchIcons.information
                  : searchIcons.alert
                : searchIcons.information
            }
            alt="info"
            height={16}
            width={16}
          />
        </Box>
        <Box
          className={`absolute ml-6 mt-2 overflow-hidden text-ellipsis text-left font-Overpass text-[18px] text-base font-normal leading-[18px] md:text-[12px] lg:text-[14px] xl:text-[16px] ${value.length >= SEARCH_CHARACTORS ? (partsCount ? "text-[--Text-green]" : "text-color-system-error-main") : "text-[--Text-green]"}`}
        >
          {getSearchMessage(value, partsCount, errorMsg, parts)}
        </Box>

        {dropdownOpen && partsCount && (
          <OgDropdownListing
            data={parts as Part[]}
            onSelect={handleSingleItemSelect}
            searchAll={handleAllItemsSelect}
            isMobile={false}
          />
        )}
      </Box>

      <Box className="absolute bottom-0 right-0">
        <OGButton
          size="large"
          leftcomp={<Image src={ogSearchIcons.search} alt="search" height={24} width={24} />}
          isLoading={IsNavigating}
          disabled={ifSearchBtnDisabled()}
          onClick={SearchOeRef}
        >
          {getLabel("Search")}
        </OGButton>
      </Box>
    </Box>
  );
}
