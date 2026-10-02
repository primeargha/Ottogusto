import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { STORE_IDS, type StoreId } from "@/config/store-constants";
import { formatHttpClientError } from "@/utils/formatHttpClientError";

export const runtime = "nodejs";

const SENDGRID_API_URL = "https://api.sendgrid.com/v3/marketing/contacts";

// --- Marketing QR (unchanged) ---
const marketingQrSignupSchema = z.object({
  email: z.string().min(1).email(),
  marketingConsent: z.boolean(),
});

const MARKETING_QR_LIST_ID = "2167594c-a4fa-48ec-9c84-6f14aa892303";
const MARKETING_QR_SOURCE_VALUE = "marketing_qr";

async function handleMarketingQrSignup(email: string, marketingConsent: boolean) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "SENDGRID_API_KEY missing" }, { status: 500 });
  }

  const marketingConsentString = marketingConsent ? "true" : "false";

  const payload = {
    list_ids: [MARKETING_QR_LIST_ID],
    contacts: [
      {
        email,
        custom_fields: {
          // Per ticket: signup_source + marketing_consent are custom field IDs (literal names).
          signup_source: MARKETING_QR_SOURCE_VALUE,
          marketing_consent: marketingConsentString,
        },
      },
    ],
  };

  const response = await fetch(SENDGRID_API_URL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 200 || response.status === 202) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const text = await response.text();
  return NextResponse.json(
    {
      ok: false,
      error: text || `SendGrid error: ${response.status}`,
    },
    { status: response.status },
  );
}

// --- Footer email capture (OD-2146) ---
const emailCaptureSignupSchema = z.object({
  signupSource: z.literal("email_capture_widget"),
  email: z.string().min(1).email(),
});

const STOREFRONT_LIST_IDS: Record<StoreId, string> = {
  [STORE_IDS.OTTOGUSTO]: "eb871fe5-ae36-473c-aabe-0064f90dfaa1",
  [STORE_IDS.QVERDE]: "dfaecfc7-51ab-48ed-8334-9a6b68dee5b6",
};

function resolveStorefrontListId(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_STOREFRONT_LIST_ID?.replace(/^"|"$/g, "");
  if (fromEnv) return fromEnv;

  const store = (process.env.STORE ||
    process.env.NEXT_PUBLIC_STORE ||
    STORE_IDS.OTTOGUSTO) as StoreId;
  return STOREFRONT_LIST_IDS[store] ?? STOREFRONT_LIST_IDS[STORE_IDS.OTTOGUSTO];
}

async function handleEmailCaptureSignup(email: string) {
  const apiKey = process.env.SENDGRID_MARKETING_CONSENT_SIGNUP_API_KEY;
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.error("[marketing/signup] SENDGRID_MARKETING_CONSENT_SIGNUP_API_KEY missing");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const listId = resolveStorefrontListId();
  if (!listId) {
    // eslint-disable-next-line no-console
    console.error("[marketing/signup] storefront list ID missing");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // SendGrid custom field names (ticket labels → account field definitions):
  // signup_source, marketing_consent (consent_type value), tag (campaign_tag value)
  const customFields = {
    signup_source: "email_capture_widget",
    marketing_consent: "marketing_updates",
    tag: "general_marketing_capture",
    // consent_type: "marketing_updates",
    // campaign_tag: "general_marketing_capture",
  };

  const payload = {
    list_ids: [listId],
    contacts: [{ email, custom_fields: customFields }],
  };

  // eslint-disable-next-line no-console
  console.info("[marketing/signup] email_capture_widget → SendGrid", {
    listId,
    email,
    custom_fields: customFields,
  });

  const response = await fetch(SENDGRID_API_URL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 200 || response.status === 202) {
    // eslint-disable-next-line no-console
    console.info("[marketing/signup] email_capture_widget success:", response.status);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const text = await response.text();
  // eslint-disable-next-line no-console
  console.error("[marketing/signup] email_capture_widget SendGrid error:", {
    status: response.status,
    body: text,
    listId,
    email,
  });
  return NextResponse.json({ ok: false }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body?.signupSource === "email_capture_widget") {
      const { email } = emailCaptureSignupSchema.parse(body);
      return handleEmailCaptureSignup(email);
    }

    const { email, marketingConsent } = marketingQrSignupSchema.parse(body);
    return handleMarketingQrSignup(email, marketingConsent);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid request body", details: error.errors },
        { status: 400 },
      );
    }

    // eslint-disable-next-line no-console
    console.error("[marketing/signup] error:", formatHttpClientError(error));
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
