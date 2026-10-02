import { OGButton } from "@/components/og-components/OGButton";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { currencyFormat, getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMedia } from "@/hooks/useMedia";
import { usePayOrderMutation } from "@/hooks/cart";
import { openPayNlPaymentGateway } from "@/utils/paymentSession";
// import { Text } from "@/components/ui/text";
// import { SimplePolicyLink } from "@/components/PolicyViewer";
import noImage from "@/assets/Frame.svg";
import exclamicon from "@/assets/productdetailsexclamation-icon.svg";
import Image from "next/image";
import { PartImagePlaceholderOverlay } from "@/components/og-components/PartImagePlaceholderOverlay";
import { resolvePartImageFromSources } from "@/utils/partImageUtils";
import { CustomTooltip } from "@/components/og-components/OGtooltip";
import { z } from "zod";
import SkeletonOverview from "./SkeletonOverview";

// Helper function to validate email using Zod
const isValidEmail = (email: string): boolean => {
  try {
    z.string().email().parse(email);
    return true;
  } catch {
    return false;
  }
};
import { useConfig } from "@/contexts/ConfigContext";
import type { ProfileInformation } from "@/type";
import React from "react";
import Termsandconditioncom from "./termsandcondition";
import Link from "next/link";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import Shoppingcartemail from "./shoppingcartemail";
import Typography from "@/components/og-components/Typography";
import { useCheckoutHref } from "@/hooks/useVehicleAwareCartHref";

