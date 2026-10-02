import React from "react";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import shoppingCartIcon from "@/assets/Ottogusto/shopping_cart.svg";
import { OGButton } from "./OGButton";
import { OGIncrementDecrement } from "./OGIncrementDecrement";
import ProductRequestinformation from "@/components/og-components/ProductRequestinformation";
import { useCartStore } from "@/stores/useCartStore";
import { useBranding } from "@/contexts/BrandingContext";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import {
  trackAddToCart,
  trackRemoveFromCart,
  convertProductToGTMItem,
  type ViewItemListCategoryContext,
} from "@/utils/gtm";
import { askConfirmation } from "@/utils/confirmation";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useSearchParams } from "next/navigation";
import { ShoppingCartIcon } from "../icons/ShoppingCartIcon";
import { useRecentlyViewedProductStore } from "@/stores/useRecentlyViewedProductStore";
import { MAX_CART_QUANTITY } from "@/config/cart-constants";

interface OGAddToCartControlProps {
  id: string | number;
  product: any; // Using any for now to match usage, ideally should be Product type
  itemCategoryContext?: ViewItemListCategoryContext | undefined;
}

export const OGAddToCartControl = ({
  id,
  product,
  itemCategoryContext,
}: OGAddToCartControlProps) => {
  const { getLabel } = useBranding();
  const toast = useToast();
  const searchParams = useSearchParams();
  const { cartitems, updateItem, removeItem, addItem, setiscartchanged, compatibilityCheckBasic } =
    useCartStore();
  const { removeRecentlyViewedProduct } = useRecentlyViewedProductStore();
  const cartItem = cartitems.find((item) => item.id === String(id));
  const quantity = cartItem?.quantity || 0;
  const isIncrementDisabled = quantity >= MAX_CART_QUANTITY;
  const getView = (): "Card" | "Mobile" | "list" => {
    // Simplified view logic or pass as prop if needed.
    // For now assuming 'Card' as default or deriving from context if available.
    // Since this is just for the cart item 'view' property, 'Card' is a safe default.
    return "Card";
  };

  const handleUpdateCart = (product: any, change: number = 1) => {
    const findProduct = cartitems.find((item) => item.id === product.id);
    const categoryCtx = itemCategoryContext ?? findProduct?.itemCategoryContext;
    const gtmSource = { ...product, itemCategoryContext: categoryCtx };
    const gtmItem = convertProductToGTMItem(gtmSource, 1);
    //for increment or decrement
    if (findProduct) {
      if (change > 0 && (findProduct.quantity || 0) >= MAX_CART_QUANTITY) {
        return;
      }
      const newQuantity = (findProduct.quantity || 0) + change;
      // for remove item
      if (newQuantity <= 0) {
        trackRemoveFromCart([{ ...gtmItem, quantity: Math.abs(change) || 1 }]);
        removeItem(product.id as string);
        setiscartchanged(true);

        toast.show({
          placement: "bottom right",
          render: ({ id }) => {
            return (
              <Toast
                nativeID={id}
                variant="solid"
                action="success"
                className="border-0 bg-color-icon-positive"
              >
                <ToastTitle>{getLabel("item_remove")}</ToastTitle>
              </Toast>
            );
          },
        });
      } else {
        updateItem(product.id as string, newQuantity);
        setiscartchanged(true);
        //for increment
        if (change > 0) {
          // Track add to cart with updated quantity
          trackAddToCart([{ ...gtmItem, quantity: change }]);

          toast.show({
            placement: "bottom right",
            render: ({ id }) => {
              return (
                <Toast
                  nativeID={id}
                  variant="solid"
                  action="success"
                  className="border-0 bg-color-icon-positive"
                >
                  <ToastTitle>
                    {newQuantity} {getLabel("item_add_cart")}!
                  </ToastTitle>
                </Toast>
              );
            },
          });
        }
        //for decrement
        else if (change < 0) {
          toast.show({
            placement: "bottom right",
            render: ({ id }) => {
              return (
                <Toast
                  nativeID={id}
                  variant="solid"
                  action="success"
                  className="border-0 bg-color-icon-positive"
                >
                  <ToastTitle>{getLabel("item_remove")}</ToastTitle>
                </Toast>
              );
            },
          });
        }
      }
    }
    //for add to cart
    else {
      setiscartchanged(true);
      removeRecentlyViewedProduct(product.id as string);
      addItem({
        id: product.id as string,
        partname: product.title,
        price: product.priceInclVat,
        isIOPart: false,
        view: getView(),
        description: product.description,
        product: { images: product.images },
        showStarBlock: true,
        pricecomp: product.priceInclVat,
        quantity: 1,
        shippingDelivery: product.shippingDelivery,
        shippingPickup: product.shippingPickup,
        shippingWarehouse: product.shippingWarehouse,
        compatibilityTested: false,
        recommendedPriceInclVat: product?.recommendedPriceInclVat || 0,
        availability: product?.availability,
        oeReference: product?.oeReference,
        manufacturer: product?.manufacturer ?? product?.brand?.name,
        manufacturerId: product?.manufacturerId,
        categories: product?.categories,
        itemCategoryContext: categoryCtx,
        ...(product?.seo && { seo: { name: product.seo.name } }),
      });

      // Track add to cart
      trackAddToCart([gtmItem]);

      toast.show({
        placement: "bottom right",
        render: ({ id }) => {
          return (
            <Toast
              nativeID={id}
              variant="solid"
              action="success"
              className="border-0 bg-color-icon-positive"
            >
              <ToastTitle>{getLabel("item_add_cart")}!</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  const handleAddToCart = () => {
    // Warn if Compatibility is not checked till now
    const ifCarDataSelected4Compatibility = compatibilityCheckBasic();
    const ifOeReferenceSearch = searchParams?.get("oeReference") ?? false;

    if (
      getClientFeatureFlag("engine_trim_feature_flag") &&
      !ifCarDataSelected4Compatibility &&
      !ifOeReferenceSearch
    ) {
      askConfirmation(
        getLabel("compatibility_check_title"),
        getLabel("compatibility_check_msg"),
        "report",
        () => {
          handleUpdateCart(product);
        },
        () => {
          return;
        },
        getLabel("cancel"),
        getLabel("add_to_cart_anyway_btn"),
      );
    } else {
      handleUpdateCart(product);
    }
  };

  const handleIncrement = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    handleUpdateCart(product, 1);
  };

  const handleDecrement = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    handleUpdateCart(product, -1);
  };

  return (
    <>
      {!cartItem ? (
        <OGButton
          size="small"
          type="primary"
          className="w-full items-center justify-center gap-3"
          onClick={handleAddToCart}
          leftcomp={<ShoppingCartIcon className="text-color-text-inverse" />}
        >
          {getLabel("add_to_cart")}
        </OGButton>
      ) : (
        <OGIncrementDecrement
          quantity={quantity}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          className="max-h-9"
          isIncrementDisabled={isIncrementDisabled}
        />
      )}
    </>
  );
};
