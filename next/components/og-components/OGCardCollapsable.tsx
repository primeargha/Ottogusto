import { Box } from "@/components/ui/box";
import React, { ReactNode, useState } from "react";
import { Icon } from "../ui/icon";
import { MinusIcon, PlusIcon } from "lucide-react-native";

type Props = {
  cardTitle: string;
  children?: ReactNode;
  rightcomp?: ReactNode;
  collapsable: Boolean;
  expanded: Boolean;
  onExpand?: () => void;
};

/**
 * Will create a collapsable card with button on top-right
 * @param props
 * @returns
 */
const OGCardCollapsable = (props: Props) => {
  const { children, cardTitle, rightcomp, collapsable = true, onExpand } = props;
  const [Expanded, setExpanded] = useState(true);
  return (
    <Box
      className={`my-[6px] rounded border-[1px] border-color-background-l8 bg-color-background-none px-[24px] py-[20px] drop-shadow-[0_8px_40px_rgba(0,0,0,0.12)]`}
    >
      <Box className="hover:bg-color-hover-action-primary/30 w-full justify-center text-color-background-brand body-bold-lg">
        {cardTitle}
        {rightcomp && (
          <Box
            onClick={() => {
              setExpanded(!Expanded);
              if (onExpand) {
                onExpand();
              }
            }}
            className="md:absolute md:right-0"
          >
            {rightcomp}
          </Box>
        )}

        {collapsable && (
          <Box className="md:absolute md:right-0">
            {Expanded ? (
              <Icon as={MinusIcon} className="h-6 w-6" />
            ) : (
              <Icon as={PlusIcon} className="h-6 w-6" />
            )}
          </Box>
        )}
      </Box>
      {Expanded && <Box className="pt-5">{children}</Box>}
    </Box>
  );
};

export default OGCardCollapsable;
