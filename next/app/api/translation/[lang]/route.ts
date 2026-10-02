// ✅ ISR: Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/config/api";
import type { GetTranslationsResponse } from "@/type";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
import { TRANSLATION_KEYS_LANG } from "@/utils/translationDisplayMode";

// ✅ Valid language codes (ISO 639-1) + pseudo "key" locale
const VALID_LANG_CODES = ["en", "nl", "fr", "de", "es", "it", "pt", "pl", TRANSLATION_KEYS_LANG];

export async function GET(request: NextRequest, { params }: { params: { lang: string } }) {
  try {
    let { lang } = params;

    // ✅ Normalize: extract language part if it contains country code (e.g., "en-BE" -> "en")
    lang = lang?.split("-")[0]?.toLowerCase() || "en";

    // ✅ Validate language code format (2 lowercase letters or "key")
    if (!lang || !/^(?:key|[a-z]{2})$/.test(lang)) {
      console.warn(`[Translation API] Invalid language code: "${params.lang}"`);
      return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
    }

    // ✅ Validate against known languages (prevent calls like /api/translation/qverde)
    if (!VALID_LANG_CODES.includes(lang)) {
      console.warn(`[Translation API] Unknown language code: "${lang}", returning 400`);
      return NextResponse.json({ error: `Unknown language code: ${lang}` }, { status: 400 });
    }

    // Fetch from backend API
    const response = await apiClient.get<{ data: GetTranslationsResponse }>(
      `/Translations/${lang}`,
    );

    // Extract only the data property (avoid circular references)
    const translations: GetTranslationsResponse = response?.data ?? {};

    return NextResponse.json(translations, {
      headers: {
        // ✅ Cache for 24 hours (86400 seconds)
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        "X-Cache": "MISS",
        "X-Language": lang,
      },
    });
  } catch (error) {
    console.error("Error fetching translations:", formatHttpClientError(error));
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 });
  }
}
