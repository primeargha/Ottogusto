import { useState } from "react";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import alert from "@/assets/search/alert.svg";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import SearchItem from "./search-item";
import { type NativeSyntheticEvent, NativeScrollEvent } from "react-native";

interface SearchItemsContainerProps {
  items: { key: string; value: string }[];
  onItemClick: (item: { key: string; value: string }) => void;
}

const SearchItemsContainer = ({ items, onItemClick }: SearchItemsContainerProps) => {
  const { isSearching } = useSearchModalStore();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };

  return (
    <Box className="relative base:mt-0 base:h-auto gtsm:mt-4 gtsm:h-full gtsm:max-h-[400px] gtlg:mt-0">
      {/* Bottom fade always present */}
      {items.length > 1 && (
        <Box className="via-[--background-beige-600]/30 via-[--background-beige-600]/60 pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[--background-beige-600] to-transparent" />
      )}
      {/* Add onScroll handler to the scrollable container */}
      <Box className="custom-scrollbar h-full overflow-y-auto px-[60px]" onScroll={handleScroll}>
        <Box className="mb-2 flex flex-col items-center gap-[14px]">
          {/* TODO: If no items, show a message */}
          {(!items?.length || items?.length === 0) && !isSearching && (
            <Box className="flex w-full flex-row justify-center gap-2">
              <Image src={alert} height={16} width={16} alt="alert" />
              <Text className="font-Overpass text-[16px] font-[400] leading-[18px] text-color-system-error-main">
                We couldn&apos;t find that data in our system.
              </Text>
            </Box>
          )}
          {items?.map((item, index) => (
            <SearchItem
              key={`${item.key}-${index}-${item.value}`}
              id={item.key}
              label={item.value}
              onClick={() => onItemClick(item)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SearchItemsContainer;
