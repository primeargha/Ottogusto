import { OGButton } from "@/components/og-components/OGButton";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import { currencyFormat } from "@/helpers/UtilityHelper";
import { useMedia } from "@/hooks/useMedia";
import ts from "typescript";
import { unknown } from "zod";
export interface Item {
  id: string;
  quantity: number;
  name: string;
  unitPrice: number;
  unitPriceIncVat: number;
  price: number;
}

export interface OrderData {
  items: Item[];
  totalPriceIncVat: number;
}

interface OverviewcarReturndetailsProps {
  items: Item[];
  totalPrice: number;
}

export default function OverviewcardReturndetails({
  items,
  totalPrice,
}: OverviewcarReturndetailsProps) {
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel, getLocale } = useBranding();
  const localeCODE = getLocale();
  return (
    <Box
      className={`${isMobile ? "z-100 h-fit w-full bg-color-background-l1 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" : "rounded-[9px]"} h-fit shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] gtsm:min-w-[350px] gtlg:min-w-[380px] gtlg:bg-transparent`}
    >
      <Box
        className={`${isMobile ? "z-90 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" : "shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)"} "z-100 gtlg:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25) w-full rounded-[8px] bg-color-background-l1 p-6 base:h-auto gtsm:mx-0 gtlg:mx-0 gtlg:h-auto`}
      >
        <Box className="flex h-full flex-col justify-between gap-[32px]">
          <Box className="flex flex-col gap-[24px]">
            <Box className="not-ligatures text-start text-color-text-body body-bold-lg">
              {getLabel("overview")}
            </Box>

            <Box className="flex flex-col gap-3">
              <Box className="flex w-full flex-row justify-between">
                <Box className="text-color-text-body body-regular-sm">
                  {getLabel("articles")} ({items.length})
                </Box>
                <Box>
                  {" "}
                  {currencyFormat(Number(totalPrice), localeCODE, {
                    symbolPosition: "before",
                  } as never)}
                </Box>
              </Box>
              {/* Items block parent*/}

              <Box className="mb-4 flex w-full flex-col gap-3 pl-2">
                {items?.map((item, index) => (
                  <Box key={index} className="flex w-full flex-row justify-between">
                    <Box className="text-color-text-body body-regular-sm">
                      1 x{" "}
                      {(item.name || "[Partname]").length > 18
                        ? `${(item.name || "[Partname]").slice(0, 18)}...`
                        : item.name || "[Partname]"}
                    </Box>
                    <Box>
                      {" "}
                      {currencyFormat(Number(item.price), localeCODE, {
                        symbolPosition: "before",
                      } as never)}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Divider />

          <Box className="flex h-auto flex-col gap-[6px]">
            <Box className="flex w-full flex-row items-center justify-between gap-2">
              <Box className="flex flex-row items-center gap-3">
                <Box className="flex w-auto flex-row flex-nowrap whitespace-nowrap text-color-text-body body-bold-lg">
                  {getLabel("total_refund")}
                </Box>{" "}
                <Box className="ml-5 flex-nowrap whitespace-nowrap text-color-text-body text-single-50-regular">
                  ({getLabel("vat")})
                </Box>
              </Box>
              <Box className="not-ligatures w-1/2 text-end text-color-text-body body-bold-lg">
                {currencyFormat(Number(totalPrice), localeCODE)}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
