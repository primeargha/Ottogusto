"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OGPill from "@/components/og-components/OGPill";
import { Box } from "@/components/ui/box";
import { formatHttpClientError } from "@/utils/formatHttpClientError";

interface TelemetryItem {
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

interface TelemetryStats {
  session_id?: string;
  event: string;
  count: number;
  avg_duration: number;
  min_duration: number;
  max_duration: number;
}

interface TelemetrySession {
  session_id: string;
  first_seen: string;
  last_seen: string;
  total_events: number;
}

export default function TelemetryDashboard() {
  const [telemetry, setTelemetry] = useState<TelemetryItem[]>([]);
  const [stats, setStats] = useState<TelemetryStats[]>([]);
  const [sessions, setSessions] = useState<TelemetrySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [sessionFilter, setSessionFilter] = useState<string>("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    const fetchDataAndSessions = async () => {
      await fetchData();
      await fetchStats();
      await fetchSessions();
    };
    fetchDataAndSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sessionFilter]);

  const fetchData = async () => {
    try {
      // Build URL with query parameters
      let url = "/api/telemetry?limit=50";
      const params = new URLSearchParams();

      if (filter) params.append("event", filter);
      if (sessionFilter) {
        params.append("sessionId", sessionFilter);
      }

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setTelemetry(data.data || []);
    } catch (error) {
      console.error("Failed to fetch telemetry:", formatHttpClientError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/telemetry/stats");
      const data = await response.json();
      setStats(data.stats || []);
    } catch (error) {
      console.error("Failed to fetch stats:", formatHttpClientError(error));
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/telemetry/sessions");
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", formatHttpClientError(error));
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchData(), fetchStats(), fetchSessions()]);
    } catch (error) {
      console.error("Failed to refresh data:", formatHttpClientError(error));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "bg-gray-100 text-gray-800";
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800";
    if (status >= 300 && status < 400) return "bg-yellow-100 text-yellow-800";
    if (status >= 400 && status < 500) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const formatPayload = (payload?: string) => {
    if (!payload) return null;
    try {
      return JSON.stringify(JSON.parse(payload), null, 2);
    } catch {
      return payload;
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case "api_success":
        return "bg-green-100 text-green-800";
      case "api_error":
        return "bg-red-100 text-red-800";
      case "startup":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading telemetry data...</div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">API Telemetry Dashboard</h1>
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Card key={`${i}-${stat.event}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{stat.event}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <div className="text-muted-foreground text-xs">
                    Avg: {Math.round(stat.avg_duration)}ms
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Range: {stat.min_duration}ms - {stat.max_duration}ms
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Session Filter */}
          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold">Session Filter</h3>
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setSessionFilter("")}
                className={`rounded px-3 py-1 ${!sessionFilter ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                All Sessions
              </button>
              {sessions.slice(0, 5).map((session, i) => (
                <button
                  key={`${i}-${session.session_id}`}
                  onClick={() => setSessionFilter(session.session_id)}
                  className={`rounded px-3 py-1 text-sm ${
                    sessionFilter === session.session_id
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200"
                  }`}
                  title={`${session.total_events} events | ${new Date(session.last_seen).toLocaleTimeString()}`}
                >
                  {session.session_id.substring(0, 12)}...
                </button>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setFilter("")}
              className={`rounded px-3 py-1 ${!filter ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("api_success")}
              className={`rounded px-3 py-1 ${filter === "api_success" ? "bg-green-500 text-white" : "bg-gray-200"}`}
            >
              Success
            </button>
            <button
              onClick={() => setFilter("Server: api_success")}
              className={`rounded px-3 py-1 ${filter === "Server: api_success" ? "bg-green-500 text-white" : "bg-gray-200"}`}
            >
              SSR (success)
            </button>
            <button
              onClick={() => setFilter("Server: api_error")}
              className={`rounded px-3 py-1 ${filter === "Server: api_error" ? "bg-red-500 text-white" : "bg-gray-200"}`}
            >
              SSR (error)
            </button>
            <button
              onClick={() => setFilter("api_error")}
              className={`rounded px-3 py-1 ${filter === "api_error" ? "bg-red-500 text-white" : "bg-gray-200"}`}
            >
              Errors
            </button>
            <button
              onClick={() => setFilter("startup")}
              className={`rounded px-3 py-1 ${filter === "startup" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Startup
            </button>
          </div>
        </div>

        {/* Telemetry Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left">Session</th>
                    <th className="p-2 text-left">Event</th>
                    <th className="p-2 text-left">Method</th>
                    <th className="p-2 text-left">URL</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Duration</th>
                    <th className="p-2 text-left">Error</th>
                    <th className="p-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetry.map((item, i) => (
                    <React.Fragment key={`${i}-${item.id}`}>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(item.created_at).toLocaleTimeString()}</td>
                        <td className="p-2">
                          {item.session_id ? (
                            <span
                              className="cursor-pointer rounded bg-purple-100 px-2 py-1 text-xs text-purple-800"
                              onClick={() => setSessionFilter(item.session_id!)}
                              title="Click to filter by this session"
                            >
                              {item.session_id.substring(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">No session</span>
                          )}
                        </td>
                        <td className="p-2">
                          <Box
                            className={`w-fit content-center justify-center rounded-full px-6 py-1 text-center ${getEventColor(item.event)}`}
                          >
                            {item.event}
                          </Box>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{item.method}</Badge>
                        </td>
                        <td className="max-w-xs truncate p-2" title={item.url}>
                          {item.url}
                        </td>
                        <td className="p-2">
                          {item.status && (
                            <Box
                              className={`w-fit content-center justify-center rounded-full px-6 py-1 text-center ${getStatusColor(item.status)}`}
                            >
                              {item.status}
                            </Box>
                          )}
                        </td>
                        <td className="p-2">
                          <span
                            className={item.duration > 1000 ? "text-red-600" : "text-green-600"}
                          >
                            {item.duration}ms
                          </span>
                        </td>
                        <td className="max-w-xs truncate p-2" title={item.error}>
                          {item.error && (
                            <Badge variant="destructive" className="text-xs">
                              {item.error.substring(0, 50)}...
                            </Badge>
                          )}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {expandedRow === item.id ? "Hide" : "Show"}
                          </button>
                        </td>
                      </tr>
                      {expandedRow === item.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={9} className="border-b p-4">
                            <div className="space-y-4">
                              {item.request_payload && (
                                <div>
                                  <h4 className="mb-2 text-sm font-semibold">Request Payload:</h4>
                                  <pre className="max-h-40 w-full overflow-auto rounded border bg-white p-3 text-xs">
                                    {formatPayload(item.request_payload)}
                                  </pre>
                                </div>
                              )}
                              {item.response_payload && (
                                <div>
                                  <h4 className="mb-2 text-sm font-semibold">Response Payload:</h4>
                                  <pre className="max-h-40 w-full overflow-auto rounded border bg-white p-3 text-xs">
                                    {formatPayload(item.response_payload)}
                                  </pre>
                                </div>
                              )}
                              {item.stack && (
                                <div>
                                  <h4 className="mb-2 text-sm font-semibold">Stack Trace:</h4>
                                  <pre className="max-h-40 overflow-auto rounded border bg-red-50 p-3 text-xs text-red-800">
                                    {item.stack}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
