import { Box } from "@/components/ui/box";
import productImg from "@/assets/Frame.svg";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { currencyFormat } from "@/helpers/UtilityHelper";
import { buildPartPdpHref } from "@/utils/build-part-pdp-url";
import { useBranding } from "@/contexts/BrandingContext";
import { PartImagePlaceholderOverlay } from "@/components/og-components/PartImagePlaceholderOverlay";
import star from "../../public/assets/greenstar.svg";

const frameFallbackSrc = typeof productImg === "string" ? productImg : productImg.src;

/** Order API sends a flat `image` string — part photos use `/parts/`, category placeholders do not. */
function isOrderPartImageUrl(url: string): boolean {
  return url.includes("parts");
}

function OrderItemImage({ image }: { image?: string | null }) {
  const src = image?.trim();
  if (!src) {
    return (
      <Box className="relative my-auto flex flex-row items-center justify-center overflow-hidden">
        <Image
          src={frameFallbackSrc}
          className="my-auto h-[85px] w-[122px] object-contain"
          width={1000}
          height={1000}
          alt="product"
          unoptimized
        />
      </Box>
    );
  }

  const isPlaceholder = !isOrderPartImageUrl(src);

  return (
    <Box className="relative my-auto flex flex-row items-center justify-center overflow-hidden">
      <Image
        src={src}
        className={`my-auto h-[85px] w-[122px] object-contain ${isPlaceholder ? "opacity-40 grayscale" : ""}`}
        width={1000}
        height={1000}
        alt="product"
        unoptimized
      />
      {isPlaceholder ? <PartImagePlaceholderOverlay /> : null}
    </Box>
  );
}

interface OrdercardProps {
  id: string;
  quantity: number;
  name?: string;
  description?: string;
  unitPriceIncVat?: number;
  image?: string;
}

export const StarBlock = () => {
  return (
    <Box className="relative z-50 h-6 w-6 base:min-w-6">
      <Image src={star} alt="" className="h-6 w-6" />
      <Box
        className="absolute inset-0 flex items-center justify-center text-center font-Anton text-[11.85px] font-[400] leading-[6.667px] text-[--Brand-Pure-White]"
        style={{
          fontFeatureSettings: "'liga' off, 'clig' off",
          fontStyle: "normal",
        }}
      >
        OE
      </Box>
    </Box>
  );
};

export default function Ordercard({
  id,
  quantity,
  name = "Part name",
  description = "Description",
  unitPriceIncVat = 109.99,
  image,
}: OrdercardProps) {
  const { getLocale, getLabel } = useBranding();
  const localeCODE = getLocale();
  const router = useRouter();
  const params = useParams();

  const handlepress = () => {
    const locale = (params as Record<string, string>)?.["language-country"];
    const href = locale ? buildPartPdpHref(locale, id, { seoName: name }) : null;
    if (href) router.push(href);
  };

  return (
    <Box
      className="z-0 flex w-full cursor-pointer rounded-[8px] bg-color-background-l1 py-3 base:h-auto base:flex-col base:gap-[12px] base:px-[20px] gtsm:flex-col gtsm:gap-[12px] gtsm:px-[20px] gtlg:h-[148px] gtlg:flex-row gtlg:gap-[48px] gtlg:px-6"
      // @ts-ignore
      onClick={handlepress}
    >
      <Box className="flex w-full flex-row base:gap-[14px] gtsm:gap-11 gtlg:gap-12">
        <Box className="my-auto flex w-[118px] flex-row items-center overflow-hidden">
          <OrderItemImage image={image ?? null} />
        </Box>

        <Box className="flex h-full w-full flex-col justify-between">
          <Box className="flex flex-row items-center gap-3">
            <Box className="text-start text-color-text-body body-bold-md">{name}</Box>
            <StarBlock />
          </Box>

          <Box
            className="line-clamp-2 h-[28px] text-color-text-body body-regular-sm"
            // @ts-ignore
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          ></Box>

          <Box className="flex h-[46px] justify-center">
            <Box className="h-[26px] w-full flex-row items-center text-color-secondary-main body-bold-lg">
              {currencyFormat(Number(unitPriceIncVat.toFixed(2)), localeCODE)}
            </Box>
          </Box>
          <Box className="w-full flex-nowrap text-end text-color-text-body body-regular-sm">
            {getLabel("quantity")}: {quantity}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
