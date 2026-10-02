import React from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import Image from "next/image";

interface Tab {
  id: string;
  label: string;
  icon: any;
}

interface SearchTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function SearchTabsNoBorder({ tabs, activeTab, onTabChange }: SearchTabsProps) {
  return (
    <Box className="rounded-[8px] bg-white p-[10px] md:mb-1 md:w-[644px] gtlg:mb-1 gtlg:w-[710px] ml:mb-1 ml:w-[715px] 2xl:mb-0 2xl:h-[70px] 2xl:w-[715px]">
      <Box className="flex h-full w-full flex-row items-center justify-around gap-3">
        {tabs?.map((tab) => (
          <Box
            key={tab.id}
            // @ts-ignore
            onClick={() => onTabChange(tab.id)}
            className={`flex h-full flex-1 cursor-pointer flex-row items-center justify-center gap-2 rounded-[4px] px-[7px] py-[10px] ${
              activeTab === tab.id
                ? "bg-color-primary-main"
                : "border border-[--brand-piston-green] bg-[--Brand-Pure-White]"
            }`}
          >
            <Image src={tab.icon} alt={tab.label} width={16} height={16} />

            <Text
              className={`font-Overpass text-[10px] font-[400] leading-[18px] gtlg:text-[13px] ${
                activeTab === tab.id ? "text-[--Brand-Pure-White]" : "text-color-primary-main"
              }`}
            >
              {tab.label}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
