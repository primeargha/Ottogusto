"use client";

import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import Typography from "@/components/og-components/Typography";
import GreenCircleTick from "@/screens/productdetails/GreenCircleTick";
import VinWarningIcon from "./VinWarningIcon";
import Image from "next/image";
import Link from "next/link";
import { currencyFormat, getRouteLocaleString } from "@/helpers/UtilityHelper";
import { resolvePartImageFromSources } from "@/utils/partImageUtils";
import type { CartItem } from "@/stores/useCartStore";
import { getNoFitItems, type VinCheckResult, type VinCheckUiCase } from "@/utils/vinCheck";
import { Routes } from "@/config/routes";
import noImage from "@/assets/Frame.svg";
import { OGButton } from "@/components/og-components/OGButton";

interface VinCheckResultBoxesProps {
  uiCase: VinCheckUiCase | null;
  result: VinCheckResult | null;
  cartItems: CartItem[];
  localeCode: string;
  params: Record<string, string | string[] | undefined>;
  getLabel: (key: string) => string;
  onRemoveNoFitItem: (itemId: string) => void;
}

export function VinCheckResultBoxes({
  uiCase,
  result,
  cartItems,
  localeCode,
  params,
  getLabel,
  onRemoveNoFitItem,
}: VinCheckResultBoxesProps) {
  if (!uiCase || !result) return null;

  if (uiCase === 3 || uiCase === 4) {
    const messageKey =
      uiCase === 3 ? "vinVerification_fit_message" : "vinVerification_mayFit_message";
    return (
      <Box className="flex w-full flex-row items-center gap-space-sm rounded-[4px] border border-color-border-positive bg-color-background-positive-muted p-space-md">
        <GreenCircleTick className="h-5 w-5 flex-shrink-0 text-color-icon-positive" />
        <Typography className="text-color-border-positive typography-body-02">
          {getLabel(messageKey)}
        </Typography>
      </Box>
    );
  }

  const noFitItems = getNoFitItems(result.items);
  if (!noFitItems.length) return null;

  const supportPath = getRouteLocaleString(Routes.support, params);

  return (
    <Box className="flex w-full flex-col gap-space-md rounded-[4px] border border-color-border-attention bg-color-background-attention-muted p-space-md">
      <Box className="flex flex-row items-start gap-space-sm">
        <VinWarningIcon className="h-5 w-5 flex-shrink-0 text-color-icon-attention" />
        <Typography className="text-color-text-attention typography-body-strong-02">
          {getLabel("vinVerification_notFit_message")}
        </Typography>
      </Box>

      <Box className="flex flex-col gap-space-md">
        {noFitItems.map((line) => {
          const cartItem = cartItems.find((c) => c.id === line.id);
          if (!cartItem) return null;
          const { src, isPlaceholder } = resolvePartImageFromSources({
            images: cartItem.product?.images,
            imageUrl: cartItem.image ?? null,
          });
          const displayName = cartItem.partname || cartItem.name || cartItem.title || line.id;
          const price = Number(cartItem.totalPriceIncVat) || Number(cartItem.price) || 0;

          const removeButton = (
            <OGButton
              type="ghost"
              size="link"
              state="default"
              onClick={() => onRemoveNoFitItem(line.id)}
            >
              {getLabel("remove_item")}
            </OGButton>
          );

          return (
            <Box key={line.id} className="flex flex-col gap-space-sm">
              <Box className="flex w-full flex-row items-start justify-between gap-space-md gtsm:items-center">
                <Box className="relative flex flex-row items-center gap-space-md">
                  <Box className="relative h-16 w-16 flex-shrink-0">
                    <Box className="h-16 w-16 overflow-hidden rounded-lg border-2 border-color-border-attention bg-color-background-default">
                      <Image
                        src={src || noImage}
                        alt={displayName}
                        width={64}
                        height={64}
                        className={`h-full w-full object-contain ${isPlaceholder ? "opacity-40 grayscale" : ""}`}
                        unoptimized
                      />
                    </Box>
                    <Box className="absolute right-0 top-0 z-10 flex h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-color-background-neutral-emphasis text-color-text-inverse typography-caption">
                      {cartItem.quantity ?? 1}
                    </Box>
                  </Box>
                  <Box className="flex flex-col gap-1">
                    <Typography className="text-color-text-emphasis typography-body-strong-02">
                      {displayName}
                    </Typography>
                    {cartItem.description ? (
                      <Box
                        className="line-clamp-2 text-color-text-muted typography-caption"
                        // @ts-ignore
                        dangerouslySetInnerHTML={{ __html: cartItem.description }}
                      />
                    ) : null}
                  </Box>
                </Box>
                <Box className="flex flex-shrink-0 flex-row items-center gap-space-md">
                  <Typography className="flex-shrink-0 text-color-text-emphasis typography-mono-body-02">
                    {currencyFormat(price, localeCode)}
                  </Typography>
                  <Box className="hidden gtsm:flex">{removeButton}</Box>
                </Box>
              </Box>
              <Box className="flex w-full flex-row justify-end gtsm:hidden">{removeButton}</Box>
            </Box>
          );
        })}
      </Box>

      <Typography className="text-color-text-default typography-body-02">
        {getLabel("vinVerification_notFit_helpText")}{" "}
        <Link href={supportPath} className="text-button-ghost-text underline">
          {getLabel("contact_us")}
        </Link>
      </Typography>
    </Box>
  );
}
