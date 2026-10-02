// Client-safe database types for telemetry
// This file only exports types for client-side use
// Actual database operations are handled by API routes

export interface TelemetryItem {
  id: number;
  session_id?: string;
  event: string;
  method: string;
  url: string;
  status?: number;
  duration: number;
  timestamp: string;
  environment: string;
  error?: string;
  stack?: string;
  node_version?: string;
  request_payload?: string;
  response_payload?: string;
  created_at: string;
}

export interface TelemetryStats {
  session_id?: string;
  event: string;
  count: number;
  avg_duration: number;
  min_duration: number;
  max_duration: number;
}

export interface TelemetrySession {
  session_id: string;
  first_seen: string;
  last_seen: string;
  total_events: number;
}

// Server-side database functions - only available in Node.js environment
export async function getTelemetryDB() {
  if (typeof window !== "undefined") {
    throw new Error("Database operations are only available on server");
  }

  // Dynamic import to avoid bundling issues
  const { telemetryDB } = await import("./db-server");
  return telemetryDB;
}

// Export types for client components
export type { telemetryDB as TelemetryDB } from "./db-server";
