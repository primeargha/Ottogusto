"use client";

import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import Typography from "@/components/og-components/Typography";
import ContactInfo2, { ContactInfo2Ref } from "../ConatctInfo2";
import { RefObject } from "react";

interface CheckoutDetailsBlockProps {
  getLabel: (key: string) => string;
  isBusiness: boolean;
  isAuthenticated: boolean;
  typoClass: string;
  onAccountType: (type: "personal" | "business") => void;
  onBusinessClickRequiresLogin?: () => void;
  contactFormRef: RefObject<ContactInfo2Ref | null>;
}

export function CheckoutDetailsBlock({
  getLabel,
  isBusiness,
  isAuthenticated,
  typoClass,
  onAccountType,
  onBusinessClickRequiresLogin,
  contactFormRef,
}: CheckoutDetailsBlockProps) {
  return (
    <Box className="flex w-full flex-col gap-space-lg rounded-[4px]">
      <Box className="flex flex-col gap-space-lg">
        <Box className="text-color-text-emphasis typography-heading-03">{getLabel("details")}</Box>
        <Box className="w-full gap-space-xl">
          <Box className="flex max-h-14 min-h-14 w-full flex-row base:w-1/2">
            <Pressable
              onPress={() => onAccountType("personal")}
              className={`group inline-flex items-center justify-center gap-2.5 border-b border-color-border-default py-1 hover:border-b-2 hover:border-color-border-focus base:w-full gtsm:min-w-48 gtsm:max-w-48 gtlg:min-w-48 gtlg:max-w-48 ${!isBusiness ? "border-b-2 border-color-border-focus" : ""} `}
            >
              <Box className="flex w-full min-w-20 items-center justify-center gap-2.5 rounded-md p-3">
                <Typography className={`${typoClass} group-hover:text-color-text-brand`}>
                  {getLabel("personal_purchase")}
                </Typography>
              </Box>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!isAuthenticated) {
                  onBusinessClickRequiresLogin?.();
                  return;
                }
                onAccountType("business");
              }}
              className={`group inline-flex items-center justify-center gap-2.5 border-b border-color-border-default py-1 ${isAuthenticated ? "cursor-pointer hover:border-b-2 hover:border-color-border-focus" : "cursor-not-allowed border-b border-color-border-default"} base:w-auto gtsm:max-w-52 gtlg:max-w-52 ${isBusiness ? "border-b-2 border-color-border-focus" : ""} `}
            >
              <Box className="flex w-full min-w-20 items-center justify-center gap-2.5 rounded-md p-3">
                <Typography
                  className={`flex-1 justify-start text-center typography-body-strong-01 ${
                    isAuthenticated && isBusiness
                      ? "text-color-text-brand group-hover:text-color-text-brand"
                      : "text-color-text-default group-hover:text-color-text-brand"
                  } ${!isAuthenticated ? "group-hover:text-color-text-default" : ""}`}
                >
                  {getLabel("business_purchase")}
                </Typography>
              </Box>
            </Pressable>
          </Box>

          <ContactInfo2 ref={contactFormRef as any} />
        </Box>
      </Box>
    </Box>
  );
}
