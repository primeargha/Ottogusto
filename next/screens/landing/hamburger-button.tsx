"use client";

import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import hamburgerOtto from "@/assets/Ottogusto/menu.svg";
import hamburgerQverde from "@/assets/Qverde/menu.svg";
import Image from "next/image";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { STORE_IDS, DEFAULT_STORE } from "@/config/store-constants";
import GreenCrossIcon from "../../public/assets/GreenCrossIcon";
import { OGButton } from "@/components/og-components/OGButton";
import HamburgerMenuIcon from "./HamburgerIcon";

type HamburgerButtonProps = {
  isOpen: boolean;
  toggleMenu: () => void;
  isIpad?: boolean | null;
  onHeader?: boolean;
};

const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  isOpen,
  toggleMenu,
  isIpad = false,
  onHeader,
}) => {
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;

  return (
    <Pressable
      className={`visible relative flex items-center justify-center bg-transparent`}
      onPress={toggleMenu}
      tabIndex={0}
    >
      {/* Container Box for Hamburger Lines / Close X */}
      <Box className="relative flex h-4 w-5 flex-col items-center justify-between">
        {!isOpen && <HamburgerMenuIcon className="h-full w-full text-header-action-icon" />}

        {/* Cross icon when menu is open */}
        {isOpen && !onHeader && (
          <GreenCrossIcon className="h-[14px] w-[14px] text-button-ghost-icon" />
        )}
      </Box>
    </Pressable>
  );
};

export default HamburgerButton;
