import { OGButton } from "@/components/og-components/OGButton";
import { Box } from "@/components/ui/box";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useCartStore } from "@/stores/useCartStore";
import useRouter from "@unitools/router";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useShoppingCartHref } from "@/hooks/useVehicleAwareCartHref";
import { useEffect } from "react";
import Typography from "./og-components/Typography";
import { clearPaymentSession } from "@/utils/paymentSession";

export default function PaymentFail() {
  const { getLabel } = useBranding();
  const { settry_again } = useCartStore();
  const params = useParams();
  const router = useRouter();
  const shoppingCartHref = useShoppingCartHref();

  useEffect(() => {
    clearPaymentSession();
  }, []);

  return (
    <Box className="flex h-full w-full flex-col items-center justify-center">
      <Box className="flex w-full flex-col items-center gap-6">
        <Box className="flex flex-col">
          <Typography type="h1" className="text-center text-color-text-body">
            {getLabel("bump_road")}
          </Typography>
          <Typography type="h1" className="text-center text-color-text-body">
            {getLabel("payment_unsuccessfull")}
          </Typography>
        </Box>

        <Box className="text-start text-color-text-body body-regular-lg">
          {getLabel("payment_fail_message")}
        </Box>
        <Box className="flex items-center justify-center gap-6 base:flex-col gtlg:flex-row">
          <OGButton
            type="outlined"
            size="large"
            onClick={() => router.push(getRouteLocaleString(Routes.pitStop, params))}
            rightcomp={
              <Image
                src={"/assets/icons/right-arrow-dark.svg"}
                width={24}
                height={24}
                alt="arrow-right"
              />
            }
            // className="flex w-fit flex-row items-center gap-2 rounded-[4px] p-[16px] text-[--Text-White]"
          >
            {getLabel("back_to_pitstop")}
          </OGButton>

          <OGButton
            type="primary"
            size="large"
            onClick={() => {
              settry_again(true);
              router.push(shoppingCartHref);
            }}
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
            {getLabel("try_again")}
          </OGButton>
        </Box>
      </Box>
    </Box>
  );
}
