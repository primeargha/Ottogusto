export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL || "https://cdn.ottogusto.group";
/**
 * API route to proxy Migration FAQ HTML files from CDN
 *
 * @param request - Next.js request object containing file query parameter
 * @returns JSON response with HTML content and content-type
 */
const STORE_NAME = process.env.NEXT_PUBLIC_STORE || "ottogusto";
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file") || "MigrationFAQ_EN.html";

    const cdnUrl = `${CDN_BASE_URL}/${STORE_NAME}/${fileName}`;

    const cdnResponse = await fetch(cdnUrl, {
      method: "GET",
      headers: {
        "User-Agent": "OttoGusto-Proxy/1.0",
      },
    });
    if (!cdnResponse.ok) {
      console.error(
        `[MigrationFAQ Proxy] CDN Error: ${cdnResponse.status} ${cdnResponse.statusText}`,
      );
      throw new Error(`CDN error: ${cdnResponse.status}`);
    }
    const content = await cdnResponse.text();
    const contentType = cdnResponse.headers.get("content-type") || "text/html";
    return NextResponse.json({
      content,
      contentType,
    });
  } catch (error) {
    console.error("[MigrationFAQ Proxy] Error:", formatHttpClientError(error));

    return NextResponse.json(
      {
        error: "Failed to fetch migration FAQ",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
