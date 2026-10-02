"use client";
import React, { useState } from "react";
import { Box } from "../ui/box";

type Props = {
  label: string | React.ReactNode;
  isOn?: boolean;
  value?: any;
  isDisabled: boolean;
  onChange: (value: any) => any;
};

const OGToggleSwitch = (props: Props) => {
  const { isDisabled, label, onChange, value, isOn = false } = props;
  const [IsOn, setIsOn] = useState(isOn);
  const handleToggle = (_e: React.MouseEvent) => {
    if (isDisabled) return;
    const newValue = !IsOn;
    setIsOn(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };
  const bgClass = IsOn ? "bg-green-500" : "bg-color-neutral-main";
  const knobClass = IsOn ? "translate-x-[20px]" : "translate-x-0";
  const opacityClass = isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  return (
    <>
      <Box className={`flex flex-row items-center gap-2 ${opacityClass}`} onClick={handleToggle}>
        <Box
          className={`h-[24px] w-[44px] rounded-full p-[2px] transition-colors duration-200 ${bgClass}`}
        >
          <Box
            className={`h-[20px] w-[20px] rounded-full bg-white shadow transition-transform duration-200 ${knobClass}`}
          ></Box>
        </Box>
        {label && <span className="select-none">{label}</span>}
      </Box>
    </>
  );
};

export default OGToggleSwitch;
