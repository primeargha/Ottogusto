import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import { OGButton } from "@/components/og-components/OGButton";
import { ShoppingCartIcon } from "@/components/icons/ShoppingCartIcon";
import { OGDiscountButton } from "@/components/og-components/OGDiscountButton";
import { useBranding } from "@/contexts/BrandingContext";
import { IndicatorIcon } from "../shoppingcart/IndicatorIcon";
import { Divider } from "@/components/ui/divider";
import Typography from "@/components/og-components/Typography";
import { CartItem } from "@/stores/useCartStore";
import { OGAddToCartControl } from "@/components/og-components/OGAddToCartControl";
import ProductRequestinformation from "./ProductRequestinformation";
import { useVatString } from "@/hooks/useVatString";
import { useMedia } from "@/hooks/useMedia";
import Link from "next/link";
import { currencyFormat } from "@/helpers/UtilityHelper";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  buildPartPdpHrefFromPathname,
  partPdpOptionsFromSearchParams,
} from "@/utils/build-part-pdp-url";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useCategories } from "@/contexts/CategoriesContext";
import { computeProductDetailsTaxonomyPath } from "@/screens/productdetails/productDetailsTaxonomyPath";
import { categoryPathToViewItemListCategoryFields } from "@/screens/products/searchResultsTaxonomyPath";
import type { ViewItemListCategoryContext } from "@/utils/gtm";
import { PartImagePlaceholderOverlay } from "@/components/og-components/PartImagePlaceholderOverlay";
import { resolvePartImageFromSources } from "@/utils/partImageUtils";

const categoryContextHasValues = (ctx?: ViewItemListCategoryContext | null): boolean =>
  !!ctx &&
  [ctx.item_category, ctx.item_category2, ctx.item_category3, ctx.item_category4].some(
    (s) => s && s.length > 0,
  );

