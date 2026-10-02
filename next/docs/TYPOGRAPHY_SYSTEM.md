# Typography System

A reusable typography system that leverages CSS variables generated from `client-theme-config.ts` to provide consistent, theme-aware typography across the application.

## 🎯 Overview

Instead of writing individual CSS variables like `text-[var(--font-size-md)]` and `font-[family-name:var(--font-family-body)]`, you can now use semantic class names that automatically adapt to the current store and device mode.

## 📚 Available Classes

### Heading Styles

| Class           | Font Family | Weight  | Size       | Line Height | Use Case           |
| --------------- | ----------- | ------- | ---------- | ----------- | ------------------ |
| `typography-h1` | Anton       | Regular | 3xl (56px) | xl (64px)   | Main page headings |
| `typography-h2` | Anton       | Regular | 2xl (40px) | lg (48px)   | Section headings   |

### Body Styles - Bold

| Class                     | Font Family | Weight | Size      | Line Height | Use Case         |
| ------------------------- | ----------- | ------ | --------- | ----------- | ---------------- |
| `typography-body-bold-lg` | Overpass    | Bold   | lg (24px) | lg (48px)   | Large bold text  |
| `typography-body-bold-md` | Overpass    | Bold   | md (20px) | md (36px)   | Medium bold text |
| `typography-body-bold-sm` | Overpass    | Bold   | sm (16px) | sm (28px)   | Small bold text  |
| `typography-body-bold-xs` | Overpass    | Bold   | xs (12px) | xs (16px)   | XS bold text     |

### Body Styles - Medium

| Class                       | Font Family | Weight | Size      | Line Height | Use Case           |
| --------------------------- | ----------- | ------ | --------- | ----------- | ------------------ |
| `typography-body-medium-lg` | Overpass    | Medium | lg (24px) | lg (48px)   | Large medium text  |
| `typography-body-medium-md` | Overpass    | Medium | md (20px) | md (36px)   | Medium weight text |
| `typography-body-medium-sm` | Overpass    | Medium | sm (16px) | sm (28px)   | Small medium text  |
| `typography-body-medium-xs` | Overpass    | Medium | xs (12px) | xs (16px)   | XS medium text     |

### Body Styles - Regular

| Class                        | Font Family | Weight  | Size      | Line Height | Use Case            |
| ---------------------------- | ----------- | ------- | --------- | ----------- | ------------------- |
| `typography-body-regular-lg` | Overpass    | Regular | lg (24px) | lg (48px)   | Large regular text  |
| `typography-body-regular-md` | Overpass    | Regular | md (20px) | md (36px)   | Medium regular text |
| `typography-body-regular-sm` | Overpass    | Regular | sm (16px) | sm (28px)   | Small regular text  |
| `typography-body-regular-xs` | Overpass    | Regular | xs (12px) | xs (16px)   | XS regular text     |

### Semantic Text Styles

| Class                     | Description         | Equivalent                   |
| ------------------------- | ------------------- | ---------------------------- |
| `text-single-300-regular` | Large regular text  | `typography-body-regular-lg` |
| `text-single-300-medium`  | Large medium text   | `typography-body-medium-lg`  |
| `text-single-300-bold`    | Large bold text     | `typography-body-bold-lg`    |
| `text-single-200-regular` | Medium regular text | `typography-body-regular-md` |
| `text-single-200-medium`  | Medium weight text  | `typography-body-medium-md`  |
| `text-single-200-bold`    | Medium bold text    | `typography-body-bold-md`    |
| `text-single-100-regular` | Small regular text  | `typography-body-regular-sm` |
| `text-single-100-medium`  | Small medium text   | `typography-body-medium-sm`  |
| `text-single-100-bold`    | Small bold text     | `typography-body-bold-sm`    |
| `text-single-50-regular`  | XS regular text     | `typography-body-regular-xs` |
| `text-single-50-medium`   | XS medium text      | `typography-body-medium-xs`  |
| `text-single-50-bold`     | XS bold text        | `typography-body-bold-xs`    |

## 🚀 Usage Examples

### Basic Usage

```jsx
// Before (old way)
<h1 className="font-[family-name:var(--font-family-title)] text-[var(--font-size-3xl)] font-[var(--font-weight-regular)] leading-[var(--font-lineheight-xl)]">
  Main Heading
</h1>

// After (new way)
<h1 className="typography-h1">
  Main Heading
</h1>
```

### Body Text Examples

