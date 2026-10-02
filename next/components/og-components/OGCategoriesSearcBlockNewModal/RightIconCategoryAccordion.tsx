import { ChevronDownIcon, ChevronUpIcon, Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import React, { forwardRef, useImperativeHandle, useState } from "react";

type Props = {};

const RightIconCategoryAccordion = forwardRef(
  (
    props: {
      defaultExpanded: boolean;
      onPress: () => void;
    },
    ref,
  ) => {
    const { defaultExpanded, onPress } = props;
    const [Expanded, setExpanded] = useState(defaultExpanded);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      toggleExpanded: () => setExpanded((prev) => !prev),
      setExpandedState: (state: boolean) => setExpanded(state),
    }));

    return (
      <Pressable
        onPress={() => {
          setExpanded(!Expanded);
          onPress();
        }}
      >
        {!Expanded ? (
          <Icon as={ChevronDownIcon} className="ml-2" />
        ) : (
          <Icon as={ChevronUpIcon} className="ml-2" />
        )}
      </Pressable>
    );
  },
);

export default RightIconCategoryAccordion;
