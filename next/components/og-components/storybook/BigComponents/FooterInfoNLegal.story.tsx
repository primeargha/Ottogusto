import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@/components/ui/box";

// ✅ Mock Zustand store
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { create } from "zustand";
import { act } from "react-dom/test-utils";
import { BrandingProvider } from "@/contexts/BrandingContext";
import OGStepper from "@/components/og-components/OGStepper";
import InfoNLegalSection from "@/screens/landing/footer/InfoNLegalSection";
import Provider from "@/providers";

// 🧪 Mock Branding context value
const brandingMock = {
  getLabel: (key: string) => key.charAt(0).toUpperCase() + key.slice(1), // Capitalize keys
};

// ✅ Storybook default export
const meta: Meta<typeof InfoNLegalSection> = {
  title: "Big Components/LandingPage/Footer/InfoNLegalSection",
  component: InfoNLegalSection,
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

type Story = StoryObj<typeof InfoNLegalSection>;

export const Default: Story = {
  args: {},
  render: (args) => {
    return (
      <BrandingProvider>
        <Provider>
          <InfoNLegalSection {...args} />
        </Provider>
      </BrandingProvider>
    );
  },
};
