"use client";
import { Box } from "@/components/ui/box";
import { useState } from "react";
import PlusIcon from "../../public/assets/icons/plusIcon.svg";
import { useBranding } from "@/contexts/BrandingContext";
import Image from "next/image";
import { OGButton } from "@/components/og-components/OGButton";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { trackAddToCart, convertProductToGTMItem } from "@/utils/gtm";
import { MAX_CART_QUANTITY } from "@/config/cart-constants";
import { useShoppingCartHref } from "@/hooks/useVehicleAwareCartHref";

export default function Addtocart({ data }: { data: any }) {
  const { getLabel } = useBranding();
  const params = useParams();
  const router = useRouter();
  const shoppingCartHref = useShoppingCartHref();
  const partid = params?.["partid"] as string;
  const language = params?.["language-country"] as string;
  const toast = useToast();
  const { cartitems, updateItem, addItem, removeItem, setiscartchanged } = useCartStore();
  const [prodincart, setprodincart] = useState(
    cartitems?.find((item) => item.id === partid)?.quantity || 0,
  );

  const handleaddToCart = () => {
    const gtmItem = convertProductToGTMItem(data, 1);
    if (prodincart === 0 && !cartitems?.find((item) => item.id === partid)) {
      setprodincart((prev) => prev + 1);
      setiscartchanged(true);
      addItem({
        id: partid,
        partname: data.title,
        price: data.price,
        isIOPart: false,
        view: "Card",
        description: data.description,
        product: { images: data.images },
        showStarBlock: true,
        pricecomp: data.price,
        quantity: 1,
        shippingDelivery: data.shippingDelivery ?? false,
        shippingPickup: data.shippingPickup ?? false,
        shippingWarehouse: data.shippingWarehouse ?? false,
        compatibilityTested: false,
        recommendedPriceInclVat: data?.recommendedPriceInclVat || 0,
        availability: data?.availability,
        oeReference: data?.oeReference,
        manufacturer: data?.manufacturer ?? data?.brand?.name,
        manufacturerId: data?.manufacturerId,
        categories: data?.categories,
        ...(data?.seo && { seo: { name: data.seo.name } }),
      });

      trackAddToCart([gtmItem]);

      toast.show({
        placement: "bottom right",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="success">
              {/* @ts-ignore */}
              <ToastTitle>{getLabel("item_add")}!</ToastTitle>
            </Toast>
          );
        },
      });
    }
    if (prodincart > 0 && cartitems?.find((item) => item.id === partid)) {
      if (prodincart >= MAX_CART_QUANTITY) {
        return;
      }
      setprodincart((prev) => prev + 1);
      setiscartchanged(true);
      updateItem(partid, prodincart + 1);

      trackAddToCart([gtmItem]);

      toast.show({
        placement: "bottom right",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="success">
              {/* @ts-ignore */}
              <ToastTitle>{getLabel("item_add")}!</ToastTitle>
            </Toast>
            //
          );
        },
      });
    }
    router.push(shoppingCartHref);
  };

  return (
    <Box className="z-50 h-[48px] w-1/2 items-center justify-center rounded-[4px] bg-color-primary-main px-[10px] py-3">
      <OGButton size="medium" type="primary" className="w-full" onClick={handleaddToCart}>
        {getLabel("add_to_cart")}
      </OGButton>
    </Box>
  );
}
