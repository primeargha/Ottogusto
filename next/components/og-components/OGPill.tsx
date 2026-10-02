import React, { useState } from "react";
import { Box } from "../ui/box";
import { Text } from "../ui/text";
import Image from "next/image";
import { categoryIcons } from "@/constants";
import { Pressable } from "../ui/pressable";

type OGPillPropType = {
  label: string;
  onRemove?: (e: any) => void;
  onShowMore?: (e: any) => void;
};

const OGPill = (props: OGPillPropType) => {
  const { label, onRemove, onShowMore } = props;
  const [ShowMore, setShowMore] = useState(false);
  if (onRemove) {
    return (
      <Box className="flex flex-row items-center justify-center overflow-hidden rounded-[6px] border border-color-border-emphasis bg-color-background-emphasis px-3 py-[9px]">
        <Text
          // title={label}
          className="line-clamp-1 inline-block overflow-hidden text-ellipsis whitespace-nowrap text-color-text-body body-regular-sm"
        >
          {label}
        </Text>

        <Pressable
          //@ts-ignore
          onPress={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            if (onRemove) {
              onRemove(e);
            }
          }}
        >
          {/* replace with 'category.icon' when its available in the src */}
          <Image
            src={categoryIcons.tag_close as string}
            width={24}
            height={24}
            alt="Remove Filter"
            className="float-right ml-[12px] cursor-pointer"
          />
        </Pressable>
      </Box>
    );
  }

  return (
    <Box className="flex flex-row items-center justify-center rounded-[6px] border border-color-border-emphasis bg-color-background-emphasis px-3 py-[9px]">
      <Pressable
        //@ts-ignore
        onPress={(e: React.MouseEvent) => {
          setShowMore(true);
          if (onShowMore) {
            onShowMore(e);
          }
        }}
      >
        <Text
          // title={label}
          className="line-clamp-1 inline-block overflow-hidden text-ellipsis text-nowrap text-color-text-body body-regular-sm"
        >
          {label}
        </Text>
      </Pressable>
    </Box>
  );
};

export default OGPill;
