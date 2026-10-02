"use client";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { useMedia } from "@/hooks/useMedia";
import { OGButton } from "@/components/og-components/OGButton";
import { useCartStore } from "@/stores/useCartStore";
import Overviewcard from "../overviewcard";
import { useToast, Toast, ToastDescription } from "@/components/ui/toast";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTabsStore } from "@/stores/useTabsStore";
import { profileFormationQueryOptions } from "@/hooks/profile";
import type { GetProfileResponse } from "@/type";
import { allOrdersQueryOptions } from "@/hooks/orders";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
// import { Text } from "@/components/ui/text";
import PaymentMethods from "./PaymentMethods";
import { useParams } from "next/navigation";
import { currencyFormat } from "@/helpers/UtilityHelper";
import { useShoppingCartHref } from "@/hooks/useVehicleAwareCartHref";
// import userBlack from "@/assets/profile/user.svg";
// import userwhite from "@/assets/profile/userwhite.svg";
// import bagwhite from "@/assets/profile/briefcasewhite.svg";
// import bagblack from "@/assets/profile/briefcaseblack.svg";
import Typography from "@/components/og-components/Typography";
// import Image from "next/image";
// import { CustomTooltip } from "@/components/og-components/OGtooltip";
import Termsandconditioncom from "../termsandcondition";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { EditAddressModal } from "@/screens/profile/EditAddressModal";
import { useEditAddressModalStore } from "@/stores/useEditAddressModalStore";
import { useAuth0 } from "@auth0/auth0-react";
import { CrossIconModal } from "@/components/icons/CrossIconModal";
import { useCheckoutCalculate } from "./hooks/useCheckoutCalculate";
import { useCheckoutPayment } from "./hooks/useCheckoutPayment";
import { useCheckoutValidation } from "./hooks/useCheckoutValidation";
import { useCheckoutTabs } from "./hooks/useCheckoutTabs";
import { useCheckoutVinCheck } from "./hooks/useCheckoutVinCheck";
import { DeliveryMethodSelector } from "./components/DeliveryMethodSelector";
import { createGuestAddressSchema, isBusinessAddress } from "./utils/checkoutHelpers";
import { trackBeginCheckout, convertCartItemsToGTMItems } from "@/utils/gtm";
import { ContactInfo2Ref } from "./ConatctInfo2";
import {
  instockInformationQueryOptions,
  useGetInstockInformationQuery,
} from "@/hooks/productdetails";
import { usePaymentInterruptedRedirect } from "@/hooks/usePaymentInterrupted";
import { useHydrateCartFromOrderIdQuery } from "@/hooks/useHydrateCartFromOrderIdQuery";
import { openPayNlPaymentGateway, getPaymentSession } from "@/utils/paymentSession";
import { clearAllCheckoutSupportDedupeForCart } from "@/utils/checkoutSupportDedupe";
import { CheckoutTabContentSkeleton } from "./components/CheckoutTabContentSkeleton";
import SkeletonOverview from "../SkeletonOverview";
import NotFoundclient from "@/screens/not-found-client";
import { useUrlVinValidation } from "@/hooks/useUrlVinValidation";
import { useUrlCarIdsValidation } from "@/hooks/useUrlCarIdsValidation";

const CHECKOUT_SELECTION_KEY = "checkoutSelection";
const CHECKOUT_BUSINESS_TAB_INTENT_KEY = "checkoutBusinessTabIntent";

function persistCheckoutBusinessTabIntent() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CHECKOUT_BUSINESS_TAB_INTENT_KEY, "1");
  } catch {
    // Ignore quota / private-mode failures; in-memory ref still covers same-page login.
  }
}

