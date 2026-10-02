"use client";

import { useCallback } from "react";
import { usePayOrderMutation } from "@/hooks/cart";
import { useCartStore } from "@/stores/useCartStore";
import { useTabsStore } from "@/stores/useTabsStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { saveAddress as saveAddressService } from "@/services/address";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useToast, Toast, ToastDescription } from "@/components/ui/toast";
import { trackAddShippingInfo, convertCartItemsToGTMItems, trackVinFormSuccess } from "@/utils/gtm";
import { useSubmitSupportMutation } from "@/hooks/support";
import type { PostSupportPayload, ProfileInformation } from "@/type";
import {
  getVatPendingSupportInflightKey,
  getVatPendingSupportSentKey,
} from "@/utils/checkoutSupportDedupe";
import {
  buildGuaranteedVinCheckSupportMessage,
  buildPartQueryUnverifiedSupportMessage,
  getMayFitItems,
  getNoFitItems,
  mapLocaleToSupportLanguageLabel,
  VALID_VIN_REGEX,
  CHECKOUT_VIN_API_FLOW_SUPPORT_SOURCE,
  CHECKOUT_MANUAL_VIN_FLOW_SUPPORT_SOURCE,
} from "@/utils/vinCheck";
import { getClientFeatureFlag } from "@/utils/theme-utils";

type CheckoutFormRef = {
  triggerValidation: () => Promise<boolean>;
  scrollToFirstError?: () => void;
};

type VatValidationStatus = "VALID" | "INVALID" | "PENDING_VERIFICATION";

type BillingFormRef = CheckoutFormRef & {
  getVatValidationStatus?: () => VatValidationStatus | null;
};

const VAT_PENDING_INFLIGHT_TTL_MS = 2 * 60 * 1000;

type CheckoutSupportOptions = {
  vatStatusOverride?: VatValidationStatus | null;
  billingVatNumber?: string;
};

