"use client";
import { Box } from "@/components/ui/box";
import OGcartcard from "./OGcart-card";
import Overviewcard from "./overviewcard";
import { useBranding } from "@/contexts/BrandingContext";
import Productfrequentlybought from "../productdetails/productfrequentlybought";
import { useMedia } from "@/hooks/useMedia";
import ConfirmationDelete from "./ConfirmationDelete";
import NoResultShoppingcart from "../products/NoResultShoppingcart";
import { CartItem, useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useCalculatePriceMutation } from "@/hooks/cart";
import { productFormationQueryOptions } from "@/hooks/productdetails";
import OGSkeletoncartCard from "./OGSkeletoncartCard";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import Typography from "@/components/og-components/Typography";
import Termsandconditioncom from "./termsandcondition";
import OGClaimtab from "@/components/og-components/OGClaimTab";
import Shoppingcartemail from "./shoppingcartemail";
import { BackToTop } from "@/app/(public)/[language-country]/car-parts/BackToTop";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { useRecentlyViewedProductStore } from "@/stores/useRecentlyViewedProductStore";
import { ProductCacheService } from "@/services/productCacheService";
import { getCheckCartId } from "@/services/cart";
import { useQueryClient } from "@tanstack/react-query";
import { convertCartItemsToGTMItems, trackViewCart } from "@/utils/gtm";
import { useHydrateCartFromOrderIdQuery } from "@/hooks/useHydrateCartFromOrderIdQuery";
import { consumeSharedOrderCartPageCalculateSkip } from "@/utils/sharedOrderFromUrl";
import type { PartImageItem } from "@/utils/partImageUtils";
import ShoppingCartPageSkeleton from "./ShoppingCartPageSkeleton";
import NotFoundclient from "../not-found-client";
import { useUrlVinValidation } from "@/hooks/useUrlVinValidation";
import { useUrlCarIdsValidation } from "@/hooks/useUrlCarIdsValidation";

const CHECK_CART_ON_FOCUS_THROTTLE_MS = 60 * 1000;

