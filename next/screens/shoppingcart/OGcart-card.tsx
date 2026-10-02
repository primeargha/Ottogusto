import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import { useModalStore } from "@/stores/useModalStore";
import { Pressable } from "@/components/ui/pressable";
import { useCartStore } from "@/stores/useCartStore";
import { useCalculatePriceMutation } from "@/hooks/cart";
import { AuthUserType, useAuthStore } from "@/stores/useAuthStore";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { currencyFormat } from "@/helpers/UtilityHelper";
import { buildPartPdpHref, partPdpOptionsFromSearchParams } from "@/utils/build-part-pdp-url";
import { useMedia } from "@/hooks/useMedia";
// import { FILE_UPLOAD_URL } from "@/config/app";
import { useBranding } from "@/contexts/BrandingContext";
//import noImage from "@/assets/Frame.svg";
import star from "../../public/assets/greenstar.svg";
import minusIcon from "@/assets/Ottogusto/minusSign.svg";
import addIcon from "@/assets/Ottogusto/add.svg";
import { MAX_CART_QUANTITY } from "@/config/cart-constants";
import {
  OGDiscountButton,
  isProductCardNavigationSuppressed,
} from "@/components/og-components/OGDiscountButton";
import { IndicatorIcon } from "./IndicatorIcon";
import { PartImagePlaceholderOverlay } from "@/components/og-components/PartImagePlaceholderOverlay";
import { resolvePartImageFromSources } from "@/utils/partImageUtils";
import type { PartImageItem } from "@/utils/partImageUtils";

// import productImg from "../../public/assets/productimages/productimg.png";
interface OGcartProps {
  state?: "default" | "hover";
  partname?: string;
  manufacturerType?: string;
  price?: number;
  isIOPart?: boolean;
  view?: "Card" | "Mobile" | "list";
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  imgcomp: string;
  pricecomp?: React.ReactNode;
  description?: string;
  product?: { images?: PartImageItem[] };
  showStarBlock?: boolean;
  id: string;
  quantity: number;
  unitPriceIncVat?: React.ReactNode;
  hasDiscount?: boolean;
  isPriceLoading?: boolean;
  availability?: string;
  isOEM?: boolean;
  recommendedPriceInclVat?: number;
  oeReference?: string;
  categories?: string[];
  seo?: { name?: string };
}

export const StarBlock = () => {
  const isTablet = useMedia("(min-width: 640px) and (max-width: 1023px)");
  const isMobile = useMedia("(max-width: 639px)");
  return (
    <Box
      className={`relative z-50 ${
        isMobile ? "h-14 w-14" : isTablet ? "h-8 w-8" : "gtlg:h-7 gtlg:w-7"
      }`}
    >
      <Image src={star} alt="" className="h-full w-full" />
      {/* OE Text Overlay */}
      <Box className="absolute inset-0 flex items-center justify-center text-center font-Anton text-[11.85px] font-[400] not-italic leading-[6.667px] text-[--Brand-Pure-White] [font-feature-settings:'liga'_off,'clig'_off]">
        OE
      </Box>
    </Box>
  );
};

