"use client";

import { useEffect, useRef } from "react";

const PLATFORM_SCRIPT_ID = "gcr-platform-script";
const PLATFORM_SCRIPT_SRC = "https://apis.google.com/js/platform.js?onload=renderOptIn";

export interface GoogleCustomerReviewsOptInProps {
  merchantId: number;
  orderId: string;
  email: string;
  deliveryCountry: string;
  estimatedDeliveryDate: string;
  /** Null lets Google choose the language from the customer's browser. */
  lang: string | null;
  optInStyle?: string;
}

/**
 * Google Customer Reviews survey opt-in (order confirmation).
 * Loaded directly on the page — not via GTM per Merchant Center requirements.
 */
export default function GoogleCustomerReviewsOptIn({
  merchantId,
  orderId,
  email,
  deliveryCountry,
  estimatedDeliveryDate,
  lang,
  optInStyle = "CENTER_DIALOG",
}: GoogleCustomerReviewsOptInProps) {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (lang) {
      window.___gcfg = { lang };
    }

    window.renderOptIn = () => {
      window.gapi?.load("surveyoptin", () => {
        window.gapi?.surveyoptin.render({
          merchant_id: merchantId,
          order_id: orderId,
          email,
          delivery_country: deliveryCountry,
          estimated_delivery_date: estimatedDeliveryDate,
          opt_in_style: optInStyle,
        });
      });
    };

    const existing = document.getElementById(PLATFORM_SCRIPT_ID);
    if (existing) {
      if (window.gapi?.surveyoptin) {
        window.renderOptIn();
      }
      return;
    }

    const script = document.createElement("script");
    script.id = PLATFORM_SCRIPT_ID;
    script.src = PLATFORM_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [merchantId, orderId, email, deliveryCountry, estimatedDeliveryDate, lang, optInStyle]);

  return null;
}
