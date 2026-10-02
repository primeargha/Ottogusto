"use client";
import { Box } from "@/components/ui/box";
import Productcardesc from "@/screens/productdetails/productcardesc";
import dynamic from "next/dynamic";
import ProductDetailsBreadcrumb from "@/screens/productdetails/ProductDetailsBreadcrumb";

/** Matches Productfrequentlybought's real shape (title + row of cards) so the chunk
 * download for this dynamic import doesn't itself add a second, separate pop-in on
 * top of the recently-viewed-store hydration gap (see render site below). */
function ProductfrequentlyboughtLoading() {
  return (
    <Box className="flex h-auto w-full flex-col gap-space-md">
      <Box className="flex w-full flex-col gap-space-xs">
        <Box className="animate-pulse h-6 w-48 rounded bg-color-background-emphasis" />
        <Box className="animate-pulse h-4 w-64 rounded bg-color-background-emphasis" />
      </Box>
      {/* Height matches OGRecentCard's real mobile shape (base:max-h-[265px]) —
          the row's height is what drives CLS here (cards scroll horizontally
          within it), so that's pinned exactly; width is widened toward the
          real card's ~280-359px range for visual consistency, though it isn't
          CLS-critical since horizontal overflow doesn't affect page height. */}
      <Box className="flex w-full flex-row gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <Box
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="animate-pulse h-[265px] w-[280px] flex-shrink-0 rounded-[8px] bg-color-background-emphasis"
          />
        ))}
      </Box>
    </Box>
  );
}

const Productfrequentlybought = dynamic(
  () => import("@/screens/productdetails/productfrequentlybought"),
  { ssr: false, loading: ProductfrequentlyboughtLoading },
);
// PERF: Removed unused imports — Productmatchingcars (lazy-loaded from page.tsx), star, Productnavigation,
// Productmanufacturerbrand, Addtocart, OGAlert, CustomTooltip, Image, exclamicon,
// useGetMatchingCarsQuery, useParams, SearchContainer
import { useState, useEffect, useMemo, useRef } from "react";
import {
  trackViewItem,
  convertProductToGTMItem,
  type ViewItemListCategoryContext,
} from "@/utils/gtm";
import { useCategories } from "@/contexts/CategoriesContext";
import { computeProductDetailsTaxonomyPath } from "@/screens/productdetails/productDetailsTaxonomyPath";
import { categoryPathToViewItemListCategoryFields } from "@/screens/products/searchResultsTaxonomyPath";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import Typography from "@/components/og-components/Typography";
import { useBranding } from "@/contexts/BrandingContext";
import { OGDiscountButton } from "@/components/og-components/OGDiscountButton";
import { Divider } from "@/components/ui/divider";
import { useCartStore, type CartItem } from "@/stores/useCartStore";
import {
  useRecentlyViewedProductStore,
  useRecentlyViewedHydrated,
} from "@/stores/useRecentlyViewedProductStore";
import { useGetManufacturerInformationQuery } from "@/hooks/products";
import { getBrandById } from "@/services/search";
import { BrandData } from "@/type";
import Image from "next/image";
import NotFoundclient from "@/screens/not-found-client";
import { useUrlVinValidation } from "@/hooks/useUrlVinValidation";
import { useUrlCarIdsValidation } from "@/hooks/useUrlCarIdsValidation";

/** Normalize Parts API category ids for storage (recently viewed, cart-aligned shape). */
const categoriesFromPartPayload = (p: any): string[] => {
  const fromCats = p?.categories;
  if (Array.isArray(fromCats) && fromCats.length > 0) {
    return fromCats.map((id: unknown) => String(id).trim()).filter(Boolean);
  }
  const fromIds = p?.categoryIds;
  if (Array.isArray(fromIds) && fromIds.length > 0) {
    return fromIds.map((id: unknown) => String(id).trim()).filter(Boolean);
  }
  return [];
};

