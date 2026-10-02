import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Box } from "@/components/ui/box";
import { OGPhoneInput } from "@/components/og-components/OGPhoneInput";

const meta: Meta<typeof OGPhoneInput> = {
  title: "OGPhoneInput",
  component: OGPhoneInput,
  argTypes: {
    state: {
      control: "radio",
      options: ["default", "filled", "error", "disabled"],
    },
    mandatory: {
      control: "boolean",
    },
    title: {
      control: "text",
    },
    placeholder: {
      control: "text",
    },
    error: {
      control: "text",
    },
    isReadOnly: {
      control: "boolean",
    },
    defaultCountry: {
      control: "text",
    },
  },
  args: {
    state: "default",
    title: "Phone Number",
    placeholder: "Enter phone number",
    error: "Invalid phone number",
    mandatory: false,
    isReadOnly: false,
    defaultCountry: "US",
  },
};

export default meta;

type Story = StoryObj<typeof OGPhoneInput>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("");

    return (
      <Box className="max-w-sm">
        <OGPhoneInput {...args} value={value} onChange={setValue} />
      </Box>
    );
  },
};

export const FilledState: Story = {
  render: (args) => {
    const [value, setValue] = useState("+14155552671");

    return (
      <Box className="max-w-sm">
        <OGPhoneInput {...args} state="filled" value={value} onChange={setValue} />
      </Box>
    );
  },
};

export const ErrorState: Story = {
  render: (args) => {
    const [value, setValue] = useState("+14155552671");

    return (
      <Box className="max-w-sm">
        <OGPhoneInput {...args} state="error" value={value} onChange={setValue} />
      </Box>
    );
  },
};

export const DisabledState: Story = {
  render: (args) => {
    const [value, setValue] = useState("+14155552671");

    return (
      <Box className="max-w-sm">
        <OGPhoneInput {...args} state="disabled" value={value} onChange={setValue} />
      </Box>
    );
  },
};

export const WithMandatory: Story = {
  render: (args) => {
    const [value, setValue] = useState("");

    return (
      <Box className="max-w-sm">
        <OGPhoneInput {...args} mandatory value={value} onChange={setValue} />
      </Box>
    );
  },
};