export default function Shoppingcartpage() {
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel } = useBranding();
  const pathname = usePathname();
  const { invalid: vinUrlInvalid } = useUrlVinValidation();
  const { invalid: carIdsUrlInvalid } = useUrlCarIdsValidation();
  const {
    cartitems: items,
    setupdatecart,
    setSelectedSavedBillingAddress,
    setSelectedSavedDeliveryAddress,
    setIsAccordionOpen,
    cartid,
    setcartid,
    setTotalPrice,
    setShippingFee,
    setVatPercentage,
    setShippingMethod,
    setcheckoutpending,
    checkoutpending,
    setcartlanguage,
    cartlanguage,
    iscartchanged,
    setiscartchanged,
    setdepositfee,
    hasHydrated,
  } = useCartStore();
  //const [items, setitems] = useState(cartitems);
  const { isAuthenticated, authUser } = useAuthStore();
  const { recentlyViewed } = useRecentlyViewedProductStore();
  const [recentlyViewedProduct, setRecentlyViewedProduct] = useState<CartItem[]>([]);
  const [cachedProductData, setCachedProductData] = useState<Record<string, any>>({});
  const [iscaching, setiscaching] = useState(false);
  // Store VAT percentage from the last successful Calculate API response so it can be
  // reused by children (e.g. overviewcard) even if Calculate is not called again.
  const vatFromCalculateApi = useRef<number | null>(null);
  const hasCalculatedOnLoadRef = useRef(false);
  const hasTrackedViewCartRef = useRef(false);
  const lastCheckCartIdCallRef = useRef<number>(0);

  const { sharedOrderId, isSharedOrderHydrating, isSharedOrderHydrateComplete } =
    useHydrateCartFromOrderIdQuery();

  useLayoutEffect(() => {
    if (isSharedOrderHydrateComplete) {
      hasCalculatedOnLoadRef.current = true;
    }
  }, [isSharedOrderHydrateComplete]);

  // Sync cart from server on window focus (only when on this page), throttled to avoid calling on every focus
  useEffect(() => {
    const handleFocus = async () => {
      if (sharedOrderId || isSharedOrderHydrating) return;
      if (!isAuthenticated || cartid === "") return;
      const now = Date.now();
      if (now - lastCheckCartIdCallRef.current < CHECK_CART_ON_FOCUS_THROTTLE_MS) return;
      lastCheckCartIdCallRef.current = now;
      try {
        const result = await getCheckCartId();
        if (result && result.length > 0) {
          const cart = result[0];
          if (cart?.orderId === cartid && cart?.items && cart?.items.length > 0) {
            const hasMatch =
              items &&
              items?.some(
                (item1) =>
                  cart?.items &&
                  cart?.items?.some(
                    //@ts-ignore
                    (item2: { id: string; quantity: number } | undefined) =>
                      item1?.id === item2?.id && item1?.quantity === item2?.quantity,
                  ),
              );
            if (!hasMatch) setiscartchanged(true);
          } else {
            setcartid(cart?.orderId ?? "");
            // Preserve seo from existing cart items so product links use correct slug
            const mergedItems = (cart?.items ?? []).map((apiItem: any) => {
              const existingItem = items?.find((e) => e.id === apiItem.id);
              return {
                ...apiItem,
                seo: apiItem.seo ?? existingItem?.seo,
                manufacturer: apiItem.manufacturer ?? existingItem?.manufacturer,
                manufacturerId: apiItem.manufacturerId ?? existingItem?.manufacturerId,
              };
            });
            setupdatecart(mergedItems);
            if (cart?.items && cart?.items?.length > 0) setiscartchanged(true);
          }
        }
      } catch (error) {
        console.error("Error checking cart on focus:", error);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [
    isAuthenticated,
    cartid,
    items,
    setcartid,
    setupdatecart,
    setiscartchanged,
    sharedOrderId,
    isSharedOrderHydrating,
  ]);

  const params = useParams();
  const language = params?.["language-country"] as string;
  const queryClient = useQueryClient();
  const { mutate, isPending: isSavingCalculate } = useCalculatePriceMutation({
    onSuccess: async (data: any) => {
      const updatedItems = items?.map((item) => {
        const matchingItem = data.data.items.find((apiItem: any) => apiItem.id === item.id);
        return {
          ...item,
          ...matchingItem,
          product: {
            ...item.product,
            ...(matchingItem as { product?: { images?: PartImageItem[] } }).product,
          },
        };
      });
      const deposititems = data.data.items.filter((item: any) => item.type === "Deposit");
      const totaldeposit = deposititems.reduce(
        (acc: any, item: any) => acc + item.totalPriceIncVat,
        0,
      );
      setdepositfee(totaldeposit);
      // Capture the VAT percentage from the Calculate API for reuse.
      const apiVat = data?.data?.items?.[0]?.vatPercentage;
      vatFromCalculateApi.current =
        typeof apiVat === "number" ? apiVat : apiVat != null ? Number(apiVat) : null;
      setcartid(cartid === "" ? data.data.id : cartid);
      if (updatedItems) {
        setupdatecart(updatedItems);
      }
      setTotalPrice(data.data.totalPriceIncVat);
      setShippingFee(data.data.shippingFee);
      setVatPercentage(Number(data.data.items?.[0]?.vatPercentage) ?? 0);
      setShippingMethod(data.data.shippingMethod ?? "");
      setcheckoutpending(true);
      if (updatedItems?.length) {
        setiscaching(true);
        try {
          const finalcached: any[] = [];
          await Promise.all(
            updatedItems.map(async (item) => {
              if (item.id) {
                let cached: any = cachedProductData[item.id]
                  ? { data: cachedProductData[item.id] }
                  : await ProductCacheService.get(item.id);

                let cacheData: Record<string, unknown> = {
                  recommendedPriceInclVat:
                    cached.data?.recommendedPriceInclVat || item.recommendedPriceInclVat,
                  availability: cached.data?.availability || item.availability,
                  oeReference: cached.data?.oeReference || item.oeReference,
                  seo: cached.data?.seo ?? item.seo,
                };

                // If recommendedPriceInclVat or availability is missing, fetch from API
                if (
                  !cacheData.recommendedPriceInclVat ||
                  !cacheData.availability ||
                  !cacheData.oeReference
                ) {
                  try {
                    const productDetails = await queryClient.fetchQuery(
                      productFormationQueryOptions(item.id),
                    );
                    const productSeo = productDetails?.data?.seo
                      ? { name: productDetails.data.seo.name }
                      : item.seo;

                    cacheData = {
                      recommendedPriceInclVat:
                        productDetails?.data?.recommendedPriceInclVat ??
                        item.recommendedPriceInclVat,
                      availability: productDetails?.data?.availability ?? item.availability,
                      oeReference: productDetails?.data?.oeReference ?? item.oeReference,
                      seo: productSeo,
                    };
                  } catch (error) {
                    console.error(`Failed to fetch product details for ${item.id}:`, error);
                    // Continue with existing data if API fails
                  }
                }

                // Only cache if at least one of the fields is not available
                if (!cached.success && !cached.data) {
                  await ProductCacheService.set(item.id, cacheData);
                }
                finalcached.push({
                  id: item.id,
                  ...cacheData,
                });
                setCachedProductData((prev) => ({ ...prev, [item.id]: cacheData }));
              }
            }),
          );

          const newupdateItems = updatedItems.map((item) => {
            const matchingItem = finalcached.find((apiItem: any) => apiItem.id === item.id);
            return {
              ...item,
              ...matchingItem,
            };
          });
          setupdatecart(newupdateItems);
        } finally {
          setiscaching(false);
        }
      }
    },
    onError: () => {
      setcheckoutpending(true);
    },
  });

  useEffect(() => {
    // Only skip the initial Calculate after ?orderId= hydrate — never block qty-change recalculates.
    if (!iscartchanged && consumeSharedOrderCartPageCalculateSkip()) {
      hasCalculatedOnLoadRef.current = true;
      return;
    }
    if (!iscartchanged && sharedOrderId && !isSharedOrderHydrateComplete) return;
    if (!iscartchanged && isSharedOrderHydrating) return;

    const shouldRunCalculate =
      items?.length > 0 &&
      (iscartchanged || language !== cartlanguage || !hasCalculatedOnLoadRef.current);

    if (!shouldRunCalculate) return;
    //@ts-ignore
    const addresses = authUser?.addresses;
    const defaultShippingAddress = addresses?.find((address: any) => address.isDefaultShipping);
    const defaultBillingAddress = addresses?.find((address: any) => address.isDefaultBilling);
    let shippingaddress = null;
    let billingaddress = null;

    if (defaultShippingAddress) {
      setSelectedSavedDeliveryAddress(defaultShippingAddress);
      shippingaddress = defaultShippingAddress;
      setIsAccordionOpen(false);
    } else {
      setSelectedSavedDeliveryAddress(null);
    }
    if (defaultBillingAddress) {
      setSelectedSavedBillingAddress(defaultBillingAddress);
      billingaddress = defaultBillingAddress;
      setIsAccordionOpen(false);
    } else {
      setSelectedSavedBillingAddress(null);
    }

    const updatedProduct = {
      id: cartid !== "" ? cartid : null,
      shipping: shippingaddress === undefined ? null : shippingaddress,
      billing: billingaddress === undefined ? null : billingaddress,
      items: items?.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    };
    setcartlanguage(language);
    setiscartchanged(false);
    hasCalculatedOnLoadRef.current = true;
    //@ts-ignore
    mutate(updatedProduct);
    setcheckoutpending(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    language,
    iscartchanged,
    items?.length,
    sharedOrderId,
    isSharedOrderHydrating,
    isSharedOrderHydrateComplete,
  ]);
  useEffect(() => {
    if (recentlyViewed.length > 0) {
      setRecentlyViewedProduct(recentlyViewed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (items?.length > 0 && !hasTrackedViewCartRef.current) {
      const gtmItems = convertCartItemsToGTMItems(items as any);
      trackViewCart(gtmItems);
      hasTrackedViewCartRef.current = true;
    }
  }, [items]);
  if (vinUrlInvalid || carIdsUrlInvalid) {
    return <NotFoundclient />;
  }
  return (
    <Box className="flex min-h-[70vh] flex-col gap-content-to-footer base:gap-4 gtsm:gap-8">
      <Box className={`flex min-w-full flex-col justify-between gap-header-to-title`}>
        <Box className={`flex w-full`}>
          {/* Header */}
          <Box
            className={`flex w-full items-start justify-center gap-title-to-content base:px-0 gtsm:px-0 gtlg:px-0`}
          >
            {/* <Productnavigation /> */}
            <Typography
              type="h1"
              className="text-color-text-body section-standard typography-heading-01"
              hasBack
            >
              {getLabel("shopping_cart")}
            </Typography>
          </Box>
          {/* <OGHeader backarrow headertitle={getLabel("check_out")}  /> */}

          {/* Cart content */}
          <Box
            className={`relative ${items?.length === 0 ? "" : "section-split-primary-right"} base:mb-0 base:h-full base:w-full base:flex-col gtsm:flex-row gtlg:w-full ml:flex ml:flex-row`}
          >
            {/* Cart items */}
            <Box
              className={`flex w-full flex-col gap-4 ${items.length === 0 ? "" : "base:pb-0 gtsm:pb-0 gtlg:pb-0"}`}
            >
              {items.length == 0 &&
              (!hasHydrated || isSavingCalculate || isSharedOrderHydrating) ? (
                <ShoppingCartPageSkeleton />
              ) : items.length === 0 && hasHydrated && !isSharedOrderHydrating ? (
                <NoResultShoppingcart />
              ) : (
                items?.map((item) => {
                  const isOEM = true;

                  // Get cached data for this item, fallback to item data if not cached
                  const cached = cachedProductData[item.id] || {};
                  const recommendedPrice =
                    cached.recommendedPriceInclVat ?? item.recommendedPriceInclVat;
                  const availability = cached.availability ?? item.availability;
                  const oeReference = cached.oeReference ?? item.oeReference;
                  const totalPriceIncVat = Number(item.totalPriceIncVat);
                  const hasActualPrice = Number.isFinite(totalPriceIncVat);

                  return (
                    //@ts-ignore
                    <OGcartcard
                      imgcomp={item?.image ?? ""}
                      key={item.id}
                      partname={item.name}
                      seo={item.seo}
                      price={hasActualPrice ? totalPriceIncVat : undefined}
                      isPriceLoading={iscaching || !checkoutpending || !hasActualPrice}
                      isIOPart={item.isIOPart}
                      view={item.view}
                      description={item.description}
                      product={item.product}
                      showStarBlock={item.showStarBlock}
                      pricecomp={item.unitPriceIncVat}
                      unitPriceIncVat={item.unitPriceIncVat}
                      quantity={item?.quantity ?? 0}
                      id={item.id}
                      availability={availability}
                      isOEM={isOEM}
                      recommendedPriceInclVat={recommendedPrice}
                      oeReference={oeReference}
                      categories={item.categories}
                      manufacturerType={item.manufacturerType}
                    />
                  );
                })
              )}
            </Box>

            <Box className="flex flex-col gap-space-lg">
              {items?.length > 0 && (
                <Box className="gtlg:min-w-auto gtsm:min-w-auto flex w-full flex-col gap-[16px] gtlg:h-fit gtlg:max-w-[381px] gtlg:self-start">
                  <Overviewcard
                    type="shoppingcart"
                    // vatFromCalculateApi={cartitems}
                    showItems={
                      !(pathname?.includes("/shoppingcart") && !pathname?.includes("checkout"))
                    }
                  />
                </Box>
              )}
              {/* email and signup block */}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Frequently bought section */}
      {/* {getClientFeatureFlag("fbt_feature_flag") && !isMobile && items?.length > 0 && (
        <Productfrequentlybought />
      )} */}
      {!isMobile && recentlyViewedProduct?.length > 0 && (
        <Box className="flex w-full section-standard">
          <Productfrequentlybought products={recentlyViewedProduct} />
        </Box>
      )}
      <ConfirmationDelete />
    </Box>
  );
}
