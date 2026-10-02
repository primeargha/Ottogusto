"use client";
import { Box } from "@/components/ui/box";
import OrderDetails from "@/screens/profile/OrderDetails";
import useRouter from "@unitools/router";

export default function OrderDetailsPage() {
  const router = useRouter();
  return (
    <main className="z-[10] min-h-full bg-color-background-l2 base:pb-6 gtsm:p-6 gtlg:p-[38px]">
      <Box className="h-full w-full base:pt-[100px] gtlg:pt-[75px]">
        <OrderDetails />
      </Box>
    </main>
  );
}
