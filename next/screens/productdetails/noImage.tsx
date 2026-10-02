import { Box } from "@/components/ui/box";
import testProduct from "@/assets/Ottogusto/testproduct.svg";
import Image from "next/image";
import { useMedia } from "@/hooks/useMedia";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import { PartImagePlaceholderOverlay } from "@/components/og-components/PartImagePlaceholderOverlay";

export default function NoImage({
  imageUrl,
  categoryId,
  className,
}: {
  /** Preferred: category image URL from Part API (label "Category"). */
  imageUrl?: string | null;
  /** Legacy fallback when API sends empty images[]. */
  categoryId?: string;
  className?: string;
}) {
  const isMobile = useMedia("(max-width: 639px)");

  const getImageSrc = () => {
    if (imageUrl) return imageUrl;
    if (!categoryId) return testProduct;
    return getCategoryImageUrl(categoryId);
  };

  return (
    <Box
      className={`mx-auto items-center ${className} justify-center ${isMobile ? "max-h-[240px] max-w-[240px]" : "w-full gtsm:max-h-[310px] gtlg:max-h-[394px] gtlg:max-w-[400px]"}`}
    >
      <Box
        className={`relative h-full w-full cursor-default items-stretch overflow-hidden rounded-xl p-4 gtsm:max-w-[310px] gtlg:max-w-[400px]`}
      >
        <Image
          src={getImageSrc()}
          alt="Main Part Image"
          className="h-full w-full object-contain opacity-40 grayscale"
          width={200}
          height={320}
          quality={60}
          loading="lazy"
          unoptimized
        />
        <PartImagePlaceholderOverlay />
      </Box>
    </Box>
  );
}
