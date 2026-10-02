import { Box } from "@/components/ui/box";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

type Props = {
  onVinChange?: (vin: any) => void;
};

const VinSelector = (props: Props) => {
  const { onVinChange } = props;

  const [VINValue, setVINValue] = useState("");
  const handleChange = (val: any) => {
    setVINValue(val);
    if (onVinChange) {
      onVinChange(val);
    }
  };

  return (
    <Box>
      {/* @ts-ignore */}
      <Input onChange={onVinChange} value={VINValue} label="Vin search" />
    </Box>
  );
};

export default VinSelector;
