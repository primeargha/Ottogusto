import React from "react";
import { Box } from "@/components/ui/box";
import ListViewIcon from "./ListViewIcon";
import MobileViewFilterIcon from "./MobileViewFilterIcon";

export type ViewMode = "grid" | "list";

interface FilterToggleMobileProps {
  view: ViewMode;
  onClick: () => void;
}

const FilterToggleMobile: React.FC<FilterToggleMobileProps> = ({ view, onClick }) => {
  return (
    <Box
      className={`flex w-[40px] max-w-10 cursor-pointer rounded-radius-small bg-color-background-default p-space-xs ${
        view === "list"
          ? "border-2 border-color-border-focus"
          : "border border-color-border-default"
      } hover:border-color-border-focus`}
      onClick={onClick}
    >
      <MobileViewFilterIcon className={`h-6 w-6 text-color-icon-default`} />
    </Box>
  );
};

export default FilterToggleMobile;
