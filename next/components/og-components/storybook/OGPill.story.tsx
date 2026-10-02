import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useState } from "react";
import OGPill from "@/components/og-components/OGPill";
import { OGButton } from "@/components/og-components/OGButton";

const meta = {
  component: OGPill,
  title: "OGPill",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A pill component for tags/filters, supporting removable and show-more variants.",
      },
    },
  },
  argTypes: {
    label: {
      control: { type: "text" },
      description: "The label text displayed inside the pill",
    },
    onRemove: {
      action: "removed",
      description: "Callback when the remove icon is clicked",
    },
    onShowMore: {
      action: "showMore",
      description: "Callback when the pill is pressed (show more)",
    },
  },
} satisfies Meta<typeof OGPill>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story (show-more variant)
export const Default: Story = {
  args: {
    label: "Default Pill",
  },
};

// Removable pill
export const Removable: Story = {
  args: {
    label: "Removable Pill",
    onRemove: () => {},
  },
};

// Show more pill
export const ShowMore: Story = {
  args: {
    label: "Show More Pill",
    onShowMore: () => {},
  },
};

// Interactive removable pill
const InteractiveRemovablePill = () => {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col items-center gap-4">
      {visible ? (
        <OGPill label="Removable Pill" onRemove={() => setVisible(false)} />
      ) : (
        <OGButton type="primary" onClick={() => setVisible(true)}>
          Restore Pill
        </OGButton>
      )}
    </div>
  );
};

export const InteractiveRemovable: Story = {
  args: {
    label: "Removable Pill",
  },
  render: () => <InteractiveRemovablePill />,
  parameters: {
    docs: {
      description: {
        story: "A pill that can be removed and restored interactively.",
      },
    },
  },
};

// Interactive show more pill
const InteractiveShowMorePill = () => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <OGPill
        label={show ? "Show More Clicked!" : "Show More Pill"}
        onShowMore={() => setShow(true)}
      />
      {show && (
        <OGButton type="secondary" onClick={() => setShow(false)}>
          Reset
        </OGButton>
      )}
    </div>
  );
};

export const InteractiveShowMore: Story = {
  args: {
    label: "Show More Pill",
  },
  render: () => <InteractiveShowMorePill />,
  parameters: {
    docs: {
      description: {
        story: "A pill that changes state when show more is clicked.",
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  args: {
    label: "Default Pill",
  },
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <OGPill label="Default Pill" />
      <OGPill label="Removable Pill" onRemove={() => {}} />
      <OGPill label="Show More Pill" onShowMore={() => {}} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "A showcase of all OGPill variants in one view.",
      },
    },
  },
};
