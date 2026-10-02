"use client";
import { OGRadioGroup, OGRadioInput } from "@/components/og-components/OGRadioInput";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Box } from "@/components/ui/box";
import { MinusIcon, PlusIcon } from "lucide-react-native";
import Image from "next/image";
// import React, { useState } from "react";

import BancontactIMG from "@/assets/payment-methods/bancontact.svg";
import PayconiqIMG from "@/assets/payment-methods/payconiq.png";
import VisaIMG from "@/assets/payment-methods/visa.svg";
import MasterCardIMG from "@/assets/payment-methods/mastercard.svg";
import iDEALIMG from "@/assets/payment-methods/iDEAL.svg";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBranding } from "@/contexts/BrandingContext";

type Props = {
  // defaultOpen?: boolean;
  isAccordionOpen: boolean;
  setIsAccordionOpen: (value: boolean) => void;
  //  onChangeCallback?: (value: string) => void;
};

export const PaymentMethodsList = [
  {
    id: "Bancontact",
    label: "Bancontact",
    icon: BancontactIMG,
  },
  {
    id: "Payconiq",
    label: "Payconiq",
    icon: PayconiqIMG,
  },
  {
    id: "Visa",
    label: "Visa",
    icon: VisaIMG,
  },
  {
    id: "MasterCard",
    label: "MasterCard",
    icon: MasterCardIMG,
  },
  {
    id: "iDEAL",
    label: "iDEAL",
    icon: iDEALIMG,
  },
];
const PaymentMethods = ({ isAccordionOpen, setIsAccordionOpen }: Props) => {
  // const { defaultOpen = false } = props;
  const { getLabel } = useBranding();
  // const [isAccordionOpen, setisAccordionOpen] = useState(defaultOpen);
  const { paymentmethod, setpaymentmethod } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const handleChange = (v: string) => {
    setpaymentmethod(v);
  };
  // sprint-21 related changes shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
  return (
    <Accordion
      size="lg"
      variant="unfilled"
      type="multiple"
      isCollapsible={true}
      isDisabled={false}
      defaultValue={isAccordionOpen ? ["a"] : []}
      value={isAccordionOpen ? ["a"] : []}
      onValueChange={(value) => setIsAccordionOpen(value.includes("a"))}
      className="w-full rounded-[6px] border border-color-border-default"
    >
      {/* accordian a */}
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger>
            {({ isExpanded }) => {
              return (
                <Box className="flex w-full flex-col">
                  <Box className="flex w-full flex-row justify-between">
                    {/* @ts-ignore  */}
                    <AccordionTitleText className="text-color-primary-main typography-heading-03">
                      {isAuthenticated ? "3" : "4"}. {getLabel("payment_method")}
                    </AccordionTitleText>
                    {isExpanded ? (
                      <AccordionIcon as={MinusIcon} className="ml-3" />
                    ) : (
                      <AccordionIcon as={PlusIcon} className="ml-3" />
                    )}
                  </Box>
                  {!isAccordionOpen && <Box className="flex w-full flex-row gap-4"></Box>}
                </Box>
              );
            }}
          </AccordionTrigger>
        </AccordionHeader>
        {/* @ts-ignore  */}
        <AccordionContent className="gap-6">
          <Box className="w-full gap-3">
            <OGRadioGroup value={paymentmethod} onChange={handleChange} className="flex flex-col">
              {PaymentMethodsList?.map((method, indx) => {
                return (
                  <Box key={indx}>
                    <OGRadioInput
                      key={`mID-${method.id}`}
                      value={method.id}
                      label={
                        <Box className="flex flex-row flex-wrap">
                          <Image
                            src={method.icon}
                            alt={`Pay via ${method.label}`}
                            className="mr-[12px] h-[20px] w-[35px]"
                            sizes="auto"
                            width={0}
                            height={20}
                          />
                          {/* {method.icon} */}
                          <Box className="body-regular-sm">{method.label}</Box>
                        </Box>
                      }
                    />
                  </Box>
                );
              })}
            </OGRadioGroup>
          </Box>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PaymentMethods;