```jsx
// Regular body text
<p className="typography-body-regular-md">
  This is regular body text with medium size.
</p>

// Bold emphasis
<p className="typography-body-bold-lg">
  This is bold large text for emphasis.
</p>

// Small caption
<p className="typography-body-regular-xs">
  This is a small caption or footnote.
</p>
```

### Semantic Classes

```jsx
// Using semantic classes for consistent text hierarchy
<h2 className="text-single-300-bold">Section Title</h2>
<p className="text-single-200-regular">Section description</p>
<p className="text-single-100-medium">Additional details</p>
```

### Combined with Colors

```jsx
// Typography classes work perfectly with color variables
<h1 className="typography-h1 text-[var(--color-piston-900)]">
  Colored Heading
</h1>

<p className="typography-body-regular-md text-[var(--color-grey-600)]">
  Colored body text
</p>
```

## 🔧 Implementation Details

### Tailwind Plugin

The typography system is implemented as a Tailwind CSS plugin in `tailwind.config.js`:

```javascript
// Custom typography plugin
function({ addUtilities }) {
  const typographyUtilities = {
    '.typography-h1': {
      'font-family': 'var(--font-family-anton)',
      'font-weight': 'var(--font-weight-regular)',
      'font-size': 'var(--font-size-3xl)',
      'line-height': 'var(--font-lineheight-xl)',
    },
    // ... more classes
  };

  addUtilities(typographyUtilities);
}
```

### CSS Variables Source

All typography values come from the CSS variables generated by the dynamic theme system:

```css
:root {
  --font-family-anton: Anton;
  --font-family-overpass: Overpass;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --font-size-xs: 12px;
  --font-size-sm: 16px;
  --font-size-md: 20px;
  --font-size-lg: 24px;
  --font-size-xl: 32px;
  --font-size-2xl: 40px;
  --font-size-3xl: 56px;
  --font-lineheight-xs: 16px;
  --font-lineheight-sm: 28px;
  --font-lineheight-md: 36px;
  --font-lineheight-lg: 48px;
  --font-lineheight-xl: 64px;
}
```

## 🎨 Theme Adaptation

The typography system automatically adapts to:

- **Store Changes**: Different fonts for Ottogusto vs Qverde
- **Device Changes**: Different sizes for mobile vs desktop
- **Dynamic Updates**: Real-time changes when switching themes

### Store-Specific Fonts

| Store     | Title Font | Body Font   |
| --------- | ---------- | ----------- |
| Ottogusto | Anton      | Overpass    |
| Qverde    | Oswald     | Public Sans |

### Device-Specific Sizes

Mobile devices get smaller font sizes and line heights for better readability on smaller screens.

## 📱 Demo Page

Visit `/typography-demo` to see all typography classes in action with live theme switching.

## ✅ Benefits

1. **Consistency**: All typography follows the same system
2. **Maintainability**: Changes in one place affect the entire app
3. **Semantic**: Class names describe the purpose, not the implementation
4. **Theme-Aware**: Automatically adapts to store and device changes
5. **Performance**: No runtime calculations, pure CSS
6. **Developer Experience**: IntelliSense support and clear naming

## 🔄 Migration Guide

### From Individual CSS Variables

```jsx
// Old way
<p className="font-[family-name:var(--font-family-body)] text-[var(--font-size-md)] font-[var(--font-weight-bold)] leading-[var(--font-lineheight-md)]">
  Text content
</p>

// New way
<p className="typography-body-bold-md">
  Text content
</p>
```

### From Hardcoded Values

```jsx
// Old way
<h1 className="text-4xl font-bold font-anton">
  Heading
</h1>

// New way
<h1 className="typography-h1">
  Heading
</h1>
```

## 🛠️ Adding New Classes

To add new typography classes:

1. Add the class definition to the Tailwind plugin in `tailwind.config.js`
2. Update this documentation
3. Add examples to the demo page

Example:

```javascript
'.typography-body-light-lg': {
  'font-family': 'var(--font-family-overpass)',
  'font-weight': '300', // Light weight
  'font-size': 'var(--font-size-lg)',
  'line-height': 'var(--font-lineheight-lg)',
},
```

## 🎯 Best Practices

1. **Use semantic classes** when possible (`text-single-300-bold` vs `typography-body-bold-lg`)
2. **Combine with color variables** for complete theming
3. **Test on both stores** to ensure consistency
4. **Use appropriate sizes** for the content hierarchy
5. **Consider mobile responsiveness** when choosing sizes
