import React from "react";

import { Box } from "@/components/ui/box";
import Image from "next/image";
// import partimg from "@/assets/productimages/productimg.png";
import uploadIcon from "@/assets/uploadImagesquare.svg";
import { Text } from "@/components/ui/text";
import { OGSelectDropdown } from "@/components/og-components/OGSelectDropdown";
import { useBranding } from "@/contexts/BrandingContext";
import { useGetConfigQuery } from "@/hooks/config";
import { getImageMimeType } from "@/helpers/UtilityHelper";
import { useMedia } from "@/hooks/useMedia";
import { PartImagePlaceholderOverlay } from "@/components/og-components/PartImagePlaceholderOverlay";
import { resolvePartImageFromSources, type PartImageItem } from "@/utils/partImageUtils";

// Change: images are now array of { name: string, data: string, mimeType: string }
type ImageObj = { name: string; data: string; mimeType: string };

interface OGReturnOrderCardProps {
  property1?: "Base" | "Damaged" | "Wrong Item";
  partname?: string;
  price?: string;
  isIOPart?: boolean;
  Device?: "Desktop" | "Mobile";
  children?: React.ReactNode;
  StarBlock?: boolean | React.ReactNode;
  onClick?: () => void;
  className?: string;
  imgcomp?: string;
  pricecomp?: React.ReactNode;
  description?: string;
  product?: { images?: PartImageItem[] };
  // StarBlock?: boolean | React.ReactNode;
  item: {
    description: string | null;
    image: string | null;
    id: string | null;
    partId: string | null;
    name: string | null;
    price: number | null;
    reason: string;
    status: string;
    comment: string | null;
    images: ImageObj[];
  };
  onReasonChange: (reason: string) => void;
  onImagesChange: (images: ImageObj[]) => void;
  error?: string | undefined;
}