function clearCheckoutBusinessTabIntent() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(CHECKOUT_BUSINESS_TAB_INTENT_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function hasCheckoutBusinessTabIntent() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(CHECKOUT_BUSINESS_TAB_INTENT_KEY) === "1";
  } catch {
    return false;
  }
}
type DeliveryKey = "small" | "medium" | "large";
export default function Checkoutpage() {
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel, getLocale } = useBranding();
  const localeCODE = getLocale();
  const { invalid: vinUrlInvalid } = useUrlVinValidation();
  const { invalid: carIdsUrlInvalid } = useUrlCarIdsValidation();
  const [doesHaveSavedAddresses, setDoesHaveSavedAddresses] = useState(false);
  const { setTabs, activeTab, setActiveTab } = useTabsStore();
  const [profileData, setProfileData] = useState<any>(null);
  const { authUser, isAuthenticated } = useAuthStore();
  const params = useParams();
  const shoppingCartHref = useShoppingCartHref();
  const [addresschanged, setaddresschanged] = useState(false);
  const [isPaymentAccordionOpen, setIsPaymentAccordionOpen] = useState(false);
  const [usershortinfo, setUsershortinfo] = useState<{
    email: string;
    firstName: string;
    lastName: string;
  }>({
    email: "",
    firstName: "",
    lastName: "",
  });
  const {
    savedShippingAddresses,
    savedBillingAddresses,
    setSavedShippingAddresses,
    setSavedBillingAddresses,
    formMode,
    setFormMode,
    isSameBilling,
    setIsSameBilling,
    isSameShipping,
    shippingfee,
    standardDeliveryShippingFee,
    setStandardDeliveryShippingFee,
    setIsSameShipping,
    isAccordionOpen,
    setIsAccordionOpen,
    selectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    setSelectedSavedBillingAddress,
    setSelectedSavedDeliveryAddress,
    warehouseAddress,
    setWarehouseAddress,
    cartitems: items,
    cartid,
    clearCheckoutStates,
    isBusiness,
    setIsBusiness,
    guestBillingFormData,
    guestDeliveryFormData,
    setGuestBillingFormData,
    setGuestDeliveryFormData,
    totalprice,
    setShowAllBillingAddresses,
    setShowAllDeliveryAddresses,
    contactinfo,
    setDeliveryTime,
    hasHydrated,
  } = useCartStore();
  const guestAddressSchema = useMemo(
    () => createGuestAddressSchema(getLabel, isBusiness, isAuthenticated),
    [getLabel, isBusiness, isAuthenticated],
  );
  // Delivery form is never validated for VAT; only billing uses business/VAT rules.
  const guestDeliveryAddressSchema = useMemo(
    () => createGuestAddressSchema(getLabel, false, isAuthenticated),
    [getLabel, isAuthenticated],
  );
  const toast = useToast();
  const [customloader, setCustomLoader] = useState(false);
  const isPaymentMethodFeatureEnabled = getClientFeatureFlag("payment_method_feature_flag");
  const useVinApiFlow = getClientFeatureFlag("checkout_vin_api_flow_feature_flag");

  const {
    vinNumber,
    vinError: vinerror,
    phase: vinCheckPhase,
    result: vinCheckResult,
    uiCase: vinCheckUiCase,
    isVinCheckPending,
    isValidVin,
    isInputLocked,
    handleVinChange,
    handleVinError,
    handleVerifyVin,
    handleChangeVin,
    handleRemoveNoFitItem,
    getVinCheckSupportState,
  } = useCheckoutVinCheck({ enabled: useVinApiFlow });

  const vinCheckProps = useMemo(
    () => ({
      vinNumber,
      onVinChange: handleVinChange,
      onVinError: handleVinError,
      isValidVin,
      isInputLocked,
      isVinCheckPending,
      phase: vinCheckPhase,
      uiCase: vinCheckUiCase,
      result: vinCheckResult,
      cartItems: items ?? [],
      localeCode: localeCODE,
      params: params ?? {},
      onVerifyVin: handleVerifyVin,
      onChangeVin: handleChangeVin,
      onRemoveNoFitItem: handleRemoveNoFitItem,
    }),
    [
      vinNumber,
      handleVinChange,
      handleVinError,
      isValidVin,
      isInputLocked,
      isVinCheckPending,
      vinCheckPhase,
      vinCheckUiCase,
      vinCheckResult,
      items,
      localeCODE,
      params,
      handleVerifyVin,
      handleChangeVin,
      handleRemoveNoFitItem,
    ],
  );

  usePaymentInterruptedRedirect();

  useEffect(() => {
    if (!cartid || typeof window === "undefined") return;

    const clearDedupeIfPaymentIncomplete = () => {
      const session = getPaymentSession();
      if (session?.orderId === cartid && session.payment_completed === false) {
        clearAllCheckoutSupportDedupeForCart(cartid);
      }
    };

    clearDedupeIfPaymentIncomplete();

    const onPageshow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        clearDedupeIfPaymentIncomplete();
      }
    };
    window.addEventListener("pageshow", onPageshow);
    return () => window.removeEventListener("pageshow", onPageshow);
  }, [cartid]);

  const { sharedOrderId, isSharedOrderHydrating, isSharedOrderHydrateComplete } =
    useHydrateCartFromOrderIdQuery();

  const isInitialLoad = useRef(true);
  const hasRestoredBusinessFromStorage = useRef(false);
  const lastSavedAddressType = useRef<"billing" | "delivery" | null>(null);
  const oldSelectedBillingAddress = useRef<any>(null);
  const oldSelectedDeliveryAddress = useRef<any>(null);
  const hasPushedBeginCheckoutRef = useRef(false);

  const deliveryFormRef = useRef<{
    getFormData: () => any;
    isValid: () => boolean;
    triggerValidation: () => Promise<boolean>;
    scrollToFirstError: () => void;
  } | null>(null);
  const billingFormRef = useRef<{
    getFormData: () => any;
    isValid: () => boolean;
    triggerValidation: () => Promise<boolean>;
    scrollToFirstError: () => void;
  } | null>(null);
  const contactFormRef = useRef<ContactInfo2Ref | null>(null);
  const formRefs = useMemo(
    () => ({ delivery: deliveryFormRef, billing: billingFormRef, contact: contactFormRef }),
    [],
  );

  const typoClass = `flex-1 justify-start text-center ${!isBusiness ? "text-color-text-brand" : "text-color-text-default"} typography-body-strong-01 hover:text-color-text-brand`;

  const handleDeliveryMethodChange = (nextTab: string) => {
    if (nextTab === activeTab) return;
    const billingData = formRefs.billing?.current?.getFormData?.();
    if (billingData) {
      setGuestBillingFormData(billingData);
    } else if (nextTab === "warehousePickup") {
      setGuestBillingFormData(null);
    } else if (isAuthenticated && selectedSavedBillingAddress && nextTab === "homeDelivery") {
      const addr = selectedSavedBillingAddress as any;
      const addrIsBusiness = isBusinessAddress(addr);
      if (addrIsBusiness === isBusiness) {
        setGuestBillingFormData({
          name: addr.name ?? "",
          street: addr.street ?? "",
          houseNumber: addr.houseNumber ?? "",
          buildingNumber: addr.buildingNumber ?? "",
          city: addr.city ?? "",
          state: addr.state ?? "",
          postalCode: addr.postalCode ?? "",
          country: addr.country ?? "",
          phoneNumber: addr.phoneNumber ?? "",
          vatNumber: addr.vatNumber ?? "",
          companyName: addr.isCompany ? (addr.name ?? "") : "",
          email: addr.email ?? "",
        });
      } else {
        setGuestBillingFormData(null);
      }
    }
    setActiveTab(nextTab);
  };

  const saveCheckoutSelection = () => {
    if (typeof window === "undefined") return;

    try {
      const payload = {
        activeTab,
        isBusiness,
      };
      window.sessionStorage.setItem(CHECKOUT_SELECTION_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to save checkout selection to sessionStorage:", error);
    }
  };

  const restoreCheckoutSelection = () => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.sessionStorage.getItem(CHECKOUT_SELECTION_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      let didRestore = false;

      if (typeof parsed.activeTab === "string" && parsed.activeTab) {
        setActiveTab(parsed.activeTab);
        didRestore = true;
      }

      if (typeof parsed.isBusiness === "boolean") {
        setIsBusiness(parsed.isBusiness);
        hasRestoredBusinessFromStorage.current = true;
        didRestore = true;
      }

      if (didRestore) {
        window.sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);
      }
    } catch (error) {
      console.error("Failed to restore checkout selection from sessionStorage:", error);
    }
  };

  useEffect(() => {
    restoreCheckoutSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isSavingAddresses, setIsSavingAddresses] = useState(false);

  const { isConfirmDisabled, buttonRenderKey } = useCheckoutValidation({
    formRefs,
    guestAddressSchema,
    guestDeliveryAddressSchema,
  });

  const hasInitializedStandardFee = useRef(false);
  useEffect(() => {
    if (!hasInitializedStandardFee.current && !standardDeliveryShippingFee && shippingfee > 0) {
      setStandardDeliveryShippingFee(shippingfee);
      hasInitializedStandardFee.current = true;
    }
  }, [shippingfee, standardDeliveryShippingFee, setStandardDeliveryShippingFee]);
  const [showBusinessLoginModal, setShowBusinessLoginModal] = useState(false);
  const isLoggingInFromBusinessTabRef = useRef(false);
  const deliveryAccordionRef = useRef<HTMLDivElement>(null);
  const wasEditAddressModalOpenRef = useRef(false);
  const openedFromRef = useRef<"billing" | "delivery" | null>(null);

  const { setAddresses, setAccessToken, setAuthUser } = useAuthStore();
  const { isPending: isSavingCalculate } = useCheckoutCalculate({
    profileData,
    addresschanged,
    setaddresschanged,
    isAuthenticated,
    pauseCalculate: Boolean(sharedOrderId) && !isSharedOrderHydrateComplete,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getDeliveryText = (deliveryTime: string): string => {
    const deliveryKey: Record<DeliveryKey, string> = {
      small: "delivery_type_small",
      medium: "delivery_type_medium",
      large: "delivery_type_large",
    };
    const delivery = deliveryTime as DeliveryKey;
    const key = delivery && deliveryKey[delivery] ? deliveryKey[delivery] : "Not available";
    return getLabel(key);
  };

  const getMaxDelivery = (data: string[]) => {
    return data.reduce((maxItem, current) => {
      const getMax = (str: string) => {
        const match = str.match(/\d+\s*[–-]\s*(\d+)/);
        return match ? parseInt(match[1] || "0") : 0;
      };

      return getMax(current) > getMax(maxItem) ? current : maxItem;
    });
  };

  const queryClient = useQueryClient();
  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.all(
        items.map((item: any) => queryClient.fetchQuery(instockInformationQueryOptions(item.id))),
      );
      const instockDeliveryTime: string[] = results.map((result: any) =>
        getDeliveryText(result.data.deliveryTime),
      );
      const maxDelivery = getMaxDelivery(instockDeliveryTime);
      setDeliveryTime(maxDelivery);
    };

    if (items?.length) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, queryClient]);

  const { handleSaveAddress, isPaymentPending } = useCheckoutPayment({
    formRefs,
    guestAddressSchema,
    guestDeliveryAddressSchema,
    getLabel,
    params: params ?? {},
    setUsershortinfo,
    saveCheckoutSelection,
    isSavingAddresses,
    setIsSavingAddresses,
    vinNumber,
    getVinCheckSupportState,
    isVinCheckPending,
    onPaymentSuccess: (data: any) => {
      if (data?.data?.url && cartid) {
        openPayNlPaymentGateway(data.data.url, { orderId: cartid });
      }
      setCustomLoader(true);
    },
    onPaymentError: () => {
      setCustomLoader(false);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            {/* @ts-ignore */}
            <ToastDescription className="text-white">
              {getLabel("payment_error") || "Payment failed. Please try again."}
            </ToastDescription>
          </Toast>
        ),
      });
    },
  });

  const { data: profileResponse, isFetching: isProfileFetching } = useQuery({
    ...profileFormationQueryOptions(),
    enabled: isAuthenticated,
    refetchOnMount: "always",
  });

  // Gates the details/billing/delivery skeleton: cart must have rehydrated from
  // session storage and, for logged-in users, saved addresses must have loaded
  // so we don't flash blank forms before swapping to the saved-address view.
  const isCheckoutContentLoading =
    !hasHydrated || isSharedOrderHydrating || (isAuthenticated && isProfileFetching);
  const { data: ordersData } = useQuery({
    ...allOrdersQueryOptions(),
    enabled: isAuthenticated,
  });

  const { isOpen: isEditAddressModalOpen, openedFrom } = useEditAddressModalStore();
  const { getAccessTokenWithPopup, user } = useAuth0();

  useEffect(() => {
    if (selectedSavedBillingAddress && !isInitialLoad.current) {
      oldSelectedBillingAddress.current = selectedSavedBillingAddress;
    }
  }, [selectedSavedBillingAddress]);

  useEffect(() => {
    if (selectedSavedDeliveryAddress && !isInitialLoad.current) {
      oldSelectedDeliveryAddress.current = selectedSavedDeliveryAddress;
    }
  }, [selectedSavedDeliveryAddress]);

  const handleBillingAddressSaved = () => {
    oldSelectedDeliveryAddress.current = selectedSavedDeliveryAddress;

    lastSavedAddressType.current = "billing";

    // Scroll to address accordion with offset for navbar
    if (deliveryAccordionRef.current) {
      const elementPosition = deliveryAccordionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 120; // 120px offset for navbar

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleDeliveryAddressSaved = () => {
    oldSelectedBillingAddress.current = selectedSavedBillingAddress;

    lastSavedAddressType.current = "delivery";

    // Scroll to address accordion with offset for navbar
    if (deliveryAccordionRef.current) {
      const elementPosition = deliveryAccordionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 120; // 120px offset for navbar

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (!profileData?.data) {
      setDoesHaveSavedAddresses(false);
      setSavedShippingAddresses([]);
      setSavedBillingAddresses([]);
      setFormMode({
        delivery: "add",
        billing: "add",
      });
      // Only set isSameShipping to true on initial load (delivery same as billing by default)
      if (isInitialLoad.current) {
        setIsSameShipping(true);
      }
      return;
    }

    if (!profileData?.data?.addresses || profileData?.data?.addresses?.length === 0) {
      setDoesHaveSavedAddresses(false);
      setSavedShippingAddresses([]);
      setSavedBillingAddresses([]);
      setFormMode({
        delivery: "add",
        billing: "add",
      });
      // Only set isSameShipping to true on initial load (delivery same as billing by default)
      if (isInitialLoad.current) {
        setIsSameShipping(true);
      }
    } else {
      setDoesHaveSavedAddresses(true);
      // Show all addresses in both shipping and billing sections
      const allAddresses = profileData?.data?.addresses || [];

      // Filter addresses based on Personal/Business mode for BILLING only
      const filteredBillingAddresses = isBusiness
        ? allAddresses.filter((addr: any) => addr.isCompany === true) // Business addresses
        : allAddresses.filter((addr: any) => addr.isCompany === false); // Personal addresses
      // Set addresses list - billing filtered, delivery shows ALL List
      setSavedShippingAddresses(allAddresses); // Show ALL addresses for delivery
      setSavedBillingAddresses(filteredBillingAddresses); // Filter billing addresses

      // If no filtered billing addresses exist, show the add form
      if (filteredBillingAddresses.length === 0) {
        setFormMode({
          delivery: "add",
          billing: "add",
        });
        setIsAccordionOpen(false);
        if (isInitialLoad.current) {
          setIsSameShipping(true);
        }
      } else {
        // Clear and explicit address selection logic
        const savedFromBillingAddress = lastSavedAddressType.current === "billing";
        const savedFromShippingAddress = lastSavedAddressType.current === "delivery";
        const isInitialLoadFlag = isInitialLoad.current;

        // Case 1: Saved from billing address form (not initial load)
        if (savedFromBillingAddress && !isInitialLoadFlag) {
          setSelectedSavedBillingAddress(filteredBillingAddresses[0]);

          // If isSameShipping is true, delivery should match billing
          if (isSameShipping) {
            setSelectedSavedDeliveryAddress(filteredBillingAddresses[0]);
          } else {
            // Restore old delivery address selection to preserve it
            if (oldSelectedDeliveryAddress.current) {
              setSelectedSavedDeliveryAddress(oldSelectedDeliveryAddress.current);
            }
          }

          lastSavedAddressType.current = null;
        }

        // Case 2: Saved from shipping/delivery address form (not initial load)
        else if (savedFromShippingAddress && !isInitialLoadFlag) {
          setSelectedSavedDeliveryAddress(allAddresses[0]);

          // Restore old billing address selection to preserve it
          if (oldSelectedBillingAddress.current) {
            setSelectedSavedBillingAddress(oldSelectedBillingAddress.current);
          }

          lastSavedAddressType.current = null;
        }

        // Case 3: Initial load - select default addresses
        else if (isInitialLoadFlag && !savedFromBillingAddress && !savedFromShippingAddress) {
          const defaultShippingAddress = allAddresses.find((addr: any) => addr.isDefaultShipping);
          const defaultBillingAddress = filteredBillingAddresses.find(
            (addr: any) => addr.isDefaultBilling,
          );

          if (defaultBillingAddress) {
            setSelectedSavedBillingAddress(defaultBillingAddress);
            setSelectedSavedDeliveryAddress(defaultBillingAddress); // isSameShipping = true

            // Store initial values for future preservation
            oldSelectedBillingAddress.current = defaultBillingAddress;
            oldSelectedDeliveryAddress.current = defaultBillingAddress;
          } else if (filteredBillingAddresses.length > 0) {
            setSelectedSavedBillingAddress(filteredBillingAddresses[0]);
            setSelectedSavedDeliveryAddress(filteredBillingAddresses[0]); // isSameShipping = true

            // Store initial values for future preservation
            oldSelectedBillingAddress.current = filteredBillingAddresses[0];
            oldSelectedDeliveryAddress.current = filteredBillingAddresses[0];
          }

          // Only set isSameShipping = true on initial load (delivery same as billing by default)
          setIsSameShipping(true);
          // Calculate API will be triggered by the "saved address selection" effect when these default selections are applied
        }

        // Case 4: No valid case - skip address selection
        else {
        }

        setIsAccordionOpen(true);
        setFormMode({
          delivery: "hidden",
          billing: "hidden",
        });
      }
    }
    // Mark initial load as done
    isInitialLoad.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?.data]);

  useEffect(() => {
    if (profileResponse) {
      setProfileData(profileResponse);
      setAddresses((profileResponse?.data?.addresses ?? []) as Parameters<typeof setAddresses>[0]);
    }
  }, [profileResponse, setAddresses]);

  useEffect(() => {
    if (isAuthenticated) {
      const wasGuest = prevIsAuthenticatedRef.current === false;
      if (wasGuest) {
        isInitialLoad.current = true;
      }
      setGuestBillingFormData(null);
      setGuestDeliveryFormData(null);
    }
  }, [isAuthenticated, setGuestBillingFormData, setGuestDeliveryFormData]);

  const prevIsAuthenticatedRef = useRef<boolean | null>(null);
  useEffect(() => {
    const wasAuthenticated = prevIsAuthenticatedRef.current;
    prevIsAuthenticatedRef.current = isAuthenticated;
    if (wasAuthenticated === true && !isAuthenticated) {
      setSelectedSavedBillingAddress(null);
      setSelectedSavedDeliveryAddress(null);
      setGuestBillingFormData(null);
      setGuestDeliveryFormData(null);
    }
  }, [
    isAuthenticated,
    setSelectedSavedBillingAddress,
    setSelectedSavedDeliveryAddress,
    setGuestBillingFormData,
    setGuestDeliveryFormData,
  ]);

  const hasDeterminedBusinessRef = useRef(false);
  useEffect(() => {
    if (hasRestoredBusinessFromStorage.current) {
      return;
    }
    const hasBusinessLoginIntent =
      isLoggingInFromBusinessTabRef.current || hasCheckoutBusinessTabIntent();
    if (!isAuthenticated) {
      hasDeterminedBusinessRef.current = false;
      // Keep Business intent while the Auth0 popup is open; do not reset to Personal.
      if (!hasBusinessLoginIntent) {
        setIsBusiness(false);
      }
      return;
    }
    if (!profileData?.data) {
      return; // wait for profile to load
    }
    if (hasDeterminedBusinessRef.current) {
      return; // only determine once per load
    }
    hasDeterminedBusinessRef.current = true;

    // Guest chose Business Purchase, then logged in / created an account.
    // Keep Business even when the new profile has no company address yet.
    if (hasBusinessLoginIntent) {
      isLoggingInFromBusinessTabRef.current = false;
      clearCheckoutBusinessTabIntent();
      setIsBusiness(true);
      return;
    }

    const allAddresses = profileData.data.addresses ?? [];
    if (allAddresses.length > 0) {
      const hasBusinessAddress = allAddresses.some((addr: any) => addr.isCompany === true);
      if (hasBusinessAddress) {
        setIsBusiness(true);
        return;
      }
    }
    const orderList = Array.isArray(ordersData)
      ? ordersData
      : ((ordersData as any)?.data?.orders ?? []);
    if (orderList.length > 0 && orderList[0]?.billing?.isCompany === true) {
      setIsBusiness(true);
      return;
    }
    setIsBusiness(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, profileData?.data, ordersData]);

  useEffect(() => {
    // Tab switch: clear "forcefully selected" duplicate state so selection behaves like page load
    useEditAddressModalStore.getState().setJustSelectedDuplicateForCheckout(false);

    // Skip if we just saved an address (to prevent overriding our selection logic)
    if (lastSavedAddressType.current !== null) {
      return;
    }

    if (profileData?.data?.addresses && profileData.data.addresses.length > 0) {
      const allAddresses = profileData.data.addresses;

      // Filter addresses based on Personal/Business mode for BILLING only
      const filteredBillingAddresses = isBusiness
        ? allAddresses.filter((addr: any) => addr.isCompany === true) // Business addresses
        : allAddresses.filter((addr: any) => addr.isCompany === false); // Personal addresses

      // Set addresses - billing filtered, delivery shows ALL
      setSavedShippingAddresses(allAddresses); // Show ALL addresses for delivery
      setSavedBillingAddresses(filteredBillingAddresses); // Filter billing addresses

      // Handle different scenarios
      if (isInitialLoad.current) {
        // Initial load - use default address selection logic

        // Reset selected addresses first when tab changes

        setSelectedSavedDeliveryAddress(null);
        setSelectedSavedBillingAddress(null);

        // If no filtered billing addresses exist, show the add form
        if (filteredBillingAddresses.length === 0) {
          setFormMode({
            delivery: "add",
            billing: "add",
          });
          setIsAccordionOpen(true);
        } else {
          // Auto-select default addresses from appropriate lists
          const defaultBillingAddress = filteredBillingAddresses.find(
            (addr: any) => addr.isDefaultBilling,
          );

          // Set addresses immediately (synchronously) to avoid timing issues
          let selectedBilling = null;

          // First, set the billing address
          if (defaultBillingAddress) {
            selectedBilling = defaultBillingAddress;

            setSelectedSavedBillingAddress(defaultBillingAddress);
          } else if (filteredBillingAddresses.length > 0) {
            selectedBilling = filteredBillingAddresses[0];

            setSelectedSavedBillingAddress(filteredBillingAddresses[0]);
          }

          // Then set delivery address to match billing (since isSameShipping will be true)
          if (selectedBilling) {
            setSelectedSavedDeliveryAddress(selectedBilling);
          }

          // Always set isSameShipping to true when tab changes

          setIsSameShipping(true);

          setIsAccordionOpen(true);
          setFormMode({
            delivery: "hidden",
            billing: "hidden",
          });
        }
      } else {
        // Tab change (not initial load) - just filter addresses, don't change selections

        setIsAccordionOpen(true);

        // Just filter the addresses, don't change current selections
        // The user's current selections should be preserved if they exist in the filtered list

        // If current billing selection is null OR not in the filtered list, select first available
        if (
          !selectedSavedBillingAddress ||
          !filteredBillingAddresses.find((addr: any) => addr.id === selectedSavedBillingAddress.id)
        ) {
          if (filteredBillingAddresses.length > 0) {
            let newBillingAddress = null;

            if (isBusiness) {
              newBillingAddress = filteredBillingAddresses[0];
              setSelectedSavedBillingAddress(filteredBillingAddresses[0]);
            } else {
              const defaultBillingAddress = filteredBillingAddresses.find(
                (addr: any) => addr.isDefaultBilling,
              );
              if (defaultBillingAddress) {
                newBillingAddress = defaultBillingAddress;
                setSelectedSavedBillingAddress(defaultBillingAddress);
              } else {
                newBillingAddress = filteredBillingAddresses[0];
                setSelectedSavedBillingAddress(filteredBillingAddresses[0]);
              }
            }

            // Set delivery address based on isSameShipping
            if (isSameShipping) {
              setSelectedSavedDeliveryAddress(newBillingAddress);
            } else {
              // Find default shipping or use first address
              const defaultShippingAddress = allAddresses.find(
                (addr: any) => addr.isDefaultShipping,
              );
              if (defaultShippingAddress) {
                setSelectedSavedDeliveryAddress(defaultShippingAddress);
              } else if (allAddresses.length > 0) {
                setSelectedSavedDeliveryAddress(allAddresses[0]);
              }
            }
          }
        } else {
        }

        // If no billing addresses available, show add form

        if (filteredBillingAddresses.length === 0) {
          setFormMode({
            delivery: "add",
            billing: "add",
          });

          // Open accordion when no addresses available
          setIsAccordionOpen(true);

          // Clear selected billing address
          setSelectedSavedBillingAddress(null);
          setSelectedSavedDeliveryAddress(null);
        } else {
          setFormMode({
            delivery: "hidden",
            billing: "hidden",
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBusiness]);

  // Cleanup states on component unmount
  useEffect(() => {
    return () => {
      // Clear checkout states when leaving the page
      clearCheckoutStates();
      // Reset active tab to default (Standard Delivery) when leaving checkout
      setActiveTab("homeDelivery");
    };
  }, [clearCheckoutStates, setActiveTab]);

  // Push begin_checkout to dataLayer once when user enters checkout page (for GTM/GA4)
  useEffect(() => {
    if (items?.length > 0 && !hasPushedBeginCheckoutRef.current) {
      const gtmItems = convertCartItemsToGTMItems(items as any);
      trackBeginCheckout(gtmItems);
      hasPushedBeginCheckoutRef.current = true;
    }
  }, [items]);

  // Initialize view states to View 1 (single selected address) on page load
  useEffect(() => {
    // Reset to View 1 when checkout page mounts
    setShowAllBillingAddresses(false);
    setShowAllDeliveryAddresses(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - only run on mount

  // Capture openedFrom when modal is open (before closeModal resets it to null)
  useEffect(() => {
    if (isEditAddressModalOpen && openedFrom) {
      openedFromRef.current = openedFrom;
    }
  }, [isEditAddressModalOpen, openedFrom]);

  // Watch for EditAddressModal close - use addresses from auth store (EditAddressModal already refetched and updated store on save)
  useEffect(() => {
    // Check if modal just closed (was open, now closed)
    if (wasEditAddressModalOpenRef.current && !isEditAddressModalOpen) {
      const capturedOpenedFrom = openedFromRef.current;
      const { justSelectedDuplicateForCheckout, setJustSelectedDuplicateForCheckout } =
        useEditAddressModalStore.getState();
      // EditAddressModal onSuccess already called getProfile + setAddresses, so auth store has fresh data - no duplicate refetch
      const allAddresses =
        (useAuthStore.getState().authUser as { addresses?: any[] })?.addresses ?? [];
      if (allAddresses.length > 0) {
        setProfileData((prev: any) =>
          prev
            ? { ...prev, data: { ...prev.data, addresses: allAddresses } }
            : { data: { addresses: allAddresses } },
        );

        const filteredBillingAddresses = isBusiness
          ? allAddresses.filter((addr: any) => addr.isCompany === true)
          : allAddresses.filter((addr: any) => addr.isCompany === false);

        if (!justSelectedDuplicateForCheckout) {
          const latestBillingAddress =
            filteredBillingAddresses.length > 0
              ? [...filteredBillingAddresses].sort((a, b) => b.id.localeCompare(a.id))[0]
              : null;
          const latestShippingAddress =
            allAddresses.length > 0
              ? [...allAddresses].sort((a, b) => b.id.localeCompare(a.id))[0]
              : null;

          if (capturedOpenedFrom === "billing") {
            if (latestBillingAddress) {
              setSelectedSavedBillingAddress(latestBillingAddress);
              setShowAllBillingAddresses(false);
            }
            if (isSameShipping && latestBillingAddress) {
              setSelectedSavedDeliveryAddress(latestBillingAddress);
              setShowAllDeliveryAddresses(false);
            }
          } else if (capturedOpenedFrom === "delivery") {
            if (latestShippingAddress) {
              setSelectedSavedDeliveryAddress(latestShippingAddress);
              setShowAllDeliveryAddresses(false);
            }
            if (isSameShipping && latestShippingAddress) {
              setSelectedSavedBillingAddress(latestShippingAddress);
              setShowAllBillingAddresses(false);
            }
          }
        } else {
          setJustSelectedDuplicateForCheckout(false);
        }

        setSavedShippingAddresses(allAddresses, true);
        setSavedBillingAddresses(filteredBillingAddresses, true);
        setFormMode({
          delivery: "hidden",
          billing: "hidden",
        });
        setaddresschanged(true);
      }
      openedFromRef.current = null;
    }
    wasEditAddressModalOpenRef.current = isEditAddressModalOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditAddressModalOpen, isBusiness, isSameShipping]);

  useEffect(() => {
    if (
      (!savedBillingAddresses || savedBillingAddresses.length === 0) &&
      (!savedShippingAddresses || savedShippingAddresses.length === 0)
    ) {
      setFormMode({
        delivery: "add",
        billing: "add",
      });
    }
  }, [savedShippingAddresses, savedBillingAddresses, setFormMode]);

  // Clear delivery address when isSameShipping changes to false for guest users
  useEffect(() => {
    if (isSameShipping === false && !isAuthenticated) {
      setSelectedSavedDeliveryAddress(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSameShipping, isAuthenticated]);

  // Handle click outside accordion for authenticated users - NO DEPENDENCIES
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only for authenticated users and when accordion is open
      if (!isAuthenticated || !isAccordionOpen) {
        return;
      }

      // Check if click is outside the accordion
      if (
        deliveryAccordionRef.current &&
        !deliveryAccordionRef.current.contains(event.target as Node)
      ) {
        // Validate address selection using current state values
        const hasValidSelection =
          (selectedSavedBillingAddress && isSameShipping) ||
          (selectedSavedBillingAddress && selectedSavedDeliveryAddress);

        if (!hasValidSelection) {
          return;
        }

        // Valid selection - close and confirm
        setIsAccordionOpen(false);
        setIsPaymentAccordionOpen(true);
        setaddresschanged(true);
      } else {
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSavedBillingAddress, selectedSavedDeliveryAddress, isAccordionOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAccordionOpen(false);
    } else {
      setIsAccordionOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAccordionOpen && !isAuthenticated) {
      setFormMode({
        delivery: "add",
        billing: "add",
      });
    }
  }, [isAccordionOpen, isAuthenticated, setFormMode]);

  const handleAccountType = (type: "personal" | "business") => {
    setIsBusiness(type === "business");
  };

  const handleBusinessLogin = async () => {
    try {
      // Keep Business context across Auth0 + profile load (refs reset on remount).
      isLoggingInFromBusinessTabRef.current = true;
      persistCheckoutBusinessTabIntent();

      // Get email from contact info (prefilled in the form)
      const emailToUse = contactinfo?.email?.trim().toLowerCase() || "";

      const accessToken = await getAccessTokenWithPopup({
        authorizationParams: { login_hint: emailToUse },
      });

      if (accessToken) {
        setAccessToken(accessToken);
        // Fetch profile after login
        const AuthUserObject = {
          accessToken: accessToken,
          ...user,
        };

        const response = (await getProfile(AuthUserObject)) as unknown as GetProfileResponse;
        setAuthUser({
          ...response.data,
        } as Parameters<typeof setAuthUser>[0]);

        const { restoreAccountCartOnLogin } = await import("@/utils/restoreServerCart");
        await restoreAccountCartOnLogin(response.data);

        // Set isBusiness to true since user clicked on Business tab
        setIsBusiness(true);
      } else {
        isLoggingInFromBusinessTabRef.current = false;
        clearCheckoutBusinessTabIntent();
      }
    } catch (error) {
      console.error("Business login error:", error);
      isLoggingInFromBusinessTabRef.current = false;
      clearCheckoutBusinessTabIntent();
    }
  };

  const activeTabContent = useTabsStore(
    (state) => state.tabs.find((tab) => tab.id === state.activeTab)?.content,
  );

  useCheckoutTabs({
    setTabs,
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
    savedBillingAddresses: savedBillingAddresses ?? [],
    savedShippingAddresses: savedShippingAddresses ?? [],
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
    vinerror: vinerror,
    customloader: customloader,
    isCheckoutContentLoading,
  });

  // When Personal/Business tab changes, clear guest form data that no longer matches the selected type
  useEffect(() => {
    if (!isBusiness && isBusinessAddress(guestDeliveryFormData)) {
      setGuestDeliveryFormData(null);
    }
    if (!isBusiness && guestBillingFormData && isBusinessAddress(guestBillingFormData)) {
      setGuestBillingFormData(null);
    }
    if (isBusiness && guestBillingFormData && !isBusinessAddress(guestBillingFormData)) {
      setGuestBillingFormData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBusiness]);

  // Sync guestDeliveryFormData with guestBillingFormData when isSameShipping is true (delivery form must never get business address data)
  useEffect(() => {
    if (!isAuthenticated || !doesHaveSavedAddresses) {
      const billingData = guestBillingFormData || formRefs.billing?.current?.getFormData();
      if (isSameShipping && billingData) {
        if (isBusinessAddress(billingData)) {
          setGuestDeliveryFormData(null);
        } else {
          setGuestDeliveryFormData(billingData);
        }
      } else if (!isSameShipping) {
        setGuestDeliveryFormData(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    isSameShipping,
    doesHaveSavedAddresses,
    guestBillingFormData,
    setGuestDeliveryFormData,
  ]);

  if (vinUrlInvalid || carIdsUrlInvalid) {
    return <NotFoundclient />;
  }
  return (
    <Box className={`flex min-h-screen min-w-full flex-col justify-between base:gap-0`}>
      <Box className={`flex w-full flex-col items-start gap-content-to-footer gap-header-to-title`}>
        <Box
          className={`flex w-full flex-row items-center gap-6 gap-title-to-content section-standard`}
        >
          <Typography
            type="h1"
            className="text-color-text-body typography-heading-01"
            hasBack
            backroute={shoppingCartHref}
          >
            {getLabel("checkout")}
          </Typography>
        </Box>

        <Box className="flex section-split-primary-right base:mb-0 base:h-full base:w-full base:flex-col gtlg:w-full gtlg:flex-row ml:flex ml:flex-row">
          <Box className="flex max-w-full flex-col grid-gap-listing gtsm:pb-0 gtlg:flex-1">
            <DeliveryMethodSelector
              activeTab={activeTab}
              onChange={(value) => {
                if (value === "homeDelivery" || value === "warehousePickup") {
                  handleDeliveryMethodChange(value);
                } else {
                  setActiveTab(value);
                }
              }}
              standardDeliveryShippingFee={standardDeliveryShippingFee ?? 0}
              shippingfee={shippingfee}
              getLabel={getLabel}
              localeCODE={localeCODE}
              showWarehouseOption={getClientFeatureFlag("delivery_method_flag")}
            />

            {isCheckoutContentLoading ? (
              <CheckoutTabContentSkeleton
                variant={activeTab === "warehousePickup" ? "warehouse" : "home"}
                isAuthenticated={isAuthenticated}
              />
            ) : (
              activeTabContent
            )}

            {isPaymentMethodFeatureEnabled && (
              <PaymentMethods
                isAccordionOpen={true}
                setIsAccordionOpen={setIsPaymentAccordionOpen}
              />
            )}
            <Box className={`flex w-full flex-col ${isMobile && "grid-gap-listing"} `}>
              <Box />
              <Termsandconditioncom />
            </Box>
          </Box>
          {items?.length > 0 ? (
            <Box className="w-full flex-shrink-0 gtlg:w-[320px]">
              {/* THIS wrapper is important */}
              <div style={{ position: "sticky", top: "200px" }}>
                <Overviewcard type="checkout" />
              </div>
            </Box>
          ) : (
            // <Box className="gtlg:h-fit gtlg:self-start fixed  right-20 w-[25%]">
            //   <Overviewcard type="checkout" />
            // </Box>
            <SkeletonOverview />
          )}
        </Box>
      </Box>

      {showBusinessLoginModal && (
        <Box className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Box
            className="relative w-full max-w-xl overflow-hidden rounded-[8px] bg-color-background-default shadow-xl"
            //@ts-ignore
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Box className="flex w-full">
              <Box className="flex flex-col items-start justify-center border-b border-color-border-default">
                <Box className="w-full border-b border-color-border-default">
                  <Box className="flex w-full flex-row justify-between px-6 py-4">
                    <Typography className="mt-1 text-start text-color-text-body typography-subtitle-01">
                      {getLabel("account_required_business_title") ||
                        "Account Required for Business Purchase"}
                    </Typography>
                    <Box
                      className="cursor-pointer rounded-md bg-color-background-default p-2 hover:bg-color-background-emphasis"
                      // @ts-ignore
                      onClick={() => {
                        setShowBusinessLoginModal(false);
                        handleAccountType("personal");
                      }}
                    >
                      <CrossIconModal className="text-color-text-emphasis" />
                    </Box>
                  </Box>
                </Box>
                <Box className="flex w-full items-start justify-start px-6 py-8">
                  <Typography className="text-start text-color-text-muted typography-body-02">
                    {getLabel("account_required_business_message") ||
                      "Please sign in or create an account to continue with your business purchase."}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box className="bg-color-background-default p-6">
              <Box className="flex w-full flex-row justify-end gap-3">
                <OGButton
                  type="outlined"
                  size="small"
                  className="flex w-auto p-2"
                  onClick={() => {
                    setShowBusinessLoginModal(false);
                    handleAccountType("personal");
                  }}
                >
                  {getLabel("cancel")}
                </OGButton>
                <OGButton
                  type="primary"
                  size="small"
                  className="flex w-auto"
                  onClick={() => {
                    setShowBusinessLoginModal(false);
                    handleBusinessLogin();
                  }}
                >
                  {getLabel("continue_to_login") || "Continue to Login"}
                </OGButton>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <EditAddressModal />
    </Box>
  );
}
