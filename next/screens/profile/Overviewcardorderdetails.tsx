import { OGButton } from "@/components/og-components/OGButton";
import { SimplePolicyLink } from "@/components/PolicyViewer";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { currencyFormat, getRouteLocaleString } from "@/helpers/UtilityHelper";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useMedia } from "@/hooks/useMedia";
import exclamicon from "@/assets/productdetailsexclamation-icon.svg";
import { CustomTooltip } from "@/components/og-components/OGtooltip";
import Link from "next/link";
export interface Item {
  id: string;
  quantity: number;
  name: string;
  unitPrice: number;
  unitPriceIncVat: number;
  type: string; // e.g., "Part", "Service", etc.
}

export interface OrderData {
  items: Item[];
  totalPriceIncVat: number;
  shippingFee: number;
}

interface OverviewcardorderdetailsProps {
  data: OrderData;
}

export default function Overviewcardorderdetails({ data }: OverviewcardorderdetailsProps) {
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel, getLocale } = useBranding();
  const localeCODE = getLocale();
  const params = useParams();
  const items = data?.items.filter((item) => item.type === "Part") || [];
  const totalQuantity = items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const deposititems = data.items.filter((item: any) => item.type === "Deposit");
  const totaldeposit = deposititems.reduce((acc: any, item: any) => acc + item.totalPriceIncVat, 0);
  const totalPrice = data?.totalPriceIncVat || 0;
  const shippingFee = data?.shippingFee || 0;
  const linkTextClass = `cursor-pointer text-[14px] font-normal leading-[16px] text-[--Text-Tarmac-Placeholder] underline decoration-solid underline-offset-auto`;

  const getPrice = (items: any) => {
    return items.reduce((acc: number, item: any) => acc + item.totalPriceIncVat, 0);
  };

  return (
    <Box
      className={`${isMobile ? "z-100 h-fit w-full bg-color-background-l2" : "rounded-[9px]"} h-fit gtsm:min-w-[350px] gtlg:min-w-[380px] gtlg:bg-transparent`}
    >
      <Box
        className={`${isMobile ? "z-90" : ""} "z-100 w-full rounded-[8px] bg-color-background-l1 p-6 base:h-auto gtsm:mx-0 gtlg:mx-0 gtlg:h-auto`}
      >
        <Box className="flex h-full flex-col justify-between gap-[32px]">
          <Box className="flex flex-col gap-[24px]">
            <Box className="not-ligatures text-start font-Overpass text-[24px] font-bold leading-[26px] text-black">
              {getLabel("overview")}
            </Box>

            <Box className="flex flex-col gap-3">
              <Box className="flex w-full flex-row justify-between">
                <Box className="font-Overpass text-[18px] font-normal leading-5">
                  {getLabel("articles")} ({totalQuantity})
                </Box>
                <Box>{currencyFormat(getPrice(items), localeCODE)}</Box>
              </Box>
              {/* Items block parent*/}

              <Box className="mb-4 flex w-full flex-col gap-3 pl-2">
                {items?.map((item, index) => (
                  <Box key={index} className="flex w-full flex-row justify-between">
                    <Box className="font-Overpass text-[18px] font-normal leading-5">
                      {item.quantity} x{" "}
                      {(item.name || "[Partname]").length > 18
                        ? `${(item.name || "[Partname]").slice(0, 18)}...`
                        : item.name || "[Partname]"}
                    </Box>
                    <Box>{currencyFormat(Number(item.unitPriceIncVat.toFixed(2)), localeCODE)}</Box>
                  </Box>
                ))}
              </Box>

              <Box className="flex w-full flex-row justify-between">
                <Box className="font-Overpass text-[18px] font-normal leading-5">
                  {getLabel("delivery_cost")}
                </Box>
                <Box>{currencyFormat(data?.shippingFee, localeCODE)} </Box>
              </Box>
              {totaldeposit > 0 && (
                <Box className="flex w-full flex-row justify-between">
                  <Box className="flex flex-row items-center gap-3">
                    <Box className="font-Overpass text-[18px] font-normal leading-5">
                      {getLabel("deposit")}
                    </Box>
                    <CustomTooltip content={getLabel("deposit_hover_text")}>
                      <Image src={exclamicon} alt="icon" className="cursor-pointer pr-1" />
                    </CustomTooltip>
                    {/* <Image src={exclamicon} alt="icon" className="pr-1" /> */}
                  </Box>

                  <Box> {currencyFormat(totaldeposit, localeCODE)}</Box>
                </Box>
              )}
            </Box>
          </Box>

          <Divider />

          <Box className="flex h-auto flex-col gap-[6px]">
            <Box className="flex w-full flex-row items-center justify-between gap-3">
              <Box className="flex flex-row items-center">
                <Box className="font-Overpass text-[20px] font-bold leading-[22px] text-black">
                  {getLabel("total")}
                </Box>{" "}
                <Box className="ml-[5px] font-Overpass text-[14px] font-normal leading-[16px] text-[--Text-Tarmac-Placeholder]">
                  {getLabel("vat")}
                </Box>
              </Box>
              <Box className="not-ligatures w-1/2 text-end font-Overpass text-[20px] font-bold leading-[22px] text-black">
                {currencyFormat(Number(totalPrice.toFixed(2)), localeCODE)}
              </Box>
            </Box>

            <Box className="py-[10px]">
              <Link
                href={getRouteLocaleString(Routes.returnPolicy, params)}
                className={linkTextClass}
              >
                {getLabel("return_policy")}
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
