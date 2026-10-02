import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OGCheckbox } from "@/components/og-components/OGCheckbox";
import { fn } from "storybook/internal/test";
const meta = {
  component: OGCheckbox,
  title: "Controls / Checkbox",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile checkbox selector with partial check support input component with customizable styling.",
      },
    },
  },
  args: {
    className: "",
    disabled: false,
    defaultIsChecked: true,
    label: "A Default checkbox",
    selected: true,
    partial: true,
  },
  argTypes: {
    className: {
      control: "text",
      description: "CSS - Tailwind classes",
      // if
    },
  },
} satisfies Meta<typeof OGCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    onChange: fn,
    className: "",
    defaultIsChecked: true,
    disabled: false,
    label: "Default checkbox",
    labelClass: "h5",
    selected: true,
    partial: true,
    type: "primary",
  },
};
