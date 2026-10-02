import React, { forwardRef } from "react";
import { Box } from "../ui/box";
import Image from "next/image";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE, STORE_DISPLAY_NAMES } from "@/config/store-constants";
import { useMedia } from "@/hooks/useMedia";
import { DropdownIcon } from "@/components/og-components/icons/DropdownIcon";
import Typography from "./Typography";

interface OGLangSelectorButtonProps {
  state?: "enabled" | "focus" | "hover";
  hasLabel?: boolean;
  text?: string;
  buttonIcon?: React.ReactNode;
  onClick?: (e: any) => void;
  className?: string;
  storeMode?: string;
}

export const OGLangSelectorButton = forwardRef<HTMLButtonElement, OGLangSelectorButtonProps>(
  (props, ref) => {
    const {
      className = ``,
      state = "enabled",
      hasLabel = false,
      text = "",
      buttonIcon = null,
      storeMode = STORE_DISPLAY_NAMES[STORE_IDS.OTTOGUSTO],
    } = props;
    const isMobile = useMedia("(max-width: 719px)");
    const currentStore =
      typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;
    let btnContainerClass =
      "flex flex-row w-auto items-center gap-3 cursor-pointer bg-color-background-default border border-color-border-emphasis rounded-[4px] p-3";

    const containerClass = `gap-3 ${state === "focus" ? "border border-color-border-focus" : ""} ${btnContainerClass} ${className}`;

    return (
      <Box className={containerClass} onClick={props.onClick as any}>
        <Box className="relative">
          {buttonIcon && (
            <Image src={buttonIcon.toString()} alt="" className="" height={24} width={24} />
          )}
        </Box>

        <Box className={`flex h-full w-full flex-row items-center justify-between`}>
          {hasLabel && (
            <Typography className="text-color-text-emphasis typography-body-strong-01">
              {text}
            </Typography>
          )}

          {isMobile ? (
            <Box className="flex h-full w-auto flex-row items-center justify-between gap-3">
              <Box className="h-full max-w-[1px] border border-color-border-default"></Box>

              <DropdownIcon className="text-color-icon-default" />
            </Box>
          ) : (
            <Box className="flex h-full w-auto flex-row items-center justify-between gap-3">
              <Box className="h-full max-w-[1px] border border-color-border-default"></Box>

              <DropdownIcon className="text-color-icon-default" />
            </Box>
          )}
        </Box>
      </Box>
    );
  },
);

OGLangSelectorButton.displayName = "OGLangSelectorButton";
