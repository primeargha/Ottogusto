import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@/components/ui/box";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { OGFeatureMakes } from "@/components/og-components/OGFeatureMakes";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/router";

// Mock data for brands
const mockBrands = [
  {
    id: "1",
    brand: "Toyota",
    image: "https://cdn.ottogusto.group/cars/toyota",
  },
  {
    id: "2",
    brand: "BMW",
    image: "https://cdn.ottogusto.group/cars/bmw",
  },
  {
    id: "3",
    brand: "Mercedes",
    image: "https://cdn.ottogusto.group/cars/mercedes",
  },
  {
    id: "4",
    brand: "Audi",
    image: "https://cdn.ottogusto.group/cars/audi",
  },
  {
    id: "5",
    brand: "Volkswagen",
    image: "https://cdn.ottogusto.group/cars/volkswagen",
  },
  {
    id: "6",
    brand: "Ford",
    image: "https://cdn.ottogusto.group/cars/ford",
  },
  {
    id: "7",
    brand: "Honda",
    image: "https://cdn.ottogusto.group/cars/honda",
  },
  {
    id: "8",
    brand: "Nissan",
    image: "https://cdn.ottogusto.group/cars/nissan",
  },
];

// Mock implementation for the service
const mockGetBrandsWithCarImage = async () => ({
  data: mockBrands,
});

// Mock for the Branding context
const mockBranding = {
  getLabel: (key: string) =>
    ({
      show_more: "Show More",
      show_less: "Show Less",
    })[key] || key,
};

// Mock for the stores
const mockStores = {
  useSavedCarsStore: () => ({
    savedCarsData: [],
  }),
  useMmeStore: () => ({
    setSearchData: () => {},
  }),
  useUrlParams: () => ({
    updateFilters: () => {},
  }),
};

const meta: Meta<typeof OGFeatureMakes> = {
  title: "Big Components/LandingPage/FeatureMakes",
  argTypes: {},
  args: {
    items: mockBrands,
  },
  component: OGFeatureMakes,
  decorators: [
    (Story, context) => {
      debugger;
      const router = useRouter();
      return (
        <AppRouterContext.Provider value={router as any}>
          <BrandingProvider>
            <Box className="bg-white p-6">
              <Story {...context} />
            </Box>
          </BrandingProvider>
        </AppRouterContext.Provider>
      );
    },
  ],

  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    msw: {
      handlers: [
        // You can add MSW handlers here if you're using Mock Service Worker
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof OGFeatureMakes>;

export const Default: Story = {
  args: {
    items: mockBrands,
  },
  decorators: [
    (Story, context) => {
      debugger;
      const router = useRouter();
      return (
        <AppRouterContext.Provider value={router as any}>
          <BrandingProvider>
            <Story {...context} />
          </BrandingProvider>
        </AppRouterContext.Provider>
      );
    },
  ],
};
