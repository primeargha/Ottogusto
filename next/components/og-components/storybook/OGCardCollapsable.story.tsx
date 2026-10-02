import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button"; // Optional rightComp
import OGCardCollapsable from "@/components/og-components/OGCardCollapsable";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Icon } from "@/components/ui/icon";
import { CircleAlertIcon, PlusCircleIcon } from "lucide-react-native";
import Typography from "@/components/og-components/Typography";

const meta: Meta<typeof OGCardCollapsable> = {
  title: "OGCardCollapsable",
  component: OGCardCollapsable,
  decorators: [
    (Story) => {
      // debugger;
      return (
        <ThemeProvider>
          <Box className="bg-tertiary-950">
            <Story />
          </Box>
        </ThemeProvider>
      );
    },
  ],
  args: {
    cardTitle: "Card Title",
    collapsable: true,
    expanded: true,
  },
  argTypes: {
    cardTitle: { control: "text" },
    collapsable: { control: "boolean" },
    expanded: {
      control: {
        type: "boolean",
      },
      description: "Initial expanded state (currently not reactive to prop)",
    },
    rightcomp: {
      control: <Icon as={PlusCircleIcon} />,
      description: "Pass a ReactNode to appear on top right (e.g., button)",
    },
  },
};

export default meta;

type Story = StoryObj<typeof OGCardCollapsable>;

export const Default: Story = {
  args: {
    collapsable: false,
    rightcomp: <Typography type="h1">-</Typography>, //<Icon as={CircleAlertIcon} />
  },
  argTypes: {},
  render: (args) => {
    debugger;
    return (
      <OGCardCollapsable {...args}>
        <Box className="text-sm text-gray-700">
          This is the body content of the collapsable card. You can place any React elements here.
        </Box>
      </OGCardCollapsable>
    );
  },
};

export const WithRightComponent: Story = {
  args: {
    rightcomp: <Button variant="solid">Action</Button>,
  },
  render: (args) => (
    <OGCardCollapsable {...args}>
      <Box className="text-sm text-gray-700">
        The card includes a button on the top-right corner.
      </Box>
    </OGCardCollapsable>
  ),
};

export const NotCollapsable: Story = {
  args: {
    collapsable: false,
  },
  render: (args) => {
    // debugger;
    return (
      <OGCardCollapsable {...args}>
        <Box className="text-sm text-gray-700">This card is not collapsable.</Box>
      </OGCardCollapsable>
    );
  },
};
