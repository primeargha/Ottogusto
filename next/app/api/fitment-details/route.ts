export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { formatHttpClientError } from "@/utils/formatHttpClientError";
const cdnbaseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL || "https://cdn.ottogusto.group";
const STORE_NAME = process.env.NEXT_PUBLIC_STORE || "ottogusto";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");
    // const fileType = searchParams.get("type") || "policy";

    // Validate input
    if (!fileName) {
      return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
    }

    // Whitelist allowed files for security
    const allowedFiles = [
      "FitmentDetails_EN.html",
      "FitmentDetails_NL.html",
      "FitmentDetails_FR.html",
      "FitmentDetails_DE.html",
    ];

    if (!allowedFiles.includes(fileName)) {
      return NextResponse.json({ error: "File not allowed" }, { status: 403 });
    }

    // Build CDN URL
    const cdnUrl = `${cdnbaseUrl}/${STORE_NAME}/${fileName}`;
    // Fetch from CDN
    const response = await fetch(cdnUrl, {
      method: "GET",
      headers: {
        "User-Agent": "OttoGusto-Proxy/1.0",
      },
    });

    if (!response.ok) {
      console.error(`[Proxy] CDN Error: ${response.status} ${response.statusText}`);
      throw new Error(`CDN error: ${response.status}`);
    }

    // Get content based on file type
    let content: string | Buffer | ArrayBuffer;
    const contentType = response.headers.get("content-type") || "text/html";

    if (contentType.includes("application/pdf")) {
      content = await response.arrayBuffer();
      return new NextResponse(content, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "public, max-age=3600",
          "Content-Disposition": `inline; filename="${fileName}"`,
        },
      });
    } else {
      content = await response.text();
      return new NextResponse(content, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch (error) {
    console.error("[Proxy] Error:", formatHttpClientError(error));
    return NextResponse.json(
      {
        error: "Failed to fetch resource",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
