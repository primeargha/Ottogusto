import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useState } from "react";
import { fn } from "storybook/test";
import { OGRadioGroup, OGRadioInput } from "@/components/og-components/OGRadioInput";
import { any, boolean } from "zod";

const meta = {
  component: OGRadioInput,
  title: "Controls / Radio Button",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A versatile Radio input component with customizable styling.",
      },
    },
  },
  argTypes: {
    isDisabled: boolean,
    isInvalid: boolean,
    label: String,
    value: any,
    state: {
      control: { type: "select" },
      options: ["hover", "default", "disabled"],
    },
    // variant: {
    //   control: { type: 'select' },
    //   options: ['info', 'warning', 'error'],
    //   description: 'The visual style variant of the alert',
    // },
    // title: {
    //   control: { type: 'text' },
    //   description: 'The title text for the alert',
    // },
    // description: {
    //   control: { type: 'text' },
    //   description: 'The description text for the alert',
    // },
    // iconSize: {
    //   control: { type: 'number', min: 16, max: 48, step: 2 },
    //   description: 'The size of the icon in pixels',
    // },
    // className: {
    //   control: { type: 'text' },
    //   description: 'Additional CSS classes to apply',
    // },
  },
} satisfies Meta<typeof OGRadioInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    label: "Default radio button",
    value: "10",
    isDisabled: false,
    isInvalid: false,
    state: "default",
    // title: 'Information',
    // description: 'This is an informational alert message.',
    // variant: 'info',
    // iconSize: 24,
  },
  render: (props) => {
    const [Val, setVal] = useState("1");
    // debugger;
    return (
      <OGRadioGroup
        onChange={(v) => {
          setVal(v);
        }}
        value={Val}
      >
        <OGRadioInput
          key={1}
          label={props.label}
          value={"1"}
          isDisabled={props.isDisabled || false}
          isInvalid={props?.isInvalid || false}
        />
        <OGRadioInput
          key={2}
          label={props.label}
          value={"2"}
          isDisabled={props.isDisabled || false}
          isInvalid={props.isInvalid || false}
        />
      </OGRadioGroup>
    );
  },
};

// Variant stories
export const Info: Story = {
  args: {
    label: "Hover state Radio radio button",
    value: "10",
    isDisabled: false,
    isInvalid: false,
    state: "hover",
    // title: 'Information',
    // description: 'This is an informational alert message.',
    // variant: 'info',
    // iconSize: 24,
  },
};
