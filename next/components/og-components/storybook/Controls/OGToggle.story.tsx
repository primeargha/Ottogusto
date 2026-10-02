import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useState } from "react";
import { fn } from "storybook/test";
import { OGRadioGroup, OGRadioInput } from "@/components/og-components/OGRadioInput";
import { any, boolean } from "zod";
import OGToggleSwitch from "@/components/og-components/OGToggleSwitch";

const meta = {
  component: OGToggleSwitch,
  title: "Controls / Toggle Button",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A versatile Toggle input component with customizable styling.",
      },
    },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
    isOn: { control: "boolean" },
    label: { control: "text", defaultValue: "Default toggle switch" },
    onChange: { control: fn },
    value: { control: "text", defaultValue: "SomeRandom Value" },
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
} satisfies Meta<typeof OGToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  //@ts-ignore
  args: {
    label: "Default toggle switch",
    value: "10",
    isDisabled: false,
    // title: 'Information',
    // description: 'This is an informational alert message.',
    // variant: 'info',
    // iconSize: 24,
  },
  // render: (props) => {
  //   debugger;
  //   return <OGToggleSwitch label="Default toggle Switch" isDisabled={false} key={"SomethingRANDOM"} onChange={fn} />
  //   // debugger;
  //   // return <OGRadioGroup>
  //   //     <OGRadioInput label={props.label} value={props.value} isDisabled={props.isDisabled} isInvalid={props.isInvalid} />
  //   // </OGRadioGroup>
  // }
};

// Variant stories
export const IsDisabled: Story = {
  args: {
    label: "Disabled state toggle switch",
    value: "10",
    isDisabled: false,
    onChange: fn,
    isOn: true,
    // isInvalid: false,
    // state: "hover",
    // title: 'Information',
    // description: 'This is an informational alert message.',
    // variant: 'info',
    // iconSize: 24,
  },
};
