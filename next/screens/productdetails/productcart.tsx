"use client";
import {
  use,
  useEffect,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { Pressable } from "@/components/ui/pressable";
// import carImg from "../../public/assets/icons/carBackopen.svg";
import Image from "next/image";
import { Box } from "@/components/ui/box";
// import PlusIcon from "../../public/assets/icons/plusIcon.svg";
// import plus from "../../public/assets/plus.svg";
// import minus from "../../public/assets/minus.svg";
import { useCartStore } from "@/stores/useCartStore";
import { useParams, useRouter } from "next/navigation";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { useBranding } from "@/contexts/BrandingContext";
import {
  trackAddToCart,
  convertProductToGTMItem,
  type ViewItemListCategoryContext,
} from "@/utils/gtm";
import shoppingCartIcon from "@/assets/Ottogusto/shopping_cart.svg";
import { useShoppingCartHref } from "@/hooks/useVehicleAwareCartHref";
import { useMedia } from "@/hooks/useMedia";
import { OGButton } from "@/components/og-components/OGButton";
import { useRecentlyViewedProductStore } from "@/stores/useRecentlyViewedProductStore";
import { MAX_CART_QUANTITY } from "@/config/cart-constants";
import { PlusIcon } from "./PlusIcon";
import { MinusIcon } from "./MinusIcon";

const Productcart = ({
  data,
  defaultQty = 1,
  itemCategoryContext,
}: {
  data: any;
  defaultQty?: number;
  itemCategoryContext?: ViewItemListCategoryContext | undefined;
}) => {
  const { cartitems, updateItem, addItem, removeItem, setiscartchanged } = useCartStore();
  const { removeRecentlyViewedProduct } = useRecentlyViewedProductStore();
  const params = useParams();
  const shoppingCartHref = useShoppingCartHref();
  const isDesktop = useMedia("(min-width: 1025px)");
  const toast = useToast();
  const router = useRouter();
  const partid = params?.["partid"] as string;
  const language = params?.["language-country"] as string;
  const { getLabel } = useBranding();

  const cartItemQuantity = cartitems?.find((item) => item.id === partid)?.quantity;

  const [prodincart, setprodincart] = useState(cartItemQuantity || defaultQty);
  /** Local draft while typing; committed on blur / Enter. */
  const [quantityInput, setQuantityInput] = useState(String(prodincart));

  useEffect(() => {
    setprodincart(cartItemQuantity || defaultQty);
  }, [cartItemQuantity, partid, defaultQty]);

  useEffect(() => {
    setQuantityInput(String(prodincart));
  }, [prodincart]);

  const isIncrementDisabled = prodincart >= MAX_CART_QUANTITY;

  const applyQuantity = (rawValue: string) => {
    const trimmed = rawValue.trim();
    if (trimmed === "") {
      setQuantityInput(String(prodincart));
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setQuantityInput(String(prodincart));
      return;
    }

    let nextQty = Math.floor(parsed);

    if (nextQty < 1) {
      nextQty = 1;
    }

    // Cap at store max (30)
    if (nextQty > MAX_CART_QUANTITY) {
      nextQty = MAX_CART_QUANTITY;
    }

    setQuantityInput(String(nextQty));
    setprodincart(nextQty);
  };

  const handleQuantityInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    applyQuantity(e.target.value);
  };

  const handleQuantityInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyQuantity((e.target as HTMLInputElement).value);
    }
  };

  const handlecartcontroller = (action: string) => {
    if (action === "add") {
      if (prodincart >= MAX_CART_QUANTITY) {
        return;
      }
      setprodincart((prev) => prev + 1);
    }

    if (action === "remove" && prodincart > 1) {
      setprodincart((prev) => prev - 1);
    } else if (action === "remove" && prodincart === 1) {
      toast.show({
        placement: "bottom right",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="error">
              <ToastTitle>{getLabel("item_remove_empty_warning")}!</ToastTitle>
            </Toast>
          );
        },
      });
    }
    if (action === "update") {
      setiscartchanged(true);
      if (prodincart === 0 && cartitems?.find((item) => item.id === partid)) {
        removeItem(partid);

        toast.show({
          placement: "bottom right",
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="success">
                <ToastTitle>{getLabel("item_remove")}!</ToastTitle>
              </Toast>
            );
          },
        });
      }
      if (prodincart > 0 && !cartitems?.find((item) => item.id === partid)) {
        const gtmSource = { ...data, itemCategoryContext };
        const gtmItem = convertProductToGTMItem(gtmSource, prodincart || defaultQty);

        addItem({
          id: partid,
          partname: data.title,
          price: data.priceInclVat,
          isIOPart: false,
          view: "Card",
          description: data.description,
          product: { images: data.images },
          showStarBlock: true,
          pricecomp: data.priceInclVat,
          quantity: prodincart || defaultQty,
          shippingDelivery: data.shippingDelivery ?? null,
          shippingPickup: data.shippingPickup ?? null,
          shippingWarehouse: data.shippingWarehouse ?? null,
          compatibilityTested: false,
          recommendedPriceInclVat: data?.recommendedPriceInclVat || 0,
          availability: data?.availability,
          oeReference: data?.oeReference,
          manufacturer: data?.manufacturer ?? data?.brand?.name,
          manufacturerId: data?.manufacturerId,
          categories: data?.categories,
          itemCategoryContext,
          ...(data?.seo && { seo: { name: data.seo.name } }),
        });
        removeRecentlyViewedProduct(partid);

        // Track add to cart
        trackAddToCart([gtmItem]);

        toast.show({
          placement: "bottom right",
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="success">
                <ToastTitle>{getLabel("item_add")}!</ToastTitle>
              </Toast>
              //
            );
          },
        });
      }
      if (prodincart > 0 && cartitems?.find((item) => item.id === partid)) {
        const gtmSource = { ...data, itemCategoryContext };
        const gtmItem = convertProductToGTMItem(gtmSource, 1);

        updateItem(partid, prodincart);

        trackAddToCart([gtmItem]);

        toast.show({
          placement: "bottom right",
          render: ({ id }) => {
            return (
              <Toast nativeID={id} variant="accent" action="success">
                <ToastTitle>{getLabel("item_add")}!</ToastTitle>
              </Toast>
            );
          },
        });
      }
      router.push(shoppingCartHref);
    }
  };
  return (
    <Box className="h-auto w-full flex-row items-center rounded-[5.743px] base:flex gtsm:flex gtlg:flex">
      <Box className="flex max-h-[44px] w-full flex-row items-center justify-between gap-2">
        <Box className="h-full base:w-1/2 gtsm:w-1/2 gtlg:max-w-full">
          {/*  */}
          <Box
            className={`flex max-h-[44px] w-full flex-row items-center rounded-[4px] border border-color-border-emphasis p-space-xs base:justify-between gtsm:justify-around gtlg:justify-between`}
          >
            <Pressable
              onPress={() => {
                handlecartcontroller("remove");
              }}
            >
              <Box className={`flex h-full w-auto cursor-pointer items-center justify-center pl-1`}>
                {/* <Image className="h-6 w-6" src={minus} alt="dropdown" /> */}
                <MinusIcon className="text-color-icon-default" />
              </Box>
            </Pressable>

            {/* mark */}
            <Box className="h-6 w-[1px] bg-color-border-default" />
            {/* main value */}
            <Box className="flex min-w-[30px] items-center justify-center overflow-visible text-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label={getLabel("quantity") !== "quantity" ? getLabel("quantity") : "Quantity"}
                value={quantityInput}
                onChange={handleQuantityInputChange}
                onBlur={handleQuantityInputBlur}
                onKeyDown={handleQuantityInputKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="h-auto min-w-[30px] max-w-[60px] border-0 bg-transparent p-0 text-center leading-normal text-color-text-emphasis outline-none typography-body-strong-01 focus:outline-none"
              />
            </Box>
            {/* mark */}
            <Box className="h-6 w-[1px] bg-color-border-default" />

            <Pressable onPress={() => handlecartcontroller("add")}>
              <Box
                className={`flex h-full w-auto items-center justify-center pr-1 ${
                  isIncrementDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                {/* <Image className="h-6 w-6" src={plus} alt="dropdown" /> */}
                <PlusIcon className="text-color-icon-default" />
              </Box>
            </Pressable>
          </Box>
        </Box>

        <OGButton
          leftcomp={<Image src={shoppingCartIcon} alt="shopping cart" width={24} height={24} />}
          className="h-full shrink-0 whitespace-nowrap base:w-1/2 gtsm:w-1/2"
          size="medium"
          onClick={() => handlecartcontroller("update")}
        >
          {getLabel("add_to_cart")}
        </OGButton>
      </Box>
    </Box>
  );
};

export default Productcart;
