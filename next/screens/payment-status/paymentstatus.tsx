"use client";
import PaymentFail from "@/components/PaymentFail";
import PaymentSuccess from "@/components/PaymentSuccess";
import GoogleCustomerReviewsOptIn, {
  type GoogleCustomerReviewsOptInProps,
} from "@/components/GoogleCustomerReviewsOptIn";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { useGetOrderByIdQuery } from "@/hooks/cart";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackPurchase, trackAddPaymentInfo, convertProductToGTMItem } from "@/utils/gtm";
import Typography from "@/components/og-components/Typography";
import { useBranding } from "@/contexts/BrandingContext";
import { getCurrentStoreDisplayName } from "@/config/store-constants";
import { clearPaymentSession, markPaymentCompleted } from "@/utils/paymentSession";
import {
  getDeliveryCountryFromOrder,
  getEstimatedDeliveryDate,
  getMaxDeliveryKeyForProductIds,
  isValidGcrEmail,
  mapLanguageCountryToGcrLang,
  parseMerchantIdFromEnv,
} from "@/utils/googleCustomerReviews";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { logGcrOptInToAxiomClient } from "@/lib/axiom/log-gcr-opt-in-client";

// PayNL Status Codes
const PAYNL_STATUS_PAID = "100"; // Payment successful
// Pending / processing statuses that should trigger the retry flow
// 50: PENDING (data received, sent to payment method)
// 85: VERIFY (suspicious, needs additional checks)
// 90: PENDING (waiting for bank/third-party response)
// 95: AUTHORIZE (reserved, can be captured)
// 98: PENDING (provider/issuer confirmed payment sent, funds not received yet)
const PAYNL_STATUS_PENDING = ["50", "85", "90", "95", "98"];

// Retry configuration
const MAX_RETRIES = 6;
const RETRY_INTERVAL_MS = 10_000; // 10 seconds

const CHECKOUT_SELECTION_KEY = "checkoutSelection";

