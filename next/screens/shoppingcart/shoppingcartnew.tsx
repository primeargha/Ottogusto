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
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { useCalculatePriceMutation } from "@/hooks/cart";
import OGSkeletoncartCard from "./OGSkeletoncartCard";
// import { getClientFeatureFlag } from "@/utils/theme-utils";
import Typography from "@/components/og-components/Typography";
// import Termsandconditioncom from "./termsandcondition";
// import OGClaimtab from "@/components/og-components/OGClaimTab";
// import Shoppingcartemail from "./shoppingcartemail";
// import { BackToTop } from "@/app/(public)/[language-country]/car-parts/BackToTop";
// import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { useRecentlyViewedProductStore } from "@/stores/useRecentlyViewedProductStore";
import { ProductCacheService } from "@/services/productCacheService";
import { getProductInformation } from "@/services/productdetailsservice";
export default function Shoppingcartpage() {
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel } = useBranding();
  const pathname = usePathname();
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
    setcartlanguage,
    cartlanguage,
    iscartchanged,
    setiscartchanged,
    setdepositfee,
  } = useCartStore();
  //const [items, setitems] = useState(cartitems);
  const { isAuthenticated, authUser } = useAuthStore();
  const { recentlyViewed } = useRecentlyViewedProductStore();
  const [recentlyViewedProduct, setRecentlyViewedProduct] = useState<CartItem[]>([]);
  const [cachedProductData, setCachedProductData] = useState<Record<string, any>>({});
  const [iscaching, setiscaching] = useState(false);

  const params = useParams();
  const language = params?.["language-country"] as string;
  const { mutate, isPending: isSavingCalculate } = useCalculatePriceMutation({
    onSuccess: async (data: any) => {
      const updatedItems = items?.map((item) => {
        const matchingItem = data.data.items.find((apiItem: any) => apiItem.id === item.id);
        return {
          ...item,
          ...matchingItem,
          product: {
            ...item.product,
            ...(matchingItem as { product?: { images?: unknown } }).product,
          },
        };
      });
      const deposititems = data.data.items.filter((item: any) => item.type === "Deposit");
      const totaldeposit = deposititems.reduce(
        (acc: any, item: any) => acc + item.totalPriceIncVat,
        0,
      );
      setdepositfee(totaldeposit);
      setcartid(cartid === "" ? data.data.id : cartid);
      setupdatecart(updatedItems);
      const finalcached: number[] = [];
      // Store RRP, availability, and OE reference in product cache service
      // Store RRP, availability, and OE reference in product cache service
      await Promise.all(
        updatedItems?.map(async (item) => {
          if (item.id) {
            let cacheData = {
              recommendedPriceInclVat: item.recommendedPriceInclVat,
              availability: item.availability,
              oeReference: item.oeReference,
            };

            // If recommendedPriceInclVat or availability is missing, fetch from API
            if (
              !cacheData.recommendedPriceInclVat ||
              !cacheData.availability ||
              !cacheData.oeReference
            ) {
              try {
                const productDetails = await getProductInformation(item.id);

                cacheData = {
                  recommendedPriceInclVat: productDetails?.data?.recommendedPriceInclVat,
                  availability: productDetails?.data?.availability,
                  oeReference: productDetails?.data?.oeReference,
                };
                await ProductCacheService.set(item.id, cacheData);
                finalcached.push(item.id);
              } catch (error) {
                console.error(`Failed to fetch product details for ${item.id}:`, error);
                // Continue with existing data if API fails
              }
            }
          }
        }) || [],
      );

      if (finalcached.length === updatedItems.length) {
        // setiscaching(true)
        const cachedData: Record<string, any> = {};

        const enrichedItems = await Promise.all(
          updatedItems.map(async (item) => {
            if (item.id) {
              const response = await ProductCacheService.get(item.id);
              if (response.success && response.data) {
                cachedData[item.id] = response.data;
                return {
                  ...item,
                  recommendedPriceInclVat:
                    response.data.recommendedPriceInclVat ?? item.recommendedPriceInclVat,
                  availability: response.data.availability ?? item.availability,
                  oeReference: response.data.oeReference ?? item.oeReference,
                };
              }
            }
            return item;
          }),
        );

        setCachedProductData(cachedData);
        setupdatecart(enrichedItems);
      }
      setTotalPrice(data.data.totalPriceIncVat);
      setShippingFee(data.data.shippingFee);
      setVatPercentage(Number(data.data.items?.[0]?.vatPercentage) ?? 0);
      setShippingMethod(data.data.shippingMethod ?? "");
      setcheckoutpending(true);
    },
    onError: (error) => {},
  });
  useEffect(() => {
    if (language !== cartlanguage || iscartchanged) {
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
        // setIsAccordionOpen(true);
      }
      if (defaultBillingAddress) {
        setSelectedSavedBillingAddress(defaultBillingAddress);
        billingaddress = defaultBillingAddress;
        setIsAccordionOpen(false);
      } else {
        setSelectedSavedBillingAddress(null);
        // setIsAccordionOpen(true);
      }
      if (items?.length > 0) {
        // const cartrandomnumber = randomcartidgenerator();
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
        //@ts-ignore
        mutate(updatedProduct);
        setcheckoutpending(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, language, iscartchanged]);
  useEffect(() => {
    if (recentlyViewed.length > 0) {
      setRecentlyViewedProduct(recentlyViewed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {isSavingCalculate ? (
                <Box className="flex w-full flex-col gap-4 base:pb-[90px] gtsm:pb-[12px] gtlg:pb-0">
                  {/* Left side Shopping cart cards loading */}
                  {[...Array(4)]?.map((_, index) => (
                    <OGSkeletoncartCard key={index} />
                  ))}
                </Box>
              ) : items.length === 0 ? (
                <NoResultShoppingcart />
              ) : (
                items?.map((item) => {
                  const isOEM = true;

                  return (
                    //@ts-ignore
                    <OGcartcard
                      imgcomp={item?.image ?? ""}
                      key={item.id}
                      partname={item.name}
                      seo={item.seo}
                      price={Number(item.totalPriceIncVat)}
                      isIOPart={item.isIOPart}
                      view={item.view}
                      description={item.description}
                      product={item.product}
                      showStarBlock={item.showStarBlock}
                      pricecomp={item.unitPriceIncVat}
                      unitPriceIncVat={item.unitPriceIncVat}
                      quantity={item.quantity ?? 0}
                      id={item.id}
                      availability={item.availability}
                      isOEM={isOEM}
                      recommendedPriceInclVat={item.recommendedPriceInclVat}
                      oeReference={item.oeReference}
                      categories={item.categories}
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

      {!isMobile && recentlyViewedProduct?.length > 0 && (
        <Box className="flex w-full section-standard">
          <Productfrequentlybought products={recentlyViewedProduct} />
        </Box>
      )}
      <ConfirmationDelete />
    </Box>
  );
}
