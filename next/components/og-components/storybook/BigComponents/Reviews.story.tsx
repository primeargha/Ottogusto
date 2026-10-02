import React from "react";
import WhyUs_BrandValues, { WhyUsBlock } from "@/screens/landing/why-us";
import { Box } from "@/components/ui/box";
import { BrandingProvider } from "@/contexts/BrandingContext";
import Reviews from "@/screens/landing/reviews";

export default {
  title: "Big Components/LandingPage/Reviews",
  component: Reviews,
  argTypes: {
    forceVisible: { control: "boolean" },
    noLeftNavSpace: { control: "boolean" },
    containerClassName: { control: "text" },
    bg: { control: "color" },
  },
};

const Template = (args: any) => {
  // return <Box>Testing...</Box>;
  return (
    <BrandingProvider>
      <Reviews {...args} />
    </BrandingProvider>
  );
};

export const Default = Template.bind({});
(Default as any).args = {
  forceVisible: true,
  noLeftNavSpace: true,
};
