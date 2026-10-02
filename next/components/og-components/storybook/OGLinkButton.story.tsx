import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OGLinkButton } from "@/components/og-components/OGLinkButton";
import { Box } from "@/components/ui/box";

// Mock icons or components for leftComp/rightComp
const MockIcon = () => <Box className="h-4 w-4 rounded-full bg-gray-400" />;

const meta: Meta<typeof OGLinkButton> = {
  title: "OGLinkButton",
  component: OGLinkButton,
  argTypes: {
    type: {
      control: "radio",
      options: ["primary", "secondary"],
    },
    size: {
      control: "radio",
      options: ["small", "medium", "large"],
    },
    disabled: {
      control: "boolean",
    },
    isDanger: {
      control: "boolean",
    },
    icon: {
      control: "radio",
      options: ["none", "left", "right"],
    },
    onClick: { action: "clicked" },
  },
  args: {
    children: "Link Button",
    type: "primary",
    size: "medium",
    disabled: false,
    isDanger: false,
    icon: "none",
  },
};

export default meta;

type Story = StoryObj<typeof OGLinkButton>;

export const Default: Story = {
  render: (args) => {
    const leftcomp = args.icon === "left" ? <MockIcon /> : null;
    const rightComp = args.icon === "right" ? <MockIcon /> : null;

    return (
      <OGLinkButton {...args} leftcomp={leftcomp} rightcomp={rightComp}>
        {args.children}
      </OGLinkButton>
    );
  },
};

export const Variants: Story = {
  render: () => (
    <Box className="flex flex-col gap-4">
      <OGLinkButton type="primary">Primary</OGLinkButton>
      <OGLinkButton type="secondary">Secondary</OGLinkButton>
      <OGLinkButton isDanger>Danger (Primary)</OGLinkButton>
      <OGLinkButton type="secondary" isDanger>
        Danger (Secondary)
      </OGLinkButton>
    </Box>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Box className="flex flex-col gap-4">
      <OGLinkButton size="small">Small</OGLinkButton>
      <OGLinkButton size="medium">Medium</OGLinkButton>
      <OGLinkButton size="large">Large</OGLinkButton>
    </Box>
  ),
};

export const DisabledStates: Story = {
  render: () => (
    <Box className="flex flex-col gap-4">
      <OGLinkButton disabled>Disabled Primary</OGLinkButton>
      <OGLinkButton type="secondary" disabled>
        Disabled Secondary
      </OGLinkButton>
      <OGLinkButton isDanger disabled>
        Disabled Danger
      </OGLinkButton>
    </Box>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Box className="flex flex-col gap-4">
      <OGLinkButton leftcomp={<MockIcon />}>Left Icon</OGLinkButton>
      <OGLinkButton rightcomp={<MockIcon />}>Right Icon</OGLinkButton>
      <OGLinkButton leftcomp={<MockIcon />} rightcomp={<MockIcon />}>
        Both Icons
      </OGLinkButton>
    </Box>
  ),
};
