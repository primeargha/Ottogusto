"use client";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import React, { useEffect } from "react";
import star from "../../public/assets/greenstar.svg";
import { useManufacturerStore } from "@/stores/usemastermanufacturerdata";
import { useGetManufacturerQuery } from "@/hooks/productdetails";
import { useThemeChangePs } from "@/components/ThemeChange/useThemeChangePS";
const Productmanufacturerbrand = ({ data }: { data: string }) => {
  const { manufacturerdata, setmanufacturerdata } = useManufacturerStore();
  const { data: manufacturer } = useGetManufacturerQuery(manufacturerdata);
  useEffect(() => {
    if (manufacturerdata === null && manufacturer !== undefined) {
      setmanufacturerdata(manufacturer?.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturerdata, manufacturer]);
  if (manufacturerdata === null) {
    return null;
  }
  const manufacturerType = manufacturerdata?.find((item: { id: string }) => item.id === data)?.type;
  return (
    <Box className="relative h-10 w-10">
      <Image src={star} alt="" className="h-10 w-10" />

      <Box
        className={`absolute inset-0 flex items-center justify-center text-center font-[family-name:var(--font-family-title)] text-[19.704px] font-[400] leading-[13.333px] text-color-text-on-dark`}
        style={{
          fontFeatureSettings: "'liga' off, 'clig' off",
          fontStyle: "normal",
        }}
      >
        {manufacturerType
          ? manufacturerType.toLowerCase().includes("oe")
            ? manufacturerType.slice(0, 2)
            : manufacturerType
          : "-"}
      </Box>
    </Box>
  );
};

export default Productmanufacturerbrand;
