import { NextResponse } from "next/server";
import { buildRobotsContent } from "@/utils/robotsContent";

export const GET = (): NextResponse => {
  const isProd: boolean = process.env?.NEXT_ALLOW_ROBOTS === "true";
  const content = buildRobotsContent({
    isProd,
    prodUrl: process.env.NEXT_PUBLIC_FRONTEND_PROD_URL,
    devUrl: process.env.NEXT_PUBLIC_FRONTEND_DEV_URL,
  });

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
