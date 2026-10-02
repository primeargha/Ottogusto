import Image from "next/image";
import { useMemo } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { currencyFormat } from "@/helpers/UtilityHelper";
import { Box } from "../ui/box";
import { Text } from "../ui/text";
import { OGDiscountButton, isProductCardNavigationSuppressed } from "./OGDiscountButton";
import { OGAddToCartControl } from "./OGAddToCartControl";
import ProductRequestinformation from "@/components/og-components/ProductRequestinformation";
import { IndicatorIcon } from "@/components/og-components/icons/IndicatorIcon";
import Typography from "./Typography";
import type { ViewItemListCategoryContext } from "@/utils/gtm";
import { PartImagePlaceholderOverlay } from "@/components/og-components/PartImagePlaceholderOverlay";
import { resolvePartImageFromSources } from "@/utils/partImageUtils";

export interface ProductImagesInterface {
  order?: number;
  url?: string;
  label?: string;
  type?: string;
}

interface OGProductcardProps {
  state?: "default" | "hover";
  id?: string | number;
  partname?: string;
  price?: number;
  isIOPart?: boolean;
  view?: "Card" | "Mobile" | "list";
  children?: React.ReactNode;
  onClick: () => void;
  isOEM: boolean;
  className?: string;
  imgcomp?: string;
  pricecomp?: React.ReactNode;
  description?: string;
  product: {
    images?: ProductImagesInterface[];
    categories?: string[];
    description?: string;
    recommendedPriceInclVat?: number;
    manufacturerType?: "OEM" | "AMS" | "OES" | string;
  };
  StarBlock?: boolean | React.ReactNode;
  vatData?: string | undefined;
  hasDiscount?: boolean;
  discountPercent?: number | string | null;
  availability?: "OnRequest" | "InStock" | "Backorder" | "EndOfLife" | string;
  oeReference?: string | null;
  manufacturer?: string;
  itemCategoryContext?: ViewItemListCategoryContext | undefined;
}

