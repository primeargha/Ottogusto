import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OGButton } from "@/components/og-components/OGButton";
import { fn } from "storybook/test";

const meta = {
  component: OGButton,
  title: "OGButton",
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
    type: {
      control: { type: "select" },
      options: ["primary", "outlined", "secondary", "error"],
      description: "The visual style variant of the button",
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large"],
      description: "The size of the button",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Whether the button is disabled",
    },
    isDanger: {
      control: { type: "boolean" },
      description: "Whether the button should use danger styling",
    },
    isLoading: {
      control: { type: "boolean" },
      description: "Whether the button shows a loading spinner",
    },
    onlyIcon: {
      control: { type: "boolean" },
      description: "Whether the button only shows icons (no text)",
    },
    onClick: {
      action: "clicked",
      description: "Click handler for the button",
    },
  },
} satisfies Meta<typeof OGButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: "Primary Button",
    type: "primary",
    size: "medium",
    disabled: false,
    isDanger: false,
    isLoading: false,
    onlyIcon: false,
  },
};

// Type variants
export const Primary: Story = {
  args: {
    children: "Primary Button",
    type: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    type: "secondary",
  },
};

export const Outlined: Story = {
  args: {
    children: "Outlined Button",
    type: "outlined",
  },
};

export const Error: Story = {
  args: {
    children: "Error Button",
    type: "error",
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

// Danger variants
export const DangerPrimary: Story = {
  args: {
    children: "Danger Primary",
    type: "primary",
    isDanger: true,
  },
};

export const DangerOutlined: Story = {
  args: {
    children: "Danger Outlined",
    type: "outlined",
    isDanger: true,
  },
};

// Icon variants
export const WithLeftIcon: Story = {
  args: {
    children: "Button with Left Icon",
    leftcomp: <span>←</span>,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "Button with Right Icon",
    rightcomp: <span>→</span>,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: "Button with Both Icons",
    leftcomp: <span>←</span>,
    rightcomp: <span>→</span>,
  },
};

export const IconOnly: Story = {
  args: {
    children: "",
    onlyIcon: true,
    leftcomp: <span>⚙️</span>,
  },
};

// Interactive examples
export const Interactive: Story = {
  args: {
    children: "Click me!",
    type: "primary",
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
  args: {
    children: "Showcase",
    type: "primary",
  },
  render: (args) => (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-2">
        <OGButton type="primary">Primary</OGButton>
        <OGButton type="secondary">Secondary</OGButton>
        <OGButton type="outlined">Outlined</OGButton>
        <OGButton type="error">Error</OGButton>
      </div>
      <div className="flex-wrap gap-2">
        <OGButton size="small">Small</OGButton>
        <OGButton size="medium">Medium</OGButton>
        <OGButton size="large">Large</OGButton>
      </div>
      <div className="flex flex-wrap gap-2">
        <OGButton disabled>Disabled</OGButton>
        <OGButton isLoading>Loading</OGButton>
        <OGButton isDanger type="primary">
          Danger
        </OGButton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "A showcase of all button variants in one view.",
      },
    },
  },
};
