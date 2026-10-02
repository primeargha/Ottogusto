import { OGDiscountButton } from "@/components/og-components/OGDiscountButton";
import { OGButton } from "@/components/og-components/OGButton";
import Typography from "@/components/og-components/Typography";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import greendot from "@/assets/greendot.svg";
import warningdot from "@/assets/warningdot.svg";
import { currencyFormat, getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useVatString } from "@/hooks/useVatString";
import Image from "next/image";
import Productcart from "./productcart";
import type { ViewItemListCategoryContext } from "@/utils/gtm";
import Link from "next/link";
import { ReturnIcon } from "./ReturnIcon";
import { useParams } from "next/navigation";
import { Routes } from "@/config/routes";
import { PaymentShield } from "./PaymentSheild";
import exclamicon from "@/assets/productdetailsexclamation-icon.svg";
import { DeliveryTruck } from "./DeliveryTruck";

import { CustomTooltip } from "@/components/og-components/OGtooltip";
import { useGetInstockInformationQuery } from "@/hooks/productdetails";
import ProductRequestinformation from "./ProductRequestinformation";
import { InfoCircleIcon } from "./InfoCircleIcon";
import { IndicatorIcon } from "../shoppingcart/IndicatorIcon";
const Productprice = ({
  data,
  defaultQty = 1,
  itemCategoryContext,
}: {
  data: any;
  defaultQty?: number;
  itemCategoryContext?: ViewItemListCategoryContext | undefined;
}) => {
  const { getLocale, getLabel } = useBranding();
  const localeCODE = getLocale();
  const params = useParams();
  type AvailabilityKey = "OnRequest" | "InStock" | "BackOrder" | "EndOfLife";
  type DeliveryKey = "small" | "medium" | "large";
  const vatString = useVatString();
  const getAvalibilityText = (): string => {
    const avalibilityKey: Record<AvailabilityKey, string> = {
      OnRequest: "on_request",
      InStock: "in_stock",
      EndOfLife: "end_of_life",
      BackOrder: "backorder",
    };

    const availability = data?.availability as AvailabilityKey;
    const key = availability && avalibilityKey[availability] ? avalibilityKey[availability] : "";
    return getLabel(key);
  };
  const getDeliveryText = (deliveryTime: string): string => {
    const deliveryKey: Record<DeliveryKey, string> = {
      small: "delivery_type_small",
      medium: "delivery_type_medium",
      large: "delivery_type_large",
    };
    const delivery = deliveryTime as DeliveryKey;
    const key = delivery && deliveryKey[delivery] ? deliveryKey[delivery] : "Not available";
    return getLabel(key);
  };
  const { data: instockInfo } = useGetInstockInformationQuery(
    data?.availability === "InStock" ? data?.id : null,
  );
  const rrp = data?.recommendedPriceInclVat || 0;
  const discount = ((rrp - data?.priceInclVat) / rrp) * 100;
  return (
    <Box
      className={`flex flex-col rounded-md border border-color-border-emphasis bg-color-background-emphasis card-padding-default card-gap-default`}
    >
      <Box className="flex w-full flex-col gap-space-md">
        {Math.round(discount) > 10 && (
          <Box className="flex w-full flex-row gap-x-space-xs">
            <OGDiscountButton
              type="emphasis"
              color="positive"
              label={`-${discount.toFixed(0)}%`}
              trailingIcon={false}
            />
          </Box>
        )}

        <Box className="flex w-full flex-col">
          <Box className="flex flex-row items-baseline gap-space-xs">
            <Typography
              type="p"
              className={`flex flex-row gap-[6px] whitespace-nowrap text-color-text-emphasis typography-mono-extra-large`}
            >
              {currencyFormat(data?.priceInclVat, localeCODE, false)}
            </Typography>
            {Math.round(discount) > 10 && (
              <Box className="text-color-text-muted line-through typography-mono-caption">
                {getLabel("productdetails_rrp")} {currencyFormat(rrp, localeCODE, false)}
              </Box>
            )}
          </Box>
          <Box className="text-color-text-muted typography-caption">{vatString}</Box>
        </Box>

        {data?.availability === "InStock" || data?.availability === "OnRequest" ? (
          <Productcart
            data={data}
            defaultQty={defaultQty}
            itemCategoryContext={itemCategoryContext}
          />
        ) : (
          // Himashu da, plz add the labeling in this component OD-1632
          <ProductRequestinformation data={data} />
        )}
      </Box>

      <Box className="h-[1px] w-full border-t border-color-border-emphasis"></Box>
      <Box className="flex w-full flex-col items-center justify-start gap-space-md">
        <Box className="flex h-auto min-h-[20px] w-full flex-row items-center gap-2">
          <Box className="p-2">
            <IndicatorIcon
              className={
                data?.availability === "InStock"
                  ? "text-color-icon-positive"
                  : data?.availability === "EndOfLife"
                    ? "text-color-text-disabled"
                    : "text-color-icon-attention"
              }
            />
          </Box>
          <Box className="flex flex-row gap-space-2xs text-color-text-emphasis typography-caption">
            {getAvalibilityText()}
            {data?.availability === "InStock" && (instockInfo?.data?.stock as any) > 0 && (
              <span className="cursor-default text-color-text-disabled typography-caption">
                ({instockInfo?.data?.stock})
              </span>
            )}
          </Box>
        </Box>

        <Box className="flex h-auto w-full flex-row items-center gap-3">
          <ReturnIcon className="text-color-icon-default" />

          <Link
            href={getRouteLocaleString(Routes.returnPolicy, params)}
            className="text-color-text-emphasis typography-caption"
          >
            {getLabel("productdetails_14daysreturn_info")}
          </Link>
        </Box>

        <Box className="flex h-auto w-full flex-row items-center gap-3">
          <PaymentShield className="text-color-icon-default" />
          <Box className="text-color-text-emphasis typography-caption">
            {getLabel("productdetails_securepayment_claim")}
          </Box>
        </Box>
        {(data?.availability === "InStock" || data?.availability === "OnRequest") && (
          <Box className="flex h-auto min-h-[40px] w-full flex-row items-center gap-3">
            <DeliveryTruck className="text-color-icon-default" />

            <Box className="flex min-h-[20px] flex-row flex-wrap gap-space-2xs text-color-text-muted typography-caption">
              {getLabel("productdetails_delivery")}{" "}
              <span className="text-color-text-emphasis typography-caption">
                {data?.availability === "InStock"
                  ? getDeliveryText(instockInfo?.data?.deliveryTime as DeliveryKey)
                  : data?.availability === "OnRequest"
                    ? getLabel("productdetails_tbd")
                    : null}
              </span>
            </Box>

            {(data?.availability === "InStock" || data?.availability === "OnRequest") && (
              <CustomTooltip content={getLabel("delivery_policy_condition")}>
                <InfoCircleIcon className="cursor-pointer text-color-icon-default" />
              </CustomTooltip>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Productprice;
