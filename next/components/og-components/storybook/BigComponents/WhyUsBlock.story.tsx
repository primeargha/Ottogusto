import React from "react";
import { WhyUsBlock } from "@/screens/landing/why-us";
import { Box } from "@/components/ui/box";
import { WhyUsBlockPropType } from "@/screens/landing/why-us";

export default {
  title: "Big Components/LandingPage/WhyUsBlock",
  component: WhyUsBlock,
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: "text" },
    bg: { control: "color" },
  },
};

const Template = (args: WhyUsBlockPropType & { bg?: string }) => (
  //@ts-ignore
  <Box style={{ backgroundColor: args.bg, padding: 32, minHeight: 300, width: 300 }}>
    <WhyUsBlock {...args} />
  </Box>
);

export const Default = Template.bind({});
(Default as any).args = {
  title: "Why choose us?",
  description: "We offer the best service and quality in the industry.",
  icon: "/assets/why-us/road.svg",
  bg: "#07431a",
};
