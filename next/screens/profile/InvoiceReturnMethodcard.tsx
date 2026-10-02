import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { useMedia } from "@/hooks/useMedia";
import banconImag from "../../public/assets/bancontactimg.svg";
import downloadImg from "../../public/assets/download.svg";
import { OGButton } from "@/components/og-components/OGButton";
import { useQueryClient } from "@tanstack/react-query";
import { orderInvoiceQueryOptions } from "@/hooks/orders";

interface InvoiceMethodCardProps {
  paymentMethod: string;
  status: string;
  id: string | undefined;
}

const InvoiceReturnMethodcard: React.FC<InvoiceMethodCardProps> = ({
  paymentMethod,
  status,
  id,
}) => {
  const isMobile = useMedia("(max-width: 639px)");
  const { getLabel } = useBranding();
  const queryClient = useQueryClient();
  const isFetchingRef = useRef(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const orderId: any = id?.toString();

  const downloadInvoice = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsDownloading(true);
    try {
      const { blob, filename } = await queryClient.fetchQuery(
        orderInvoiceQueryOptions(orderId, true),
      );

      if (typeof window === "undefined") {
        throw new Error("Invoice download is only supported in the browser.");
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download invoice", error);
    } finally {
      isFetchingRef.current = false;
      setIsDownloading(false);
    }
  };

  return (
    <Box
      className={`${isMobile ? "z-100 h-fit w-full rounded-[10px] bg-color-background-l2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" : "rounded-[9px]"} h-auto shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] gtsm:w-full gtlg:w-full gtlg:bg-transparent`}
    >
      <Box
        className={`${isMobile ? "z-100 rounded-[9px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" : "shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)"} "z-100 gtlg:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25) w-full rounded-[8px] bg-color-background-l1 p-6 base:h-auto gtsm:mx-0 gtlg:mx-0 gtlg:h-auto`}
      >
        <Box className="flex h-auto w-full flex-col items-center gap-3">
          <Box className="flex w-full flex-row items-center justify-between">
            <Box className="text-color-text-body text-single-200-regular">
              {/* Paid with [PaymentMethod] */}
              {getLabel("Order_paid_with", {
                method: paymentMethod,
              })}
            </Box>

            <Box className="h-6 w-[34px]">
              <Image src={banconImag} alt="" className="h-full w-full" />
            </Box>
          </Box>

          <Box className="flex w-full flex-col gap-[6px]">
            <OGButton
              onClick={downloadInvoice}
              type="primary"
              size="medium"
              isLoading={isDownloading}
              //   disabled={status !== "Delivered"}
              className="w-full flex-1"
              leftcomp={<Image src={downloadImg} alt="Advanced Search" height={20} width={20} />}
            >
              {getLabel("Order_download_invoice")}
            </OGButton>
            <Box className="text-center text-color-text-placeholder text-single-50-regular">
              {getLabel("credit_note_text")}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceReturnMethodcard;
