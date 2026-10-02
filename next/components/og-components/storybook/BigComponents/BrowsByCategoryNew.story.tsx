import React from "react";
import { Box } from "@/components/ui/box";
import { BrandingProvider } from "@/contexts/BrandingContext";
import BrowseByCategoryNew from "@/screens/landing/browse-by-category-new";
import Provider from "@/providers";

export default {
  title: "Big Components/LandingPage/BrowseByCategory (New)",
  component: BrowseByCategoryNew,
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
      <Provider>
        <BrowseByCategoryNew {...args} />
      </Provider>
    </BrandingProvider>
  );
};

export const Default = Template.bind({});
(Default as any).args = {
  forceVisible: true,
  noLeftNavSpace: true,
};
