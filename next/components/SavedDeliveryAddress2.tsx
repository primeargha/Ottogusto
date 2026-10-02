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
import { OGRadioGroup, OGRadioInput } from "./og-components/OGRadioInput";
import { useEditAddressModalStore } from "@/stores/useEditAddressModalStore";
import Typography from "./og-components/Typography";

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

export const SavedDeliveryAddress2: React.FC<DeliveryaddressInputProps> = ({
  addresses,
  isSameBilling,
  setIsSamesavedBilling,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [maxScroll, setMaxScroll] = useState<number>(0);
  const {
    formMode,
    setFormMode,
    savedBillingAddresses,
    selectedSavedDeliveryAddress,
    setSelectedSavedDeliveryAddress,
    setSelectedSavedBillingAddress,
    isSameShipping,
    showAllDeliveryAddresses: showAllAddresses,
    setShowAllDeliveryAddresses: setShowAllAddresses,
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
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const { getLabel } = useBranding();

  const addressSchema = z.object({
    name: z.string().optional(),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, getLabel("Checkout_city_required")),
    state: z.string().optional(),
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
      if (selectedSavedDeliveryAddress) {
        const selectedAddr = addresses.find((addr) => addr.id === selectedSavedDeliveryAddress.id);
        return selectedAddr ? [selectedAddr] : [addresses[0]];
      }
      return [addresses[0]];
    }
  }, [addresses, showAllAddresses, selectedSavedDeliveryAddress]);

  const handleAddressSelect = (address: any) => {
    // In View 1 (single card view), clicking shouldn't do anything - only "Change Address" button should
    // In View 2 (all addresses view), clicking selects the address and switches to View 1
    if (!showAllAddresses) {
      // View 1: Don't do anything on card click, only "Change Address" button toggles view
      return;
    }

    // View 2: Select the clicked address and switch to View 1
    setSelectedSavedDeliveryAddress(address);
    if (isSameShipping) {
      // When "delivery same as billing" is checked, also update billing to match
      setSelectedSavedBillingAddress(address);
    }
    setShowAllAddresses(false);

    // Collapse the form when selecting a saved address
    setFormMode({
      delivery: "hidden",
      billing:
        formMode.billing === "add" || formMode.billing === "edit" ? "hidden" : formMode.billing,
    });
  };

  const handleEditAddress = (address: any) => {
    setSelectedAddress(address);
    setModalType("edit");
    setOpenedFrom("delivery"); // Track that modal was opened from delivery section
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
    <Box className="flex h-auto flex-col gap-6">
      <Box className="flex h-auto w-full flex-col gap-2">
        {/* Radio Address List */}
        <OGRadioGroup
          value={selectedSavedDeliveryAddress?.id || ""}
          className="flex w-full flex-col gap-0"
        >
          {visibleAddresses?.map((item) => {
            const isSelected = selectedSavedDeliveryAddress?.id === item.id;
            const isFirstAddressOnly = !showAllAddresses;
            const truncate = (text?: string, maxLength = 38) => {
              if (!text) return "";
              return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
            };
            return (
              // @ts-ignore
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
                        <OGRadioInput value={item.id} label={truncate(item.name)} />
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
                              streetPart += `Bus-${item.buildingNumber}, `;
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
                        // @ts-ignore
                        onClick={(e: any) => {
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
                        // @ts-ignore
                        onClick={(e: any) => {
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
                          streetPart += ` Bus-${item.buildingNumber}`;
                        }

                        return [
                          // item?.isCompany !== true && streetPart,
                          item?.city,
                          item?.postalCode,
                          item?.country,
                        ]
                          .filter(Boolean)
                          .join(", ");
                      })()}
                    </Typography>
                  </Box>

                  {item?.phoneNumber && (
                    <Box
                      className={`${item?.isCompany === true && "ml-7"} flex flex-row items-center justify-start`}
                    >
                      <Typography className="text-color-text-muted typography-body-02">
                        {getLabel("phone")}:
                      </Typography>{" "}
                      <Typography className="ml-1 text-color-text-muted typography-body-02">
                        {item.phoneNumber}
                      </Typography>
                    </Box>
                  )}
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
              // Deselect any saved addresses when adding new address
              setSelectedSavedDeliveryAddress(null);
              if (isSameShipping) {
                // When "delivery same as billing" is checked, also clear billing
                setSelectedSavedBillingAddress(null);
              }
              setModalType("add");
              setOpenedFrom("delivery"); // Track that modal was opened from delivery section
              // Delivery addresses default to Personal mode
              setModalSaveType("Personal");
              openModal();
            }}
            type="outlined"
            size="small"
            className="w-auto gap-3 p-2"
            leftcomp={<Image src={plus} alt="Quick Search" width={20} height={20} />}
          >
            {getLabel("add_a_new_address")}
          </OGButton>
          <Box />
        </Box>
      )}
    </Box>
  );
};