export function useCheckoutPayment({
  formRefs,
  guestAddressSchema,
  guestDeliveryAddressSchema,
  getLabel,
  params,
  setUsershortinfo,
  saveCheckoutSelection,
  isSavingAddresses,
  setIsSavingAddresses,
  vinNumber,
  getVinCheckSupportState,
  isVinCheckPending,
  onPaymentSuccess,
  onPaymentError,
}) {
  const toast = useToast();
  const { isAuthenticated, authUser } = useAuthStore();
  const activeTab = useTabsStore((state) => state.activeTab);
  const {
    cartid,
    cartitems: items,
    totalprice,
    isBusiness,
    selectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    setSelectedSavedBillingAddress,
    setSelectedSavedDeliveryAddress,
    isSameShipping,
    savedBillingAddresses,
  } = useCartStore();

  const { mutate: payOrder, isPending: isPaymentPending } = usePayOrderMutation({
    onSuccess: async (data) => {
      onPaymentSuccess?.(data);
    },
    onError: (error) => {
      onPaymentError?.(error);
    },
  });

  const { mutate: submitSupport } = useSubmitSupportMutation();

  const callPaymentAPI = useCallback(
    (billingAddress, shippingAddress) => {
      const fullUrl = new URL(window.location.href);
      const storeState = useCartStore.getState();
      const currentActiveTab = useTabsStore.getState().activeTab;
      const isWarehousePickup = currentActiveTab === "warehousePickup";

      const dummyWarehouseAddress = {
        name: "Warehouse",
        street: "Warehouse Address",
        houseNumber: "",
        buildingNumber: "",
        city: "Hove",
        state: "",
        postalCode: "2540",
        country: "Belgium",
        phoneNumber: "",
      };

      const warehouseAddr =
        storeState.selectedSavedDeliveryAddress?.shippingMethod === "PICKUP"
          ? storeState.selectedSavedDeliveryAddress
          : storeState.warehouseAddress;

      let finalShippingAddress;
      if (isWarehousePickup) {
        finalShippingAddress = warehouseAddr || dummyWarehouseAddress;
      } else {
        finalShippingAddress = shippingAddress;
        if (!finalShippingAddress) {
          return;
        }
      }

      const currentShippingFee = useCartStore.getState().shippingfee;
      const currentShippingMethod = useCartStore.getState().shippingMethod;

      let shippingForPayload;
      const guestAndWarehouse =
        !isAuthenticated && isWarehousePickup && (storeState.warehouseAddress || warehouseAddr);
      if (guestAndWarehouse) {
        const warehouseSource = storeState.warehouseAddress || warehouseAddr;
        //@ts-ignore
        const { shippingMethod: _w, ...warehouseRest } = warehouseSource;
        shippingForPayload = warehouseRest;
      } else {
        shippingForPayload =
          finalShippingAddress && typeof finalShippingAddress === "object"
            ? (() => {
                const { shippingMethod: _, ...rest } = finalShippingAddress;
                return rest;
              })()
            : finalShippingAddress;
      }

      const latestContact = useCartStore.getState().contactinfo;
      const currentAuthUser = useAuthStore.getState().authUser;
      const currentDeliveryInstructions = useCartStore.getState().deliveryInstructions;

      let customer: ProfileInformation;
      if (isAuthenticated && currentAuthUser && "email" in currentAuthUser) {
        const auth = currentAuthUser as ProfileInformation;
        const formFirst = latestContact?.firstName?.trim();
        const formLast = latestContact?.lastName?.trim();
        customer = {
          ...auth,
          email: auth.email ?? "",
          firstName: (formFirst || auth.firstName) ?? null,
          lastName: (formLast || auth.lastName) ?? null,
        };
      } else {
        customer = {
          email: latestContact?.email ?? "",
          firstName: latestContact?.firstName?.trim() || null,
          lastName: latestContact?.lastName?.trim() || null,
        };
      }

      const payload = {
        id: cartid,
        createDate: new Date().toISOString(),
        customer,
        shipping: shippingForPayload,
        billing: billingAddress,
        shippingFee: currentShippingFee,
        ...(currentShippingMethod && { shippingMethod: currentShippingMethod }),
        vinNumber: vinNumber || "",
        totalPriceIncVat: totalprice,
        ...(currentDeliveryInstructions && {
          deliveryInstructions: currentDeliveryInstructions,
        }),
        totalPaid: totalprice + currentShippingFee,
        items:
          items?.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            name: item.partname || "",
            unitPrice: item.price || 0,
          })) ?? [],
        status: "New" as const,
        metaData: null,
        returnUrl: fullUrl.origin + getRouteLocaleString(Routes.paymentStatus, params),
      };

      // return;

      const shippingTierMap = {
        homeDelivery: "Home Delivery",
        clickAndCollect: "Click and Collect",
        warehousePickup: "Warehouse Pickup",
      };
      const shippingTier = shippingTierMap[activeTab] || "Home Delivery";
      const gtmItems = convertCartItemsToGTMItems(items as any[]);
      trackAddShippingInfo(
        gtmItems,
        shippingTier,
        "EUR",
        undefined,
        billingAddress,
        finalShippingAddress,
      );

      saveCheckoutSelection();
      setUsershortinfo({
        email: customer.email ?? "",
        firstName: customer.firstName ?? "",
        lastName: customer.lastName ?? "",
      });
      // @ts-ignore
      payOrder(payload);
    },
    [
      activeTab,
      cartid,
      totalprice,
      items,
      isAuthenticated,
      params,
      payOrder,
      setUsershortinfo,
      saveCheckoutSelection,
      vinNumber,
    ],
  );

  const readBillingVatValidationStatus = useCallback((): VatValidationStatus | null => {
    const billingRef = formRefs.billing?.current as BillingFormRef | null;
    return billingRef?.getVatValidationStatus?.() ?? null;
  }, [formRefs.billing]);

  const getCheckoutContactInfo = useCallback(() => {
    const latestContact = useCartStore.getState().contactinfo;
    const currentAuthUser = useAuthStore.getState().authUser as ProfileInformation | null;
    const isAuth = useAuthStore.getState().isAuthenticated;

    const email = (latestContact?.email?.trim() || currentAuthUser?.email?.trim() || "") as string;

    let firstName = latestContact?.firstName?.trim() || "";
    let lastName = latestContact?.lastName?.trim() || "";

    if (isAuth && currentAuthUser && "email" in currentAuthUser) {
      const auth = currentAuthUser as ProfileInformation;
      if (!firstName) firstName = auth.firstName?.trim() || "";
      if (!lastName) lastName = auth.lastName?.trim() || "";
    }

    return { email, firstName, lastName };
  }, []);

  const submitVatPendingSupport = useCallback(
    (contact: { email: string; firstName: string; lastName: string }, billingVatNumber: string) => {
      if (!cartid || !isBusiness || !billingVatNumber.trim()) return;

      if (typeof window === "undefined") return;

      const sentKey = getVatPendingSupportSentKey(cartid, billingVatNumber);
      const inflightKey = getVatPendingSupportInflightKey(cartid, billingVatNumber);

      try {
        if (window.localStorage.getItem(sentKey)) return;

        const inflightStartedAt = window.localStorage.getItem(inflightKey);
        if (inflightStartedAt) {
          const startedAt = Number(inflightStartedAt);
          if (!Number.isNaN(startedAt) && Date.now() - startedAt < VAT_PENDING_INFLIGHT_TTL_MS) {
            return;
          }
          window.localStorage.removeItem(inflightKey);
        }

        window.localStorage.setItem(inflightKey, String(Date.now()));
      } catch {
        // If localStorage is unavailable, still submit without dedupe.
      }

      const { email, firstName, lastName } = contact;

      const finalMessage = `
     Category: Other
     Email: ${email}
     Name: ${firstName} ${lastName}
     orderId: ${cartid}
     Vat Number: ${billingVatNumber}
     Message: "VAT validation pending, need to verify VAT."
     Source: Checkout page`;

      const payload: PostSupportPayload = {
        category: "Other",
        email,
        files: null,
        firstName,
        invoiceNumber: null,
        lastName,
        message: finalMessage.replace(/\n/g, "<br />"),
        orderId: cartid,
        vin: null,
      };

      submitSupport(payload, {
        onSuccess: () => {
          try {
            window.localStorage.setItem(sentKey, "1");
            window.localStorage.removeItem(inflightKey);
          } catch {}
        },
        onError: () => {
          try {
            window.localStorage.removeItem(inflightKey);
          } catch {}
        },
      });
    },
    [cartid, isBusiness, submitSupport],
  );

  const submitVinPartQuerySupport = useCallback(
    (contact: { email: string; firstName: string; lastName: string }, vin: string) => {
      if (!cartid || !vin.trim()) return;

      const { email, firstName, lastName } = contact;
      const useVinApiFlow = getClientFeatureFlag("checkout_vin_api_flow_feature_flag");
      const languageCountry = params?.["language-country"];
      const localeSegment = Array.isArray(languageCountry) ? languageCountry[0] : languageCountry;
      const language = mapLocaleToSupportLanguageLabel(localeSegment);
      const flow = useVinApiFlow ? "vin_api_unverified" : "manual_vin";
      const source = useVinApiFlow
        ? CHECKOUT_VIN_API_FLOW_SUPPORT_SOURCE
        : CHECKOUT_MANUAL_VIN_FLOW_SUPPORT_SOURCE;

      const message = buildPartQueryUnverifiedSupportMessage({
        contact,
        orderId: cartid,
        vin,
        cartItems: items ?? [],
        isAuthenticated,
        language,
        flow,
        source,
      });

      const payload: PostSupportPayload = {
        firstName,
        lastName,
        email,
        category: "PartQuery",
        vin,
        invoiceNumber: null,
        orderId: cartid,
        message,
        files: null,
        source,
      };

      submitSupport(payload, {
        onSuccess: () => {
          trackVinFormSuccess();
        },
      });
    },
    [cartid, isAuthenticated, items, params, submitSupport],
  );

  const submitGuaranteedVinCheckSupport = useCallback(
    (
      contact: { email: string; firstName: string; lastName: string },
      vin: string,
      message: string,
    ) => {
      if (!cartid || !vin.trim() || !message.trim()) return;

      const { email, firstName, lastName } = contact;
      const payload: PostSupportPayload = {
        firstName,
        lastName,
        email,
        category: "GuaranteedVinCheck",
        vin,
        invoiceNumber: null,
        orderId: cartid,
        message,
        files: null,
        source: "Checkout page",
      };

      submitSupport(payload);
    },
    [cartid, submitSupport],
  );

  const submitCheckoutSupportTickets = useCallback(
    (options?: CheckoutSupportOptions) => {
      if (!cartid) return;

      const contact = getCheckoutContactInfo();
      const trimmedVin = (vinNumber || "").trim();
      const hasValidVin = VALID_VIN_REGEX.test(trimmedVin);
      const vatStatus = options?.vatStatusOverride ?? readBillingVatValidationStatus();
      const isVatPending = isBusiness && vatStatus === "PENDING_VERIFICATION";
      const billingVatNumber = options?.billingVatNumber ?? "";

      if (isVatPending) {
        submitVatPendingSupport(contact, billingVatNumber);
      }

      const { verified, result: vinCheckResult } = getVinCheckSupportState();

      if (verified && vinCheckResult) {
        const languageCountry = params?.["language-country"];
        const localeSegment = Array.isArray(languageCountry) ? languageCountry[0] : languageCountry;
        const language = mapLocaleToSupportLanguageLabel(localeSegment);

        const mayFit = getMayFitItems(vinCheckResult.items);
        if (mayFit.length > 0) {
          const message = buildGuaranteedVinCheckSupportMessage({
            contact,
            orderId: cartid,
            vin: trimmedVin,
            mayFitItems: mayFit,
            cartItems: items ?? [],
            isAuthenticated,
            language,
          });
          submitGuaranteedVinCheckSupport(contact, trimmedVin, message);
        }

        const noFit = getNoFitItems(vinCheckResult.items);
        if (noFit.length > 0) {
          const message = buildGuaranteedVinCheckSupportMessage({
            contact,
            orderId: cartid,
            vin: trimmedVin,
            mayFitItems: noFit,
            cartItems: items ?? [],
            isAuthenticated,
            matchType: "NO_FIT",
            language,
          });
          submitGuaranteedVinCheckSupport(contact, trimmedVin, message);
        }
        return;
      }

      if (hasValidVin && !isVinCheckPending) {
        submitVinPartQuerySupport(contact, trimmedVin);
      }
    },
    [
      cartid,
      getCheckoutContactInfo,
      getVinCheckSupportState,
      isAuthenticated,
      isBusiness,
      isVinCheckPending,
      items,
      params,
      readBillingVatValidationStatus,
      submitVatPendingSupport,
      submitGuaranteedVinCheckSupport,
      submitVinPartQuerySupport,
      vinNumber,
    ],
  );

  const proceedToPayment = useCallback(
    (
      billingAddress: unknown,
      shippingAddress: unknown,
      supportOptions?: CheckoutSupportOptions,
    ) => {
      submitCheckoutSupportTickets(supportOptions);
      callPaymentAPI(billingAddress, shippingAddress);
    },
    [submitCheckoutSupportTickets, callPaymentAPI],
  );

  const handleSaveAddress = useCallback(async () => {
    const validateAndScroll = async (
      formRef: CheckoutFormRef | null | undefined,
    ): Promise<boolean> => {
      if (!formRef) return false;
      const isValid = await formRef.triggerValidation();
      if (!isValid) {
        formRef.scrollToFirstError?.();
      }
      return isValid;
    };

    if (isPaymentPending || isSavingAddresses) {
      return;
    }

    const contactRef = formRefs.contact?.current;
    const isContactValid = await validateAndScroll(contactRef);
    if (!isContactValid) {
      return;
    }

    const currentActiveTab = useTabsStore.getState().activeTab;
    const isWarehousePickup = currentActiveTab === "warehousePickup";

    if (!isAuthenticated) {
      const billingRef = formRefs.billing?.current as BillingFormRef | null;
      const isBillingFormValid = await validateAndScroll(billingRef);
      const billingVatStatus = readBillingVatValidationStatus();
      const billingFormData = formRefs.billing?.current?.getFormData();
      const billingValidationResult = guestAddressSchema.safeParse(billingFormData);
      const isBillingValid = billingValidationResult.success;

      if (!isBillingFormValid || !isBillingValid || !billingFormData) {
        return;
      }

      setSelectedSavedBillingAddress(billingFormData);

      const supportOptions: CheckoutSupportOptions = {
        vatStatusOverride: billingVatStatus,
        billingVatNumber: billingFormData.vatNumber ?? "",
      };

      if (isWarehousePickup) {
        proceedToPayment(billingFormData, null, supportOptions);
        return;
      }

      let deliveryFormData = formRefs.delivery?.current?.getFormData();
      if (isSameShipping) {
        deliveryFormData = billingFormData;
      } else {
        const deliveryRef = formRefs.delivery?.current;
        const isDeliveryFormValid = await validateAndScroll(deliveryRef);
        const deliverySchema = guestDeliveryAddressSchema ?? guestAddressSchema;
        const deliveryValidationResult = deliverySchema.safeParse(deliveryFormData);
        if (!isDeliveryFormValid || !deliveryValidationResult.success || !deliveryFormData) {
          return;
        }
      }

      setSelectedSavedDeliveryAddress(deliveryFormData);
      proceedToPayment(billingFormData, deliveryFormData, supportOptions);
      return;
    }

    const hasSavedAddresses = savedBillingAddresses && savedBillingAddresses.length > 0;

    if (!hasSavedAddresses) {
      const billingRef = formRefs.billing?.current as BillingFormRef | null;
      const isBillingFormValid = await validateAndScroll(billingRef);
      const billingVatStatus = readBillingVatValidationStatus();
      const billingFormData = formRefs.billing?.current?.getFormData();
      const billingValidationResult = guestAddressSchema.safeParse(billingFormData);
      const isBillingValid = billingValidationResult.success;

      if (!isBillingFormValid || !isBillingValid || !billingFormData) {
        return;
      }

      const supportOptions: CheckoutSupportOptions = {
        vatStatusOverride: billingVatStatus,
        billingVatNumber: billingFormData.vatNumber ?? "",
      };

      setIsSavingAddresses(true);

      try {
        if (isWarehousePickup) {
          await saveAddressService({
            ...billingFormData,
            name: billingFormData.companyName,
            isDefaultBilling: true,
            isDefaultShipping: false,
          });
          proceedToPayment(billingFormData, null, supportOptions);
          return;
        }

        let deliveryFormData = formRefs.delivery?.current?.getFormData();
        if (isSameShipping) {
          deliveryFormData = billingFormData;
        } else {
          const deliveryRef = formRefs.delivery?.current;
          const isDeliveryFormValid = await validateAndScroll(deliveryRef);
          const deliverySchema = guestDeliveryAddressSchema ?? guestAddressSchema;
          const deliveryValidationResult = deliverySchema.safeParse(deliveryFormData);
          if (!isDeliveryFormValid || !deliveryValidationResult.success || !deliveryFormData) {
            setIsSavingAddresses(false);
            return;
          }
        }

        let savedBillingAddress;
        let savedDeliveryAddress;

        if (isSameShipping) {
          savedBillingAddress = await saveAddressService({
            ...billingFormData,
            name: billingFormData.companyName,
            isDefaultBilling: true,
            isDefaultShipping: true,
          });
          savedDeliveryAddress = savedBillingAddress;
        } else if (selectedSavedDeliveryAddress?.shippingMethod === "PICKUP") {
          savedBillingAddress = await saveAddressService({
            ...billingFormData,
            name: billingFormData.companyName,
            isDefaultBilling: true,
            isDefaultShipping: false,
          });
          savedDeliveryAddress = selectedSavedDeliveryAddress;
        } else {
          const [billingResult, deliveryResult] = await Promise.all([
            saveAddressService({
              ...billingFormData,
              name: billingFormData.companyName,
              isDefaultBilling: true,
              isDefaultShipping: false,
            }),
            saveAddressService({
              ...deliveryFormData,
              isDefaultBilling: false,
              isDefaultShipping: true,
            }),
          ]);
          savedBillingAddress = billingResult;
          savedDeliveryAddress = deliveryResult;
        }

        proceedToPayment(billingFormData, deliveryFormData, supportOptions);
      } catch (error) {
        setIsSavingAddresses(false);
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              {/* @ts-ignore */}
              <ToastDescription className="text-white">
                {getLabel("address_save_error") || "Failed to save address. Please try again."}
              </ToastDescription>
            </Toast>
          ),
        });
      }
      return;
    }

    if (!selectedSavedBillingAddress) {
      return;
    }

    if (
      isBusiness &&
      (!selectedSavedBillingAddress.vatNumber ||
        String(selectedSavedBillingAddress.vatNumber).trim() === "")
    ) {
      return;
    }

    if (isWarehousePickup) {
      proceedToPayment(selectedSavedBillingAddress, null, {
        billingVatNumber: selectedSavedBillingAddress.vatNumber ?? "",
      });
      return;
    }

    // Read current store state at call time so shipping payload uses the user's actual delivery card selection (avoids stale closure using 0th/default)
    const storeState = useCartStore.getState();
    const currentBilling = storeState.selectedSavedBillingAddress;
    const currentDelivery = isSameShipping
      ? storeState.selectedSavedBillingAddress
      : storeState.selectedSavedDeliveryAddress;

    if (!isSameShipping && !currentDelivery) {
      return;
    }

    proceedToPayment(currentBilling, currentDelivery, {
      billingVatNumber: currentBilling?.vatNumber ?? "",
    });
  }, [
    isPaymentPending,
    isSavingAddresses,
    isAuthenticated,
    isBusiness,
    formRefs,
    guestAddressSchema,
    guestDeliveryAddressSchema,
    isSameShipping,
    savedBillingAddresses,
    selectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    setSelectedSavedBillingAddress,
    setSelectedSavedDeliveryAddress,
    setIsSavingAddresses,
    proceedToPayment,
    getLabel,
    toast,
    readBillingVatValidationStatus,
  ]);

  return { handleSaveAddress, callPaymentAPI, isPaymentPending };
}
