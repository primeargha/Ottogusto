"use client";
import Modal from "@/components/Modal";
import { Box } from "@/components/ui/box";
// import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useModalStore } from "@/stores/useModalStore";
import alertImg from "../../public/assets/profile/alert-diamond.svg";
import Image from "next/image";
import { useCartStore } from "@/stores/useCartStore";
import { useCalculatePriceMutation } from "@/hooks/cart";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBranding } from "@/contexts/BrandingContext";
import { OGButton } from "@/components/og-components/OGButton";
import { convertProductToGTMItem, trackRemoveFromCart } from "@/utils/gtm";
const ConfirmationDelete = () => {
  const { closeModal, partid, setPartid } = useModalStore();
  const { getLabel } = useBranding();
  const {
    removeItem,
    setTotalPrice,
    cartid,
    cartitems,
    setShippingFee,
    setVatPercentage,
    setShippingMethod,
    setcheckoutpending,
    setdepositfee,
    setiscartchanged,
  } = useCartStore();
  const { isAuthenticated, authUser } = useAuthStore();
  const handleclosemodal = () => {
    closeModal();
    setPartid("");
  };
  const { mutate, isPending: isSavingCalculate } = useCalculatePriceMutation({
    onSuccess: async (data) => {
      setTotalPrice(data.data.totalPriceIncVat ?? 0);
      setShippingFee(data.data.shippingFee ?? 0);
      setVatPercentage(Number(data.data.items?.[0]?.vatPercentage) ?? 0);
      setShippingMethod(data.data.shippingMethod ?? "");
      setcheckoutpending(true);
      const deposititems =
        data?.data.items && data?.data.items.filter((item: any) => item.type === "Deposit");
      const totaldeposit = deposititems?.reduce(
        (acc: any, item: any) => acc + item.totalPriceIncVat,
        0,
      );
      setdepositfee(totaldeposit);
    },
    onError: (error) => {
      console.error("Error saving address:", error);
    },
  });
  const handledeletemodal = () => {
    //removeItem(partid);
    const cartitemsfilter = cartitems.filter((item) => item.id !== partid);
    // @ts-ignore
    const addresses = authUser?.addresses;
    const shippingaddress = addresses?.find((address: any) => address.isDefaultShipping);
    const billingaddress = addresses?.find((address: any) => address.isDefaultBilling);
    const updatedProduct = {
      id: cartid,
      shipping: shippingaddress === undefined ? null : shippingaddress,
      billing: billingaddress === undefined ? null : billingaddress,
      items: cartitems
        .filter((item) => item.id !== partid)
        ?.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
    };
    const removedItem = cartitems.find((item) => item.id === partid);
    if (removedItem) {
      const gtmItem = convertProductToGTMItem(removedItem as any, removedItem.quantity || 1);
      trackRemoveFromCart([gtmItem]);
    }

    setiscartchanged(true);
    // mutate(updatedProduct);
    removeItem(partid);
    setcheckoutpending(false);

    setPartid("");
    closeModal();
  };
  return (
    <>
      <Modal
        width="max-w-md"
        containerClassName="z-[1000]"
        modalClassName="rounded-[8px] bg-color-background-l2 w-full gtsm:min-w-[600px] gtsm:h-[288px] base:h-auto"
        backdropClass="bg-black bg-opacity-50"
        showCloseButton={false}
        contentClassName="base:px-[55px] gtsm:px-[82px] py-8"
        // headerComponent={
        //   <Box className="flex flex-row items-center">
        //     <Text className="font-Overpass text-[20px] font-bold leading-[22px] text-color-text-body">
        //       Delete Account
        //     </Text>
        //   </Box>
        // }
        // headerClassName="px-[26px] py-[26px] border-b border-[--primary-colors-primary-dark] border-opacity-20"
        footerClassName="bg-color-background-l2 gtsm:pb-0"
        footerComponent={
          <Box className="flex w-full flex-row justify-center gap-2 px-[26px] py-[16px]">
            <OGButton size="medium" type="outlined" onClick={handleclosemodal}>
              {getLabel("cancel")}
            </OGButton>
            <OGButton size="medium" type="error" onClick={handledeletemodal}>
              {getLabel("delete")}
            </OGButton>
          </Box>
        }
        //
      >
        <Box className="flex flex-col items-center justify-center gap-4">
          <Box className="flex flex-row items-center justify-center rounded-[8px] bg-color-system-error-extra-light">
            <Image src={alertImg} height={52} width={52} alt="delete" />
          </Box>

          <Text className="text-center text-color-text-body body-bold-md">
            {getLabel("cart_delete_item_confirmation")}
          </Text>

          <Text className="text-center text-color-text-body body-regular-sm">
            {getLabel("cart_delete_item_confirmation_warn")}
          </Text>
        </Box>
      </Modal>
    </>
  );
};

export default ConfirmationDelete;
