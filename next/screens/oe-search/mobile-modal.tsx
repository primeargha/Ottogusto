import { Box } from "@/components/ui/box";
import React, { useEffect, useRef, useState } from "react";
import InputBox from "./input-box";
import Image from "next/image";
import { DEBOUNCE_DELAY, SEARCH_CHARACTORS, searchIcons } from "@/constants";
import { useBranding } from "@/contexts/BrandingContext";
import useDeviceType from "./device-type";
import useRouter from "@unitools/router";
import useDebounce from "@/hooks/use-debounce";
import { getOeRef } from "@/services/search";
import DropdownListing from "./oe-dropdown";
import AdvancedSearchIconBlack from "@/assets/search/ad-search-black.svg";
import Dropdownicon from "@/assets/search/dropdown.svg";
import Dropupicon from "@/assets/search/dropup.svg";
import searcIconOE from "@/assets/search/searchIconOE.svg";
import ModalHeader from "./modal-header";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { OGTextSearch } from "@/components/og-components/OGTextSearch";
import { OGButton } from "@/components/og-components/OGButton";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useOERefStore } from "@/stores/useOERefStore";
import { useSearchPartsMutation } from "@/hooks/search";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useParams } from "next/navigation";
import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({ isOpen, onClose }) => {
  const { isOERefSearchOpen, openOERefSearch, closeOERefSearch } = useOERefStore();
  const { addOERefToPreviousSearches, searchData } = useSearchModalStore();
  const { getLabel, getLocale } = useBranding();
  const deviceType = useDeviceType();
  const params = useParams();
  const language = params?.["language-country"] as string;
  const lang = language.split("-")[0];
  const [value, setValue] = useState("");
  const [parts, setParts] = useState([]);
  const { updateFilters } = useUrlParams();
  const [partsCount, setPartsCount] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter(); // Initialize router
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedValue, setselectedValue] = useState("");
  const debouncedValue = useDebounce(value, DEBOUNCE_DELAY); // Wait 50ms before processing
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
      setValue(""); // Set input value
      setDropdownOpen(false);
      closeOERefSearch();
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
          setParts(response?.data as any);
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Prevent scrolling
    } else {
      document.body.style.overflow = "auto";
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle Enter Key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && value.trim()) {
      // router.push(`/products/${value.trim()}`); // Navigate to products page with value
      // router.push(`/products`);
      router.push(`${getRouteLocaleString(Routes.products, params)}`);
    }
  };

  function handleInputChange(value: string): void {
    setValue(value);
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

  function handleDropdownClick(selectedValue: string): void {
    // setValue(selectedValue); // Set input value
    //setDropdownOpen(false); // Close dropdown
    // router.push(`/products/${selectedValue}`); // Navigate to products page
    //router.push(`/products`);
    setselectedValue(selectedValue);
    const payload: any = {
      oeReference: selectedValue,
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
  }

  const handleAdvSearch = () => {
    // addToPreviousSearchesFromAdvSearch(filteredList); // not required anymore

    setValue(""); // Set input value
    setDropdownOpen(false); // Close dropdown
    // router.push(`/products/${selectedValue}`); // Navigate to products page
    closeOERefSearch();
    router.push(`${getRouteLocaleString(Routes.products, params)}`);
    //router.push(`/products`);
  };

  return (
    <Box className="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
      {/* <Box className="w-full base:h-full gtsm:min-h-[765px] gtsm:pl-[30px] gtsm:pr-[30px]"> */}
      <Box className="h-full w-full overflow-auto bg-color-background-l2 sm:max-w-[767] sm:rounded-[8px]">
        {/* <Box className="h-full w-full bg-[--neutral-beige-400] gtsm:mx-auto gtsm:mb-[104px] gtsm:mt-[110px] gtsm:max-w-[1222px] gtsm:rounded-[8px]"> */}
        {/* Header No Change Needed*/}
        <ModalHeader onClose={onClose} />

        {/* Content */}
        <Box className="top-0 flex-1 space-y-3 overflow-auto px-6 pt-[12px]">
          {/* {getLabel("OE_serach_box_heading")} */}

          <Box className="font-overpass text-center text-[24px] font-normal leading-[38px] text-color-text-body">
            {getLabel("oe_serach_box_heading")}
          </Box>
          <OGTextSearch
            inputRef={inputRef}
            placeholder={getLabel("enter_oe_ref")}
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
              className="absolute right-[3.0rem] top-[7.8rem] -translate-y-1/2 cursor-pointer"
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
              className="absolute right-[3.0rem] top-[7.8rem] -translate-y-1/2 cursor-pointer"
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

            {/* Footer */}
            {/* <Box className="border-t pt-4">
          <button onClick={onClose} className="w-full rounded-lg bg-red-500 px-4 py-2 text-white">
            Close
          </button>
        </Box> */}
            {/* </Box> */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FullScreenModal;
