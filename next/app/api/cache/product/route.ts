import { NextRequest, NextResponse } from "next/server";
import { formatHttpClientError } from "@/utils/formatHttpClientError";

// In-memory cache storage (persists across requests during server runtime)
const productCache = new Map<string, { data: any; timestamp: number }>();

// Cache TTL (Time To Live) - 24 hours in milliseconds
const CACHE_TTL = 24 * 60 * 60 * 1000;

// POST - Store product data with ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Store in cache with timestamp
    productCache.set(id, {
      data,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Product ${id} cached successfully`,
      cachedId: id,
    });
  } catch (error) {
    console.error("[Cache API] Error storing product:", formatHttpClientError(error));
    return NextResponse.json({ success: false, error: "Failed to cache product" }, { status: 500 });
  }
}

// GET - Retrieve product data by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 },
      );
    }

    const cached = productCache.get(id);

    if (!cached) {
      return NextResponse.json(
        { success: false, error: "Product not found in cache" },
        { status: 404 },
      );
    }

    // Check if cache is expired
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;

    if (isExpired) {
      productCache.delete(id);
      return NextResponse.json({ success: false, error: "Cache expired" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: cached.data,
      cachedAt: new Date(cached.timestamp).toISOString(),
    });
  } catch (error) {
    console.error("[Cache API] Error retrieving product:", formatHttpClientError(error));
    return NextResponse.json(
      { success: false, error: "Failed to retrieve cached product" },
      { status: 500 },
    );
  }
}

// DELETE - Clear specific product from cache or all cache
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Delete specific product
      const deleted = productCache.delete(id);
      return NextResponse.json({
        success: deleted,
        message: deleted ? `Product ${id} removed from cache` : "Product not found",
      });
    } else {
      // Clear all cache
      productCache.clear();
      return NextResponse.json({
        success: true,
        message: "All cache cleared",
      });
    }
  } catch (error) {
    console.error("[Cache API] Error deleting cache:", formatHttpClientError(error));
    return NextResponse.json({ success: false, error: "Failed to delete cache" }, { status: 500 });
  }
}