export default function OGRecentCard({ product }: { product: CartItem }) {
  const { getLocale, getLabel } = useBranding();
  const localeCODE = getLocale();
  const vatString = useVatString();
  const isMobile = useMedia("(max-width: 639px)");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewMmeEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const pdpVehicleOptions = useMemo(
    () => partPdpOptionsFromSearchParams(searchParams, { includeCarIds: isNewMmeEnabled }),
    [searchParams, isNewMmeEnabled],
  );
  const { data: categoriesData } = useCategories();

  const recentCardLang = useMemo(() => {
    const segments = pathname?.split("/").filter(Boolean) || [];
    const lc = segments[0] || "";
    return lc.split("-")[0] || "en";
  }, [pathname]);

  const recentItemCategoryContext = useMemo((): ViewItemListCategoryContext => {
    if (categoryContextHasValues(product.itemCategoryContext)) {
      return product.itemCategoryContext!;
    }
    const empty: ViewItemListCategoryContext = {
      item_category: "",
      item_category2: "",
      item_category3: "",
      item_category4: "",
    };
    if (!product?.categories || product.categories.length === 0) return empty;
    const path = computeProductDetailsTaxonomyPath(categoriesData as any, product.categories);
    if (path.length === 0) return empty;
    return categoryPathToViewItemListCategoryFields(path, recentCardLang);
  }, [categoriesData, product?.categories, product?.itemCategoryContext, recentCardLang]);

  const categoryId = product?.categories?.[0]?.slice(0, 9) ?? "001001";
  const { src: productImage, isPlaceholder } = resolvePartImageFromSources({
    images: product?.product?.images,
    imageUrl: product?.image ?? null,
    categoryId,
  });
  const rrp = product?.recommendedPriceInclVat || 0;
  const discount = ((rrp - Number(product.pricecomp || 0)) / rrp) * 100;
  type AvailabilityKey = "OnRequest" | "InStock" | "Backorder" | "EndOfLife";
  const getAvailabilityText = (): string => {
    const availabilityKeyMap: Record<AvailabilityKey, string> = {
      OnRequest: "on_request",
      InStock: "in_stock",
      Backorder: "backorder",
      EndOfLife: "end_of_life",
    };

    const key =
      product.availability && product.availability in availabilityKeyMap
        ? availabilityKeyMap[product.availability as AvailabilityKey]
        : "";

    return getLabel(key);
  };

  const imageexist = !isPlaceholder;

  const handleCardClick = (_e: any) => {
    const href = buildPartPdpHrefFromPathname(pathname, product?.id, {
      seoName: product?.seo?.name ?? product?.name,
      ...pdpVehicleOptions,
    });
    if (href) router.push(href);
  };

  return (
    <Box
      className={`relative flex h-full cursor-pointer items-center rounded-[8px] ${isMobile ? "max-w-[359px] flex-row" : "justify-between gtsm:flex-row gtlg:flex-col"} bg-color-background-default card-padding-compact card-gap-compact base:max-h-[265px] base:w-full gtsm:max-h-[464px] gtsm:w-[400px] gtsm:max-w-[400px] gtlg:max-h-[464px] gtlg:w-full`}
      //@ts-ignore
      onClick={handleCardClick}
    >
      {/* Image block */}
      <Box
        className={`relative items-center justify-center overflow-hidden gtsm:w-full ${isMobile ? "h-full" : "gtsm:max-h-[160px] gtsm:min-h-[160px] gtsm:w-[157.5px] gtsm:max-w-[158px] gtlg:max-h-[160px] gtlg:min-h-[160px] gtlg:max-w-[160px]"}`}
      >
        {productImage ? (
          <>
            <Image
              src={productImage}
              alt="product"
              className={`h-full w-full items-stretch base:max-w-[150px] gtsm:w-full ${isMobile ? "object-contain" : "object-cover"} ${imageexist ? "transition-transform hover:scale-110" : "opacity-40 grayscale"}`}
              width={320}
              height={320}
              quality={75}
              priority={false}
              unoptimized
            />
            {isPlaceholder && <PartImagePlaceholderOverlay />}
          </>
        ) : null}
      </Box>
      {/*  */}
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
        <Box className="absolute z-40 base:left-3 base:top-3 gtsm:left-4 gtsm:top-4"></Box>
      )}

      <Box className="flex h-full w-full justify-between card-gap-compact">
        {/* L4, name, oeRef, In stock */}
        <Box className="flex h-auto w-full flex-col">
          {product?.description ? (
            <Box
              className="line-clamp-1 max-h-[15px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-color-text-muted typography-overline"
              //@ts-ignore
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          ) : (
            <Text className="text-color-text-inverse typography-overline">.</Text>
          )}
          {/*  */}
          <Box
            className="text-start text-color-text-body body-bold-sm"
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
          >
            {product?.partname}
          </Box>
          {product?.oeReference ? (
            product?.manufacturerType === "OEM" ? (
              <Box className="flex flex-row items-start gap-2">
                <Box className="text-color-text-muted typography-caption">
                  {getLabel("oe_reference")}
                </Box>
                <Box className="line-clamp-1 text-color-text-muted typography-mono-caption">
                  {product?.oeReference}
                </Box>
              </Box>
            ) : (
              <Box className="flex flex-row gap-2">
                <Typography className="text-color-text-muted typography-caption">
                  {getLabel("non_oe_Reference")}
                </Typography>
                <Box className="line-clamp-1 text-color-text-muted typography-mono-caption">
                  {product?.oeReference}
                </Box>
              </Box>
            )
          ) : (
            <Text className="text-white typography-overline">.</Text>
          )}

          <Box className="flex flex-row items-center justify-start gap-space-xs p-1">
            <IndicatorIcon
              className={
                product?.availability === "InStock"
                  ? "text-color-icon-positive"
                  : "text-color-icon-attention"
              }
            />
            <Box className="flex flex-row gap-space-2xs text-end text-color-text-muted typography-caption">
              {getAvailabilityText()}
            </Box>
          </Box>
        </Box>
        {/* divider line */}
        {<Box className={`h-[1px] w-full border-t border-color-border-emphasis`} />}

        {/* rrp, price+ discount button, price tax, increment button */}
        <Box className={`flex w-full flex-col items-start gap-space-xs`}>
          {Math.round(discount) > 10 ? (
            <Box className="flex flex-row text-color-text-muted typography-mono-caption">
              {getLabel("productdetails_rrp")}{" "}
              <span className="ml-1 line-through">{currencyFormat(rrp, localeCODE, false)}</span>
            </Box>
          ) : (
            <Text className="text-color-text-inverse typography-mono-caption">.</Text>
          )}

          {/* price and green discount button */}
          <Box className="flex w-full flex-col">
            <Box className="flex w-auto flex-row gap-space-xs">
              {product?.pricecomp !== undefined && product?.pricecomp !== null && (
                <Box
                  className={`text-color-text-emphasisflex-row flex h-auto w-auto items-center justify-center typography-mono-large`}
                >
                  {currencyFormat(Number(product?.pricecomp), localeCODE)}
                  {/* {pricecomp} € */}
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
              {vatString ? vatString : getLabel("common_vatLabel_prefix")}
            </Typography>
          </Box>

          <Box
            // @ts-ignore
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
            }}
            className="w-full"
          >
            {product.availability === "InStock" || product.availability === "OnRequest" ? (
              <OGAddToCartControl
                id={String(product.id)}
                product={{
                  ...product,
                  title: product.title ?? product.partname,
                  priceInclVat:
                    (product as any).priceInclVat ??
                    product.price ??
                    Number(product.pricecomp ?? 0),
                }}
                itemCategoryContext={recentItemCategoryContext}
              />
            ) : (
              <ProductRequestinformation
                data={{
                  id: String(product.id),
                  name: product.partname,
                  title: product.partname,
                  oeReference: product.oeReference || "",
                  manufacturer: product.manufacturer || "",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
