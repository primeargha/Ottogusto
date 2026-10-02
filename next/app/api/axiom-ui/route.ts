import { NextResponse } from "next/server";
import { axiomUiServerLogger } from "@/lib/axiom/server";
import { createProxyRouteHandler } from "@axiomhq/nextjs";

export const runtime = "nodejs";

const proxyHandler =
  axiomUiServerLogger !== null ? createProxyRouteHandler(axiomUiServerLogger) : null;

export async function POST(request: Request) {
  if (!proxyHandler) {
    return NextResponse.json({ error: "Axiom UI logging is not configured" }, { status: 503 });
  }

  return proxyHandler(request);
}
