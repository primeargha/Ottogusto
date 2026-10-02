import React from "react";
import WhyUs_BrandValues, { WhyUsBlock } from "@/screens/landing/why-us";
import { Box } from "@/components/ui/box";
import { BrandingProvider } from "@/contexts/BrandingContext";
import KeyFeaturesSection from "@/screens/landing/key-features";

export default {
  title: "Big Components/LandingPage/KeyFeatures",
  component: KeyFeaturesSection,
  argTypes: {
    forceVisible: { control: "boolean" },
    // noLeftNavSpace: { control: "boolean" },
    // containerClassName: { control: "text" },
    // bg: { control: "color" }
  },
};

const Template = (args: any) => {
  // return <Box>Testing...</Box>;
  return (
    <BrandingProvider>
      <KeyFeaturesSection {...args} />
    </BrandingProvider>
  );
};

export const Default = Template.bind({});
(Default as any).args = {
  forceVisible: true,
  noLeftNavSpace: true,
};
