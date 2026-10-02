import { NextRequest, NextResponse } from "next/server";
import { getTelemetryDB } from "../../../lib/db";
import { formatHttpClientError } from "@/utils/formatHttpClientError";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { event, method, url, duration, timestamp, environment } = body;

    if (!event || !method || !url || !duration || !timestamp || !environment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get database instance (server-only)
    const telemetryDB = await getTelemetryDB();

    // Insert telemetry data
    const result = telemetryDB.insert({
      sessionId: body.sessionId,
      event,
      method,
      url,
      status: body.status,
      duration,
      timestamp,
      environment,
      error: body.error,
      stack: body.stack,
      nodeVersion: body.nodeVersion,
      requestPayload: body.requestPayload,
      responsePayload: body.responsePayload,
    });

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error("Telemetry API error:", formatHttpClientError(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const event = searchParams.get("event");
    const sessionId = searchParams.get("sessionId");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Get database instance (server-only)
    const telemetryDB = await getTelemetryDB();

    let data;

    // Priority: Session filter takes precedence, can be combined with event filter
    if (sessionId && sessionId.trim() !== "") {
      // Get data for specific session (with optional event filtering)
      data = telemetryDB.getBySessionAndEvent(sessionId, event, limit);
    } else if (event === "api_error") {
      // Get error events
      data = telemetryDB.getErrors(limit);
    } else if (event) {
      // Get events for specific type
      data = telemetryDB.getByEvent(event, limit);
    } else {
      // Get most recent events
      data = telemetryDB.getRecent(limit);
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Telemetry GET error:", formatHttpClientError(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
