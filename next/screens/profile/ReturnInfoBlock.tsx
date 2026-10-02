import { OGButton } from "@/components/og-components/OGButton";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useBranding } from "@/contexts/BrandingContext";
import React from "react";

const ReturnInfoBlock = ({ bankaccount, iban }: { bankaccount: string; iban: string }) => {
  const { getLabel } = useBranding();
  return (
    <Box className="flex h-auto w-full items-start gap-3 rounded-[8px] border border-color-background-l8 bg-color-background-l2 p-6 shadow-[0px_8px_40px_0px_rgba(0,0,0,0.12)] base:flex-col gtsm:flex-col gtlg:flex-row">
      <Box className="flex h-full w-full flex-1 flex-col gap-3">
        <Box className="flex justify-start py-3">
          <Box className="text-color-text-body body-bold-lg">{getLabel("refund_info")}</Box>
        </Box>

        <Box className="flex h-full flex-col justify-between gap-3 rounded-[8px] bg-color-background-l3 p-6">
          <Box className="inline text-color-text-body body-bold-sm">
            {getLabel("bank_account_name")}:&nbsp;
            <span className="body-regular-sm">{bankaccount}</span>
          </Box>

          <Box className="inline text-color-text-body body-bold-sm">
            {getLabel("iban")}: <span className="body-regular-sm">{iban}</span>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ReturnInfoBlock;
