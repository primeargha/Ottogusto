import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OGButton2, type ButtonProps } from "@/components/og-components/OGButton2";
import React from "react";

// Using simple text icons to avoid external dependency
const Home = () => <span>🏠</span>;
const Plus = () => <span>+</span>;
const Settings = () => <span>⚙️</span>;

type Story = StoryObj<typeof OGButton2>;

const meta: Meta<typeof OGButton2> = {
  component: OGButton2,
  title: "OGButton2",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A versatile button component with multiple variants, sizes, and states.",
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "outline", "danger", "danger-outline"],
      description: "The visual style variant of the button",
      table: {
        defaultValue: { summary: "primary" },
      },
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large"],
      description: "The size of the button",
      table: {
        defaultValue: { summary: "medium" },
      },
    },
    rounded: {
      control: { type: "select" },
      options: ["none", "sm", "md", "lg", "full"],
      description: "The border radius of the button",
      table: {
        defaultValue: { summary: "md" },
      },
    },
    disabled: {
      control: { type: "boolean" },
      description: "Whether the button is disabled",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    isLoading: {
      control: { type: "boolean" },
      description: "Whether the button shows a loading state",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    onPress: {
      action: "clicked",
      description: "Click handler for the button",
      table: { disable: true },
    },
    leftcomp: {
      control: { type: "text" },
      table: { disable: true },
    },
    rightcomp: {
      control: { type: "text" },
      table: { disable: true },
    },
    style: {
      control: { type: "text" },
      table: { disable: true },
    },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "medium",
    rounded: "md",
    disabled: false,
    isLoading: false,
  },
};

export default meta;

// Default story
export const Default: Story = {
  args: {
    children: "Primary Button",
    variant: "primary",
    size: "medium",
    disabled: false,
    isLoading: false,
  },
};

// Variant stories
export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline Button",
    variant: "outline",
  },
};

export const Danger: Story = {
  args: {
    children: "Danger Button",
    variant: "danger",
  },
};

export const DangerOutline: Story = {
  args: {
    children: "Danger Outline",
    variant: "danger-outline",
  },
};

// Size variants
export const Small: Story = {
  args: {
    children: "Small Button",
    size: "small",
  },
};

export const Medium: Story = {
  args: {
    children: "Medium Button",
    size: "medium",
  },
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "large",
  },
};

// State variants
export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: "Loading Button",
    isLoading: true,
  },
};

// Icon variants
export const WithLeftIcon: Story = {
  args: {
    children: "With Left Icon",
    leftcomp: <Home />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "With Right Icon",
    rightcomp: <Plus />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: "With Both Icons",
    leftcomp: <Settings />,
    rightcomp: <Plus />,
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    children: "Click me!",
    variant: "primary",
  },
  parameters: {
    docs: {
      description: {
        story: "This button has a click handler that logs to the Actions panel.",
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h3 className="mb-2 text-lg font-medium">Variants</h3>
        <div className="flex flex-wrap gap-2">
          <OGButton2 variant="primary">Primary</OGButton2>
          <OGButton2 variant="outline">Outline</OGButton2>
          <OGButton2 variant="danger">Danger</OGButton2>
          <OGButton2 variant="danger-outline">Danger Outline</OGButton2>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-medium">Sizes</h3>
        <div className="flex items-center gap-2">
          <OGButton2 size="small">Small</OGButton2>
          <OGButton2 size="medium">Medium</OGButton2>
          <OGButton2 size="large">Large</OGButton2>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-medium">States</h3>
        <div className="flex flex-wrap gap-2">
          <OGButton2 disabled>Disabled</OGButton2>
          <OGButton2 isLoading>Loading</OGButton2>
          <OGButton2 leftcomp={<Plus />}>With Icon</OGButton2>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "A showcase of all button variants, sizes, and states in one view.",
      },
    },
  },
};
