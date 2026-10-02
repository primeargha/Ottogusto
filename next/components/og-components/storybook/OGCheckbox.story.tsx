import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useState } from "react";
import { OGCheckbox } from "@/components/og-components/OGCheckbox";
import { OGButton } from "@/components/og-components/OGButton";
import { fn } from "storybook/test";

const meta = {
  component: OGCheckbox,
  title: "OGCheckbox",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A customizable checkbox component with support for different styles, states, and labels.",
      },
    },
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["primary", "title"],
      description: "The style type of the checkbox",
    },
    selected: {
      control: { type: "boolean" },
      description: "Whether the checkbox is selected",
    },
    partial: {
      control: { type: "boolean" },
      description: "Whether the checkbox is in a partially selected state",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Whether the checkbox is disabled",
    },
    label: {
      control: { type: "text" },
      description: "The label text displayed next to the checkbox",
    },
    labelClass: {
      control: { type: "text" },
      description: "Additional CSS classes for the label",
    },
    className: {
      control: { type: "text" },
      description: "Additional CSS classes to apply to the checkbox container",
    },
    onChange: {
      action: "changed",
      description: "Callback function when checkbox state changes",
    },
  },
} satisfies Meta<typeof OGCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    label: "Accept Terms and Conditions",
    type: "primary",
    selected: true,
    onChange: fn(),
  },
};

// Type variants
export const Primary: Story = {
  args: {
    label: "Primary Style Checkbox",
    type: "primary",
    selected: false,
    onChange: fn(),
  },
};

export const Title: Story = {
  args: {
    label: "Title Style Checkbox",
    type: "title",
    selected: false,
    onChange: fn(),
  },
};

// State variants
export const Selected: Story = {
  args: {
    label: "Selected Checkbox",
    type: "primary",
    selected: true,
    onChange: fn(),
  },
};

export const Partial: Story = {
  args: {
    label: "Partially Selected Checkbox",
    type: "primary",
    partial: true,
    onChange: fn(),
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Checkbox",
    type: "primary",
    disabled: true,
    onChange: fn(),
  },
};

export const DisabledSelected: Story = {
  args: {
    label: "Disabled Selected Checkbox",
    type: "primary",
    disabled: true,
    selected: true,
    onChange: fn(),
  },
};

// Interactive examples with OGButton
const InteractiveCheckbox = ({
  type,
  label,
  initialSelected = false,
}: {
  type: "primary" | "title";
  label: string;
  initialSelected?: boolean;
}) => {
  const [selected, setSelected] = useState(initialSelected);

  return (
    <div className="flex flex-col gap-4">
      <OGButton type="primary" onClick={() => setSelected(!selected)}>
        {selected ? "Uncheck" : "Check"} Checkbox
      </OGButton>
      <OGCheckbox type={type} label={label} selected={selected} onChange={(e) => setSelected(e)} />
    </div>
  );
};

export const InteractivePrimary: Story = {
  args: {
    label: "Interactive Primary Checkbox",
    type: "primary",
    selected: false,
    onChange: fn(),
  },
  render: (args) => (
    <InteractiveCheckbox
      type={args.type || "primary"}
      label={args.label}
      initialSelected={args.selected || false}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "An interactive example showing how to use OGButton to control a primary checkbox.",
      },
    },
  },
};

export const InteractiveTitle: Story = {
  args: {
    label: "Interactive Title Checkbox",
    type: "title",
    selected: false,
    onChange: fn(),
  },
  render: (args) => (
    <InteractiveCheckbox
      type={args.type || "title"}
      label={args.label}
      initialSelected={args.selected ?? false}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "An interactive example showing how to use OGButton to control a title checkbox.",
      },
    },
  },
};

