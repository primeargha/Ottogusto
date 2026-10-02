"use Client";

import { Box } from "@/components/ui/box";
import React, { useState, useEffect, useRef } from "react";
import InputBox from "../oe-search/input-box";
import Image from "next/image";
import { DEBOUNCE_DELAY, SEARCH_CHARACTORS, searchIcons } from "@/constants";
import DropdownListing from "../oe-search/oe-dropdown";
import { useBranding } from "@/contexts/BrandingContext";
import useDeviceType from "../oe-search/device-type";
import useDebounce from "@/hooks/use-debounce";
import { getOeRef } from "@/services/search";
import useRouter from "@unitools/router";
import Dropdownicon from "@/assets/search/dropdown.svg";
import Dropupicon from "@/assets/search/dropup.svg";
import searcIconOE from "@/assets/search/searchIconOE.svg";
import AdvancedSearchIconBlack from "@/assets/search/ad-search-black.svg";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { OGTextSearch } from "@/components/og-components/OGTextSearch";
import { OGButton } from "@/components/og-components/OGButton";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useOERefStore } from "@/stores/useOERefStore";
import { useSearchPartsMutation } from "@/hooks/search";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useParams } from "next/navigation";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";

export default function OEContent() {
  const { closeOgSearchModal, addOERefToPreviousSearches, searchData } = useSearchModalStore();
  const { getLabel, getLocale } = useBranding();
  const { closeOERefSearch } = useOERefStore();
  const deviceType = useDeviceType();
  const [value, setValue] = useState("");
  const [parts, setParts] = useState<any[]>([]);
  const [partsCount, setPartsCount] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter(); // Initialize router
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateFilters } = useUrlParams();
  const [selectedValue, setselectedValue] = useState("");
  const debouncedValue = useDebounce(value?.replaceAll(" ", ""), DEBOUNCE_DELAY); // Wait 50ms before processing
  const [errorMsg, setErrorMsg] = useState(false);
  const params = useParams();
  const language = params?.["language-country"] as string;
  const lang = language.split("-")[0];
  const isOpen = true;
  const { addToPreviousSearchesFromAdvSearch, filteredList } = useAdvancedSearchStore();
  const { mutate: searchpart } = useSearchPartsMutation({
    onSuccess: async (data: any) => {
      if (data.data.totalCount === 1) {
        router.push(`${getRouteLocaleString(Routes.pitStop, params)}${data.data.parts[0].id}`); // Navigate to products page with value
      } else {
        updateFilters(
          {
            oeReference: selectedValue,
            year: searchData?.year?.value || null,
          },
          "/products",
        );
      }
      setselectedValue("");
      setValue(selectedValue);
      setDropdownOpen(false);
      closeOgSearchModal();
    },
    onError: (error: any) => {},
  });
  useEffect(() => {
    // ✅ Exit early if value is too short, but keep the effect running
    if (debouncedValue.length < SEARCH_CHARACTORS) {
      setDropdownOpen(false);
      setParts([]);
      setPartsCount(false);
      return;
    }

    // ✅ Always execute the API call inside useEffect
    getOeRef(debouncedValue)
      .then((response) => {
        addOERefToPreviousSearches({
          OERef: debouncedValue,
          parts: response.data,
        });
        if (response?.data?.length > 0) {
          setParts(response?.data);
          setDropdownOpen(true);
          setPartsCount(true);
        } else {
          setParts([]);
          setPartsCount(false);
          setDropdownOpen(false);
        }
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
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus(); // Auto-focus input when modal opens
      }, 100); // Slight delay to ensure smooth execution
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleInputChange(value: string): void {
    setValue(value.replaceAll(" ", ""));
  }

  function handleInputClick(): void {
    if (deviceType === "mobile" || deviceType === "tablet") {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.click(); // Ensure input is clicked programmatically
        }
      }, 50); // Increase delay for mobile compatibility
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && value.trim()) {
      closeOgSearchModal();
      //router.push(`/products`);
      router.push(`${getRouteLocaleString(Routes.products, params)}`);
    }
  };

  const handleDropdownClick = (selectedValue: string) => {
    setselectedValue(selectedValue.replaceAll(" ", ""));
    const payload: any = {
      oeReference: selectedValue.replaceAll(" ", ""),
      vendorId: null,
      language: getLocale(),
      search: null,
      name: null,
      makeModelTypeId: null,
      categoryId: null,
      take: null,
      continuationToken: null,
    };
    searchpart(payload);
    // setValue(selectedValue);
    // setDropdownOpen(false);
    // closeOgSearchModal();
    //router.push(`/products`);
  };

  const getSearchMessage = (
    value: string,
    partsCount: number,
    apiFailed: boolean,
    parts: any[],
  ) => {
    switch (true) {
      // API request failed
      case apiFailed:
        return getLabel("api_failed");

      // User typed at least 7 characters
      case value.length >= SEARCH_CHARACTORS:
        return partsCount && parts.length > 0
          ? getLabel("oe_search_blank")
          : getLabel("oe_ref_not_found");

      // User is still typing but hasn't reached 7 characters
      case value.length > 0 && value.length < SEARCH_CHARACTORS:
        return getLabel("oe_search_warning");

      // Default message when no input is provided
      default:
        return getLabel("oe_search_blank");
    }
  };

  const handleAdvSearch = () => {
    // addToPreviousSearchesFromAdvSearch(filteredList); // not required anymore

    setValue(""); // Set input value
    setDropdownOpen(false); // Close dropdown
    // router.push(`/products/${selectedValue}`); // Navigate to products page\
    closeOgSearchModal();
    closeOERefSearch();
    router.push(`${getRouteLocaleString(Routes.products, params)}`);
    // router.push(`/products`);
  };

  return (
    <Box className="flex-1 overflow-auto">
      <Box className="top-0 flex-1 space-y-3 overflow-auto px-6 pt-[12px]">
        <Box className="font-overpass text-center text-[24px] font-normal leading-[38px] text-color-text-body">
          {getLabel("oe_serach_box_heading")}
        </Box>
        <OGTextSearch
          inputRef={inputRef}
          placeholder={getLabel("enter_oe_Ref")}
          className="h-18 relative flex w-full items-center gap-[12px] rounded-[4px] border border-color-background-l8 bg-transparent p-6 text-lg leading-relaxed text-color-text-body focus:outline-none"
          value={value}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onTouchStart={handleInputClick}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="on"
          name="oe-ref-num"
          id="oe-ref-num"
          leftcomp={
            <Image src={AdvancedSearchIconBlack} alt="Advanced Search" height={20} width={20} />
          }
        />

        {/* Cross Image (Clear Input Button) */}
        {value.length > 6 && !dropdownOpen && (
          <Image
            className="absolute right-[2.5rem] top-[5.6rem] -translate-y-1/2 cursor-pointer"
            src={Dropdownicon}
            alt="dropdown"
            height={20}
            width={20}
            onClick={() => {
              // setValue("");
              setDropdownOpen(!dropdownOpen);
              // setParts([]);
            }}
          />
        )}

        {dropdownOpen && value.length > 0 && (
          <Image
            className="absolute right-[2.5rem] top-[5.6rem] -translate-y-1/2 cursor-pointer"
            src={Dropupicon}
            alt="dropdown"
            height={20}
            width={20}
            onClick={() => {
              // setValue("");
              setDropdownOpen(false);
              // setParts([]);
            }}
          />
        )}

        <Box className="flex flex-col items-center justify-center">
          {dropdownOpen && partsCount && (
            <Box className="-top-2 z-20 w-full">
              <DropdownListing
                data={parts}
                onSelect={handleDropdownClick}
                isMobile={true}
                onSearchAll={handleAdvSearch}
              />
            </Box>
          )}

          {!dropdownOpen && (
            <Box
              className={`font-Overpass text-base font-normal leading-[18px] ${
                value.length >= SEARCH_CHARACTORS
                  ? partsCount
                    ? "text-[--Text-green]"
                    : "text-color-system-error-main"
                  : "text-[--Text-green]"
              }`}
            >
              {value.length >= SEARCH_CHARACTORS
                ? partsCount
                  ? getLabel("oe_search_blank")
                  : getLabel("oe_search_not_found")
                : getLabel("oe_search_blank")}
            </Box>
          )}

          <OGButton
            size="medium"
            type="primary"
            disabled={value.length < 7}
            onClick={handleAdvSearch}
            className="!ml-[0px] mt-[24px] w-28 min-w-28 p-[12px]"
            leftcomp={<Image src={searcIconOE} alt="Advanced Search" width={18} height={18} />}
          >
            {getLabel("search")}
          </OGButton>
        </Box>
      </Box>
    </Box>
  );
}