const OGReturnOrderCard = (props: OGReturnOrderCardProps) => {
  const {
    property1,
    partname,
    price,
    isIOPart,
    Device,
    children,
    onClick,
    className,
    imgcomp,
    pricecomp,
    description,
    product,
    StarBlock,
    item,
    onReasonChange,
    onImagesChange,
    error,
  } = props;

  const { getLabel } = useBranding();
  const { data: config } = useGetConfigQuery();
  const isMobile = useMedia("(max-width: 639px)");
  const { src: displayImg, isPlaceholder: isProductImagePlaceholder } = resolvePartImageFromSources(
    {
      images: product?.images,
      imageUrl: imgcomp ?? null,
    },
  );
  // Generate return reasons array from config and map with labels
  const RETURN_REASON_OPTIONS =
    config?.returnReasons?.map((reason: string) => ({
      label: getLabel(`return_reason_label_${reason}`),
      value: reason,
    })) || [];

  // Check for Device
  let DeviceClasses = "";
  if (Device === "Desktop") {
    DeviceClasses =
      " flex h-auto w-full flex-col gap-[24px] self-stretch rounded-[8px] bg-color-background-l1 px-[24px] py-[12px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] z-0";
  }
  if (Device === "Mobile") {
    DeviceClasses =
      "flex gap-3 flex-row p-[12px] base:w-full self-stretch h-auto rounded-[8px] bg-color-background-l1 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] z-50";
  }

  // check for part name
  let partfontClass = "";
  if (Device === "Mobile") {
    partfontClass =
      "text-color-text-body text-start  font-Overpass text-[16px] font-[700] leading-[18px] [font-feature-settings:'liga_off','clig_off']";
  }
  if (Device === "Desktop") {
    partfontClass =
      "text-color-text-body text-start  font-Overpass text-[20px] font-[700] leading-[22px] [font-feature-settings:'liga_off','clig_off']";
  }

  //   check for imag class
  let imgClass = "";
  if (Device === "Mobile") {
    imgClass = "w-full justify-center h-full object-contain";
  }
  if (Device === "Desktop") {
    imgClass = "w-full h-full object-contain";
  }

  // check for description font
  let descFont = "";
  if (Device === "Mobile") {
    descFont =
      "font-Overpass line-clamp-2 h-[32px] text-[14px] font-[500] leading-[16px] text-color-text-body";
  }
  if (Device === "Desktop") {
    descFont =
      "font-Overpass h-[18px] text-[16px] font-[400] leading-[18px] text-color-text-body [font-feature-settings:'liga_off','clig_off']";
  }

  //   check for uploadicon css
  let imguploadiconClass = "";
  if (Device === "Mobile") {
    imguploadiconClass = "h-[13.33px] w-[13.33px]";
  }
  if (Device === "Desktop") {
    imguploadiconClass = "h-[20px] w-[20px]";
  }

  const containerClass = `${DeviceClasses} ${className}`;

  // Helper: Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Remove image by index
  const handleRemoveImage = (idx: number) => {
    const newImages = [...item.images];
    newImages.splice(idx, 1);
    onImagesChange(newImages);
  };

  // Upload handler: base64, max 3, ≤5MB, store filename
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    let newImages: ImageObj[] = [...item.images];
    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= 3) {
        alert("Maximum 3 images allowed per item");
        break;
      }
      const file: any = files[i];
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > 5) {
        alert("Each image must be less than 5MB");
        continue;
      }
      const base64 = await fileToBase64(file);
      newImages.push({
        name: file.name,
        data: base64,
        mimeType: getImageMimeType(file.name) || "image/jpeg",
      });
      if (newImages.length >= 3) break;
    }
    onImagesChange(newImages);
    event.target.value = "";
  };

  return (
    <Box {...props} className={containerClass + " p-[24px]"}>
      <Box className="flex w-full flex-row gap-[14px] md:gap-[48px]">
        {displayImg && (
          <Box className="relative h-auto w-[170px] md:w-[100px]">
            <Image
              src={displayImg}
              alt=""
              className={`${imgClass} ${isProductImagePlaceholder ? "opacity-40 grayscale" : ""}`}
              width={1000}
              height={1000}
              unoptimized
            />
            {isProductImagePlaceholder ? <PartImagePlaceholderOverlay /> : null}
          </Box>
        )}

        <Box className="flex h-auto w-full flex-col justify-between gap-3">
          <Box className="flex flex-col gap-4">
            {partname && (
              <Box className="flex flex-row items-center gap-3">
                <Box
                  className={`${partfontClass} ${Device !== "Desktop" ? "max-w-[180px] truncate" : ""}`}
                >
                  {Device !== "Desktop" && partname.length > 14
                    ? `${partname.slice(0, 14)}...`
                    : partname}
                </Box>
                {StarBlock}
              </Box>
            )}
            {description && <Box className={`${descFont} overflow-hidden`}>{description}</Box>}
          </Box>

          <Box
            className={`flex w-full flex-row items-center justify-between gap-3 ${
              Device === "Desktop" ? "h-[48px]" : "h-[32px]"
            }`}
          >
            <Box
              className={`h-8 w-full ${
                Device === "Desktop"
                  ? "text-[24px]"
                  : Device === "Mobile"
                    ? "text-[18px]"
                    : "text-[16px]"
              } flex-row items-center font-Anton font-normal leading-[22px] text-[--brand-traffic-light-green] [font-feature-settings:'liga_off','clig_off'] base:justify-start`}
            >
              {price} €
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className="w-full">
        {/* Dropdown and upload button in a row, bottom-aligned */}
        <Box className="flex w-full items-end gap-3 base:flex-col md:flex-row">
          {/* Return-Reason dropdown */}
          <Box className="w-full min-w-0 flex-1">
            <OGSelectDropdown
              title="Return Reason"
              value={item.reason}
              onChange={(value) => onReasonChange(value)}
              placeholder="Select"
              state={error ? "error" : item.reason ? "filled" : "default"}
              mandatory={true}
              options={RETURN_REASON_OPTIONS}
              className={`w-full ${error ? "border border-color-system-error-main" : ""}`}
            />
          </Box>
          {/* Upload Images and JPEG/PNG */}
          <Box className="flex flex-row items-center gap-3 base:w-full md:w-fit">
            <label className="flex w-auto cursor-pointer flex-row flex-nowrap items-end gap-3 rounded-[4px] border border-[--Primary-Colors-Main] p-3">
              <Image src={uploadIcon} alt="" className={`z-50 ${imguploadiconClass}`} />
              <Box className="font-overpass whitespace-nowrap text-[16px] font-normal leading-[18px] text-[--Primary-Colors-Main]">
                Upload Images
                {item.reason === "DoNotReturn" ||
                item.reason === "NotCompatible" ||
                item.reason === "NoLongerNeeded"
                  ? ""
                  : "*"}
              </Box>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Only show JPEG/PNG text if no images */}
            {(!item.images || item.images.length === 0) && (
              <Text className="flex w-auto flex-none justify-center font-[Overpass] text-[14px] font-normal leading-[16px] text-color-text-body">
                JPEG or PNG
              </Text>
            )}
          </Box>
        </Box>

        {/* Show file names with remove icon */}
        {item.images && item.images.length > 0 && (
          <Box className="flex items-center justify-start gap-2 py-1 base:flex-col gtsm:flex-row gtlg:flex-row">
            {item.images?.map((img, idx) => {
              const filename = img.name || "Filename.JPEG";
              const displayName =
                isMobile && filename.length > 26 ? filename.slice(0, 26) + "..." : filename;

              return (
                <Box key={idx} className="flex w-full flex-row items-center gap-1">
                  <span className="cursor-pointer truncate text-[14px] underline" title={filename}>
                    {displayName}
                  </span>
                  <span
                    className="cursor-pointer text-[18px] font-bold"
                    onClick={() => handleRemoveImage(idx)}
                    aria-label="Remove image"
                  >
                    ×
                  </span>
                </Box>
              );
            })}
          </Box>
        )}
        {/* Error message below, only under dropdown */}
        {item?.images?.length < 1 && (
          <Box className="mt-[2px] h-auto w-full flex-wrap py-1">
            <Text
              className={`font-Overpass text-[16px] font-normal leading-[18px] transition-all duration-200 [font-feature-settings:'liga'_off,'clig'_off] ${error ? "text-color-system-error-main opacity-100" : "opacity-0"}`}
            >
              {error || "placeholder"}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OGReturnOrderCard;
