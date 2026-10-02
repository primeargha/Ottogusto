// ✅ ISR: Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

import { NextResponse } from "next/server";
import { getBrands } from "@/services/search";

export async function GET() {
  try {
    // ✅ Use cached getBrands function
    const response = await getBrands();
    const brands = response?.data || response;
    return NextResponse.json(brands, {
      headers: {
        // ✅ Cache for 24 hours
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
