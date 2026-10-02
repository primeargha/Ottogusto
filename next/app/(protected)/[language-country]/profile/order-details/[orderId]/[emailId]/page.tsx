"use client";

import OrderDetails from "@/screens/profile/OrderDetails";
import { useGetOrderById } from "@/hooks/orders";
import React from "react";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Box } from "@/components/ui/box";

const Page = () => {
  const params = useParams();
  const orderId = (params?.orderId as string) ?? "";
  const emailId = (params?.emailId as string) ?? "";

  const { data, isPending, error } = useGetOrderById(orderId, emailId);

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
        <p className="text-red-600">Failed to load order: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-color-text-body">Order not found.</p>
      </div>
    );
  }

  return <OrderDetails data={data} />;
};

export default Page;
