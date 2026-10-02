import { Box } from "@/components/ui/box";
import React from "react";

type Props = {
  onMakeSelection: (makeId: any) => void;
  onModelSelection: (makeId: any) => void;
  onEngineSelection: (makeId: any) => void;
};

const ManualSelector = (props: Props) => {
  const { onMakeSelection, onModelSelection, onEngineSelection } = props;

  return (
    <>
      <Box>Make</Box>
      <Box>Model</Box>
      <Box>Engine</Box>
    </>
  );
};

export default ManualSelector;
