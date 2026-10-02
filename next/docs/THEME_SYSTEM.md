# Theme System Documentation

## Overview

This theme system provides a flexible, multi-dimensional theming solution that supports:

- **Multiple stores** (ottogusto, qverde, etc.)
- **Device-specific themes** (mobile <640px, desktop >=640px)
- **Nested object structure** for organized theme configuration
- **Automatic CSS variable generation** from theme objects
- **Server and client component support**

## Architecture

### File Structure

```
next/
├── config/
│   └── client-theme-config.ts    # Main theme configuration
├── scripts/
│   └── generate-theme-css.ts     # CSS generation script
├── styles/
│   ├── global.css                # Imports generated CSS variables
│   └── generated-theme-variables.css # Auto-generated CSS variables
├── utils/
│   └── server-theme.ts           # Server-side theme utilities
├── hooks/
│   └── useThemeConfig.ts         # Client-side theme hook
├── components/
│   ├── ThemeProvider.tsx         # Theme context provider
│   └── examples/                 # Usage examples
└── app/
    ├── dummy-server/             # Server component demo
    └── dummy-client/             # Client component demo
```

## Configuration

### Theme Structure

The theme configuration in `client-theme-config.ts` uses a nested object structure:

```typescript
const ottogustoTheme = {
  Color: {
    Piston: {
      50: "#EDFCF3",
      100: "#D3F8E2",
      // ... more shades
    },
    Beige: {
      200: "#FCFCFB",
      600: "#F7F7F3",
      800: "#F2F1EB",
    },
  },
  Font: {
    Size: {
      xs: "12px",
      sm: "16px",
      md: "20px",
      // ... more sizes
    },
    LineHeight: {
      xs: "16px",
      sm: "28px",
      // ... more line heights
    },
  },
};
```

### CSS Variable Generation

The system automatically converts nested paths to kebab-case CSS variables:

- `Color/Beige/600` → `--color-beige-600`
- `Font/Size/md` → `--font-size-md`
- `Color/Piston/950` → `--color-piston-950`

## Usage

### 1. Server Components

Use the server utilities to access theme values:

```typescript
import { getServerThemeValue, getCurrentServerThemeInfo } from "@/utils/server-theme";

export function MyServerComponent() {
  const themeInfo = getCurrentServerThemeInfo();
  const primaryColor = getServerThemeValue("Color/Piston/900");
  const fontSize = getServerThemeValue("Font/Size/lg");

  return (
    <div style={{ backgroundColor: primaryColor, fontSize: fontSize }}>
      Store: {themeInfo.store}, Device: {themeInfo.device}
    </div>
  );
}
```

### 2. Client Components

Use the `useTheme` hook in client components:

```typescript
"use client";
import { useTheme } from "@/components/ThemeProvider";

export function MyClientComponent() {
  const { currentStore, currentDevice, getValue } = useTheme();

  const primaryColor = getValue("Color/Piston/900");
  const fontSize = getValue("Font/Size/lg");

  return (
    <div style={{ backgroundColor: primaryColor, fontSize: fontSize }}>
      Store: {currentStore}, Device: {currentDevice}
    </div>
  );
}
```

### 3. CSS Variables (Recommended)

Use the generated CSS variables directly with Tailwind:

```typescript
export function MyComponent() {
  return (
    <div className="bg-color-primary-main text-[var(--color-white)]">
      <h1 className="text-[var(--font-size-lg)]">Title</h1>
      <p className="text-[var(--font-size-md)]">Content</p>
    </div>
  );
}
```

## Store and Device Detection

### Store Detection

- **Server**: Detected from `host` header
- **Client**: Detected from `window.location.hostname`
- **Fallback**: Uses `defaultStore` from configuration

### Device Detection

- **Server**: Detected from User-Agent header
- **Client**: Detected from `window.innerWidth`
- **Breakpoint**: 640px (configurable)

## Development Workflow

### 1. Update Theme Configuration

Edit `config/client-theme-config.ts` to add/modify theme values.

### 2. Generate CSS Variables

Run the generation script:

```bash
npx tsx scripts/generate-theme-css.ts
```

### 3. Use in Components

Access theme values using the provided utilities or CSS variables.

## Testing

### Demo Pages

- `/dummy-server` - Server component examples
- `/dummy-client` - Client component examples

### URL Overrides

For testing different device modes:

- `?force-desktop=true` - Force desktop mode
- `?force-mobile=true` - Force mobile mode

## Best Practices

### 1. Use CSS Variables for Styling

Prefer CSS variables over inline styles for better performance:

```typescript
// ✅ Good
<div className="bg-color-primary-main text-[var(--color-white)]">

// ❌ Avoid
<div style={{ backgroundColor: getValue("Color/Piston/900") }}>
```

### 2. Server vs Client Components

- Use server utilities in server components
- Use `useTheme` hook in client components
- Use CSS variables for both

### 3. Theme Paths

Use the exact nested paths from your configuration:

- `Color/Piston/900`
- `Font/Size/lg`
- `Color/Beige/600`

## Troubleshooting

### Common Issues

1. **CSS Variables Not Working**
   - Ensure `generated-theme-variables.css` is imported in `global.css`
   - Check that the generation script ran successfully

2. **Theme Values Not Found**
   - Verify the path exists in your theme configuration
   - Check console for "Path not found" warnings

3. **Device Detection Issues**
   - Use URL overrides for testing: `?force-mobile=true`
   - Check User-Agent patterns in `server-theme.ts`

### Debugging

1. **Check Current Theme Info**

   ```typescript
   // Server
   const themeInfo = getCurrentServerThemeInfo();
   console.log(themeInfo);

   // Client
   const { currentStore, currentDevice } = useTheme();
   console.log({ currentStore, currentDevice });
   ```

2. **Verify CSS Variables**
   - Open browser dev tools
   - Check `:root` styles for generated variables

## API Reference

### Server Utilities

- `getServerThemeInfo()` - Get current store and device
- `getServerThemeValue(path)` - Get theme value by path
- `detectMobileFromUserAgent(ua)` - Detect mobile from User-Agent

### Client Hook

- `useTheme()` - Get theme context
- `useThemeConfig()` - Get full theme configuration

### Theme Provider

- `ThemeProvider` - Context provider for client components

### Configuration

- `CLIENT_THEME_CONFIG` - Main configuration object
- `getStoreFromDomain(domain)` - Detect store from domain
- `getDeviceMode(width)` - Detect device from width
