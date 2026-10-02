import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@/components/ui/box";

// ✅ Mock Zustand store
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { create } from "zustand";
import { act } from "react-dom/test-utils";
import OGStepper from "@/components/og-components/OGStepper";
import { BrandingProvider } from "@/contexts/BrandingContext";

// 🧪 Set mock state
const mockState = {
  currentStep: 2,
  isOgSearch: false,
  ebMode: "edit",
  isEB: true,
  searchData: {
    make: { value: "Toyota" },
    model: { value: "Camry" },
    year: { value: "2022" },
    type: { value: "Sedan" },
  },
  carByVinResults: [],
  setStep: (step: number) => console.log("Set step:", step),
};

// 🧪 Mock Zustand (replace real store hook)
// jest.mock("@/stores/useSearchModalStore", () => ({
//   useSearchModalStore: jest.fn(() => mockState),
// }));

// 🧪 Mock Branding context value
const brandingMock = {
  getLabel: (key: string) => key.charAt(0).toUpperCase() + key.slice(1), // Capitalize keys
};

// ✅ Storybook default export
const meta: Meta<typeof OGStepper> = {
  title: "OGStepper",
  component: OGStepper,
  decorators: [
    (Story) => (
      // <BrandingProvider>
      <Box className="bg-white p-6">
        <Story />
      </Box>
      // </BrandingProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OGStepper>;

export const Default: Story = {
  render: () => (
    <BrandingProvider>
      <OGStepper />
    </BrandingProvider>
  ),
};
