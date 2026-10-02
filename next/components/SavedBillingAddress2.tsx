"use client";
import React, { useRef, useState, useEffect } from "react";
import { Box } from "./ui/box";
import Image from "next/image";
// import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import plus from "../public/assets/plus.svg";
import { useBranding } from "@/contexts/BrandingContext";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCartStore } from "@/stores/useCartStore";
import { OGButton } from "./og-components/OGButton";
import { OGRadioGroup, OGRadioInput } from "./og-components/OGRadioInput";
import { useEditAddressModalStore } from "@/stores/useEditAddressModalStore";
import Typography from "./og-components/Typography";

// Define interface for address data
interface AddressData {
  name: string;
  address: string;
  phone: string;
}

interface SavedBillingAddressProps {
  isSameBilling: boolean;
  setIsSamesavedBilling: (val: boolean) => void;
  addresses: any[];
  isBusiness?: boolean;
}

export const SavedBillingAddress2: React.FC<SavedBillingAddressProps> = ({
  addresses,
  isSameBilling,
  setIsSamesavedBilling,
  isBusiness = false,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [maxScroll, setMaxScroll] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const { getLabel } = useBranding();
  const {
    setFormMode,
    selectedSavedBillingAddress,
    setSelectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    formMode,
    showAllBillingAddresses: showAllAddresses,
    setShowAllBillingAddresses: setShowAllAddresses,
  } = useCartStore();
  const {
    setSelectedAddress,
    openModal: openEditModal,
    setModalType,
    selectedAddress,
    setModalSaveType,
    openModal,
    setOpenedFrom,
  } = useEditAddressModalStore();

  // const addressSchema = z.object({
  //   name: z.string().optional(),
  //   street: z.string().min(1, "Street address is required"),
  //   city: z.string().min(1, getLabel("Checkout_city_required")),
  //   state: z.string().optional(),
  //   postalCode: z.string().min(1, getLabel("Checkout_postcode_required")),
  //   country: z.string().min(1, "Country is required"),
  //   phoneNumber: z
  //     .string()
  //     .optional()
  //     .refine((value) => !value || isPossiblePhoneNumber(value), {
  //       message: "Please enter a valid phone number",
  //     }),
  //   isDefaultBilling: z.boolean().optional(),
  //   isSamesavedBilling: z.boolean().optional(),
  //   isDefault: z.boolean().optional(),
  //   type: z.enum(["Billing", "Shipping"]),
  // });

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm({
    defaultValues: {
      name: "",
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

  // Determine which addresses to show based on view state
  // View 1: Show only selected address (or first if none selected)
  // View 2: Show all addresses in original order (no reordering)
  const visibleAddresses = React.useMemo(() => {
    if (!addresses || addresses.length === 0) return [];

    if (showAllAddresses) {
      // View 2: Show all addresses in original order - do NOT reorder based on selection
      return addresses;
    } else {
      // View 1: Show only the selected address (or first if none selected)
      if (selectedSavedBillingAddress) {
        const selectedAddr = addresses.find((addr) => addr.id === selectedSavedBillingAddress.id);
        return selectedAddr ? [selectedAddr] : [addresses[0]];
      }
      return [addresses[0]];
    }
  }, [addresses, showAllAddresses, selectedSavedBillingAddress]);

  // const handleScroll = (): void => {
  //   if (scrollRef.current) {
  //     setScrollPosition(scrollRef.current.scrollLeft);
  //   }
  // };

  // const canScrollLeft = scrollPosition > 0;
  // const canScrollRight = scrollPosition < maxScroll;

  const handleAddressSelect = (address: any) => {
    // In View 1 (single card view), clicking shouldn't do anything - only "Change Address" button should
    // In View 2 (all addresses view), clicking selects the address and switches to View 1
    if (!showAllAddresses) {
      // View 1: Don't do anything on card click, only "Change Address" button toggles view
      return;
    }

    // View 2: Select the clicked address and switch to View 1
    setSelectedSavedBillingAddress(address);
    setShowAllAddresses(false);

    // Collapse the form when selecting a saved address
    setFormMode({
      delivery: formMode.delivery,
      billing: "hidden",
    });
  };

  const handleEditAddress = (address: any) => {
    setSelectedAddress(address);
    setModalType("edit");
    setOpenedFrom("billing"); // Track that modal was opened from billing section
    openEditModal();
    if (!address?.isCompany) {
      setModalSaveType("Personal");
    } else {
      setModalSaveType("Business");
    }
  };

  const handleChangeAddress = () => {
    setShowAllAddresses(true);
  };

  return (
    <Box className="flex w-full flex-col gap-6">
      {/* address heading */}
      <Box className="text-color-text-emphasis typography-subtitle-01">
        {getLabel("billing_address")}
      </Box>

      <Box className="flex h-auto w-full flex-col gap-2">
        {/* Radio Address List */}
        <OGRadioGroup
          value={selectedSavedBillingAddress?.id ?? ""}
          className="flex w-full flex-col gap-0"
        >
          {visibleAddresses?.map((item) => {
            const isSelected = selectedSavedBillingAddress?.id === item.id;
            const isFirstAddressOnly = !showAllAddresses;
            const truncate = (text?: string, maxLength = 38) => {
              if (!text) return "";
              return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
            };
            return (
              //@ts-ignore
              <Box
                key={item.id}
                onClick={isFirstAddressOnly ? undefined : () => handleAddressSelect(item)}
                className={`border transition-all ${isFirstAddressOnly ? "" : "cursor-pointer"} ${
                  isSelected
                    ? "border-2 border-color-border-brand"
                    : "border border-color-border-default hover:border-2 hover:border-color-border-brand"
                }`}
              >
                <Box className="flex w-full flex-col gap-space-sm p-space-md">
                  <Box className="flex w-full flex-row items-center justify-between">
                    {/* <Box className="flex flex-row items-center justify-start"> */}
                    <Box className="flex flex-row flex-wrap items-center justify-start">
                      {item?.isCompany === true && (
                        <OGRadioInput value={item?.id} label={truncate(item?.name)} />
                      )}

                      {item?.isCompany === true && (
                        <Typography className="ml-2 text-color-text-muted typography-body-02">
                          ({item.vatNumber})
                        </Typography>
                      )}

                      {item?.isCompany !== true && (
                        <Typography className="text-color-text-default typography-body-01">
                          {(() => {
                            let streetPart = item?.street || "";

                            if (item?.houseNumber?.trim()) {
                              streetPart += `, ${item.houseNumber}, `;
                            }
                            if (item?.buildingNumber?.trim()) {
                              streetPart += `${item.buildingNumber}, `;
                            }

                            if (item?.isCompany === true) {
                              const partsB = [
                                streetPart,
                                item?.city,
                                item?.postalCode,
                                item?.country,
                              ];
                              return partsB.filter(Boolean).join(", ");
                            } else {
                              const partsP = [
                                streetPart,
                                // item?.city,
                                // item?.postalCode,
                                // item?.country,
                              ];
                              return partsP.filter(Boolean).join(", ");
                            }
                          })()}
                        </Typography>
                      )}
                    </Box>

                    {isFirstAddressOnly ? (
                      <OGButton
                        size="small"
                        className="w-auto"
                        type="ghost"
                        //@ts-ignore
                        onClick={(e: React.MouseEvent) => {
                          // e.stopPropagation();
                          handleChangeAddress();
                        }}
                      >
                        {getLabel("change_address")}
                      </OGButton>
                    ) : (
                      <OGButton
                        size="small"
                        className="w-auto"
                        type="ghost"
                        //@ts-ignore
                        onClick={(e: React.MouseEvent) => {
                          // e.stopPropagation();
                          handleEditAddress(item);
                        }}
                      >
                        {getLabel("edit_address")}
                      </OGButton>
                    )}
                  </Box>

                  <Box className="flex w-full flex-col gap-[10px]">
                    <Typography
                      className={`${item?.isCompany === true && "ml-7"} text-color-text-muted typography-body-02`}
                    >
                      {(() => {
                        let streetPart = item?.street || "";

                        if (item?.houseNumber?.trim()) {
                          streetPart += ` ${item.houseNumber}`;
                        }

                        if (item?.buildingNumber?.trim()) {
                          streetPart += `${item.buildingNumber}`;
                        }

                        return [
                          // item?.isCompany !== true && streetPart,
                          item?.isCompany === true && item?.street,
                          item?.isCompany === true && item?.houseNumber,
                          item?.isCompany === true &&
                            item.buildingNumber &&
                            `${item.buildingNumber}`,
                          item?.city,
                          item?.postalCode,
                          item?.country,
                        ]
                          .filter(Boolean)
                          .join(", ");
                      })()}
                    </Typography>

                    {item?.phoneNumber && (
                      <Box
                        className={`${item?.isCompany === true && "ml-7"} flex flex-row items-center justify-start`}
                      >
                        <Typography className="text-color-text-muted typography-body-02">
                          {getLabel("phone")}:
                        </Typography>{" "}
                        <Typography className="ml-1 text-color-text-muted typography-body-02">
                          {item?.phoneNumber}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </OGRadioGroup>
      </Box>
      {showAllAddresses && (
        <Box className="flex flex-row items-center justify-between">
          <OGButton
            onClick={() => {
              setSelectedSavedBillingAddress(null);
              setModalType("add");
              setOpenedFrom("billing"); // Track that modal was opened from billing section
              // Set modalSaveType based on isBusiness to pre-select the correct tab in modal
              setModalSaveType(isBusiness ? "Business" : "Personal");
              openModal();
            }}
            type="outlined"
            size="small"
            className="w-auto gap-3 p-2"
            leftcomp={<Image src={plus} alt="Quick Search" width={18} height={18} />}
          >
            {getLabel("add_a_new_address")}
          </OGButton>
          <Box />
        </Box>
      )}
    </Box>
  );
};
