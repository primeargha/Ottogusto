"use client";
// import { OGRadioGroup, OGRadioInput } from "@/components/og-components/OGRadioInput";
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
// import Image from "next/image";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import BancontactIMG from "@/assets/payment-methods/bancontact.svg";
import PayconiqIMG from "@/assets/payment-methods/payconiq.png";
import VisaIMG from "@/assets/payment-methods/visa.svg";
import MasterCardIMG from "@/assets/payment-methods/mastercard.svg";
import iDEALIMG from "@/assets/payment-methods/iDEAL.svg";
import { useCartStore } from "@/stores/useCartStore";
import { OGButton } from "@/components/og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
// import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OGTextInput } from "@/components/og-components/OGTextInput";
import { OGCheckboxInput } from "@/components/og-components/OGCheckboxInput";
import { ContactFormData, contactSchema } from "./contactschema";

type Props = {
  defaultOpen?: boolean;
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

const CotactInformation = (props: Props) => {
  const { defaultOpen = false } = props;
  const [isAccordionOpen, setisAccordionOpen] = useState(defaultOpen);
  const { paymentmethod, setpaymentmethod, setcontactinfo, contactinfo, setIsAccordionOpen } =
    useCartStore();
  const { getLabel } = useBranding();
  const handleChange = (v: string) => {
    setpaymentmethod(v);
  };

  const {
    control,
    reset,
    handleSubmit,
    trigger,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: contactinfo?.firstName || "",
      lastName: contactinfo?.lastName || "",
      email: contactinfo?.email || "",
      emailconfirm: contactinfo?.emailconfirm || false,
    },
    mode: "onChange",
  });

  // Watch individual form fields to update contactinfo in real-time
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const email = watch("email");
  const emailconfirm = watch("emailconfirm");

  // Update contactinfo whenever form fields change
  React.useEffect(() => {
    setcontactinfo({
      firstName,
      lastName,
      email,
      emailconfirm,
    });
  }, [firstName, lastName, email, emailconfirm, setcontactinfo]);

  const onSubmit = (data: ContactFormData) => {
    setcontactinfo(data);
    setisAccordionOpen(false);
    setIsAccordionOpen(true); // for Delivery address section
  };
  return (
    <Box>
      {/* sprit 21 related changes shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] */}
      <Accordion
        size="lg"
        variant="unfilled"
        type="multiple"
        isCollapsible={true}
        isDisabled={false}
        defaultValue={isAccordionOpen ? ["c"] : []}
        value={isAccordionOpen ? ["c"] : []}
        onValueChange={(value) => setisAccordionOpen(value.includes("c"))}
        className="w-full rounded-[6px] border border-color-border-default"
      >
        {/* accordian a */}
        <AccordionItem value="c">
          <AccordionHeader>
            <AccordionTrigger>
              {({ isExpanded }) => {
                return (
                  <Box className="flex w-full flex-col">
                    <Box className="flex w-full flex-row justify-between">
                      {/* @ts-ignore */}
                      <AccordionTitleText className="text-color-primary-main typography-heading-03">
                        1. {getLabel("contact_information")}
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
          {/* @ts-ignore */}
          <AccordionContent className="gap-6">
            <Box className="w-full gap-3">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box className="mt-3 grid w-full grid-cols-1 gap-6">
                  <Box className="flex flex-row gap-6">
                    <Box className="flex-1">
                      <Controller
                        control={control}
                        name="firstName"
                        render={({ field: { onChange, value } }) => (
                          <OGTextInput
                            title={`${getLabel("first_name")} *`}
                            value={value}
                            onChange={onChange}
                            placeholder={getLabel("enter_first_name")}
                            state={errors.firstName ? "error" : value ? "filled" : "default"}
                            error={errors.firstName?.message}
                          />
                        )}
                      />
                    </Box>
                    <Box className="flex-1">
                      <Controller
                        control={control}
                        name="lastName"
                        render={({ field: { onChange, value } }) => (
                          <OGTextInput
                            title={`${getLabel("last_name")} *`}
                            value={value}
                            onChange={onChange}
                            placeholder={getLabel("enter_last_name")}
                            state={errors.lastName ? "error" : value ? "filled" : "default"}
                            error={errors.lastName?.message}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <OGTextInput
                        title={`${getLabel("email")} *`}
                        value={value}
                        onChange={onChange}
                        placeholder={getLabel("enter_email_address")}
                        state={errors.email ? "error" : value ? "filled" : "default"}
                        error={errors.email?.message}
                      />
                    )}
                  />
                  <Box className="flex flex-col gap-6">
                    <Controller
                      control={control}
                      name="emailconfirm"
                      render={({ field: { onChange, value } }) => (
                        <OGCheckboxInput
                          selected={value ? "yes" : "no"}
                          label={getLabel("email_me_with_news_and_offers")}
                          onChange={(isSelected) => {
                            onChange(isSelected);
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </form>
            </Box>
            <OGButton
              onClick={handleSubmit(onSubmit)}
              type="primary"
              size="large"
              className="w-full"
            >
              {getLabel("confirm")}
            </OGButton>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default CotactInformation;
