import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@/components/ui/box";

// ✅ Mock Zustand store
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { create } from "zustand";
import { act } from "react-dom/test-utils";
import FaqSection from "@/screens/landing/faq";
import { BrandingProvider } from "@/contexts/BrandingContext";
import OGStepper from "@/components/og-components/OGStepper";

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
const meta: Meta<typeof FaqSection> = {
  title: "Big Components/LandingPage/FAQ",
  component: FaqSection,
  decorators: [
    (Story) => {
      return (
        <BrandingProvider>
          <Box className="bg-white p-6">
            <Story />
          </Box>
        </BrandingProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof FaqSection>;

export const Default: Story = {
  args: {
    forceVisible: true,
    isSupportPage: true,
    noLeftNavSpace: true,
  },
  render: (args) => {
    // debugger;
    return (
      <BrandingProvider>
        <FaqSection {...args} />
      </BrandingProvider>
    );
  },
};
