import { Box } from "@/components/ui/box";
import star from "../../public/assets/greenstar.svg";
import Image from "next/image";
import { currencyFormat } from "@/helpers/UtilityHelper";
import { useBranding } from "@/contexts/BrandingContext";
import { PartLineImage } from "@/components/og-components/PartLineImage";
import type { PartImageItem } from "@/utils/partImageUtils";

interface ReturncardProps {
  id?: string;
  quantity?: string;
  name?: string;
  description?: string;
  unitPriceIncVat?: string;
  image?: string;
  images?: PartImageItem[];
  categories?: string[];
  price?: number;
}

export const StarBlock = () => {
  return (
    <Box className="relative z-50 h-6 w-6">
      <Image src={star} alt="" className="h-6 w-6" />
      <Box className="absolute inset-0 flex items-center justify-center text-center font-Anton text-[11.85px] font-[400] leading-[6.667px] text-[--Brand-Pure-White]">
        OE
      </Box>
    </Box>
  );
};

export default function Returncard({
  quantity,
  name = "Part name",
  description = "Description",
  unitPriceIncVat,
  image,
  images,
  categories,
}: ReturncardProps) {
  const { getLocale, getLabel } = useBranding();
  const localeCODE = getLocale();
  const categoryId = categories?.[0]?.slice(0, 9);

  return (
    <Box className="z-0 flex w-full rounded-[8px] bg-color-background-l2 py-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] base:h-auto base:flex-col base:gap-[12px] base:px-[20px] gtsm:flex-col gtsm:gap-[12px] gtsm:px-[20px] gtlg:h-[140px] gtlg:flex-row gtlg:gap-[48px] gtlg:px-6">
      <Box className="flex w-full flex-row base:gap-[14px] gtsm:gap-11 gtlg:gap-12">
        <Box className="my-auto flex w-[118px] flex-row items-center overflow-hidden">
          <PartLineImage image={image ?? null} images={images} categoryId={categoryId ?? null} />
        </Box>

        <Box className="flex h-full w-full flex-col gap-[16px]">
          <Box className="flex flex-row items-center gap-3">
            <Box className="text-start text-color-text-body body-bold-md">{name}</Box>
            <StarBlock />
          </Box>
          <Box className="flex w-full">
            <div
              className="line-clamp-2 text-color-text-body body-regular-sm"
              dangerouslySetInnerHTML={{ __html: description }}
            />

            <Box className="flex h-[46px] w-full flex-row items-end justify-between">
              <Box className="h-[26px] w-full flex-row items-center text-color-secondary-main body-bold-lg">
                {currencyFormat(Number(Number(unitPriceIncVat).toFixed(2)), localeCODE)}
              </Box>
              <Box className="w-full flex-nowrap text-end text-color-text-body body-regular-sm">
                {getLabel("quantity")}: {quantity}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
