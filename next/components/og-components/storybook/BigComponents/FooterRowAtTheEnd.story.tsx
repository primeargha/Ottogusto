import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@/components/ui/box";

// ✅ Mock Zustand store
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { create } from "zustand";
import { act } from "react-dom/test-utils";
import { BrandingProvider } from "@/contexts/BrandingContext";
import OGStepper from "@/components/og-components/OGStepper";
import { FooterRowAtTheEnd } from "@/screens/landing/footer";
import Provider from "@/providers";

// 🧪 Mock Branding context value
const brandingMock = {
  getLabel: (key: string) => key.charAt(0).toUpperCase() + key.slice(1), // Capitalize keys
};

// ✅ Storybook default export
const meta: Meta<typeof FooterRowAtTheEnd> = {
  title: "Big Components/LandingPage/Footer/RowAtTheEnd",
  component: FooterRowAtTheEnd,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <BrandingProvider>
          <Box className="bg-color-primary-main p-6">
            <Story />
          </Box>
        </BrandingProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof FooterRowAtTheEnd>;

export const Default: Story = {
  args: {
    bottomNavPadding: true,
    getLabel: (key: string) => key.charAt(0).toUpperCase() + key.slice(1),
    isIpad: false,
    noLeftNavSpace: false,
  },
  render: (args) => {
    // debugger;
    return (
      <BrandingProvider>
        <Provider>
          <FooterRowAtTheEnd {...args} />
        </Provider>
      </BrandingProvider>
    );
  },
};