export default function Overviewcard({
  type,
  showItems = true,
  vatFromCalculateApi,
}: {
  type: string;
  showItems?: boolean;
  // Optional VAT percentage coming directly from the Shoppingcartpage Calculate API ref.
  vatFromCalculateApi?: number | null;
}) {
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel, getLocale } = useBranding();
  const localeCODE = getLocale();
  const { isAuthenticated, authUser } = useAuthStore();

  // Check if payment method feature flag is enabled
  const isPaymentMethodFeatureEnabled = getClientFeatureFlag("payment_method_feature_flag");
  const {
    cartitems,
    totalprice,
    shippingfee,
    vatPercentage,
    shippingMethod,
    checkoutpending,
    paymentmethod,
    selectedSavedBillingAddress,
    selectedSavedDeliveryAddress,
    showAllItems,
    setShowAllItems,
    cartid,
    depositfee,
    settry_again,
    guestAddressFormsValid,
  } = useCartStore();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const checkoutHref = useCheckoutHref();
  // const totalQuantity = cartitems?.reduce((acc, item) => acc + item?.quantity, 0) || 0;
  const { mutate, isPending: ispaymentorder } = usePayOrderMutation({
    onSuccess: async (data: any) => {
      settry_again(false);
      if (data?.data?.url && cartid) {
        openPayNlPaymentGateway(data.data.url, { orderId: cartid });
      }
      // setTotalPrice(data.data.totalPriceIncVat);
      // setShippingFee(data.data.shippingFee);
      // setcheckoutpending(true)
    },
    onError: (error: any) => {},
  });
  const handlecheckoutproceed = () => {
    router.push(checkoutHref);
    // if (isAuthenticated) {
    //   router.push(getRouteLocaleString(Routes.checkout, params));
    // } else {
    //   router.push(getRouteLocaleString(Routes.checkoutOptions, params));
    // }
  };
  const displayedItems = showAllItems ? cartitems : cartitems?.slice(0, 3); // control visible items

  const handlepayment = () => {
    // Strip shippingMethod from shipping address - it is sent as top-level payload property only
    const shippingForPayload =
      selectedSavedDeliveryAddress && typeof selectedSavedDeliveryAddress === "object"
        ? (() => {
            const { shippingMethod: _, ...rest } = selectedSavedDeliveryAddress;
            return rest;
          })()
        : selectedSavedDeliveryAddress;

    const latestContact = useCartStore.getState().contactinfo;
    const currentAuthUser = useAuthStore.getState().authUser;

    let customer: ProfileInformation;
    if (isAuthenticated && currentAuthUser && "email" in currentAuthUser) {
      const auth = currentAuthUser as ProfileInformation;
      const formFirst = latestContact?.firstName?.trim();
      const formLast = latestContact?.lastName?.trim();
      customer = {
        ...auth,
        email: auth.email ?? "",
        firstName: (formFirst || auth.firstName) ?? null,
        lastName: (formLast || auth.lastName) ?? null,
      };
    } else {
      customer = {
        email: latestContact?.email ?? "",
        firstName: latestContact?.firstName?.trim() || null,
        lastName: latestContact?.lastName?.trim() || null,
      };
    }

    const returnOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const payload = {
      id: cartid,
      customer,
      shipping: shippingForPayload,
      billing: selectedSavedBillingAddress,
      shippingfee: shippingfee,
      ...(shippingMethod && { shippingMethod }),
      vinNUmber: null,
      totalPriceIncVat: totalprice,
      totalpaid: totalprice + shippingfee,
      items: cartitems?.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        name: item.partname || "",
        unitPrice: item.price || 0,
      })),
      // payments: [
      //   {
      //     id: null,
      //     method: paymentmethod,
      //     price: totalprice + shippingfee,
      //     paymentInfo: null,
      //     currecy: "euro",
      //   },
      // ],
      status: "New",
      metaData: null,
      returnUrl: returnOrigin + getRouteLocaleString(Routes.paymentStatus, params),
    };
    //@ts-ignore
    mutate(payload);
  };
  // TRAILING SLASH FIX
  const isMobileandCheckoutRoute = isMobile && pathname?.includes("/shoppingcart/checkout");

  const linkTextClass = `cursor-pointer body-regular-sm text-color-text-placeholder underline`;
  // Subtotal: sum of items' totalPriceIncVat from Calculate API (no frontend price calculation)
  const getPrice = (items: any) => {
    return (items ?? []).reduce(
      (acc: number, item: any) => acc + (Number(item?.totalPriceIncVat) || 0),
      0,
    );
  };

  // Cart: total = subtotal + deposit only (no shipping). Checkout: unchanged (API total from store).
  const displayTotal =
    type === "shoppingcart"
      ? getPrice(cartitems ?? []) + Number(depositfee || 0)
      : Number(totalprice);

  // Decide which VAT percentage to show:
  // - On the shopping cart page, prefer the value passed from Shoppingcartpage's
  //   vatFromCalculateApi ref (which is taken directly from the last Calculate API call).
  // - Otherwise (checkout and other usages), fall back to the store-level vatPercentage.
  const displayVatPercentage =
    type === "shoppingcart" || type !== "checkout"
      ? (cartitems[0]?.vatPercentage ?? vatPercentage)
      : vatPercentage;
  const showCheckoutEmailFlagON =
    type === "shoppingcart" &&
    !isAuthenticated &&
    cartitems?.length > 0 &&
    getClientFeatureFlag("checkout_email_capture_feature_flag");
  return (
    <Box
      className={`${isMobile ? (isMobileandCheckoutRoute ? "mb-0 p-4" : "z-100 py-space-lg") : "rounded-[6px]"} z-50 h-fit rounded-[6px] bg-color-background-default gtsm:w-full gtlg:w-full`}
    >
      {checkoutpending ? (
        <Box
          className={`${
            isMobile ? (isMobileandCheckoutRoute ? "" : "z-90") : ""
          } z-100 h-auto w-full rounded-[6px] bg-color-background-default gtsm:mx-0 gtsm:px-0 gtlg:mx-0 gtlg:px-0`}
        >
          <Box
            className={`flex h-full flex-col justify-between ${
              isMobile && isAuthenticated ? "gap-space-md" : "gap-space-lg"
            }`}
          >
            <Box className="flex flex-col gap-3">
              {/* Items block parent*/}
              {showItems && (
                <Box className="mb-4 flex w-full flex-col card-gap-default">
                  {displayedItems?.map((item) => {
                    const categoryId = item?.categories?.[0]?.slice(0, 9) ?? "001001";
                    const { src: thumbSrc, isPlaceholder } = resolvePartImageFromSources({
                      images: item?.product?.images,
                      imageUrl: item?.image ?? null,
                      categoryId,
                    });

                    return (
                      <Box
                        className="relative flex w-full flex-row items-center justify-between"
                        key={item.id}
                      >
                        <Box className="flex flex-row justify-center gap-space-sm">
                          <Box className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-color-border-default">
                            <Image
                              src={thumbSrc || noImage}
                              alt={item.partname || ""}
                              width={48}
                              height={48}
                              className={`h-12 w-12 object-cover ${isPlaceholder ? "opacity-40 grayscale" : ""}`}
                              unoptimized
                            />
                            {isPlaceholder && thumbSrc ? (
                              <PartImagePlaceholderOverlay compact className="!text-[6px]" />
                            ) : null}
                          </Box>

                          <Box className="flex flex-col items-start justify-center">
                            <Box className="text-color-text-emphasis typography-caption">
                              {(item?.name?.length ?? 0) > 34
                                ? `${item?.name?.slice(0, 34) ?? ""}...`
                                : (item?.name ?? "")}
                            </Box>
                            <Box
                              className="text-color-text-disabled typography-caption"
                              // @ts-ignore
                              dangerouslySetInnerHTML={{ __html: item.description }}
                            />
                          </Box>
                        </Box>
                        <Box className="absolute left-8 top-[-10px] z-50 flex h-6 w-6 items-center justify-center rounded-full bg-color-background-neutral-emphasis text-center text-color-text-inverse typography-caption">
                          {item.quantity}
                        </Box>

                        <Box className="text-color-text-emphasis typography-mono-body-02">{` ${currencyFormat(Number(item.totalPriceIncVat) || 0, localeCODE)}`}</Box>
                      </Box>
                    );
                  })}
                  {cartitems.length > 3 && (
                    <Box
                      className="cursor-pointer text-color-primary-main underline typography-body-02"
                      // @ts-ignore
                      onClick={() => setShowAllItems(!showAllItems)}
                    >
                      {showAllItems
                        ? getLabel("Checkout_view_less")
                        : getLabel("Checkout_view_more")}
                    </Box>
                  )}
                </Box>
              )}

              <Box className="flex w-full flex-row justify-between">
                <Typography className="text-color-text-emphasis typography-body-02">
                  {getLabel("subtotal")}
                </Typography>

                <Typography className="text-color-text-emphasis typography-mono-body-strong-02">
                  {" "}
                  {currencyFormat(getPrice(cartitems ?? []), localeCODE)}
                </Typography>
              </Box>

              <Box className="flex w-full flex-row justify-between">
                <Typography className="text-color-text-emphasis typography-body-02">
                  {getLabel("shipping_cost")}
                </Typography>

                {type === "shoppingcart" ? (
                  <Typography className="text-color-text-emphasis typography-body-02">
                    {" "}
                    {getLabel("cart_shipping_placeholder")}
                  </Typography>
                ) : (
                  <Typography className="text-color-text-emphasis typography-mono-body-strong-02">
                    {" "}
                    {currencyFormat(shippingfee, localeCODE)}
                  </Typography>
                )}
              </Box>
              {depositfee > 0 && (
                <Box className="flex w-full flex-row justify-between">
                  <Box className="flex flex-row items-center gap-3">
                    <Box className="font-Overpass text-[18px] font-normal leading-5">
                      {getLabel("deposit")}
                    </Box>

                    <CustomTooltip content={getLabel("deposit_hover_text")}>
                      <Image src={exclamicon} alt="icon" className="cursor-pointer pr-1" />
                    </CustomTooltip>
                  </Box>

                  <Box> {currencyFormat(depositfee, localeCODE)}</Box>
                </Box>
              )}
            </Box>

            <Divider />
            <Box className="flex w-full flex-col gap-space-lg">
              <Box className="flex h-auto flex-col">
                <Box className="flex w-full flex-row items-center justify-between">
                  <Box className="text-color-text-emphasis typography-body-strong-01">
                    {getLabel("total")}
                  </Box>{" "}
                  <Box className="not-ligatures w-1/2 text-end text-color-text-emphasis typography-mono-large">
                    {currencyFormat(displayTotal, localeCODE)}
                  </Box>
                </Box>
                <Box className="flex w-full">
                  <Box className="flex w-full flex-row justify-end">
                    <span className="text-color-text-muted typography-caption">
                      {`${getLabel("common_vatLabel_prefix")} ${displayVatPercentage}% ${getLabel("common_vatLabel_suffix")}`}
                    </span>
                  </Box>
                </Box>
              </Box>
              {/* {!isMobile && type === "shoppingcart" && isAuthenticated && (
                <Box className="flex w-full flex-col gap-3">
                  <OGButton
                    type="primary"
                    size="medium"
                    className={`w-full ${type === "shoppingcart" ? "" : ""}`}
                    onClick={handlecheckoutproceed}
                  >
                    {getLabel("proceed_to_checkout")}
                  </OGButton>
                </Box>
              )} */}
              {/* {isMobile && type === "shoppingcart" && isAuthenticated && (
                <>
                  <Box className="z-50 flex flex-col gap-2 bg-color-background-default px-3">
                    <OGButton
                      type="primary"
                      size="medium"
                      className="w-full"
                      onClick={handlecheckoutproceed}
                    >
                      {getLabel("proceed_to_checkout")}
                    </OGButton>
                  </Box>
                </>
              )} */}
            </Box>

            <Box className={`flex flex-col ${isMobile ? "gap-space-sm" : "gap-space-lg"}`}>
              {/* {type === "shoppingcart" && !isAuthenticated && cartitems?.length > 0 && (
                <Shoppingcartemail />
              )} */}

              {showCheckoutEmailFlagON ? (
                <Shoppingcartemail />
              ) : (
                type === "shoppingcart" && (
                  <Box
                    className={`${isMobile ? "fixed bottom-0 right-0 section-gutter" : ""} z-50 flex w-full flex-col gap-2 bg-color-background-default py-space-sm`}
                  >
                    <OGButton
                      type="primary"
                      size="medium"
                      className="w-full"
                      onClick={handlecheckoutproceed}
                    >
                      {getLabel("cart_cta_SignUp_SignIn_Pay")}
                    </OGButton>
                    <Termsandconditioncom />
                  </Box>
                )
              )}
              {/* {type === "shoppingcart" && cartitems?.length > 0 && <Termsandconditioncom />} */}
            </Box>
          </Box>
        </Box>
      ) : (
        // Overview card loading
        <SkeletonOverview />
      )}
    </Box>
  );
}
