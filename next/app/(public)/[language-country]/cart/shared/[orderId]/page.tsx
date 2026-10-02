"use client";

import { useGetOrderByIdWithoutEmail } from "@/hooks/orders";
import React from "react";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Box } from "@/components/ui/box";

/**
 * [OD-403] Sharable cart page
 * Test URL http://localhost:3000/en-EU/cart/shared/OG000332/
 */
export default function CartPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) ?? "";

  const { data: cartData, isPending, error } = useGetOrderByIdWithoutEmail(orderId);

  if (isPending) {
    return (
      <Box className="flex min-h-[80vh] items-center justify-center">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-red-600">Failed to load cart: {error.message}</p>
      </div>
    );
  }

  if (!cartData) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-color-text-body">Cart not found.</p>
      </div>
    );
  }

  return (
    <main>
      <h1>Cart</h1>
      <pre>{JSON.stringify(cartData, null, 2)}</pre>
    </main>
  );
}
