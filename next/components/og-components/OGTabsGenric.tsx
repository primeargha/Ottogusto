import React from "react";
import { Box } from "../ui/box";
import Image from "next/image";
import { useAuthStore } from "@/stores/useAuthStore";

interface OGTabsGenricItemInterface {
  label: string;
  id: string;
  icon: {
    src: string;
  };
  isActive?: boolean;
  onClick?: any;
}
const OGTabsGenricItem = (props: OGTabsGenricItemInterface) => {
  const { id, label, icon, isActive = false, onClick } = props;
  const { isAuthenticated } = useAuthStore();
  // debugger;
  let tabOuterClass = `flex h-9 flex-1 flex-wrap content-center items-center justify-start gap-2.5 rounded px-3 py-2 cursor-pointer`;
  let lableClass = `text-color-text-body`;
  if (isActive) {
    tabOuterClass = `${tabOuterClass}  bg-color-primary-main border-2 border-color-primary-main`;
    lableClass = `text-white`;
  } else {
    tabOuterClass = `${tabOuterClass}  bg-transparent border-2 border-color-primary-main`;
  }

  return (
    <Box
      className={`line-clamp-1 whitespace-nowrap px-[12px] py-[8px] ${tabOuterClass}`}
      onClick={() => {
        if (onClick) {
          onClick(id);
        }
      }}
    >
      <Box
        className={`flex w-full flex-row content-center items-center justify-center ${isAuthenticated ? "gap-1" : "gap-3"}`}
        title={icon.src}
      >
        <Box className="relative h-5 w-5">
          <Image src={icon.src} alt={label} width={20} height={20} />
        </Box>
        <Box
          className={`align-center text-nowrap font-Overpass text-base font-medium ${lableClass}`}
        >
          {label}
        </Box>
      </Box>
    </Box>
  );
};

type Props = {
  data: any;
  activeTab: any;
  onTabChange: (tabId: string) => void;
};

const OGTabsGenric = (props: Props) => {
  const { data, activeTab, onTabChange } = props;

  const handleTabChange = (val: string) => {
    onTabChange(val);
  };

  return (
    <>
      {data?.map((tabData: any, indx: number) => {
        return (
          <OGTabsGenricItem
            key={indx}
            label={tabData.label}
            isActive={tabData.id === activeTab}
            onClick={handleTabChange}
            {...tabData}
          />
        );
      })}
    </>
  );
};

export default OGTabsGenric;
