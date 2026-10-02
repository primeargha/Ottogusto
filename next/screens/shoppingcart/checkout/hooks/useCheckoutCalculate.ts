"use client";

import { useEffect, useRef, useState } from "react";
import { useCalculatePriceMutation } from "@/hooks/cart";
import { useCartStore } from "@/stores/useCartStore";
import { useTabsStore } from "@/stores/useTabsStore";
import { consumeSharedOrderCalculateSkip } from "@/utils/sharedOrderFromUrl";
import { buildCalculatePayload } from "../utils/calculatePayload";

interface UseCheckoutCalculateParams {
  profileData: { data?: { addresses?: unknown[] } } | null;
  addresschanged: boolean;
  setaddresschanged: (value: boolean) => void;
  isAuthenticated: boolean;
  /** Block Calculate while ?orderId= shared-cart hydration is in progress. */
  pauseCalculate?: boolean;
}

interface CalculatePayload {
  activeTab: string;
  isAuthenticated: boolean;
  hasSavedAddresses: boolean;
  guestBillingFormData: unknown;
  guestDeliveryFormData: unknown;
  selectedSavedBillingAddress: unknown;
  selectedSavedDeliveryAddress: unknown;
  isSameShipping: boolean;
  warehouseAddress: unknown;
  cartid: string | null;
  items: unknown[];
}

interface CalculateResponse {
  data: {
    items: Array<{
      id: string;
      unitPriceIncVat: number;
      totalPriceIncVat: number;
      type: string;
      vatPercentage: number;
    }>;
    totalPriceIncVat: number;
    shippingFee: number;
    shippingMethod?: string;
    shipping?: unknown;
  };
}

interface CartItem {
  id: string;
  price: number;
  totalPriceIncVat: number;
  [key: string]: unknown;
}

