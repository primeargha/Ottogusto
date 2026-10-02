import React, { useEffect, useState } from "react";

import { createPortal } from "react-dom";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import Image from "next/image";
import UpArrowIcon from "@/assets/og-search/arrow-up-active.svg";
import DownArrowIcon from "@/assets/og-search/arrow-down-active.svg";
import SearchIcon from "@/assets/og-search/search.svg";
import OGMMYTSearchDropdown from "@/components/og-components/OGMMYTSearchDropdown";
import { useUrlParams } from "@/hooks/useUrlParams";
import InactiveArrowIcon from "../og-search/InactiveArrowIcon";
import InactiveArrowIconMobile from "./InactiveArrowIconMobile";

interface MobileSearchDropdownProps {
  label: string;
  placeholder: string;
  isVisible: boolean;
  value: string;
  options: Array<{ key: string; value: string }>;
  onSearch: (value: string) => void;
  onSelect: (option: { key: string; value: string }) => void;
  classNames?: string;
  step?: number | any;
}

export default function MobileSearchDropdown({
  label,
  placeholder,
  isVisible,
  value,
  options,
  onSearch,
  onSelect,
  classNames,
  step,
}: MobileSearchDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { updateFilters } = useUrlParams();
  const { setStep, getMakeModelTypeId, addToPreviousSearches, fetchSearchResults } =
    useSearchModalStore();
  const [searchInputValue, setSearchInputValue] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement | any>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Local filtering state
  const [filteredOptions, setFilteredOptions] = React.useState(options);

  // Update filtered options when options prop changes
  React.useEffect(() => {
    setFilteredOptions(options);
  }, [options, label]);

  // Initialize filtered options when component mounts
  React.useEffect(() => {
    setFilteredOptions(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update dropdown position when open
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const updatePosition = () => {
        const rect = dropdownRef.current?.getBoundingClientRect();
        if (rect) {
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]);

  // Same click outside logic
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is on the dropdown trigger (original container)
      const isOnTrigger = dropdownRef.current?.contains(target);

      // Check if click is on the portal dropdown panel
      const isOnPortal =
        target instanceof Element &&
        (target.closest("[data-dropdown-panel]") !== null ||
          target.closest(".fixed.z-\\[99999\\]") !== null);

      // Only close if click is neither on trigger nor on portal
      if (!isOnTrigger && !isOnPortal) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [label]);

  // Same dropdown click logic
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
      case "Engine CC":
      case "Horsepower":
      case "Fuel Type":
        setStep(5);
        break;
      case "Body Type":
      case "Number of Doors":
      case "Variant":
        setStep(6);
        break;
      default:
        break;
    }
    const newIsOpen = !isOpen;

    setIsOpen(newIsOpen);

    // Clear search input when closing dropdown
    if (!newIsOpen) {
      setSearchInputValue("");
      setFilteredOptions(options);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchInputValue(newValue);

    // For steps 5-6 (Engine/Trim), use local filtering
    if (step === 5 || step === 6) {
      if (newValue.trim() === "") {
        setFilteredOptions(options);
      } else {
        const filtered = options.filter((option) => {
          // Convert both option.value and newValue to strings for comparison
          const optionValue = String(option.value);
          const searchValue = String(newValue);
          const matches = optionValue.toLowerCase().includes(searchValue.toLowerCase());

          return matches;
        });

        setFilteredOptions(filtered);
      }
    } else {
      // Use external search (for steps 1-4)

      if (onSearch) {
        onSearch(newValue);
      }
    }
  };

  const handleOptionSelect = (option: { key: string; value: string }) => {
    onSelect(option);
    setIsOpen(false);
    setSearchInputValue("");
    setFilteredOptions(options);
  };

  return (
    <Box className={`relative w-full ${classNames}`} ref={dropdownRef}>
      {/* Label and Value Container */}

      <OGMMYTSearchDropdown
        label={label}
        value={value}
        placeholder={placeholder}
        property={isOpen ? "open" : "inactive"}
        direction="horizontal"
        onDropdownClick={handleDropdownClick}
        step={step}
        isDisabled={!isVisible}
      />
      {/* Dropdown Panel */}

      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <Box
            data-dropdown-panel={label}
            className="fixed z-10 rounded-md border border-gray-300 bg-white shadow-lg"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxWidth: dropdownPosition.width,
            }}
          >
            {/* Search Input */}
            <Box className="border-b border-gray-200 p-3">
              <Box className="relative">
                <input
                  type="text"
                  value={searchInputValue}
                  onChange={handleSearchInputChange}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none"
                />
                <Box className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Image src={SearchIcon} alt="Search" height={16} width={16} />
                </Box>
              </Box>
            </Box>

            {/* Options List */}
            <Box className="max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
              {filteredOptions.length > 0 ? (
                filteredOptions?.map((option) => (
                  <Box
                    key={option.key}
                    onClick={() => {
                      handleOptionSelect(option);
                    }}
                    className="flex cursor-pointer flex-row items-center border-b border-gray-100 px-3 py-5 hover:bg-[--system-green-color]"
                  >
                    <Text className="text-[14px] capitalize text-color-primary-main">
                      {option.value}
                    </Text>
                  </Box>
                ))
              ) : (
                <Box className="px-4 py-3 text-center text-sm text-gray-500">No results found</Box>
              )}
            </Box>
          </Box>,
          document.body,
        )}
    </Box>
  );
}
