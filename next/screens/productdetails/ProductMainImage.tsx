import Image from "next/image";
import { Box } from "@/components/ui/box";
import { getImageUrl } from "@/utils/imageUtils";

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAlMB9p0lL0kAAAAASUVORK5CYII=";

const PDP_IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px";

type ProductMainImageProps = {
  imageUrl: string | null | undefined;
  productTitle?: string | null;
  imageLabel?: string | null;
  className?: string;
};

/**
 * Server-rendered PDP hero image for LCP (same dimensions/sizes as OGImageCarousal main image).
 */
export default function ProductMainImage({
  imageUrl,
  productTitle,
  imageLabel,
  className = "",
}: ProductMainImageProps) {
  const src = getImageUrl(imageUrl);
  if (!src || src.includes("Frame.svg")) return null;

  const label = [imageLabel, productTitle].filter(Boolean).join(" ").trim();
  const alt = label || productTitle || "Product image";

  return (
    <Box
      className={`h-[240px] max-h-[241px] w-full gtsm:h-[432px] gtsm:max-h-[433px] gtsm:cursor-crosshair gtlg:h-auto ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        title={alt}
        className="h-full w-full object-contain"
        width={400}
        height={400}
        quality={75}
        sizes={PDP_IMAGE_SIZES}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        priority
        fetchPriority="high"
      />
    </Box>
  );
}

export { PDP_IMAGE_SIZES };
