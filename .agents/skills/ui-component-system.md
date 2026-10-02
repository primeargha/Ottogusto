---
description: Component system using Gluestack UI and custom components
---

# UI Component System

## Core Framework
- **Gluestack UI** - Primary component library
- **React Native Web** - Cross-platform components
- **Tailwind CSS** - Styling and design system
- **Framer Motion** - Animations and transitions
- **Lucide React Native** - Icon system

## Component Architecture

### Gluestack Components (50+ components)
- **Form Controls**: Input, Select, Checkbox, Radio, Switch
- **Navigation**: Button, Link, Menu, Actionsheet
- **Feedback**: Alert, Toast, Modal, Tooltip
- **Layout**: Box, Divider, Avatar, Spinner
- **Data Display**: Accordion, Progress, Slider

### Custom Component Categories
- **OG Components** (`components/og-components/`) - Brand-specific UI
- **Screens** (`screens/`) - Page-level components
- **Universal Components** - Cross-platform shared components

## Theme System
- **Multi-store theming** (Ottogusto, Qverde)
- **Device-responsive design** (mobile/desktop)
- **Dynamic CSS variables** for colors and typography
- **Semantic class names** with Tailwind integration

### Theme Structure
```typescript
// Store-specific color mapping
colors: {
  'color-primary-main': '#0A4932', // Ottogusto
  'color-secondary-main': '#009F4D',
  'color-background-l1': '#FCFCFB',
  // ...
}

// Typography system
typography: {
  'h1': { fontSize: '2.5rem', fontWeight: 'bold' },
  'body-medium-md': { fontSize: '1rem', fontWeight: '500' },
  // ...
}
```

## Styling Patterns
- **Utility-first** with Tailwind CSS
- **Component variants** with Gluestack
- **Responsive design** with mobile-first approach
- **Dark mode support** with CSS variables
- **Custom animations** with Framer Motion

## Icon System
- **Lucide React Native** for consistent icons
- **Custom SVG icons** for brand elements
- **Icon components** with size and color variants
- **Loading animations** with Lottie

## Accessibility
- **ARIA labels** and semantic HTML
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** compliance
- **Focus management** in modals and forms
