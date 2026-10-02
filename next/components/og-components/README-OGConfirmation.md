# OGConfirmation Component

A reusable confirmation dialog component that can be triggered programmatically using the `askConfirmation` utility function.

## Features

- ✅ Programmatically triggered confirmations
- ✅ Customizable title and body text
- ✅ Yes/No callback functions
- ✅ Consistent with existing OG component design patterns
- ✅ Uses Zustand for state management
- ✅ Responsive design
- ✅ Keyboard accessible

## Installation

The component is already included in the project. No additional installation required.

## Usage

### 1. Add the component to your app

Add the `OGConfirmation` component to your main layout or app component:

```tsx
import { OGConfirmation } from "@/components/og-components/OGConfirmation";

function App() {
  return (
    <div>
      {/* Your app content */}
      <OGConfirmation />
    </div>
  );
}
```

### 2. Trigger confirmations

Use the `askConfirmation` utility function to trigger confirmations:

```tsx
import { askConfirmation } from "@/utils/confirmation";

const handleDeleteClick = () => {
  askConfirmation(
    "Delete Item", // title
    "Are you sure you want to delete this item? This action cannot be undone.", // body
    "confirm",
    () => {
      // yesCallback - executed when user clicks "Confirm"
      console.log("User confirmed deletion");
      // Perform delete operation here
    },
    () => {
      // noCallback (optional) - executed when user clicks "Cancel"
      console.log("User cancelled deletion");
    },
  );
};
```

### 3. Using the hook (alternative approach)

You can also use the `useConfirmation` hook:

```tsx
import { useConfirmation } from "@/utils/confirmation";

function MyComponent() {
  const { askConfirmation } = useConfirmation();

  const handleAction = () => {
    askConfirmation(
      "Confirm Action",
      "Do you want to proceed?",
      "confirm",
      () => console.log("Confirmed"),
      () => console.log("Cancelled"),
    );
  };

  return <button onClick={handleAction}>Trigger Confirmation</button>;
}
```

## API Reference

### askConfirmation(title, body, yesCallback, noCallback?)

- `title` (string): The title displayed in the confirmation dialog
- `body` (string): The body text displayed in the confirmation dialog
- `variant` ("confirm", "report")
- `yesCallback` (function): Function called when user clicks "Confirm"
- `noCallback` (function, optional): Function called when user clicks "Cancel"

### OGConfirmation Component Props

- `className` (string, optional): Additional CSS classes

## Examples

### Basic confirmation

```tsx
askConfirmation(
  "Delete Item",
  "Are you sure you want to delete this item?",
  "confirm | report",
  () => deleteItem(),
);
```

### Confirmation with cancel callback

```tsx
askConfirmation(
  "Save Changes",
  "You have unsaved changes. Do you want to save them?",
  "confirm | report",
  () => saveChanges(),
  () => console.log("User chose not to save"),
);
```

### Confirmation in event handlers

```tsx
const handleFormSubmit = (e) => {
  e.preventDefault();

  askConfirmation(
    "Submit Form",
    "Are you sure you want to submit this form?",
    "confirm | report",
    () => {
      // Proceed with form submission
      submitForm();
    },
  );
};
```

## Integration with existing code

The component follows the same patterns as other OG components in the project:

- Uses the same UI components (`Box`, `Text`, `OGButton`)
- Follows the same styling conventions
- Uses Zustand for state management like other stores
- Integrates with the existing design system

## Styling

The component uses the existing design tokens and follows the project's styling conventions:

- Uses `--primary-colors-primary-dark` for text colors
- Uses `--System-Colors-Error-Main` for the alert icon
- Follows the Overpass font family
- Uses consistent spacing and border radius

## Accessibility

- Modal is properly focused and trapped
- Keyboard navigation support
- Screen reader friendly
- High contrast design
- Clear visual hierarchy
