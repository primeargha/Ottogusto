"use client";
import React, { useRef, useState, useEffect } from "react";
import { Box } from "./ui/box";
import leftcirclewhite from "../public/assets/lightgreenleftcircle.svg";
import rightcircleimport from "../public/assets/deepgreenrightcircle.svg";
import Image from "next/image";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import plus from "../public/assets/plus.svg";
import { useBranding } from "@/contexts/BrandingContext";
import { OGCheckboxInput } from "./og-components/OGCheckboxInput";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { OGButton } from "./og-components/OGButton";
import { useCartStore } from "@/stores/useCartStore";

// Define interface for address data
interface AddressData {
  name: string;
  address: string;
  phone: string;
}

interface DeliveryaddressInputProps {
  addresses: any[];
  isSameBilling: boolean;
  setIsSamesavedBilling: (val: boolean) => void;
}

export const SavedDeliveryAddress: React.FC<DeliveryaddressInputProps> = ({
  addresses,
  isSameBilling,
  setIsSamesavedBilling,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [maxScroll, setMaxScroll] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const {
    formMode,
    setFormMode,
    savedBillingAddresses,
    selectedSavedDeliveryAddress,
    setSelectedSavedDeliveryAddress,
    setSelectedSavedBillingAddress,
  } = useCartStore();
  const { getLabel } = useBranding();

  const addressSchema = z.object({
    name: z.string().optional(),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, getLabel("Checkout_city_required")),
    state: z.string().optional(), // Changed from required to optional
    postalCode: z.string().min(1, getLabel("Checkout_postcode_required")),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z
      .string()
      .optional()
      .refine((value) => !value || isPossiblePhoneNumber(value), {
        message: "Please enter a valid phone number",
      }),
    isDefaultBilling: z.boolean().optional(),
    isSamesavedBilling: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    type: z.enum(["Billing", "Shipping"]),
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      isSamesavedBilling: "",
    },
  });

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    let frameId: number | null = null;

    const measure = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        if (!scrollRef.current) return;
        const { scrollWidth, clientWidth } = scrollRef.current;
        setMaxScroll(Math.max(0, scrollWidth - clientWidth));
        setContainerWidth(clientWidth);
      });
    };

    measure();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(element);
    } else {
      window.addEventListener("resize", measure);
    }

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", measure);
      }
    };
  }, [addresses]);

  const scroll = (direction: "left" | "right"): void => {
    const container = scrollRef.current;
    if (!container) return;

    const effectiveWidth = containerWidth || container.clientWidth;
    const scrollAmount = effectiveWidth * 0.8;
    const newScrollPosition =
      direction === "left"
        ? Math.max(scrollPosition - scrollAmount, 0)
        : Math.min(scrollPosition + scrollAmount, maxScroll);

    container.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });

    setScrollPosition(newScrollPosition);
  };

  const handleScroll = (): void => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft);
    }
  };

  // Calculate if we can scroll in either direction
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  const handleAddressSelect = (address: any) => {
    setSelectedSavedDeliveryAddress(address);
    if (isSameBilling) {
      setSelectedSavedBillingAddress(address);
    }
    // Collapse the form when selecting a saved address
    setFormMode({
      delivery: "hidden",
      billing:
        formMode.billing === "add" || formMode.billing === "edit" ? "hidden" : formMode.billing,
    });
  };

  return (
    <Box className="flex w-full flex-col gap-3">
      {/* address heading */}
      <Box className="py-3">
        <Box className="text-color-text-body body-bold-lg">
          {getLabel("checkout_saved_delivery_address")}
        </Box>
      </Box>

      {/* carousal block */}
      <Box className="relative w-full">
        {/* Left navigation arrow - fixed position */}
        <Box
          className="absolute left-[-5px] top-1/2 z-10 -translate-y-1/2 cursor-pointer opacity-100"
          onClick={() => canScrollLeft && scroll("left")}
        >
          <Box
            className={`flex h-10 w-10 items-center justify-center rounded-full ${canScrollLeft ? "bg-[--arrow-bg]" : "bg-[--disabled-arrow-bg]"} object-cover`}
          >
            <Image src={leftcirclewhite} alt="Scroll left" className="h-6 w-6 text-white" />
          </Box>
        </Box>

        {/* Card container with horizontal scroll */}
        <Box className="w-full px-2">
          <Box
            ref={scrollRef as any}
            onScroll={handleScroll}
            className="flex w-full flex-row gap-3 overflow-x-auto pr-5 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "smooth" }}
          >
            {addresses?.map((item, index) => (
              <Box
                key={index}
                className={`group w-full max-w-[380px] flex-shrink-0 cursor-pointer gap-3 rounded-[8px] p-6 ${
                  selectedSavedDeliveryAddress?.id === item.id
                    ? "bg-color-primary-main"
                    : "bg-[--AddresscardHover] hover:bg-color-primary-main"
                }`}
                onClick={() => handleAddressSelect(item)}
              >
                <Box
                  className={`body-bold-sm ${
                    selectedSavedDeliveryAddress?.id === item.id
                      ? "text-white"
                      : "text-color-text-body group-hover:text-white"
                  }`}
                >
                  {item?.name}
                </Box>
                <Box
                  className={`flex flex-row items-start gap-1 ${
                    selectedSavedDeliveryAddress?.id === item.id
                      ? "text-white"
                      : "text-color-text-body group-hover:text-white"
                  }`}
                >
                  <span className="body-bold-sm">Address:</span>
                  <span>
                    {(() => {
                      let streetPart = item?.street || "";
                      if (item?.houseNumber?.trim()) {
                        streetPart += ` ${item.houseNumber}`;
                      }
                      if (item?.buildingNumber?.trim()) {
                        streetPart += ` Bus-${item.buildingNumber}`;
                      }
                      const parts = [
                        streetPart,
                        item?.city || "",
                        item?.postalCode || "",
                        item?.country || "",
                      ];
                      return parts.filter((part) => part).join(", ");
                    })()}
                  </span>
                </Box>
                {item?.phoneNumber && item.phoneNumber.trim() !== "" && (
                  <Box
                    className={`${
                      selectedSavedDeliveryAddress?.id === item.id
                        ? "text-white"
                        : "text-color-text-body group-hover:text-white"
                    }`}
                  >
                    <span className="body-bold-sm">Phone:</span> <span>{item.phoneNumber}</span>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right navigation arrow - fixed position */}
        <Box
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer hover:opacity-100"
          onClick={() => canScrollRight && scroll("right")}
        >
          <Box
            className={`flex h-10 w-10 items-center justify-center ${canScrollRight ? "bg-[--arrow-bg]" : "bg-[--disabled-arrow-bg]"} rounded-full object-cover`}
          >
            <Image src={rightcircleimport} alt="Scroll right" className="h-6 w-6 text-center" />
          </Box>
        </Box>
      </Box>
      <OGButton
        onClick={() => {
          // Deselect any saved addresses when adding new address
          setSelectedSavedDeliveryAddress(null);
          if (isSameBilling) {
            setSelectedSavedBillingAddress(null);
          }
          setFormMode({
            delivery: "add",
            billing: "hidden",
          });
        }}
        type="outlined"
        size="large"
        className="w-full"
        leftcomp={<Image src={plus} alt="Quick Search" width={20} height={20} />}
      >
        {getLabel("add_a_new_address")}
      </OGButton>

      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </Box>
  );
};
