"use client";
import { OGButton } from "@/components/og-components/OGButton";
import { OGButton2 } from "@/components/og-components/OGButton2";
import { Box } from "@/components/ui/box";
import { Home } from "lucide-react-native";
import { useState } from "react";
import { useNetworkState } from "react-use";

export default function Page() {
  const [value, setValue] = useState<unknown>(null);
  const networkState = useNetworkState();
  const handleChange = (val: unknown) => {
    setValue(val);
    debugger;
  };
  return (
    <div className="min-h-screen space-y-8 p-8 pt-28">
      <Box className="fbody-bold-lg text-typography-black">Test your components here</Box>

      <OGButton>Hello</OGButton>
      <OGButton2>Hello</OGButton2>
      <Box className="color-button-primary-bg-default">Test</Box>
      <Box>
        <OGButton2
          variant="primary"
          onPress={() => handleChange("Submitting...")}
          isLoading={false}
        >
          Submitting....
        </OGButton2>{" "}
        <OGButton2 variant="danger" size="small" leftcomp={<Home size={16} />} isLoading={false}>
          Loading
        </OGButton2>
      </Box>
    </div>
  );
}