const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
export default function Products({
  data: product,
  language,
  defaultQty = 1,
  matchingCarsSection,
  serverMainImage,
}: {
  data?: any;
  language: string | undefined;
  defaultQty?: number;
  matchingCarsSection?: React.ReactNode;
  serverMainImage?: React.ReactNode;
}) {
  // const [isScrolled, setIsScrolled] = useState(false);
  const { getLabel } = useBranding();
  const { invalid: vinUrlInvalid } = useUrlVinValidation();
  const { invalid: carIdsUrlInvalid } = useUrlCarIdsValidation();
  const { cartitems } = useCartStore();
  const { data: categoriesData } = useCategories();
  // const { data: ManufacturerBrands } = useGetManufacturerInformationQuery();

  const pdpItemCategoryContext = useMemo((): ViewItemListCategoryContext => {
    const empty: ViewItemListCategoryContext = {
      item_category: "",
      item_category2: "",
      item_category3: "",
      item_category4: "",
    };
    if (!product?.categories || product.categories.length === 0) return empty;
    const path = computeProductDetailsTaxonomyPath(categoriesData as any, product.categories);
    if (path.length === 0) return empty;
    return categoryPathToViewItemListCategoryFields(path, language || "en");
  }, [categoriesData, product?.categories, language]);
  const [recentlyViewedProduct, setRecentlyViewedProduct] = useState<any>([]);
  const { addRecentlyViewedProduct, recentlyViewed } = useRecentlyViewedProductStore();
  const isRecentlyViewedHydrated = useRecentlyViewedHydrated();
  const productRef = useRef(product);
  productRef.current = product;
  const [manufacturerBrands, setManufacturerBrands] = useState<BrandData[]>([]);

  const [brandImage, setBrandImage] = useState<string | null>(null);
  // True once the brand-logo fetch below has settled (success or the
  // early-return "not a branded part" case) — lets the mobile title block
  // reserve a fixed-size placeholder only while a logo is actually pending,
  // instead of guessing, so a branded part's logo popping in doesn't push
  // the badges row below it down.
  const [brandImageChecked, setBrandImageChecked] = useState(false);
  const isBrandedPart = Boolean(product?.manufacturerId && product?.manufacturerType !== "OEM");
  //
  useEffect(() => {
    const fetchData = async () => {
      if (!product?.manufacturerId || product?.manufacturerType === "OEM") {
        setBrandImage(null); // ensure it's cleared
        setBrandImageChecked(true);
        return;
      }

      const res = await getBrandById(product.manufacturerId);

      setBrandImage(res.data.image || null);
      setBrandImageChecked(true);
    };

    setBrandImageChecked(false);
    fetchData();
  }, [product?.manufacturerId, product?.manufacturerType]);

  useEffect(() => {
    const p = productRef.current;
    if (!p?.id) return;
    const checkproductincart = cartitems.find((item: any) => item.id === p.id);
    if (checkproductincart) return;

    const categoryIds = categoriesFromPartPayload(p);
    const seoName = p?.seo?.name ?? p?.name;
    const seoTitle = p?.seo?.title ?? p?.title;
    const seoDescription = p?.seo?.description ?? p?.description;
    const seoSchema = p?.seo?.schema ?? p?.schema;

    const productData: CartItem = {
      id: String(p.id),
      partname: p.title,
      title: p.title,
      name: p.name ?? seoName,
      price: p.priceInclVat,
      description: p.description ?? p.fullDescription,
      product: { images: p.images },
      pricecomp: p.priceInclVat,
      manufacturerType: p.manufacturerType,
      shippingDelivery: p.shippingDelivery ?? false,
      shippingPickup: p.shippingPickup ?? false,
      shippingWarehouse: p.shippingWarehouse ?? false,
      manufacturer: p.manufacturer,
      manufacturerId: p.manufacturerId,
      compatibilityTested: false,
      availability: p.availability,
      recommendedPriceInclVat: p.recommendedPriceInclVat || 0,
      oeReference: p.oeReference,
      ...(categoryIds.length > 0 ? { categories: categoryIds } : {}),
      itemCategoryContext: pdpItemCategoryContext,
      ...(!!p.seo && {
        seo: {
          name: seoName,
          title: seoTitle,
          description: seoDescription,
          schema: seoSchema,
        },
      }),
    };

    addRecentlyViewedProduct(productData);
  }, [product?.id, cartitems, pdpItemCategoryContext, addRecentlyViewedProduct]);

  useEffect(() => {
    if (recentlyViewed.length > 0 && product && product.id) {
      setRecentlyViewedProduct(recentlyViewed.filter((item) => item.id !== product.id));
    }
  }, [recentlyViewed, product]);

  useEffect(() => {
    if (product && product.id) {
      const gtmItem = convertProductToGTMItem(
        product,
        defaultQty,
        undefined,
        pdpItemCategoryContext,
      );
      trackViewItem(gtmItem);
    }
  }, [product, defaultQty, pdpItemCategoryContext]);

  const activeFallback =
    product?.title || product?.name || (product?.seo?.title as string | undefined) || "[title]";
  // const manufacturerLogo = manufacturerBrands?.
  if (vinUrlInvalid || carIdsUrlInvalid) {
    return <NotFoundclient />;
  }
  return (
    <Box className="flex min-h-[calc(100vh)] w-full bg-color-background-default section-standard base:gap-space-md base:pb-16 base:pt-0 gtsm:gap-space-lg gtsm:pb-0 gtsm:pt-0 gtsm:gap-content-to-footer gtlg:gap-6 gtlg:section-gutter">
      <Box className="relative flex w-full flex-col gap-space-xs">
        <ProductDetailsBreadcrumb
          categories={product?.categories}
          activeFallback={activeFallback}
        />
      </Box>

      {/* Title/subtitle/badges — mobile & tablet only (desktop shows this inside
          Productfulldescription's description column instead). Always rendered so
          it's present for SEO/crawlers and to avoid a post-hydration layout shift;
          CSS handles visibility instead of a client-only media-query hook. */}
      <Box className="flex h-fit flex-col gap-space-xs gtlg:hidden">
        {/* min-h + line-clamp-2 reserve a deterministic 2-line-max height on mobile so
            product-title length doesn't cause layout shift; full title text stays in
            the DOM (line-clamp only truncates visually), so this doesn't affect SEO. */}
        <Typography
          type="h1"
          className={`line-clamp-2 min-h-[64px] text-color-text-body typography-heading-01`}
        >
          {product?.title || "[title]"}
        </Typography>

        {/* // For Mobile View */}

        {product?.description !== undefined && product?.description !== "" && (
          // min-h-6 matches the h-6 subtitle bar reserved in ProductDetailsPageLoading's
          // skeleton, so this line-clamp-1 (single-line) block is exactly the same height
          // as its loading placeholder — no shift when swapping skeleton -> real content.
          <Box className="flex min-h-6 items-start justify-center gap-space-xs">
            <Box
              className="line-clamp-1 text-color-text-default typography-subtitle-01"
              // @ts-ignore
              dangerouslySetInnerHTML={{
                __html: product?.description,
              }}
            ></Box>
          </Box>
        )}
        {/*  */}
        {isBrandedPart && !brandImageChecked && (
          <Box className="animate-pulse h-[50px] w-[100px] rounded bg-color-background-emphasis" />
        )}
        {brandImageChecked && brandImage && (
          <Image
            src={brandImage}
            alt="Brand Logo"
            width={100}
            height={50}
            quality={100}
            className="object-contain"
            unoptimized
          />
        )}
        {/*  */}
        <Box className="flex flex-row gap-space-xs">
          {product?.manufacturerType === "OEM" ? (
            <>
              <OGDiscountButton
                type="muted"
                color="info"
                label={getLabel("OEM_part")}
                trailingIcon={true}
                tooltipText="oem_tooltip_info"
                headingContent="original_manufacturer_text"
              />

              <OGDiscountButton
                type="muted"
                color="warning"
                label={getLabel("original_brand") + " " + product?.manufacturer}
                trailingIcon={false}
              />
            </>
          ) : product?.manufacturerType === "AMS" ? (
            <OGDiscountButton
              type="muted"
              color="neutral"
              label={getLabel("product_tag_ams")}
              tooltipText="ams_tooltip_info"
              headingContent="ams_tooltip_text"
              trailingIcon={true}
            />
          ) : product?.manufacturerType === "OES" ? (
            <OGDiscountButton
              type="muted"
              color="warning"
              label={getLabel("product_tag_oes")}
              tooltipText="oes_tooltip_info"
              headingContent="oes_tooltip_text"
              trailingIcon={true}
            />
          ) : (
            <OGDiscountButton
              type="muted"
              color="neutral"
              label={getLabel("non_oe_Reference")}
              // tooltipText="oes_tooltip_info"
              // headingContent="oes_tooltip_text"
              // trailingIcon={true}
              // className="absolute z-40 base:left-3 base:top-3 gtsm:left-4 gtsm:top-4"
            />
          )}
        </Box>
      </Box>

      <div
        id="scrollableDiv"
        className={`rounded-0 h-full w-full overflow-hidden overflow-y-auto bg-color-background-none scrollbar-hide [&_img]:pointer-events-none [&_img]:select-none [&_img]:[-webkit-touch-callout:none] [&_img]:[-webkit-user-drag:none] [&_img]:[user-drag:none]`}
      >
        <Box className="flex w-full flex-col gap-stack">
          <Productcardesc
            data={product}
            defaultQty={defaultQty}
            language={language}
            itemCategoryContext={pdpItemCategoryContext}
            serverMainImage={serverMainImage}
          />

          {matchingCarsSection}

          {!isRecentlyViewedHydrated && (
            <>
              <Divider />
              <ProductfrequentlyboughtLoading />
            </>
          )}

          {isRecentlyViewedHydrated && recentlyViewedProduct?.length > 0 && (
            <>
              <Divider />
              <Productfrequentlybought products={recentlyViewedProduct} />
            </>
          )}
        </Box>
      </div>
    </Box>
  );
}
