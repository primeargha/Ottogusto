"use client";
import React, { useEffect, useRef, useState } from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import ModifyAddressIcon from "@/components/icons/ModifyAddressIcon";
import { useEditAddressModalStore } from "@/stores/useEditAddressModalStore";
import { loggedInUserOGSearchIcons } from "@/constants";
import Image from "next/image";
import { Pressable } from "@/components/ui/pressable";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/stores/useModalStore";
import { useDeleteAddressMutation } from "@/hooks/address";
import DeleteUserIcon from "@/components/icons/DeleteUserIcon";
import Modal from "@/components/Modal";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/services/authService";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useBranding } from "@/contexts/BrandingContext";
import { OGButton } from "@/components/og-components/OGButton";

interface AddressBoxProps {
  address: any;
  isLastBox?: boolean;
  isFirstBox?: boolean;
  allowDelete?: boolean;
}

const MenuItem = ({
  id,
  item,
  onClose,
  handleEditAddress,
  handleDeleteAddress,
  isLastBox,
  isFirstBox,
  allowDelete,
}: {
  id: number;
  item: any;
  onClose: () => void;
  handleEditAddress: () => void;
  handleDeleteAddress: () => void;
  isLastBox?: boolean;
  isFirstBox?: boolean;
  allowDelete?: boolean;
}) => {
  const router = useRouter();
  const { getLabel } = useBranding();
  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("bottom");
  // Check if the content is scrollable and adjust menu position accordingly
  React.useEffect(() => {
    const container = document.querySelector(".custom-scrollbar");
    if (container) {
      const isScrollable = container.scrollHeight > container.clientHeight;
      if (isLastBox && !isScrollable) {
        setMenuPosition("bottom");
      } else if (isLastBox && isScrollable) {
        setMenuPosition("top");
      } else {
        setMenuPosition("bottom");
      }
    }
  }, [isLastBox]);

  return (
    <Box
      className={`absolute ${
        menuPosition === "top" ? "-top-24 right-0" : "right-0 top-12"
      } z-[200] inline-flex flex-col rounded-md bg-white shadow-md`}
    >
      <Pressable
        onPress={handleEditAddress}
        className="flex items-start rounded-t-md hover:bg-[--hover-green-color] base:min-w-[170px] gtsm:min-w-[200px]"
      >
        <Box className="flex flex-row items-center gap-2 whitespace-nowrap px-[15px] py-[14px]">
          <Image
            src="/assets/profile/modify-address-icon.svg"
            height={20}
            width={20}
            alt="modify address"
          />
          <Box className="whitespace-nowrap text-color-text-body body-regular-sm">
            {getLabel("Modify_address")}
          </Box>
        </Box>
      </Pressable>

      <Pressable
        onPress={() => {
          if (!allowDelete) return;
          handleDeleteAddress();
          onClose();
        }}
        className="round flex items-start rounded-b-md hover:bg-[--hover-green-color] base:min-w-[170px] gtsm:min-w-[200px]"
      >
        <Box
          className={`${
            allowDelete ? "" : "cursor-not-allowed opacity-50"
          } flex flex-row items-center gap-2 whitespace-nowrap px-[15px] py-[14px]`}
        >
          <Image
            src="/assets/profile/delete-address-icon.svg"
            height={20}
            width={20}
            alt="delete"
          />
          <Box className="whitespace-nowrap text-color-text-body body-regular-sm">
            {getLabel("delete_address")}
          </Box>
        </Box>
      </Pressable>
    </Box>
  );
};

