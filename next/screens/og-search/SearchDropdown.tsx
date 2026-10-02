import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import UpArrowIcon from "@/assets/og-search/arrow-up-active.svg";
import DownArrowIcon from "@/assets/og-search/arrow-down-active.svg";
import Image from "next/image";
import SearchIcon from "@/assets/og-search/search.svg";
import { useBranding } from "@/contexts/BrandingContext";
import InactiveArrowIcon from "./InactiveArrowIcon";

interface SearchDropdownProps {
  label: string;
  placeholder: string;
  isVisible: boolean;
  value: string;
  options: Array<{ key: string; value: string }>;
  onSearch: (value: string) => void;
  onSelect: (option: { key: string; value: string }) => void;
}

export default function SearchDropdown({
  label,
  placeholder,
  isVisible,
  value,
  options,
  onSearch,
  onSelect,
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { setStep, fetchSearchResults, updateSearchData, currentStep } = useSearchModalStore();
  const { setSearchValue: setNewSearchValue, updateSearchData: updateNewSearchData } =
    useNewSearchModalStore();
  const [searchInputValue, setSearchInputValue] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { getLabel } = useBranding();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownClick = () => {
    if (!isVisible) return;

    switch (label) {
      case "Make":
        setStep(1);
        break;
      case "Model":
        setStep(2);
        break;
      case "Year":
        setStep(3);
        break;
      case "Type":
        setStep(4);
        break;
      default:
        break;
    }

    setIsOpen(!isOpen);
    // load the search result if not loaded.
    // fetchSearchResults();
  };

  //   if (!isVisible) return null;

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchInputValue(newValue);
    onSearch(newValue); // This will trigger setSearchValue in the old store
    setNewSearchValue(newValue, currentStep); // This will trigger setSearchValue in the new store
  };

  const handleOptionSelect = (option: { key: string; value: string }) => {
    onSelect(option); // This will trigger updateSearchData in the old store
    updateNewSearchData(option, currentStep); // This will trigger updateSearchData in the new store
    setIsOpen(false);
    setSearchInputValue(""); // Clear search input after selection
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength - 3) + "..." : text;
  };

  return (
    // @ts-ignore
    <Box className="relative col-span-1 flex p-1 gtsm:relative" ref={dropdownRef}>
      <div className="absolute left-[-12px] top-3 h-[65%] border-l border-[--Text-Tarmac]" />

      <Box className="gtsm:space-y-1">
        <label
          className={`font-Overpass font-[700] leading-[20px] gtsm:block gtsm:text-[18px] gtsm:text-sm ${isVisible ? "text-color-primary-main" : "gtsm:text-gray-400"}`}
        >
          {label}
        </label>

        {/* Selected Value Display / Dropdown Trigger */}
        <Box
          // @ts-ignore
          onClick={handleDropdownClick}
          className={`gtsm:flex gtsm:w-full gtsm:flex-row gtsm:items-center gtsm:gap-2 gtsm:rounded-md gtsm:font-Overpass gtsm:text-[16px] ${
            !isVisible ? "" : "gtsm:cursor-pointer"
          }`}
        >
          <Text className={`${!value ? "gtsm:text-gray-400" : "gtsm:text-gray-900"}`}>
            {truncateText(value || `${getLabel("add")} ${label}`, 25)}
          </Text>
          {isOpen ? (
            <Image src={UpArrowIcon} alt="Up Arrow" height={24} width={24} />
          ) : (
            <>
              {isVisible ? (
                <Image src={DownArrowIcon} alt="Down Arrow" height={24} width={24} />
              ) : (
                <InactiveArrowIcon />
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Dropdown Panel */}
      {isOpen && (
        <Box className="top-12 z-20 gtsm:absolute gtsm:z-10 gtsm:mt-1 gtsm:w-full gtsm:rounded-md gtsm:border gtsm:border-gray-300 gtsm:bg-white gtsm:shadow-lg">
          {/* Search Input */}
          <Box className="gtsm:border-b gtsm:border-gray-200 gtsm:p-2">
            <Box className="gtsm:relative">
              <input
                type="text"
                value={searchInputValue}
                onChange={handleSearchInputChange}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="gtsm:w-full gtsm:rounded-md gtsm:border gtsm:border-gray-300 gtsm:py-2 gtsm:pl-9 gtsm:pr-3 gtsm:text-sm gtsm:focus:outline-none"
              />
              <Box className="gtsm:absolute gtsm:left-3 gtsm:top-1/2 gtsm:-translate-y-1/2">
                <Image src={SearchIcon} alt="Search" height={18} width={18} />
              </Box>
            </Box>
          </Box>

          {/* Options List */}
          <Box className="scrollbar-hide gtsm:max-h-[200px] gtsm:overflow-y-auto">
            {options.length > 0 ? (
              options?.map((option) => (
                <Box
                  key={option.key}
                  // @ts-ignore
                  onClick={() => handleOptionSelect(option)}
                  className={`flex flex-row items-center gap-2 hover:bg-[--light-green] gtsm:cursor-pointer gtsm:px-3 gtsm:py-5 ${option.value === value ? "bg-[--light-green]" : ""} `}
                >
                  <Text className="line-clamp-2 font-Overpass font-[400] capitalize leading-[18px] text-color-primary-main gtsm:text-[16px]">
                    {option.value}
                  </Text>
                </Box>
              ))
            ) : (
              <Box className="gtsm:px-3 gtsm:py-3.5 gtsm:text-center gtsm:text-sm gtsm:text-gray-500">
                No results found
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
