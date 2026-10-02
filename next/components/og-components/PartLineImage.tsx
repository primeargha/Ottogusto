import { Box } from "@/components/ui/box";
import productImg from "@/assets/Frame.svg";
import Image from "next/image";
import { PartImagePlaceholderOverlay } from "@/components/og-components/PartImagePlaceholderOverlay";
import { resolvePartImageFromSources, type PartImageItem } from "@/utils/partImageUtils";

const frameFallbackSrc = typeof productImg === "string" ? productImg : productImg.src;

type PartLineImageProps = {
  image?: string | null;
  images?: PartImageItem[] | unknown;
  categoryId?: string | null;
  className?: string;
  width?: number;
  height?: number;
  compactOverlay?: boolean;
};

export function PartLineImage({
  image,
  images,
  categoryId,
  className = "my-auto h-[85px] w-[122px] object-contain",
  width = 1000,
  height = 1000,
  compactOverlay = false,
}: PartLineImageProps) {
  const { src, isPlaceholder } = resolvePartImageFromSources({
    images,
    imageUrl: image ?? null,
    ...(categoryId ? { categoryId } : {}),
  });
  const itemImg = src ?? frameFallbackSrc;

  return (
    <Box className="relative my-auto flex flex-row items-center justify-center overflow-hidden">
      <Image
        src={itemImg}
        className={`${className} ${isPlaceholder ? "opacity-40 grayscale" : ""}`}
        width={width}
        height={height}
        alt="product"
        unoptimized
      />
      {isPlaceholder && src ? <PartImagePlaceholderOverlay compact={compactOverlay} /> : null}
    </Box>
  );
}
