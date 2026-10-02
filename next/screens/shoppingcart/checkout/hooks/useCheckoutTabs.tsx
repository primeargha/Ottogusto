"use client";

import { useEffect } from "react";
import { useTabsStore } from "@/stores/useTabsStore";
import { Box } from "@/components/ui/box";
import { ClickandCollectInput } from "@/components/ClickandCollectInput";
import { HomeDeliveryTabContent } from "../components/HomeDeliveryTabContent";
import { WarehouseTabContent } from "../components/WarehouseTabContent";
import type { VincompatibilitycheckProps } from "../Vincompatibilitycheck";
import truckimg from "../../../../public/assets/truck.svg";
import blacktruck from "../../../../public/assets/blacktruck.svg";
import packagebox from "../../../../public/assets/packagebox.svg";
import whitepackagebox from "../../../../public/assets/whitepackagebox.svg";
import warehouse from "../../../../public/assets/warehouse.svg";
import whitewarehouse from "../../../../public/assets/whitewarehouse.svg";

export interface UseCheckoutTabsParams {
  setTabs: (tabs: any[]) => void;
  getLabel: (key: string) => string;
  typoClass: string;
  isAuthenticated: boolean;
  isBusiness: boolean;
  setShowBusinessLoginModal: (value: boolean) => void;
  handleAccountType: (type: "personal" | "business") => void;
  formRefs: any;
  isSameBilling: boolean;
  setIsSameBilling: (value: boolean) => void;
  setProfileData: (data: any) => void;
  handleBillingAddressSaved: () => void;
  handleDeliveryAddressSaved: () => void;
  savedBillingAddresses: any[];
  savedShippingAddresses: any[];
  isSameShipping: boolean;
  setIsSameShipping: (value: boolean) => void;
  selectedSavedBillingAddress: any;
  setSelectedSavedDeliveryAddress: (address: any) => void;
  vinCheckProps: VincompatibilitycheckProps;
  buttonRenderKey: number;
  isConfirmDisabled: boolean;
  handleSaveAddress: () => void | Promise<void>;
  isPaymentPending: boolean;
  isSavingAddresses: boolean;
  vinerror: boolean;
  customloader: boolean;
  isCheckoutContentLoading: boolean;
}

export function useCheckoutTabs(params: UseCheckoutTabsParams) {
  const { setTabs, ...rest } = params;

  useEffect(() => {
    const {
      getLabel,
      typoClass,
      isAuthenticated,
      isBusiness,
      setShowBusinessLoginModal,
      handleAccountType,
      formRefs,
      isSameBilling,
      setIsSameBilling,
      setProfileData,
      handleBillingAddressSaved,
      handleDeliveryAddressSaved,
      savedBillingAddresses,
      savedShippingAddresses,
      isSameShipping,
      setIsSameShipping,
      selectedSavedBillingAddress,
      setSelectedSavedDeliveryAddress,
      vinCheckProps,
      buttonRenderKey,
      isConfirmDisabled,
      handleSaveAddress,
      isPaymentPending,
      isSavingAddresses,
      vinerror,
      customloader,
      isCheckoutContentLoading,
    } = rest;

    setTabs([
      {
        id: "homeDelivery",
        label: getLabel("Checkout_home_delivery"),
        icon: {
          active: truckimg,
          inactive: blacktruck,
        },
        content: (
          <HomeDeliveryTabContent
            getLabel={getLabel}
            typoClass={typoClass}
            isAuthenticated={isAuthenticated}
            isBusiness={isBusiness}
            setShowBusinessLoginModal={setShowBusinessLoginModal}
            onAccountType={handleAccountType}
            formRefs={formRefs}
            isSameBilling={isSameBilling}
            setIsSameBilling={setIsSameBilling}
            setProfileData={setProfileData}
            onBillingAddressSaved={handleBillingAddressSaved}
            onDeliveryAddressSaved={handleDeliveryAddressSaved}
            savedBillingAddresses={savedBillingAddresses ?? []}
            savedShippingAddresses={savedShippingAddresses ?? []}
            isSameShipping={isSameShipping}
            setIsSameShipping={setIsSameShipping}
            selectedSavedBillingAddress={selectedSavedBillingAddress}
            setSelectedSavedDeliveryAddress={setSelectedSavedDeliveryAddress}
            vinCheckProps={vinCheckProps}
            buttonRenderKey={buttonRenderKey}
            isConfirmDisabled={isConfirmDisabled}
            onOrderAndPay={handleSaveAddress}
            isPaymentPending={isPaymentPending}
            isSavingAddresses={isSavingAddresses}
            vinError={vinerror}
            customLoader={customloader}
            isLoading={isCheckoutContentLoading}
          />
        ),
      },
      {
        id: "clickAndCollect",
        label: getLabel("Checkout_click_and_collect"),
        icon: {
          active: whitepackagebox,
          inactive: packagebox,
        },
        content: (
          <>
            <Box className="flex h-auto flex-col gap-space-lg rounded-[4px] border border-color-border-default base:p-space-sm gtsm:px-space-xl gtsm:py-space-lg">
              <ClickandCollectInput />
            </Box>
          </>
        ),
      },
      {
        id: "warehousePickup",
        label: getLabel("Checkout_warehouse_pickup"),
        icon: {
          active: whitewarehouse,
          inactive: warehouse,
        },
        content: (
          <WarehouseTabContent
            getLabel={getLabel}
            typoClass={typoClass}
            isAuthenticated={isAuthenticated}
            isBusiness={isBusiness}
            setShowBusinessLoginModal={setShowBusinessLoginModal}
            onAccountType={handleAccountType}
            formRefs={formRefs}
            isSameBilling={isSameBilling}
            setIsSameBilling={setIsSameBilling}
            setProfileData={setProfileData}
            onBillingAddressSaved={handleBillingAddressSaved}
            savedBillingAddresses={savedBillingAddresses ?? []}
            vinCheckProps={vinCheckProps}
            buttonRenderKey={buttonRenderKey}
            isConfirmDisabled={isConfirmDisabled}
            onOrderAndPay={handleSaveAddress}
            isPaymentPending={isPaymentPending}
            isSavingAddresses={isSavingAddresses}
            vinError={vinerror}
            isLoading={isCheckoutContentLoading}
          />
        ),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setTabs,
    rest.getLabel,
    rest.typoClass,
    rest.isAuthenticated,
    rest.isBusiness,
    rest.formRefs,
    rest.isSameBilling,
    rest.savedBillingAddresses,
    rest.savedShippingAddresses,
    rest.isSameShipping,
    rest.selectedSavedBillingAddress,
    rest.buttonRenderKey,
    rest.isConfirmDisabled,
    rest.isPaymentPending,
    rest.isSavingAddresses,
    rest.vinerror,
    rest.customloader,
    rest.isCheckoutContentLoading,
    rest.vinCheckProps.vinNumber,
    rest.vinCheckProps.isValidVin,
    rest.vinCheckProps.isInputLocked,
    rest.vinCheckProps.isVinCheckPending,
    rest.vinCheckProps.phase,
    rest.vinCheckProps.uiCase,
    rest.vinCheckProps.result,
    rest.vinCheckProps.cartItems,
  ]);
}
