import { NextResponse } from "next/server";
import { axiomServerLogger } from "@/lib/axiom/server";
import { createProxyRouteHandler } from "@axiomhq/nextjs";

export const runtime = "nodejs";

const proxyHandler = axiomServerLogger !== null ? createProxyRouteHandler(axiomServerLogger) : null;

export async function POST(request: Request) {
  if (!proxyHandler) {
    return NextResponse.json({ error: "Axiom is not configured" }, { status: 503 });
  }

  return proxyHandler(request);
}