export default function OGcartcard(props: OGcartProps) {
  const {
    partname,
    description,
    quantity,
    product,
    id: partid,
    price,
    imgcomp,
    pricecomp,
    unitPriceIncVat,
    hasDiscount,
    isPriceLoading,
    availability,
    isOEM,
    recommendedPriceInclVat,
    oeReference,
    categories,
    seo,
    manufacturerType,
  } = props;

  const { openModal, setPartid } = useModalStore();
  const isDesktop = useMedia("(min-width: 1200px)");
  const {
    cartitems,
    updateItem,
    addItem,
    removeItem,
    setupdatecart,
    setTotalPrice,
    cartid,
    setShippingFee,
    setVatPercentage,
    setShippingMethod,
    setcheckoutpending,
    setdepositfee,
    setiscartchanged,
    vatPercentage,
  } = useCartStore();

  const prodincart = cartitems?.find((item) => item.id === partid) || null;
  const currentQuantity = prodincart?.quantity ?? quantity ?? 0;
  const isIncrementDisabled = currentQuantity >= MAX_CART_QUANTITY;
  // Prefer per-line VAT percentage coming from the last Calculate API response.
  // Fall back to the global store VAT only when the item does not have one.
  const lineVatPercentage = cartitems[0]?.vatPercentage ?? vatPercentage;
  const { authUser } = useAuthStore();
  const router = useRouter();
  const isMobile = useMedia("(max-width: 639px)");
  const params = useParams();
  const searchParams = useSearchParams();
  const { getLocale, getLabel } = useBranding();
  const localeCODE = getLocale();
  /** Local draft while typing; committed on blur / Enter. */
  const [quantityInput, setQuantityInput] = useState(String(currentQuantity));

  useEffect(() => {
    setQuantityInput(String(currentQuantity));
  }, [currentQuantity]);

  type AvailabilityKey = "OnRequest" | "InStock" | "Backorder" | "EndOfLife";
  const getAvailabilityText = (): string => {
    const availabilityKeyMap: Record<AvailabilityKey, string> = {
      OnRequest: "on_request",
      InStock: "in_stock",
      Backorder: "backorder",
      EndOfLife: "end_of_life",
    };

    const key =
      availability && availability in availabilityKeyMap
        ? availabilityKeyMap[availability as AvailabilityKey]
        : "";

    return getLabel(key);
  };
  const { mutate, isPending: isSavingCalculate } = useCalculatePriceMutation({
    onSuccess: async (data) => {
      const updatedItems = cartitems?.map((item) => {
        const matchingItem =
          data?.data?.items && data?.data?.items.find((apiItem) => apiItem.id === item.id);
        return {
          ...item,
          ...matchingItem,
        };
      });
      const deposititems =
        data?.data?.items && data.data.items.filter((item: any) => item.type === "Deposit");
      const totaldeposit = deposititems?.reduce(
        (acc: any, item: any) => acc + item.totalPriceIncVat,
        0,
      );
      setdepositfee(totaldeposit);
      setupdatecart(updatedItems as any[]);
      setTotalPrice(data.data.totalPriceIncVat ?? 0);
      setShippingFee(data?.data?.shippingFee ?? 0);
      setVatPercentage(Number(data.data.items?.[0]?.vatPercentage) ?? 0);
      setShippingMethod(data.data.shippingMethod ?? "");
      setcheckoutpending(true);
    },
    onError: (error) => {
      console.error("Error saving address:", error);
    },
  });
  const handleSubmit = (items: any) => {
    const addresses = (authUser as AuthUserType)?.addresses;
    const shippingaddress = addresses?.find((address: any) => address.isDefaultShipping);
    const billingaddress = addresses?.find((address: any) => address.isDefaultBilling);
    const updatedProduct = {
      id: cartid,
      shipping: shippingaddress === undefined ? null : shippingaddress,
      billing: billingaddress === undefined ? null : billingaddress,
      items: items,
    };
    setiscartchanged(true);
    //mutate(updatedProduct);
    setcheckoutpending(false);
  };
  const handlemodalopen = (e?: any) => {
    e?.stopPropagation?.();
    openModal();
    setPartid(partid);
  };
  const applyQuantity = useCallback(
    (rawValue: string, e?: any) => {
      e?.stopPropagation?.();
      const trimmed = rawValue.trim();
      if (trimmed === "") {
        setQuantityInput(String(currentQuantity));
        return;
      }

      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        setQuantityInput(String(currentQuantity));
        return;
      }

      let nextQty = Math.floor(parsed);

      // Prevent negatives
      if (nextQty < 0) {
        nextQty = 0;
      }

      // 0 = delete confirmation (do not change cart until confirmed)
      if (nextQty === 0) {
        setQuantityInput(String(currentQuantity));
        handlemodalopen(e);
        return;
      }

      // Cap at store max (30)
      if (nextQty > MAX_CART_QUANTITY) {
        nextQty = MAX_CART_QUANTITY;
      }

      setQuantityInput(String(nextQty));

      if (nextQty === currentQuantity) {
        return;
      }

      updateItem(partid, nextQty);
      const items = cartitems?.map((item) => ({
        id: item.id,
        quantity: item.id === partid ? nextQty : item.quantity,
      }));
      handleSubmit(items);
    },
    // handleSubmit / handlemodalopen close over stable store setters + partid
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartitems, currentQuantity, partid, updateItem],
  );

  const handleQuantityInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    // Allow empty while editing; digits only (blocks -, e, decimals)
    if (value === "") {
      setQuantityInput("");
      return;
    }
    if (!/^\d+$/.test(value)) {
      return;
    }
    setQuantityInput(value);
  };

  const handleQuantityInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    applyQuantity(e.target.value, e);
  };

  const handleQuantityInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      applyQuantity((e.target as HTMLInputElement).value, e);
    }
  };

  const handlecartcontroller = (e: any, action: string) => {
    e.stopPropagation();
    if (action === "add" && prodincart) {
      if ((prodincart.quantity ?? 0) >= MAX_CART_QUANTITY) {
        return;
      }
      updateItem(partid, (prodincart.quantity ?? 0) + 1);
      const items = cartitems?.map((item) => ({
        id: item.id,
        quantity: item.id === partid ? (item.quantity ?? 0) + 1 : item.quantity,
      }));
      handleSubmit(items);
      //  else {
    }
    if (action === "remove") {
      if (prodincart !== null && (prodincart.quantity ?? 0) > 1) {
        updateItem(partid, (prodincart.quantity ?? 0) - 1);
        const items = cartitems?.map((item) => ({
          id: item.id,
          quantity: item.id === partid ? (item.quantity ?? 0) - 1 : item.quantity,
        }));
        handleSubmit(items);
      }
      if (prodincart !== null && (prodincart.quantity ?? 0) === 1) {
        // OD-612
        handlemodalopen(e);
      }
    }
  };
  const handlepress = () => {
    const locale = (params as Record<string, string>)?.["language-country"];
    const href = locale
      ? buildPartPdpHref(locale, partid, {
          seoName: seo?.name ?? partname,
          ...partPdpOptionsFromSearchParams(searchParams, { includeCarIds: true }),
        })
      : null;
    if (href) router.push(href);
  };

  function toTitleCase(str?: string): string {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function toSentenceCase(str?: string): string {
    if (!str) return "";
    const lower = str.toLowerCase().trim();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  const rrp = recommendedPriceInclVat || 0;
  const discount = ((rrp - Number(unitPriceIncVat || 0)) / rrp) * 100;
  const categoryIDdata = categories?.[0]?.slice(0, 9) ?? "001001";
  const { src: cartImageSrc, isPlaceholder } = resolvePartImageFromSources({
    images: product?.images,
    imageUrl: imgcomp ?? null,
    categoryId: categoryIDdata,
    categoryImageOptions: { width: 180, quality: 80 },
  });
  const imageexist = !isPlaceholder;
  const hasActualPrice = typeof price === "number" && Number.isFinite(price);
  const showPriceSkeleton = isPriceLoading || !hasActualPrice;

  return (
    <Box className="gtlg:max-h-auto base:max-h-auto z-0 flex w-full rounded-[6px] border border-color-border-default bg-color-background-default card-padding-compact card-gap-compact base:min-h-[262px] base:flex-row base:gap-[12px] gtsm:flex-col gtsm:gap-[12px] gtlg:min-h-[152px] gtlg:flex-row">
      {/* for image box */}

      <Box
        className="relative flex w-full cursor-pointer flex-row card-gap-compact base:min-w-[136px] base:max-w-[137px] gtlg:min-w-[180px] gtlg:max-w-[181px]"
        //@ts-ignore
        onClick={(e: React.MouseEvent) => {
          if (isProductCardNavigationSuppressed()) return;

          const target = (e.nativeEvent?.target ?? e.target) as EventTarget | null;
          if (target instanceof Element && target.closest("[data-og-discount-button]")) {
            return;
          }
          handlepress();
        }}
      >
        <Box className="relative my-auto flex flex-row items-center justify-center overflow-hidden">
          {isPriceLoading ? (
            <Box className="animate-pulse h-[120px] w-[136px] rounded-md bg-gray-300 gtlg:w-[180px]" />
          ) : cartImageSrc ? (
            <>
              <Image
                src={cartImageSrc}
                className={`my-auto max-h-[120px] max-w-[180px] object-contain ${imageexist ? "transition-transform hover:scale-110" : "opacity-40 grayscale"}`}
                width={1000}
                height={1000}
                unoptimized
                alt="product"
              />

              {isPlaceholder && <PartImagePlaceholderOverlay />}
            </>
          ) : null}
        </Box>
        {/*  */}
        {isPriceLoading ? (
          <Box className="animate-pulse absolute z-40 h-[22px] w-[74px] rounded bg-gray-300 base:left-0 base:top-3 gtsm:left-0 gtsm:top-0" />
        ) : manufacturerType === "OEM" ? (
          <>
            <OGDiscountButton
              type="muted"
              color="info"
              label={getLabel("OEM_part")}
              trailingIcon={true}
              tooltipText="oem_tooltip_info"
              headingContent="original_manufacturer_text"
              className="absolute z-40 base:left-0 base:top-3 gtsm:left-0 gtsm:top-0"
            />
          </>
        ) : manufacturerType === "AMS" ? (
          <OGDiscountButton
            type="muted"
            color="neutral"
            label={getLabel("product_tag_ams")}
            tooltipText="ams_tooltip_info"
            headingContent="ams_tooltip_text"
            trailingIcon={true}
            className="absolute z-40 base:left-0 base:top-3 gtsm:left-0 gtsm:top-0"
          />
        ) : manufacturerType === "OES" ? (
          <OGDiscountButton
            type="muted"
            color="warning"
            label={getLabel("product_tag_oes")}
            tooltipText="oes_tooltip_info"
            headingContent="oes_tooltip_text"
            trailingIcon={true}
            className="absolute z-40 base:left-0 base:top-3 gtsm:left-0 gtsm:top-0"
          />
        ) : (
          <OGDiscountButton
            type="muted"
            color="neutral"
            label={getLabel("non_oe_Reference")}
            // tooltipText="oes_tooltip_info"
            // headingContent="oes_tooltip_text"
            // trailingIcon={true}
            className="absolute z-40 base:left-0 base:top-3 gtsm:left-0 gtsm:top-0"
          />
        )}
      </Box>

      <Box
        className={`flex w-full card-gap-compact base:flex-col gtlg:flex-row ${isMobile ? "justify-between" : ""}`}
      >
        {/* for rest of item details */}

        <Box className="flex w-full base:h-auto gtlg:h-full">
          <Box className="flex flex-col items-start justify-start">
            {isPriceLoading ? (
              <Box className="animate-pulse h-4 w-[180px] rounded bg-gray-300" />
            ) : (
              <Box
                className="line-clamp-1 overflow-hidden text-ellipsis whitespace-normal break-all text-color-text-muted typography-overline"
                //@ts-ignore
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
            {/* Main title element */}
            {isPriceLoading ? (
              <Box className="animate-pulse mt-1 h-5 w-[230px] rounded bg-gray-300" />
            ) : (
              <Box className="w-auto text-start text-color-text-body body-bold-md">
                {toTitleCase(partname)}
              </Box>
            )}

            {/* OE Ref element */}
            {isPriceLoading ? (
              <Box className="mt-1 flex flex-row items-start gap-2">
                <Box className="animate-pulse h-4 w-[70px] rounded bg-gray-300" />
                <Box className="animate-pulse h-4 w-[95px] rounded bg-gray-300" />
              </Box>
            ) : manufacturerType === "OEM" ? (
              <Box className="flex flex-row items-start gap-2">
                <Box className="text-color-text-muted typography-caption">
                  {getLabel("oe_reference")}
                </Box>
                <Box className="whitespace-normal text-wrap text-color-text-muted typography-mono-caption">
                  {oeReference}
                </Box>
              </Box>
            ) : (
              <Box className="flex flex-row items-start gap-2">
                <Box className="text-color-text-muted typography-caption">
                  {getLabel("non_oe_Reference")}
                </Box>
                <Box className="whitespace-normal text-wrap text-color-text-muted typography-mono-caption">
                  {oeReference}
                </Box>
              </Box>
            )}

            {/* availability element */}
            {isPriceLoading ? (
              <Box className="mt-1 flex h-auto w-full flex-row items-center gap-space-xs">
                <Box className="animate-pulse h-3 w-3 rounded-full bg-gray-300" />
                <Box className="animate-pulse h-4 w-[70px] rounded bg-gray-300" />
              </Box>
            ) : (
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
                {/*  */}
                <Box className="flex flex-row gap-space-2xs text-end text-color-text-emphasis typography-caption">
                  {/* In Stock */}
                  {getAvailabilityText()}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {isMobile && <Box className="h-[1px] w-full bg-color-border-default" />}

        {/* buttons group */}
        <Box className="flex flex-col justify-between gap-space-xs base:w-full gtlg:h-full gtlg:max-w-[170px]">
          {isPriceLoading ? (
            <Box className="flex flex-row items-center gap-space-xs">
              <Box className="animate-pulse h-4 w-[72px] rounded bg-gray-300" />
              <Box className="animate-pulse h-6 w-[54px] rounded bg-gray-300" />
            </Box>
          ) : Math.round(discount) > 10 ? (
            <Box className="flex flex-row text-color-text-muted typography-mono-caption">
              {getLabel("productdetails_rrp")}{" "}
              <span className="ml-1 line-through">{currencyFormat(rrp, localeCODE, false)}</span>
            </Box>
          ) : (
            <Box className="w-full"></Box>
          )}

          <Box className="flex w-full flex-col gap-space-xs">
            <Box className="flex w-full flex-col">
              <Box className="flex w-auto flex-row gap-space-xs">
                <Box
                  className={`text-color-text-emphasisflex-row flex h-auto w-auto items-start justify-center typography-mono-large`}
                >
                  {showPriceSkeleton ? (
                    <Box className="animate-pulse h-[28px] w-[90px] rounded bg-gray-300" />
                  ) : (
                    currencyFormat(Number(unitPriceIncVat), localeCODE)
                  )}
                </Box>
                {!isPriceLoading && Math.round(discount) > 10 && (
                  <OGDiscountButton
                    type="emphasis"
                    color="positive"
                    label={`-${Math.round(discount)}%`}
                    trailingIcon={false}
                  />
                )}
              </Box>
              {isPriceLoading ? (
                <Box className="animate-pulse mt-1 h-3 w-[115px] rounded bg-gray-300" />
              ) : (
                <Box className="text-color-text-muted typography-caption">
                  {`${getLabel("common_vatLabel_prefix")} ${lineVatPercentage}% ${getLabel("common_vatLabel_suffix")}`}
                </Box>
              )}
            </Box>

            <Box className="flex min-h-9 w-full flex-row items-center justify-between rounded-md border border-color-border-default px-3 py-2">
              <Pressable onPress={(e: any) => handlecartcontroller(e, "remove")}>
                <Box className="flex max-w-5 cursor-pointer items-center justify-center">
                  {" "}
                  <Image src={minusIcon} alt="Decrease quantity" className="opacity-70" />
                </Box>
              </Pressable>
              <Box className="h-4 w-[1px] shrink-0 bg-color-border-default" />
              <Box className="flex min-h-[22px] w-full max-w-[88px] items-center justify-center overflow-visible">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-label={
                    getLabel("quantity") !== "quantity" ? getLabel("quantity") : "Quantity"
                  }
                  value={quantityInput}
                  onChange={handleQuantityInputChange}
                  onBlur={handleQuantityInputBlur}
                  onKeyDown={handleQuantityInputKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="h-auto min-h-[22px] w-full max-w-[88px] border-0 bg-transparent py-0 text-center leading-normal text-color-text-emphasis outline-none typography-body-strong-02 focus:outline-none"
                />
              </Box>
              <Box className="h-4 w-[1px] shrink-0 bg-color-border-default" />
              <Pressable onPress={(e: any) => handlecartcontroller(e, "add")}>
                <Box
                  className={`flex max-w-5 items-center justify-center ${
                    isIncrementDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                >
                  {" "}
                  <Image src={addIcon} alt="Increase quantity" className="opacity-70" />
                </Box>
              </Pressable>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
