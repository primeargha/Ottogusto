import React from "react";
import { Box } from "@/components/ui/box";
import ListViewIcon from "./ListViewIcon";
import GridViewIcon from "./GridViewIcon";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  view: ViewMode;
  onClick: () => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onClick }) => {
  return (
    <Box
      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-radius-small border border-color-border-default bg-color-background-default hover:border-color-border-focus`}
      onClick={onClick}
    >
      {view === "list" ? (
        <GridViewIcon className={`text-color-icon-default`} />
      ) : (
        <ListViewIcon className={`h-6 w-6 text-color-icon-default`} />
      )}
    </Box>
  );
};

export default ViewToggle;