export default function PaymentStatusComponent() {
  const { getLabel } = useBranding();
  const routeParams = useParams();
  const searchParams = useSearchParams();

  // URL Parameters
  const allOrderIds = useMemo(() => searchParams?.getAll("orderId") || [], [searchParams]);
  const orderId = allOrderIds.length > 0 ? allOrderIds[0] : null;
  const paymentStatusCode = searchParams?.get("orderStatusId") ?? null;
  const customerId = searchParams?.get("customerId") ?? null;
  const isPaymentInterrupted = searchParams?.get("interrupted") === "1";

  // Auth & Cart stores
  const { authUser } = useAuthStore();
  const emailId = (authUser as any)?.email ?? null;
  const { resetCart, contactinfo } = useCartStore();
  const orderLookupEmail = emailId || contactinfo?.email?.trim() || null;

  // Local state
  const [retryCount, setRetryCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const hasResetCart = useRef(false);
  const hasTrackedPurchase = useRef(false);
  const hasPreparedGcr = useRef(false);
  const [gcrOptIn, setGcrOptIn] = useState<GoogleCustomerReviewsOptInProps | null>(null);

  // Fetch order data
  const {
    data: orderData,
    isPending: isOrderLoading,
    refetch,
  } = useGetOrderByIdQuery(orderId || "", orderLookupEmail, customerId, {
    allowOrderIdOnly: isPaymentInterrupted,
  });
  // Payment status from orderData.payments[0]
  const paymentFromOrder = orderData?.payments?.[0];
  const paymentStatusFromOrder = paymentFromOrder?.status;

  // Determine if PayNL says it's paid or pending
  const isPayNLPaid = paymentStatusCode === PAYNL_STATUS_PAID;
  const isPayNLPending = PAYNL_STATUS_PENDING.includes(paymentStatusCode || "");

  // Immediate failure from PayNL (e.g. cancel, denied, etc.)
  // IMPORTANT: For code -63 specifically, we SHOULD NOT reset/clear the cart
  // so that the user can retry the payment for the same order.
  const isImmediateFailFromPayNL =
    !!paymentStatusCode &&
    paymentStatusCode !== PAYNL_STATUS_PAID &&
    !isPayNLPending &&
    paymentStatusCode !== "-63" &&
    paymentStatusCode !== "-90";

  // Final success state: PayNL says PAID, or order API confirms payment is Paid
  const isPaymentSuccessful = isPayNLPaid || paymentStatusFromOrder === "Paid";

  useEffect(() => {
    if (isPaymentSuccessful) markPaymentCompleted();
  }, [isPaymentSuccessful]);

  useEffect(() => {
    if (paymentStatusCode) clearPaymentSession();
  }, [paymentStatusCode]);

  // Handle retry logic for pending statuses (processing flow)
  useEffect(() => {
    // Only poll if PayNL status is one of the processing/pending codes
    // and payment is still \"Processing\" or not present yet.
    const isStillProcessingOrUnknown =
      !orderData || orderData.payments?.length === 0 || paymentStatusFromOrder === "Processing";

    const canRetry =
      !isPaymentInterrupted &&
      isPayNLPending &&
      retryCount < MAX_RETRIES &&
      isStillProcessingOrUnknown;

    if (!canRetry) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    const timer = setTimeout(() => {
      refetch();
      setRetryCount((prev) => prev + 1);
    }, RETRY_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [
    isPaymentInterrupted,
    isPayNLPending,
    orderData,
    paymentStatusFromOrder,
    retryCount,
    refetch,
  ]);

  // Handle cart reset (only once)
  useEffect(() => {
    if (hasResetCart.current) return;

    // 1) SUCCESS: reset cart when payment is successful
    if (isPaymentSuccessful) {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(CHECKOUT_SELECTION_KEY);
      }

      resetCart();
      hasResetCart.current = true;
      return;
    }

    // 2) IMMEDIATE FAIL FROM PAYNL (non-processing codes): clear cart
    if (isImmediateFailFromPayNL) {
      // resetCart(); // Needed bcz they want to retry payment.
      hasResetCart.current = true;
      return;
    }

    const cameFromProcessing = isPayNLPending;
    const noMoreRetries = retryCount >= MAX_RETRIES;
    const leftProcessingState =
      !!paymentStatusFromOrder &&
      paymentStatusFromOrder !== "Processing" &&
      paymentStatusFromOrder !== "Paid";

    if (cameFromProcessing && (noMoreRetries || leftProcessingState)) {
    }
  }, [
    isPaymentSuccessful,
    isImmediateFailFromPayNL,
    isPayNLPending,
    paymentStatusFromOrder,
    retryCount,
    resetCart,
  ]);

  // Handle GTM tracking (only once when payment is successful)
  useEffect(() => {
    if (hasTrackedPurchase.current) return;
    if (!isPaymentSuccessful || !orderData) return;

    // Track GTM events
    if (orderData.items && orderData.items.length > 0) {
      const gtmItems = orderData.items.map((item: any, index: number) =>
        convertProductToGTMItem(
          {
            id: item.id,
            title: item.name || item.partname,
            manufacturer: item.manufacturer,
            categories: item.categories,
            // GA4 expects unit price in items.price (not line total); quantity is separate
            priceInclVat: item.unitPriceIncVat ?? item.price,
            price: item.unitPrice ?? item.price,
            vatPercentage: item.vatPercentage,
            status: item.status,
          },
          item.quantity,
          index + 1,
        ),
      );

      // Track payment info
      const paymentMethod = paymentFromOrder?.paymentMethod;
      if (paymentMethod) {
        trackAddPaymentInfo(gtmItems, paymentMethod, "EUR", orderData.coupon);
      }

      // Track purchase
      trackPurchase(
        orderData?.id || "",
        gtmItems,
        "EUR",
        orderData.totalPriceIncVat || orderData?.totalpaid,
        orderData.tax as any,
        orderData.shippingFee || (orderData.shippingfee as any),
        orderData.coupon,
        getCurrentStoreDisplayName(),
      );

      hasTrackedPurchase.current = true;
    }
  }, [isPaymentSuccessful, orderData, paymentFromOrder]);

  // Google Customer Reviews opt-in (success only, once per order)
  useEffect(() => {
    if (hasPreparedGcr.current) return;
    if (!isPaymentSuccessful || !orderData?.id) return;

    const languageCountry = routeParams?.["language-country"] as string | undefined;
    if (!getClientFeatureFlag("gcr_opt_in_feature_flag", languageCountry)) return;

    const orderId = orderData.id;
    const merchantId = parseMerchantIdFromEnv();
    const email = orderData.customer?.email?.trim() || orderLookupEmail?.trim() || null;
    const deliveryCountry = getDeliveryCountryFromOrder(orderData);

    if (!merchantId) {
      logGcrOptInToAxiomClient({ outcome: "skipped", reason: "missing_merchant_id", orderId });
      return;
    }
    if (!isValidGcrEmail(email)) {
      logGcrOptInToAxiomClient({ outcome: "skipped", reason: "invalid_email", orderId });
      return;
    }
    if (!deliveryCountry) {
      logGcrOptInToAxiomClient({ outcome: "skipped", reason: "missing_delivery_country", orderId });
      return;
    }

    hasPreparedGcr.current = true;

    const lang = mapLanguageCountryToGcrLang(languageCountry);
    const productIds = (orderData.items ?? []).map((item) => item.id);

    void (async () => {
      try {
        const maxDeliveryKey = await getMaxDeliveryKeyForProductIds(productIds);
        const estimatedDeliveryDate = getEstimatedDeliveryDate(
          maxDeliveryKey,
          orderData.createDate,
        );

        setGcrOptIn({
          merchantId,
          orderId,
          email,
          deliveryCountry,
          estimatedDeliveryDate,
          lang,
        });

        logGcrOptInToAxiomClient({
          outcome: "rendered",
          orderId,
          merchantId,
          deliveryCountry,
          estimatedDeliveryDate,
          lang,
        });
      } catch (error) {
        // GCR is optional; payment success flow must not be affected.
        logGcrOptInToAxiomClient({
          outcome: "failed",
          reason: "delivery_date_lookup",
          orderId,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      }
    })();
  }, [isPaymentSuccessful, orderData, orderLookupEmail, routeParams]);

  // Determine what to show
  const showSuccess = isPaymentSuccessful;
  const showLoading = isOrderLoading || isPolling;
  const showFail = !showSuccess && !showLoading;

  return (
    <main className="z-[10] min-h-[50vh] bg-eb-panel-hero-image bg-cover bg-center bg-no-repeat">
      <Box className="h-full w-full py-[200px] base:px-3 gtsm:px-[200px] gtlg:px-[390px]">
        <Box className="absolute inset-0 bg-[--background-white] opacity-70" />

        {showSuccess ? (
          <Box className="relative z-[1]">
            <PaymentSuccess />
            {gcrOptIn ? <GoogleCustomerReviewsOptIn {...gcrOptIn} /> : null}
          </Box>
        ) : showLoading ? (
          <Box className="flex h-[50vh] w-full flex-col content-center items-center justify-center gap-6">
            <Spinner size="large" color="#0a4932" />
            <Typography type="h3" className="text-center text-color-text-body">
              {getLabel("payment_processing_title")}
            </Typography>
            <Typography type="div" className="text-center text-color-text-body body-regular-lg">
              {getLabel("payment_processing_message")}
            </Typography>
          </Box>
        ) : showFail ? (
          <PaymentFail />
        ) : null}
      </Box>
    </main>
  );
}
