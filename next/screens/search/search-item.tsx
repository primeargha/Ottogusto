"use client";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useSearchModalStore } from "@/stores/useSearchModalStore";

interface SearchItemProps {
  id: string;
  label: string;
  onClick: () => void;
}

const SearchItem = ({ id, label, onClick }: SearchItemProps) => {
  const { searchData, currentStep } = useSearchModalStore();

  const isActive = () => {
    switch (currentStep) {
      case 1:
        return id.toString() === searchData.make?.key;
      case 2:
        return id.toString() === searchData.model?.key;
      case 3:
        // year doesnot have iD so we need to check the value
        return Number(label) === Number(searchData.year?.value);
      case 4:
        return id.toString() === searchData.type?.key;
      default:
        return false;
    }
  };
  return (
    <Button
      onPress={onClick}
      className={`group h-auto w-full rounded-[4px] border border-[--Primary-Colors-Main] bg-color-background-l2 p-[12px] text-center font-Overpass text-base font-normal gtlg:hover:bg-[--secondary-colors-secondary-hover] gtlg:focus:bg-[--secondary-colors-secondary-hover] gtlg:active:bg-[--secondary-colors-secondary-hover] ${isActive() ? "bg-[--Primary-Colors-Main] text-[--Text-White]" : "bg-color-background-l2"}`}
    >
      <Text
        className={`${isActive() ? "text-[--Text-White]" : "text-[--Primary-Colors-Main]"} font-Overpass text-[20px] base:group-hover:bg-transparent gtlg:group-hover:bg-[--secondary-colors-secondary-hover] gtlg:group-hover:text-[--Primary-Colors-Main] gtlg:group-focus:bg-[--secondary-colors-secondary-hover] gtlg:group-active:bg-[--secondary-colors-secondary-hover]`}
      >
        {label}
      </Text>
    </Button>
  );
};

export default SearchItem;
