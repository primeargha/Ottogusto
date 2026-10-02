import React from "react";
import { Box } from "@/components/ui/box";
import Image from "next/image";
import minusIcon from "@/assets/Ottogusto/minusSign.svg";
import addIcon from "@/assets/Ottogusto/add.svg";

interface OGIncrementDecrementProps {
  quantity: number;
  onIncrement: (e: any) => void;
  onDecrement: (e: any) => void;
  className?: string;
  isIncrementDisabled?: boolean;
}

export const OGIncrementDecrement = ({
  quantity,
  onIncrement,
  onDecrement,
  className,
  isIncrementDisabled = false,
}: OGIncrementDecrementProps) => {
  return (
    <Box
      className={`flex w-full flex-row items-center justify-between gap-[6px] rounded-md border border-color-border-emphasis p-3 ${className}`}
      onClick={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Box
        className="flex max-w-5 cursor-pointer items-center justify-center"
        onClick={onDecrement}
      >
        <Image src={minusIcon} alt="Decrease quantity" className="opacity-70" />
      </Box>
      <Box className="w-[2px] bg-color-background-default base:min-h-[22px]" />
      <Box className="flex w-full items-center justify-center text-color-text-emphasis typography-body-strong-02">
        {quantity}
      </Box>
      <Box className="w-[2px] bg-color-background-default base:min-h-[22px]" />
      <Box
        className={`flex max-w-5 items-center justify-center ${
          isIncrementDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
        onClick={(e: any) => {
          if (isIncrementDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onIncrement(e);
        }}
      >
        <Image src={addIcon} alt="Increase quantity" className="opacity-70" />
      </Box>
    </Box>
  );
};
