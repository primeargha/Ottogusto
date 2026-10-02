import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@/components/ui/box";

// ✅ Mock Zustand store
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { create } from "zustand";
import { act } from "react-dom/test-utils";
import { BrandingProvider } from "@/contexts/BrandingContext";
import OGStepper from "@/components/og-components/OGStepper";
import Provider from "@/providers";
import OGClaimtab from "@/components/og-components/OGClaimTab";
import Typography from "@/components/og-components/Typography";

// 🧪 Mock Branding context value
const brandingMock = {
  getLabel: (key: string) => key.charAt(0).toUpperCase() + key.slice(1), // Capitalize keys
};

// ✅ Storybook default export
const meta: Meta<typeof OGClaimtab> = {
  title: "OGClaimtab",
  component: OGClaimtab,
  tags: ["autodocs"],
  argTypes: {
    itemsCount: {
      control: { type: "select" },
      options: [1, 2, 3, 4],
      description: "The visual style variant of the button",
    },
  },

  decorators: [
    (Story) => {
      return (
        <Box className="bg-white p-6">
          <BrandingProvider>
            <Provider>
              <Box className="flex w-full bg-color-border-default base:p-0 gtsm:py-8 gtlg:p-0 gtlg:pt-[104px]">
                <Box
                  className={`h-full w-full flex-col base:mt-[64px] base:gap-0 gtsm:mt-[52px] gtsm:gap-6 gtsm:py-10 md:flex gtlg:mt-[64px] gtlg:gap-6 gtlg:py-10`}
                >
                  <Box
                    className={`min-h-20"} max-h-[80px] w-full items-center justify-center rounded-md border border-color-border-emphasis gtlg:flex`}
                  >
                    <Story />
                  </Box>
                </Box>
              </Box>
            </Provider>
          </BrandingProvider>
        </Box>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof OGClaimtab>;

export const Default: Story = {
  args: {
    // forceVisible: true,
    // isSupportPage: true,
    // noLeftNavSpace: true,
  },
  render: (args) => {
    // debugger;
    return <OGClaimtab {...args} />;
  },
};
