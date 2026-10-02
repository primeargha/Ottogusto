import React, { forwardRef } from "react";
import { Box } from "../ui/box";
import Image from "next/image";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE, STORE_DISPLAY_NAMES } from "@/config/store-constants";
import { useMedia } from "@/hooks/useMedia";
import UserLogo from "@/assets/UserLogo";

interface OGHeaderButtonProps {
  state?: "enabled" | "focus" | "hover";
  hasLabel?: boolean;
  text?: string;
  buttonIcon?: React.ReactNode;
  hasCounter?: boolean;
  countData?: number;
  hasNotificationDot?: boolean;
  onClick?: (e: any) => void;
  className?: string;
  storeMode?: string;
  texthoverClass?: string | boolean;
  labeltextClass?: string;
  sideBarIcons?: React.ReactNode;
  buttonBG?: string;
  isActive?: boolean;
}

export const OGSidebarButton = forwardRef<HTMLButtonElement, OGHeaderButtonProps>((props, ref) => {
  const {
    className = ``,
    state = "enabled",
    hasLabel = false,
    text = "",
    buttonIcon = null,
    hasCounter = false,
    countData = 0,
    texthoverClass = "",
    hasNotificationDot = false,
    labeltextClass = "",
    sideBarIcons,
    buttonBG = "",
    isActive = false,
    storeMode = STORE_DISPLAY_NAMES[STORE_IDS.OTTOGUSTO],
  } = props;
  const isMobile = useMedia("(max-width: 639px)");
  const computedState = isActive ? "focus" : state;
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;

  let btnContainerClass = `flex flex-row w-auto items-center justify-between hover:bg-color-background-emphasis cursor-pointer rounded-[6px] p-2 ${buttonBG ? "" : "bg-header-action-bg-default "} `;
  const containerClass = `${
    computedState === "focus" ? "border border-color-border-focus bg-color-background-emphasis" : ""
  } ${btnContainerClass} ${className} group`;

  return (
    // @ts-ignore
    <Box className={containerClass} onClick={props.onClick}>
      <Box className="flex flex-row items-center justify-start">
        <Box className="relative">
          <Box className="relative">
            {sideBarIcons
              ? sideBarIcons
              : buttonIcon && (
                  <Image src={buttonIcon.toString()} alt="" className="" height={24} width={24} />
                )}
          </Box>
          {/* <UserLogo className="text-color-text-default" /> */}
          {hasNotificationDot && (
            <Box className="absolute -right-1 -top-0 h-[10px] w-[10px] rounded-full bg-[#ffd31b]" />
          )}
        </Box>

        {hasLabel && (
          <Box
            className={`${(sideBarIcons || buttonIcon) && "ml-2"} ${texthoverClass} flex-grow ${labeltextClass} typography-button-01`}
          >
            {text}
          </Box>
        )}
      </Box>

      {hasCounter && countData > 0 && (
        <Box className="relative flex flex-row gap-2">
          {countData > 0 && (
            <Box
              className={`bg-badge-count-bg ml-2 h-[22px] w-[22px] items-center rounded-full ${
                currentStore === STORE_IDS.OTTOGUSTO ? "bg-[#ffd31b]" : "bg-[#cc2824]"
              }`}
            >
              <Box className="p-[2px] text-header-badge-count-text typography-mono-caption">
                {countData}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
});

OGSidebarButton.displayName = "OGSidebarButton";
