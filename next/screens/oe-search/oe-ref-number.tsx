"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import useRouter from "@unitools/router";
import { useBranding } from "@/contexts/BrandingContext";
import { DEBOUNCE_DELAY, ogSearchIcons, SEARCH_CHARACTORS, searchIcons } from "@/constants";
import DropdownListing from "./oe-dropdown";
import { getOeRef } from "@/services/search";
import useDeviceType from "./device-type";
import useDebounce from "@/hooks/use-debounce";
import { useOERefStore } from "@/stores/useOERefStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Heading } from "@/components/ui/heading";
import CancelSquare from "@/assets/search/cancel-square.svg";
import Dropdownicon from "@/assets/search/dropdown.svg";
import Dropupicon from "@/assets/search/dropup.svg";
import { OGButton } from "@/components/og-components/OGButton";
import { OGTextSearch } from "@/components/og-components/OGTextSearch";
import { useUrlParams } from "@/hooks/useUrlParams";
import { applyOeSearchResultsNavigation } from "@/utils/oeSearchResultsFilters";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Routes } from "@/config/routes";
import { buildPartPdpHref } from "@/utils/build-part-pdp-url";
import slugify from "slugify";

const stripSpaces = (str: string) => str.replaceAll(" ", "");

const OERefNumber: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const { isOERefSearchOpen, closeOERefSearch } = useOERefStore();
  const { addOERefToPreviousSearches, searchData } = useSearchModalStore();
  const { getLabel, getLocale } = useBranding();
  const deviceType = useDeviceType();
  const { updateFilters } = useUrlParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const [value, setValue] = useState("");
  const [parts, setParts] = useState<any[]>([]);
  const [partsFound, setPartsFound] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const debouncedValue = useDebounce(value, DEBOUNCE_DELAY);

  // Helpers
  const resetSearch = () => {
    setValue("");
    setDropdownOpen(false);
    closeOERefSearch();
    setIsNavigating(false);
  };

  // Fetch OE references
  useEffect(() => {
    if (stripSpaces(debouncedValue).length < SEARCH_CHARACTORS) {
      setDropdownOpen(false);
      setParts([]);
      setPartsFound(false);
      return;
    }
    let active = true;
    setIsSearching(true);
    getOeRef(stripSpaces(debouncedValue))
      .then((response) => {
        if (!active) return;
        addOERefToPreviousSearches({
          OERef: stripSpaces(debouncedValue),
          parts: response.data,
        });
        if (response?.data?.length > 0) {
          setParts(response.data);
          setDropdownOpen(true);
          setPartsFound(true);
        } else {
          setParts([]);
          setPartsFound(false);
          setDropdownOpen(true);
        }
        setIsSearching(false);
      })
      .catch(() => {
        setIsSearching(false);
        if (!active) return;
        setParts([]);
        setPartsFound(false);
        setDropdownOpen(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedValue, addOERefToPreviousSearches]);

  // Lock body scroll
  useEffect(() => {
    if (!isOERefSearchOpen) return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOERefSearchOpen]);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOERefSearch();
    };
    if (isOERefSearchOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOERefSearchOpen, closeOERefSearch]);

  // Autofocus input
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isOERefSearchOpen) {
      timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOERefSearchOpen]);

  // Handlers
  const handleInputChange = (newValue: string) => setValue(stripSpaces(newValue));
  const handleInputClick = () => {
    if (deviceType !== "desktop") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Handle Enter Key press
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && value.trim() && !ifSearchBtnDisabled()) {
      SearchOeRef();
    }
  };

  // handles SingleItemSelect and SingleItemSelect based on available items
  const SearchOeRef = () => {
    if (parts.length === 1) {
      setIsNavigating(true);
      const part = parts[0];

      handleSingleItemSelect(part);
    } else {
      setIsNavigating(true);
      handleAllItemsSelect();
    }
  };

  // SingleItemSelect
  const handleSingleItemSelect = (selected: any) => {
    setParts([selected]);
    setIsNavigating(true);
    const part = selected; //parts[0];
    const locale = (params as Record<string, string>)?.["language-country"];
    const href = locale
      ? buildPartPdpHref(locale, part.id, {
          seoName: part?.brand ?? part.title[getLocale()] ?? part.name,
        })
      : null;
    if (href) router.push(href);
    resetSearch();
  };

  // MultiSelect (Navigate to search results page)
  const handleAllItemsSelect = () => {
    applyOeSearchResultsNavigation(updateFilters, stripSpaces(value), {
      sp: searchParams,
      languageCountrySegment: pathname?.split("/").filter(Boolean)[0],
      extra: { year: searchData?.year?.value || null },
    });
    resetSearch();
  };
  const ifSearchBtnDisabled = () =>
    value.length < SEARCH_CHARACTORS || isSearching || parts.length <= 0;

  if (!isOERefSearchOpen) return null;

  return (
    <Modal size="lg" isOpen={isOERefSearchOpen} onClose={resetSearch} className="border-none p-0">
      <ModalBackdrop />
      <ModalContent className="border-none p-0">
        {/* Header */}
        <Box className="mb-4 flex flex-row items-center justify-between border-b p-6 pb-3">
          <Heading className="text-2xl font-bold text-color-text-body">
            {getLabel("oe_search_head")}
          </Heading>
          <button onClick={resetSearch} className="p-1">
            <Image src={CancelSquare} alt="Cancel" height={38} width={38} />
          </button>
        </Box>
        {/* Body */}
        <Box className="px-6 pb-4">
          <Box className="mb-3 text-center text-color-text-body body-medium-md">
            {getLabel("oe_ref_small_heading")}
          </Box>
          {/* Search Input */}
          <Box className="relative">
            <OGTextSearch
              inputRef={inputRef}
              placeholder={getLabel("enter_oe_ref")}
              className="h-18 flex w-full items-center gap-3 rounded border border-color-background-l8 bg-transparent p-6 text-lg text-color-text-body focus:outline-none"
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
                <Image src={searchIcons.aisearch} alt="Advanced Search" height={24} width={24} />
              }
            />
            {/* Dropdown toggle */}
            {value.length >= SEARCH_CHARACTORS && (
              <Image
                src={dropdownOpen ? Dropupicon : Dropdownicon}
                alt="dropdown"
                className="absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                height={12}
                width={12}
                onClick={() => setDropdownOpen((prev) => !prev)}
              />
            )}
            {/* Results */}
            {dropdownOpen && (
              <>
                {!partsFound && (
                  <h4 className="mt-2 text-color-system-error-main body-regular-sm">
                    {getLabel("oe_search_not_found")}
                  </h4>
                )}
                {partsFound && (
                  <DropdownListing
                    data={parts}
                    onSelect={handleSingleItemSelect}
                    isMobile={false}
                    onSearchAll={handleAllItemsSelect}
                  />
                )}
              </>
            )}
          </Box>
          {/* Empty search hint */}
          {value.length < SEARCH_CHARACTORS && (
            <Box className="mt-3">
              <h4 className="text-color-text-body body-regular-sm">
                {getLabel("oe_search_blank")}
              </h4>
            </Box>
          )}
          {/* Search Button */}
          {/*  */}
          <Box className="mb-6 flex items-center justify-center">
            <OGButton
              size="medium"
              type="primary"
              isLoading={isNavigating}
              disabled={ifSearchBtnDisabled()}
              onClick={SearchOeRef}
              className="mt-6 w-28 min-w-28 p-3"
              leftcomp={
                <Image src={ogSearchIcons.search} alt="Advanced Search" width={20} height={20} />
              }
            >
              {getLabel("search")}
            </OGButton>
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default OERefNumber;
