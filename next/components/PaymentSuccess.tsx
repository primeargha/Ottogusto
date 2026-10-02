import React from "react";

import { OGButton } from "@/components/og-components/OGButton";
import { Box } from "@/components/ui/box";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import useRouter from "@unitools/router";
import Image from "next/image";
import { useParams } from "next/navigation";
import Typography from "./og-components/Typography";

export default function PaymentSuccess() {
  const { getLabel } = useBranding();
  const params = useParams();
  const router = useRouter();
  return (
    <Box className="flex h-full w-full flex-col items-center justify-center">
      <Box className="flex w-full flex-col items-center gap-6">
        <Typography type="h1" className="text-center text-color-text-body">
          {getLabel("smooth_ride_order_placed")}
        </Typography>
        <Box className="text-start text-color-text-body body-regular-lg">
          {getLabel("payment_success_message")}
        </Box>
        <Box>
          <OGButton
            type="primary"
            size="large"
            onClick={() => router.push(getRouteLocaleString(Routes.pitStop, params))}
            rightcomp={
              <Image
                src={"/assets/icons/arrow-right-02.svg"}
                width={24}
                height={24}
                alt="arrow-right"
              />
            }
            // className="flex w-fit flex-row items-center gap-2 rounded-[4px] p-[16px] text-[--Text-White]"
          >
            {getLabel("return_to_pitstop")}
          </OGButton>
        </Box>
      </Box>
    </Box>
  );
}