// Multiple checkboxes showcase
const MultipleCheckboxes = () => {
  const [checkboxes, setCheckboxes] = useState([
    { id: 1, label: "Option 1", selected: false, type: "primary" as const, partial: false },
    { id: 2, label: "Option 2", selected: false, type: "primary" as const, partial: false },
    { id: 3, label: "Option 3", selected: false, type: "title" as const, partial: false },
    { id: 4, label: "Option 4", selected: false, type: "title" as const, partial: false },
  ]);

  const toggleCheckbox = (id: number) => {
    setCheckboxes(checkboxes?.map((cb) => (cb.id === id ? { ...cb, selected: !cb.selected } : cb)));
  };

  const selectAll = () => {
    setCheckboxes(checkboxes?.map((cb) => ({ ...cb, selected: true })));
  };

  const unselectAll = () => {
    setCheckboxes(checkboxes?.map((cb) => ({ ...cb, selected: false })));
  };

  const togglePartial = () => {
    setCheckboxes(
      checkboxes?.map((cb, index) => ({
        ...cb,
        partial: index === 0 ? !cb.partial : false,
        selected: index === 0 ? false : cb.selected,
      })),
    );
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <OGButton type="primary" onClick={selectAll}>
          Select All
        </OGButton>
        <OGButton type="secondary" onClick={unselectAll}>
          Unselect All
        </OGButton>
        <OGButton type="outlined" onClick={togglePartial}>
          Toggle Partial
        </OGButton>
      </div>

      <div className="flex flex-col gap-2">
        {checkboxes?.map((checkbox) => (
          <OGCheckbox
            key={checkbox.id}
            type={checkbox.type}
            label={checkbox.label}
            selected={checkbox.selected}
            partial={checkbox.partial}
            onChange={() => toggleCheckbox(checkbox.id)}
          />
        ))}
      </div>
    </div>
  );
};

export const MultipleCheckboxesShowcase: Story = {
  args: {
    label: "Multiple Checkboxes",
    type: "primary",
    selected: false,
    onChange: fn(),
  },
  render: () => <MultipleCheckboxes />,
  parameters: {
    docs: {
      description: {
        story:
          "A showcase of multiple checkboxes that can be controlled using OGButton components.",
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  args: {
    label: "All Variants",
    type: "primary",
    selected: false,
    onChange: fn(),
  },
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      <OGCheckbox type="primary" label="Primary Unselected" selected={false} onChange={() => {}} />
      <OGCheckbox type="primary" label="Primary Selected" selected={true} onChange={() => {}} />
      <OGCheckbox type="title" label="Title Unselected" selected={false} onChange={() => {}} />
      <OGCheckbox type="title" label="Title Selected" selected={true} onChange={() => {}} />
      <OGCheckbox type="primary" label="Partially Selected" partial={true} onChange={() => {}} />
      <OGCheckbox type="primary" label="Disabled Unselected" disabled={true} onChange={() => {}} />
      <OGCheckbox
        type="primary"
        label="Disabled Selected"
        disabled={true}
        selected={true}
        onChange={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "A showcase of all checkbox variants in one view.",
      },
    },
  },
};

// Custom styling example
export const CustomStyling: Story = {
  args: {
    label: "Custom Styled Checkbox",
    type: "primary",
    selected: false,
    className: "border border-blue-300 rounded-lg p-4 shadow-lg",
    labelClass: "text-blue-600 font-semibold",
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "An example of how to apply custom styling to the checkbox component.",
      },
    },
  },
};

// Form example
const CheckboxFormExample = () => {
  const [formData, setFormData] = useState({
    terms: false,
    newsletter: false,
    notifications: false,
    marketing: false,
  });

  const handleChange = (field: keyof typeof formData) => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = () => {
    alert(`Form submitted with: ${JSON.stringify(formData, null, 2)}`);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <h3 className="text-lg font-bold">Registration Form</h3>

      <OGCheckbox
        type="primary"
        label="I accept the Terms and Conditions"
        selected={formData.terms}
        onChange={handleChange("terms")}
      />

      <OGCheckbox
        type="primary"
        label="Subscribe to newsletter"
        selected={formData.newsletter}
        onChange={handleChange("newsletter")}
      />

      <OGCheckbox
        type="title"
        label="Enable push notifications"
        selected={formData.notifications}
        onChange={handleChange("notifications")}
      />

      <OGCheckbox
        type="title"
        label="Receive marketing emails"
        selected={formData.marketing}
        onChange={handleChange("marketing")}
      />

      <OGButton type="primary" onClick={handleSubmit} disabled={!formData.terms}>
        Submit Form
      </OGButton>
    </div>
  );
};

export const FormExample: Story = {
  args: {
    label: "Form Example",
    type: "primary",
    selected: false,
    onChange: fn(),
  },
  render: () => <CheckboxFormExample />,
  parameters: {
    docs: {
      description: {
        story:
          "A practical example showing how to use checkboxes in a form with OGButton for submission.",
      },
    },
  },
};
