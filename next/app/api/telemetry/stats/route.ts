import { NextRequest, NextResponse } from "next/server";
import { getTelemetryDB } from "../../../../lib/db";
import { formatHttpClientError } from "@/utils/formatHttpClientError";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get database instance (server-only)
    const telemetryDB = await getTelemetryDB();
    const stats = telemetryDB.getStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Telemetry stats error:", formatHttpClientError(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