export const OGProductcard = (props: OGProductcardProps) => {
  const {
    className,
    view,
    imgcomp,
    pricecomp,
    partname,
    description,
    onClick,
    product,
    vatData,
    hasDiscount,
    discountPercent,
    availability,
    oeReference,
    id,
    isOEM,
    manufacturer,
    itemCategoryContext,
  } = props;
  const { getLocale, getLabel } = useBranding();

  const categoryId = product?.categories?.[0]?.slice(0, 9) ?? "001001";
  const { src: resolvedImageSrc, isPlaceholder } = resolvePartImageFromSources({
    images: product?.images,
    imageUrl: imgcomp ?? null,
    categoryId,
    categoryImageOptions: { width: 180, quality: 80 },
  });
  const imageSrc = resolvedImageSrc ?? "";
  type AvailabilityKey = "OnRequest" | "InStock" | "BackOrder" | "EndOfLife";
  const availabilityLabel = useMemo(() => {
    const availabilityKeyMap: Record<AvailabilityKey, string> = {
      OnRequest: "on_request",
      InStock: "in_stock",
      BackOrder: "backorder",
      EndOfLife: "end_of_life",
    };

    const key =
      availability && availability in availabilityKeyMap
        ? availabilityKeyMap[availability as AvailabilityKey]
        : "";

    return key ? getLabel(key) : "";
  }, [availability, getLabel]);

  let partfontClass = "";
  if (view === "Card") {
    partfontClass = "text-color-text-body text-start body-bold-sm  ";
  }
  if (view === "Mobile") {
    partfontClass = "text-color-text-body text-start  body-bold-sm";
  }
  if (view === "list") {
    partfontClass = "text-color-text-body text-start  body-medium-sm";
  }

  // Check for view
  let viewClasses = "";
  if (view === "Card") {
    viewClasses =
      "cursor-pointer flex gtsm:flex-row gtlg:flex-col card-gap-compact base:w-full gtlg:min-h-[430px] gtlg:max-h-[470px] gtsm:h-auto radius-card bg-color-background-default border border-color-border-default card-padding-compact z-0";
  }
  if (view === "Mobile") {
    viewClasses =
      "flex gap-3 flex-row p-[12px] base:w-full self-stretch min-h-[260px] max-h-none rounded-[6px] bg-color-background-default border border-color-border-default z-0";
  }
  if (view === "list") {
    viewClasses =
      "cursor-pointer items-center flex h-auto  w-full flex-row card-gap-compact card-padding-compact self-stretch rounded-[6px] bg-color-background-default border border-color-border-default z-0";
  }

  // Check for image class
  let imgClass = "";
  if (view === "Card") {
    // base: sizing added — previously this branch only had gtsm:/gtlg: overrides, so
    // below 640px the <img> had no explicit size at all (fell back to its raw
    // width={1000} height={1000} HTML attributes) until getView() re-resolves to
    // "Mobile" post-mount. See wrapper Box below for the matching base: height.
    imgClass = isPlaceholder
      ? "max-w-[160px] max-h-[160px] object-contain opacity-40 grayscale"
      : "w-full h-[215px] gtsm:w-[350px] gtsm:h-[215px] gtsm:min-h-0 gtlg:max-w-[160px] gtlg:min-w-[160px] gtlg:h-[160px] gtlg:max-h-[161px] object-cover transition-transform hover:scale-110 items-stretch";
  }
  if (view === "Mobile") {
    // w-full h-full (not min/max-h) fills the now-fixed-height wrapper Box exactly —
    // that box's h-[236px] is what's actually reserved by CSS before the image loads;
    // width/height={1000} attributes below keep the <img> itself explicitly sized too.
    imgClass = isPlaceholder
      ? "w-full h-full object-contain opacity-40 grayscale"
      : "w-full h-full object-cover";
  }
  if (view === "list") {
    imgClass = isPlaceholder
      ? "max-w-[120px] h-full object-contain opacity-40 grayscale"
      : "max-w-[120px] h-full object-contain transition-transform hover:scale-110";
  }

  let descFont = "";
  if (view === "Card") {
    descFont = "h-[59px] text-start body-regular-sm text-color-text-body";
  }
  if (view === "Mobile") {
    descFont = "h-[52px] body-regular-sm text-color-text-body";
  }
  if (view === "list") {
    descFont = " h-[59px] body-regular-sm text-color-text-body ";
  }

  let cartButtonClass = "";
  if (view === "Card") {
    cartButtonClass =
      "flex flex-row px-[8px] w-full  min-h-[32px] max-h-[34px] gap-[8px] rounded justify-center items-center cursor-pointer bg-color-primary-main hover:bg-color-primary-hover";
  }
  if (view === "Mobile") {
    cartButtonClass =
      "flex flex-row px-[8px] w-full rounded justify-between items-center cursor-pointer bg-color-primary-main hover:bg-color-primary-hover  min-h-[32px] max-h-[34px]";
  }
  if (view === "list") {
    cartButtonClass =
      "flex flex-row px-[12px] w-full rounded justify-center items-center cursor-pointer bg-color-primary-main hover:bg-color-primary-hover";
  }

  // Check for carimg class
  let imgcarClass = "";
  if (view === "Card") {
    imgcarClass = "h-[32px] w-[32px]";
  }
  if (view === "Mobile") {
    imgcarClass = "h-[32px] w-[32px]";
  }
  if (view === "list") {
    imgcarClass = "h-[48px] w-[48px]";
  }

  // Check for carimg class
  let imgPlusClass = "";
  if (view === "Card") {
    imgPlusClass = "h-[14.39px] w-[14.39px]";
  }
  if (view === "Mobile") {
    imgPlusClass = "h-[13.33px] w-[13.33px]";
  }
  if (view === "list") {
    imgPlusClass = "h-[20px] w-[20px]";
  }

  const containerClass = `${viewClasses} relative ${className ?? ""}`;
  const localeCODE = getLocale();
  const rrp = product?.recommendedPriceInclVat || 0;
  const discount = useMemo(() => {
    if (!rrp || pricecomp == null) return 0;
    return ((rrp - Number(pricecomp || 0)) / rrp) * 100;
  }, [rrp, pricecomp]);
  return (
    //@ts-ignore
    <Box
      className={containerClass}
      onClick={(e: React.MouseEvent) => {
        if (isProductCardNavigationSuppressed()) return;

        const target = (e.nativeEvent?.target ?? e.target) as EventTarget | null;
        if (target instanceof Element && target.closest("[data-og-discount-button]")) {
          return;
        }
        onClick();
      }}
      id={id != null ? String(id) : undefined}
    >
      {imageSrc && (
        <Box
          className={`flex ${
            view === "Mobile"
              ? // Fixed height (not h-auto) so this box — and the image filling it via
                // w-full h-full below — are sized by CSS alone before the image loads.
                "my-auto h-[236px] min-w-0 max-w-none basis-1/2"
              : view === "list" && isPlaceholder
                ? "flex min-w-[180px] items-center justify-center"
                : // base: h-[215px] (Card) / h-[120px] (list) added — same reasoning as
                  // the imgClass fix above: previously no unprefixed height existed here.
                  `h-[215px] gtsm:h-full gtsm:min-h-0 gtlg:h-[160.2px] gtlg:max-h-[160.3px] ${view === "list" ? "my-auto h-[120px] w-[240px] items-center justify-center rounded-[8px] gtlg:h-[120.2px] gtlg:max-h-[120.3px]" : "w-full"} mx-auto`
          } relative flex items-center justify-center overflow-hidden rounded-[8px] ${isPlaceholder ? "flex items-center justify-center bg-white" : view === "list" ? "min-h-[120px]" : ""}`}
        >
          <Image
            src={imageSrc}
            unoptimized
            alt={`${product.images?.[0]?.label || partname}`}
            title={`${product.images?.[0]?.label || partname}`}
            className={imgClass}
            width={1000}
            height={1000}
          />
          {isPlaceholder && <PartImagePlaceholderOverlay />}
        </Box>
      )}
      {/* use for OEM part button logic */}

      {product?.manufacturerType === "OEM" ? (
        <>
          <OGDiscountButton
            type="muted"
            color="info"
            label={getLabel("OEM_part")}
            trailingIcon={true}
            tooltipText="oem_tooltip_info"
            headingContent="original_manufacturer_text"
            className="absolute z-40 base:left-3 base:top-3 gtsm:left-4 gtsm:top-4"
          />

          {/* <OGDiscountButton
            type="muted"
            color="neutral"
            label={getLabel("original_brand") + " " + product?.manufacturer}
            trailingIcon={false}
          /> */}
        </>
      ) : product?.manufacturerType === "AMS" ? (
        <OGDiscountButton
          type="muted"
          color="neutral"
          label={getLabel("product_tag_ams")}
          tooltipText="ams_tooltip_info"
          headingContent="ams_tooltip_text"
          trailingIcon={true}
          className="absolute z-40 base:left-3 base:top-3 gtsm:left-4 gtsm:top-4"
        />
      ) : product?.manufacturerType === "OES" ? (
        <OGDiscountButton
          type="muted"
          color="warning"
          label={getLabel("product_tag_oes")}
          tooltipText="oes_tooltip_info"
          headingContent="oes_tooltip_text"
          trailingIcon={true}
          className="absolute z-40 base:left-3 base:top-3 gtsm:left-4 gtsm:top-4"
        />
      ) : (
        <OGDiscountButton
          type="muted"
          color="neutral"
          label={getLabel("non_oe_Reference")}
          // tooltipText="oes_tooltip_info"
          // headingContent="oes_tooltip_text"
          // trailingIcon={true}
          className="absolute z-40 base:left-3 base:top-3 gtsm:left-4 gtsm:top-4"
        />
      )}

      <Box
        className={`flex w-full ${
          view === "list"
            ? "h-[120px] max-h-[121px] flex-row card-gap-compact"
            : `flex-col card-gap-compact ${
                view === "Mobile" ? "flex min-h-[120px] min-w-0 max-w-none basis-1/2" : ""
              }`
        }`}
      >
        <Box className={`flex ${view === "list" ? "w-full" : "h-auto"}`}>
          <Box className="flex flex-col items-start gap-space-2xs">
            {product?.description ? (
              <Box
                className="line-clamp-1 max-h-[15px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-color-text-muted typography-overline"
                //@ts-ignore
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : view !== "Mobile" ? (
              <Text className="text-color-text-inverse typography-overline">.</Text>
            ) : null}

            {partname && (
              <Box className="flex w-full items-start">
                <Box
                  className={`${partfontClass} ${view !== "list" ? "flex-1 gtsm:w-full gtlg:w-auto gtlg:max-w-[230px]" : "flex-1"}`}
                  //@ts-ignore
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: "1.4",
                    maxHeight: "calc(1.4em * 2)",
                  }}
                  title={partname}
                >
                  {partname}
                </Box>
              </Box>
            )}
            <Box className="flex flex-row items-start gap-2">
              {oeReference ? (
                product.manufacturerType === "OEM" ? (
                  <>
                    <Typography className="text-color-text-muted typography-caption">
                      {getLabel("oe_reference")}
                    </Typography>
                    <Box className="line-clamp-1 text-color-text-muted typography-mono-caption">
                      {oeReference}
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography className="text-color-text-muted typography-caption">
                      {getLabel("non_oe_Reference")}
                    </Typography>
                    <Box className="line-clamp-1 text-color-text-emphasis typography-mono-caption">
                      {oeReference}
                    </Box>
                  </>
                )
              ) : (
                <Text className="text-color-text-inverse typography-caption">.</Text>
              )}
            </Box>

            <Box className="flex h-auto w-full flex-row items-center gap-space-xs">
              <Box className="flex items-center justify-center p-1">
                <IndicatorIcon
                  className={
                    availability === "InStock"
                      ? "text-color-icon-positive"
                      : availability === "EndOfLife"
                        ? "text-color-text-disabled"
                        : "text-color-icon-attention"
                  }
                />
              </Box>
              {availabilityLabel && (
                <Box className="flex flex-row gap-space-2xs text-end text-color-text-muted typography-caption">
                  {availabilityLabel}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* divider line */}
        <Box
          className={`h-[1px] w-full border-t border-color-border-emphasis ${
            view === "list" ? "hidden" : ""
          }`}
        />

        <Box
          className={`flex ${view === "list" ? "h-full min-h-[120px] min-w-[184px] max-w-[185px] flex-col justify-between" : "min-h-[130px] gap-space-xs"} flex-col`}
        >
          {Math.round(discount) > 10 ? (
            <Box className="flex flex-row text-color-text-muted typography-mono-caption">
              {getLabel("productdetails_rrp")}{" "}
              <span className="ml-1 line-through">{currencyFormat(rrp, localeCODE, false)}</span>
            </Box>
          ) : (
            <Text className="text-color-text-inverse typography-mono-caption">.</Text>
          )}
          {/* Price and add to cart button group */}
          <Box
            className={`between-1024-1065:gap-space-xs flex w-full flex-col items-start justify-between gap-space-xs ${
              view === "list" ? "h-auto" : "h-full between-1024-1075:h-auto"
            }`}
          >
            <Box className="flex w-full flex-col">
              <Box className="flex w-auto flex-row gap-space-xs">
                {pricecomp !== undefined && pricecomp !== null && (
                  <Box
                    className={`text-color-text-emphasisflex-row flex h-auto w-auto items-center justify-center typography-mono-large`}
                  >
                    {currencyFormat(Number(pricecomp), localeCODE)}
                  </Box>
                )}
                {Math.round(discount) > 10 && (
                  <OGDiscountButton
                    type="emphasis"
                    color="positive"
                    label={`-${Math.round(discount)}%`}
                    trailingIcon={false}
                  />
                )}
              </Box>
              <Typography className="text-color-text-muted typography-caption">
                {vatData ? vatData : getLabel("common_vatLabel_prefix")}
              </Typography>
            </Box>

            {/* All button group */}
            <Box
              //@ts-ignore
              data-og-add-to-cart
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="max-h-9 w-full"
            >
              {/* Add to cart button */}
              {availability === "InStock" || availability === "OnRequest" ? (
                <OGAddToCartControl
                  id={String(id)}
                  product={product}
                  itemCategoryContext={itemCategoryContext}
                />
              ) : (
                <ProductRequestinformation
                  data={{
                    id: String(id),
                    name: partname,
                    title: partname,
                    oeReference: oeReference || undefined,
                    manufacturer: manufacturer ?? "",
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
