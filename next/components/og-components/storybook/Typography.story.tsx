import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import Typography from "@/components/og-components/Typography";

const meta = {
  component: Typography,
  title: "Typography",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A Typography component that render h1, h2, .... tags and text within",
      },
    },
  },
  argTypes: {},
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: "Heading 1",
    type: "h1",
    className: "h1",
  },
};

// Type variants
export const Heading1: Story = {
  args: {
    children: "Heading 1",
    type: "h1",
  },
};

export const Heading2: Story = {
  args: {
    children: "Heading 2",
    type: "h2",
  },
};

export const Heading3: Story = {
  args: {
    children: "Heading 3",
    type: "h3",
  },
};
export const Heading4: Story = {
  args: {
    children: "Heading 4",
    type: "h4",
  },
};