export default function AddressBox({
  address,
  isLastBox,
  isFirstBox,
  allowDelete,
}: AddressBoxProps) {
  const {
    setSelectedAddress,
    openModal: openEditModal,
    setModalType,
    selectedAddress,
    setModalSaveType,
  } = useEditAddressModalStore();
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const { isOpen, openModal, closeModal } = useModalStore();
  const { setAddresses } = useAuthStore();
  const queryClient = useQueryClient();
  const { getLabel } = useBranding();
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => {
    setOpenMenu(false);
  });
  // Add delete address mutation
  const { mutate: deleteAddress, isPending: isDeletingAddress } = useDeleteAddressMutation({
    onSuccess: async (data) => {
      const profile = await getProfile({});
      //@ts-ignore
      setAddresses(profile?.data?.addresses);
      closeModal();
      // You might want to refresh the addresses list or show a success toast here
    },
    onError: (error) => {
      console.error("Error deleting address:", error);
    },
  });

  useEffect(() => {
    if (!openMenu) return;

    const handleScroll = () => {
      setOpenMenu(false);
    };

    // 1️⃣ Window scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 2️⃣ Optional: custom scroll container
    const container = document.querySelector(".custom-scrollbar");
    container?.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [openMenu]);

  const handleEditAddress = () => {
    setSelectedAddress(address);
    setModalType("edit");
    openEditModal();
    setOpenMenu(false);
    if (!address?.isCompany) {
      setModalSaveType("Personal");
    } else setModalSaveType("Business");
  };

  const handleDeleteAddress = () => {
    // return;
    setSelectedAddress(address);
    openModal();
    setOpenMenu(false);
  };

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };
  return (
    <Box className="relative mb-3 h-auto rounded-[6px] border border-color-border-default bg-color-background-default p-[24px]">
      <Box className="flex h-full flex-row justify-between">
        <Box className="relative flex w-auto flex-col space-y-3">
          <Box className="">
            <Text className="text-color-text-body body-bold-md">
              {address?.name ? address?.name : ""}
            </Text>
          </Box>
          {address?.isCompany && (
            <Box className="flex flex-row flex-wrap gap-2">
              <Text className="text-color-text-body body-bold-md">
                {getLabel("common_vatLabel_suffix")}:
              </Text>
              <Text className="text-color-text-body body-medium-md">
                {address?.vatNumber ? address?.vatNumber : ""}
              </Text>
            </Box>
          )}

          <Box className="flex flex-row flex-wrap gap-2">
            <Text className="text-color-text-body body-bold-md">{getLabel("address")}:</Text>
            {(address?.street || address?.city || address?.country) && (
              <Text className="text-color-text-body body-medium-md">
                {(() => {
                  let streetPart = address?.street || "";
                  if (address?.houseNumber?.trim()) {
                    streetPart += ` ${address.houseNumber}`;
                  }
                  if (address?.buildingNumber?.trim()) {
                    streetPart += ` ${address.buildingNumber}`;
                  }
                  const parts = [
                    streetPart,
                    address?.city || "",
                    address?.postalCode || "",
                    address?.country || "",
                  ];
                  return parts.filter((part) => part).join(", ");
                })()}
              </Text>
            )}
          </Box>
          <Box className="flex flex-row flex-wrap gap-2">
            <Text className="text-color-text-body body-bold-md">{getLabel("phone")}:</Text>
            {address?.phoneNumber && (
              <Text className="text-color-text-body body-medium-md">{address?.phoneNumber}</Text>
            )}
          </Box>
          {!address?.isCompany && (address?.isDefaultBilling || address?.isDefaultShipping) ? (
            <Box className="flex flex-row gap-2">
              {address?.isDefaultBilling && (
                <Box className="flex h-auto items-center justify-center bg-color-hover-action-primary p-3">
                  <Text className="text-color-text-body body-regular-sm">
                    {getLabel("billing")}
                  </Text>
                </Box>
              )}
              {address?.isDefaultShipping && (
                <Box className="flex h-auto items-center justify-center bg-color-hover-action-primary p-3">
                  <Text className="text-color-text-body body-regular-sm">
                    {getLabel("shipping")}
                  </Text>
                </Box>
              )}
            </Box>
          ) : null}
          {address?.isCompany && (
            <Box className="inline-flex h-auto max-w-[100px] items-center justify-center bg-color-hover-action-primary p-3">
              <Text className="text-color-text-body body-regular-sm">{getLabel("business")}</Text>
            </Box>
          )}
        </Box>

        {/* Edit button */}
        {/* menu -icon */}
        {/*  @ts-ignore */}
        <Box ref={menuRef} className="relative flex min-w-[46px] flex-row justify-center">
          <Pressable
            onPress={toggleMenu}
            className="h-[40px] w-[40px] flex-row items-center justify-center rounded border border-color-primary-main p-2 hover:bg-color-background-l3 md:h-[44px] md:w-[44px]"
          >
            <Image
              src={loggedInUserOGSearchIcons.moreInfo}
              height={24}
              width={24}
              alt="more info"
            />
          </Pressable>
          {openMenu && (
            <MenuItem
              id={address.id}
              item={address}
              onClose={() => setOpenMenu(false)}
              handleEditAddress={handleEditAddress}
              handleDeleteAddress={handleDeleteAddress}
              isLastBox={isLastBox ?? false}
              isFirstBox={isFirstBox ?? false}
              allowDelete={allowDelete ?? false}
            />
          )}
        </Box>
      </Box>

      {/* Delete Address Confirmation Modal */}
      <Modal
        width="max-w-md"
        containerClassName="z-[1000] modal-backdrop"
        modalClassName="rounded-[8px] bg-color-background-l2 w-full gtsm:min-w-[600px] gtlg:max-w-[600px] h-auto"
        showCloseButton={false}
        contentClassName="px-6 py-6"
        footerClassName="bg-color-background-l2 pb-4 gtsm:pb-0"
        footerComponent={
          <Box className="flex w-full flex-row justify-center gap-6 px-6 pb-6">
            <OGButton
              size="medium"
              type="outlined"
              onClick={closeModal}
              disabled={isDeletingAddress}
            >
              {getLabel("cancel")}
            </OGButton>

            <OGButton
              size="medium"
              type="error"
              onClick={() => {
                // Handle address deletion logic here
                if (selectedAddress?.id) {
                  deleteAddress(selectedAddress?.id);
                }
              }}
              disabled={isDeletingAddress}
            >
              {getLabel("delete")}
            </OGButton>
          </Box>
        }
      >
        <Box className="flex flex-col items-center justify-center gap-6">
          <Box className="flex flex-row items-center justify-center rounded-[8px] bg-[--System-Colors-Error-Extra-Light] p-[12px]">
            <Image src={`/assets/profile/alert-diamond.svg`} height={62} width={62} alt="delete" />
          </Box>

          <Text className="text-center text-color-text-body body-bold-md">
            {getLabel("delete_address_confirmation")}
          </Text>

          <Text className="text-center text-color-text-body body-regular-sm">
            {getLabel("delete_address_warning")}
          </Text>
        </Box>
      </Modal>
    </Box>
  );
}
