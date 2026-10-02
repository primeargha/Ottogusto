"use client";

import BackIcon from "@/components/icons/BackIcon";
import LocationIcon from "@/components/icons/LocationIcon";
import ModifyAddressIcon from "@/components/icons/ModifyAddressIcon";
import SavedAddressIcon from "@/components/icons/SavedAddressIcon";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CustomerAddress } from "@/type";
import type { Address } from "@/types/profile";
import { useEditAddressModalStore } from "@/stores/useEditAddressModalStore";
import { useRouter } from "next/navigation";
import AddressBox from "./AddressBox";
import { useEffect, useState } from "react";
import { useToast, Toast, ToastDescription } from "@/components/ui/toast";
import { useBranding } from "@/contexts/BrandingContext";
import { useGetProfileInformationQuery } from "@/hooks/profile";
import { Spinner } from "@/components/ui/spinner";
import Productnavigation from "../productdetails/productnavigation";
import { OGButton } from "@/components/og-components/OGButton";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { useMedia } from "@/hooks/useMedia";

export default function SavedAddresses() {
  const router = useRouter();
  const { getLabel } = useBranding();
  const { authUser } = useAuthStore();
  const addresses: (Address | CustomerAddress)[] | null | undefined =
    authUser && "addresses" in authUser ? (authUser.addresses ?? undefined) : undefined;
  const { openModal, setModalType, hasDuplicateInSavedAddresses, setHasDuplicateInSavedAddresses } =
    useEditAddressModalStore();
  const { isPending } = useGetProfileInformationQuery();
  const [toastId, setToastId] = useState(0);
  const isMobile = useMedia("(max-width: 639px)");
  const toast = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    if (hasDuplicateInSavedAddresses) {
      setShowDuplicateModal(true);
      setHasDuplicateInSavedAddresses(false);
    }
  }, [hasDuplicateInSavedAddresses, setHasDuplicateInSavedAddresses]);

  // Add this function to handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };

  // Add a success toast function
  const showSuccessToast = (message: string) => {
    const newId = Math.random();
    setToastId(newId);

    // Check if window exists and set placement based on window width
    const placement =
      typeof window !== "undefined" && window.innerWidth > 992 ? "top right" : "top";

    toast.show({
      id: String(newId),
      placement: placement,
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            nativeID={uniqueToastId}
            className="h-[44px] w-[308px] rounded-[4px] bg-[--light-blue] 2xl:top-20"
          >
            {/* @ts-ignore */}
            <ToastDescription className="font-Overpass text-[16px] font-normal leading-[18px] text-[--Text-White]">
              {message}
            </ToastDescription>
          </Toast>
        );
      },
    });
  };

  if (isPending) {
    return (
      <Box className="flex min-h-[80vh] items-center justify-center">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box
      className={`relative h-auto w-full pb-[40px] base:mt-5 base:pl-3 base:pr-3 gtsm:pr-3 md:pl-0 gtlg:mt-[94px] between-640-767:mt-[78px] between-768-1023:mt-[94px] between-728-767:mt-[78px]`}
    >
      {/* Back button - only visible on mobile  */}
      <Box className="flex w-full items-start justify-center">
        <Box
          //@ts-ignore
          onPress={() => router.back()}
          className="mb-4 flex flex-row items-center bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent gtsm:hidden"
        >
          <Productnavigation />
          <Text className="ml-1 mt-[2px] text-color-text-body body-medium-md">
            {getLabel("back")}
          </Text>
        </Box>
      </Box>
      {/* sprint-21 related changes shadow-[0px_8px_26px_10px_rgba(0,0,0,0.10)] */}
      <Card className="h-full max-w-[600px] items-center overflow-hidden rounded-[6px] border border-color-border-default bg-color-background-default p-0 lg:max-w-full">
        <Box className="h-auto w-full px-5 py-6">
          <Box className="flex h-auto w-full flex-row items-center justify-between">
            <Box className="flex w-auto flex-col">
              <Box>
                <Text className="break-words text-color-text-body body-bold-lg">
                  {getLabel("saved_addresses")}
                </Text>
                <Text className="break-words pb-[12px] text-color-text-body body-regular-sm">
                  {getLabel("manage_addresses")}
                </Text>
              </Box>
            </Box>

            <OGButton
              size="medium"
              leftcomp={<LocationIcon height={16} width={16} color="#fff" />}
              onClick={() => {
                setModalType("add");
                openModal();
              }}
              className="gap-2"
            >
              {getLabel("add_new_address")}
            </OGButton>
          </Box>
        </Box>

        {/* Scrollable addresses section */}

        <Box className="custom-scrollbar relative h-full w-full overflow-y-auto">
          {/* Add onScroll handler to the scrollable container */}
          <Box
            className="custom-scrollbar h-full w-full overflow-y-auto border-t base:px-5 gtlg:px-6"
            // @ts-ignore
            onScroll={handleScroll}
          >
            {/* <Box className="mx-auto mt-6 custom-scrollbar h-full w-full overflow-y-auto"> */}
            <div
              id="scrollableDiv"
              className={`h-full w-full overflow-y-auto border-t ${
                isMobile
                  ? addresses?.length && addresses.length >= 2
                    ? "pb-[160px]"
                    : "pb-[150px]"
                  : "pb-[150px]"
              } pt-6 scrollbar-hide`}
            >
              {!addresses || addresses.length === 0 ? (
                <Box className="flex flex-col items-center justify-center rounded-md border border-dashed border-[--neutral-chrome-801] p-6">
                  <Text className="text-center font-Overpass text-[18px] font-medium text-color-text-body">
                    {getLabel("no_saved_addresses")}
                  </Text>
                </Box>
              ) : (
                /* Replace the hardcoded boxes with a mapped array */
                addresses.map((address, index, array) => {
                  const multipleAddresses = array.length > 1;
                  return (
                    <AddressBox
                      key={address?.id}
                      address={address}
                      isLastBox={index === array.length - 1}
                      isFirstBox={index === 0}
                      allowDelete={multipleAddresses}
                    />
                  );
                })
              )}
            </div>

            {/* </Box> */}
          </Box>
        </Box>
      </Card>

      {showDuplicateModal && (
        <Box className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Box className="w-full max-w-xl overflow-hidden rounded-[8px] bg-color-background-default shadow-xl">
            <Box className="border-b border-color-border-default px-6 py-4">
              <Text className="text-start text-color-text-body body-bold-lg">
                {getLabel("address_already_exists_title") || "Address already exists"}
              </Text>
            </Box>
            <Box className="px-6 py-8">
              <Text className="body-body-01 text-start text-color-text-muted">
                {getLabel("address_already_exists_message") ||
                  "This address is already saved in your profile. Please use the existing address or edit it instead of creating a duplicate."}
              </Text>
            </Box>
            <Box className="flex items-end gap-3 border-t border-color-border-default bg-color-background-default p-6">
              <Box className="w-24">
                <OGButton
                  type="primary"
                  size="small"
                  className="w-auto p-4 button-button-01"
                  onClick={() => setShowDuplicateModal(false)}
                >
                  {getLabel("ok") || "OK"}
                </OGButton>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