export function useCheckoutCalculate({
  profileData,
  addresschanged,
  setaddresschanged,
  isAuthenticated,
  pauseCalculate = false,
}: UseCheckoutCalculateParams) {
  const shouldCallCalculateAPIRef = useRef(false);
  const [calculateTrigger, setCalculateTrigger] = useState(0);
  const calculateSelectionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialCalculateDoneRef = useRef(false);
  const previousActiveTab = useRef("");
  const skipNextAddressSelectionTriggerRef = useRef(false);
  const lastTriggerHandledRef = useRef<number>(-1);
  const prevIsAuthenticatedRef = useRef<boolean>(false);
  const lastGuestCalculateCalledRef = useRef(false);

  const activeTab = useTabsStore((state) => state.activeTab);
  const {
    cartid,
    cartitems: items,
    savedBillingAddresses,
    selectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    guestBillingFormData,
    guestDeliveryFormData,
    isSameShipping,
    warehouseAddress,
    setdepositfee,
    setupdatecart,
    setTotalPrice,
    setShippingFee,
    setVatPercentage,
    setShippingMethod,
    setcheckoutpending,
    setSelectedSavedDeliveryAddress,
    setWarehouseAddress,
    setStandardDeliveryShippingFee,
  } = useCartStore();

  const { mutate: mutateCalculate, isPending: isSavingCalculate } = useCalculatePriceMutation({
    //@ts-ignore
    onSuccess: async (data: CalculateResponse) => {
      const currentItems = useCartStore.getState().cartitems as CartItem[] | never[];
      const updatedItems = currentItems?.map((item) => {
        const matchingItem = data.data.items.find((apiItem) => apiItem.id === item.id);
        return {
          ...item,
          price: matchingItem ? matchingItem.unitPriceIncVat : item.price,
          totalPriceIncVat: matchingItem?.totalPriceIncVat ?? item.totalPriceIncVat,
        };
      });
      const deposititems = data.data.items.filter((item) => item.type === "Deposit");
      const totaldeposit = deposititems.reduce((acc, item) => acc + item.totalPriceIncVat, 0);
      setdepositfee(totaldeposit);
      setupdatecart(updatedItems);
      setTotalPrice(data.data.totalPriceIncVat);
      setShippingFee(data.data.shippingFee);
      setVatPercentage(Number(data.data.items?.[0]?.vatPercentage) ?? 0);
      setShippingMethod(data.data.shippingMethod ?? "");
      setcheckoutpending(true);
      if (data?.data?.shippingMethod === "PICKUP") {
        const warehouseAddr = data?.data?.shipping
          ? { ...data.data.shipping, shippingMethod: "PICKUP" as const }
          : {
              name: "Tyunder Warehouse",
              street: "Rue d'Ecosse 12",
              houseNumber: "bte 12",
              city: "Saint-Gilles",
              postalCode: "1060",
              country: "BE",
              state: "",
              phoneNumber: "",
              shippingMethod: "PICKUP" as const,
            };
        setSelectedSavedDeliveryAddress(warehouseAddr as any);
        setWarehouseAddress(warehouseAddr as any);
        // @ts-ignore
      } else if (!data?.shippingMethod) {
        setStandardDeliveryShippingFee(data.data.shippingFee);
      }
    },
    onError: () => {},
  });

  const hasSavedAddresses = (savedBillingAddresses?.length ?? 0) > 0;

  // When guest logs in, reset so Initial effect can run again for logged-in-with-addresses
  useEffect(() => {
    const wasGuest = prevIsAuthenticatedRef.current === false;
    if (isAuthenticated && wasGuest) {
      initialCalculateDoneRef.current = false;
      lastGuestCalculateCalledRef.current = false;
    }
    prevIsAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Initial Calculate trigger
  useEffect(() => {
    if (pauseCalculate) return;
    if (cartid && consumeSharedOrderCalculateSkip(cartid)) {
      initialCalculateDoneRef.current = true;
      return;
    }
    if (initialCalculateDoneRef.current) return;
    if (!items?.length) return;
    if (!isAuthenticated) {
      initialCalculateDoneRef.current = true;
      shouldCallCalculateAPIRef.current = true;
      setCalculateTrigger((t) => t + 1);
      return;
    }
    if (!profileData?.data) return;
    const hasAddresses = (profileData.data.addresses?.length ?? 0) > 0;
    if (!hasAddresses) {
      initialCalculateDoneRef.current = true;
      shouldCallCalculateAPIRef.current = true;
      setCalculateTrigger((t) => t + 1);
    } else {
      initialCalculateDoneRef.current = true;
      shouldCallCalculateAPIRef.current = true;
      setCalculateTrigger((t) => t + 1);
      skipNextAddressSelectionTriggerRef.current = true;
    }
  }, [
    isAuthenticated,
    profileData?.data,
    profileData?.data?.addresses?.length,
    cartid,
    items,
    pauseCalculate,
  ]);

  // When addresschanged is set
  useEffect(() => {
    if (pauseCalculate) return;
    if (!addresschanged) return;
    shouldCallCalculateAPIRef.current = true;
    setCalculateTrigger((t) => t + 1);
  }, [addresschanged, pauseCalculate]);

  // When logged-in user selects or changes saved address (debounced)
  useEffect(() => {
    if (pauseCalculate) return;
    if (!hasSavedAddresses) return;
    if (!selectedSavedBillingAddress && !selectedSavedDeliveryAddress) return;
    if (skipNextAddressSelectionTriggerRef.current) {
      skipNextAddressSelectionTriggerRef.current = false;
      return;
    }
    if (calculateSelectionDebounceRef.current) {
      clearTimeout(calculateSelectionDebounceRef.current);
      calculateSelectionDebounceRef.current = null;
    }
    calculateSelectionDebounceRef.current = setTimeout(() => {
      shouldCallCalculateAPIRef.current = true;
      setCalculateTrigger((t) => t + 1);
      calculateSelectionDebounceRef.current = null;
    }, 80);
    return () => {
      if (calculateSelectionDebounceRef.current) {
        clearTimeout(calculateSelectionDebounceRef.current);
        calculateSelectionDebounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSavedAddresses, selectedSavedBillingAddress?.id, selectedSavedDeliveryAddress?.id]);

  // Single Calculate API effect (only call once per trigger value; avoids duplicate from re-runs or Strict Mode)
  useEffect(() => {
    if (pauseCalculate) return;
    if (calculateTrigger === lastTriggerHandledRef.current) return;
    if (!shouldCallCalculateAPIRef.current) return;
    if (!items?.length) return;
    const payload = buildCalculatePayload({
      activeTab,
      isAuthenticated,
      hasSavedAddresses,
      guestBillingFormData,
      guestDeliveryFormData,
      selectedSavedBillingAddress,
      selectedSavedDeliveryAddress,
      isSameShipping,
      warehouseAddress,
      cartid: cartid ?? null,
      items: items as unknown as Array<{ id: string; quantity: number }>,
    }) as unknown as CalculatePayload;

    const isGuestPayload =
      !isAuthenticated &&
      (payload as { billing?: null; shipping?: null }).billing === null &&
      (payload as { billing?: null; shipping?: null }).shipping === null;
    if (isGuestPayload && lastGuestCalculateCalledRef.current) {
      lastTriggerHandledRef.current = calculateTrigger;
      shouldCallCalculateAPIRef.current = false;
      setaddresschanged(false);
    } else {
      lastTriggerHandledRef.current = calculateTrigger;
      // @ts-ignore
      mutateCalculate(payload);
      shouldCallCalculateAPIRef.current = false;
      setaddresschanged(false);
      if (isGuestPayload) {
        lastGuestCalculateCalledRef.current = true;
      } else {
        lastGuestCalculateCalledRef.current = false;
      }
    }
  }, [
    calculateTrigger,
    activeTab,
    isAuthenticated,
    savedBillingAddresses?.length,
    guestBillingFormData,
    guestDeliveryFormData,
    selectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    isSameShipping,
    warehouseAddress,
    cartid,
    items,
    mutateCalculate,
    setaddresschanged,
    hasSavedAddresses,
    pauseCalculate,
  ]);

  // Handle delivery method tab changes
  useEffect(() => {
    if (pauseCalculate) return;
    if (!activeTab || previousActiveTab.current === activeTab) return;
    const isWarehousePickup = activeTab === "warehousePickup";
    const wasWarehousePickup = previousActiveTab.current === "warehousePickup";
    const isFirstRender = previousActiveTab.current === "";
    previousActiveTab.current = activeTab;
    if (isFirstRender) {
      if (activeTab === "warehousePickup") {
        shouldCallCalculateAPIRef.current = true;
        setCalculateTrigger((t) => t + 1);
      }
      return;
    }
    if (isWarehousePickup === wasWarehousePickup) return;

    skipNextAddressSelectionTriggerRef.current = true;
    if (isWarehousePickup) {
      setWarehouseAddress(null);
    } else {
      setWarehouseAddress(null);
      if (useCartStore.getState().selectedSavedDeliveryAddress?.shippingMethod === "PICKUP") {
        setSelectedSavedDeliveryAddress(null);
        if (selectedSavedBillingAddress && isSameShipping) {
          setSelectedSavedDeliveryAddress(selectedSavedBillingAddress);
        }
      }
    }
    shouldCallCalculateAPIRef.current = true;
    setCalculateTrigger((t) => t + 1);
  }, [
    activeTab,
    isAuthenticated,
    selectedSavedBillingAddress,
    isSameShipping,
    setWarehouseAddress,
    setSelectedSavedDeliveryAddress,
    pauseCalculate,
  ]);

  return { isPending: isSavingCalculate };
}
