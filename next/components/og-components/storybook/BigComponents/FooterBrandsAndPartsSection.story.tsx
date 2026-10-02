import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@/components/ui/box";

// ✅ Mock Zustand store
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { create } from "zustand";
import { act } from "react-dom/test-utils";
import { BrandingProvider } from "@/contexts/BrandingContext";
import OGStepper from "@/components/og-components/OGStepper";
import BrandsAndPartsSection from "@/screens/landing/footer/BrandsAndPartsSection";
import Provider from "@/providers";

// 🧪 Mock Branding context value
const brandingMock = {
  getLabel: (key: string) => key.charAt(0).toUpperCase() + key.slice(1), // Capitalize keys
};

// ✅ Storybook default export
const meta: Meta<typeof BrandsAndPartsSection> = {
  title: "Big Components/LandingPage/Footer/BrandsAndPartsSection",
  component: BrandsAndPartsSection,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <BrandingProvider>
          <Box className="bg-slate-800 p-6">
            <h2 className="text-sm text-blue-800">Info & Legal Section</h2>
            <Story />
          </Box>
        </BrandingProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof BrandsAndPartsSection>;

export const Default: Story = {
  args: {
    // forceVisible: true,
    // isSupportPage: true,
    // noLeftNavSpace: true,
  },
  render: (args) => {
    // debugger;
    return (
      <Box className="bg-color-primary-main p-6">
        <BrandingProvider>
          <Provider>
            <BrandsAndPartsSection {...args} />
          </Provider>
        </BrandingProvider>
      </Box>
    );
  },
};
