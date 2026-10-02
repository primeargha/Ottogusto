# OttoGusto

OttoGusto

## Getting Started

Fuelling Passion. Powering Possibilities
Original parts for the Innovators

## ENV files
-- .env.main  === DEV
-- .env.master === Production

## Run code linting

```
npm run lint
```

## Check Production build on local
```
npm run build
npm run start_live
# then check on localhost:8080
```


## Run Storybook for our Components/Documentations

```
cd next
npm install
npm run storybook
```
#### then navigate to http://localhost:6006

---
---

## Running DEV Server Localy

```
cd next && npm i
npm run dev
```

**Now open [localhost:3000](http://localhost:3000)**

### Folder/Directory Structure

|
|-- next (contains NextJS webApp) \*current
|-- docker (contains ReverseProxy for our NexJS webApp)
|
|-- docker-compose.yml (Docker Compose deployment script)
|-- universal

### Prerequisite

> Docker with DockerCompose based machine

### Installation

1. Clone the repository:

```bash
git clone git@ssh.dev.azure.com:v3/cp2digital/CP2%20Digital/CP2.Ottogusto

cd CP2.Ottogusto

docker compose up --build -d

```

2. Install dependencies:

Go to `expo-app`, `next` and `universal` folders and run the following command in each:

```bash
yarn
```

### Running the Application

#### Next.js

To run the Next.js application, run the following command:

```bash
cd next && yarn dev
```

#### (NOT YET STARTED) Expo

To run the Expo application, run the following command:

```bash
cd expo-app && yarn start
```

#### Universal

For the Expo app in the universal project, run the following command:

```bash
cd universal && yarn run:expo
```

For the Next.js app in the universal project, run the following command:

```bash
cd universal && yarn run:next
```

## Project Structure

### Next.js

- `next`: Contains the Next.js application along with components and screens.

### Expo

- `expo`: Contains the Expo application along with components and screens.

### Universal

- `app/next`: Contains the Next.js application.
- `app/expo`: Contains the Expo application.
- `packages/components`: Shared components used across platforms.
- `packages/screens`: Shared screens that can be used in both Next.js and Expo projects.
- `packages/shared`: Shared assets

# Usage

You can copy the project of your choice (Next.js, Expo, or Universal) and start building your application. The starter kit provides a basic structure and shared components to help you get started quickly.

# Ejection

If you have copied the universal project and want to eject the project, you can run the following command:

```bash
cd universal && yarn eject
```

# How to use new theme

## 🎨 Multi-Dimensional Theme System

This project implements a robust, multi-dimensional theme system that supports:

- **Store-based theming**: Different themes for different stores (ottogusto, qverde)
- **Device-based theming**: Different themes for mobile and desktop devices
- **Dynamic adaptation**: Themes change automatically based on store and device detection
- **CSS variable generation**: Automatic generation of CSS variables from nested theme configuration
- **Typography system**: Semantic Tailwind CSS classes for typography that adapt to store and device

### 🚀 Quick Start

The theme system is automatically configured at the layout level. No additional setup required!

```tsx
// All components automatically have access to the theme system
<div className="bg-color-primary-main text-color-text-body">
  <h1 className="h1">Dynamic Heading</h1>
  <p className="body-medium-md">Dynamic Body Text</p>
</div>
```

### 🎯 Key Features

#### 1. **Store-Specific Colors**

Colors are mapped based on the current store (ottogusto vs qverde):

```tsx
// These classes automatically use the correct colors for the current store
<button className="bg-color-primary-main text-color-text-on-brand">
  Primary Button
</button>

<div className="bg-color-background-l1 text-color-text-body">
  Background with text
</div>
```

#### 2. **Device-Responsive Typography**

Typography automatically adapts to device (mobile/desktop) and store:

```tsx
// Typography classes that adapt to store + device
<h1 className="h1">Heading - Font changes with store</h1>
<p className="body-bold-lg">Body Bold Large</p>
<p className="text-single-300-bold">Semantic Text</p>
```

#### 3. **Opacity Support**

Native Tailwind opacity modifiers work with theme colors:

```tsx
// Opacity modifiers work seamlessly
<div className="bg-color-primary-main/80">80% opacity</div>
<button className="hover:bg-color-primary-main/60">Hover with opacity</button>
```

### 📁 Configuration Files

#### `config/client-theme-config.ts`

Main theme configuration with store-specific themes:

```typescript
export const CLIENT_THEME_CONFIG = {
  stores: {
    ottogusto: {
      desktop: ottogustoTheme,
      mobile: {
        /* mobile overrides */
      },
    },
    qverde: {
      desktop: qverdeTheme,
      mobile: {
        /* mobile overrides */
      },
    },
  },
};
```

#### `tailwind.config.js`

Tailwind configuration with dynamic color mapping:

```javascript
theme: {
  extend: {
    colors: getStoreColorMapping(), // Dynamic colors based on store
    fontFamily: getTypographyValues().fontFamily, // Dynamic fonts
    fontSize: getTypographyValues().fontSize, // Dynamic sizes
  }
}
```

#### `utils/theme-utils.ts`

Utility functions for theme value retrieval:

```typescript
// Get current store
const store = getCurrentStore();

// Get device mode
const device = getClientDeviceMode(); // client
const device = getServerDeviceMode(); // server

// Get theme values
const color = getColorValue("primary-main");
const typography = getTypographyValues();
```

### 🧪 Test Pages

#### Client-Side Test: `/test`

- **URL**: `http://localhost:3000/[language-country]/test`
- **Purpose**: Test client-side theme functionality
- **Features**:
  - Real-time device detection
  - Dynamic typography updates
  - Color examples with opacity
  - Hover effects
  - Store comparison

#### Server-Side Test: `/test-server`

- **URL**: `http://localhost:3000/[language-country]/test-server`
- **Purpose**: Test server-side theme functionality
- **Features**:
  - Server-side device detection from User-Agent
  - Store detection from environment variables
  - Static rendering with theme
  - User-Agent analysis

### 🎨 Available Color Classes

#### Primary Colors

```tsx
bg - color - primary - main;
bg - color - primary - hover;
bg - color - primary - disabled;
text - color - primary - main;
```

#### Secondary Colors

```tsx
bg - color - secondary - main;
bg - color - secondary - hover;
bg - color - secondary - disabled;
text - color - secondary - main;
```

#### Background Colors

```tsx
bg - color - background - l1;
bg - color - background - l2;
bg - color - background - l3;
bg - color - background - l4;
```

#### Text Colors

```tsx
text - color - text - body;
text - color - text - on - brand;
text - color - text - placeholder;
text - color - text - disabled;
```

#### System Colors

```tsx
bg - color - system - warning - extra - light;
bg - color - system - info - extra - light;
bg - color - system - success - extra - light;
bg - color - system - error - extra - light;
```

### 📝 Available Typography Classes

#### Headings

```tsx
<h1 className="h1">H1 Heading</h1>
<h2 className="h2">H2 Heading</h2>
```

#### Body Text

```tsx
<p className="body-bold-lg">Body Bold Large</p>
<p className="body-medium-md">Body Medium Medium</p>
<p className="body-regular-sm">Body Regular Small</p>
```

#### Semantic Text

```tsx
<p className="text-single-300-bold">Semantic Bold</p>
<p className="text-single-200-medium">Semantic Medium</p>
<p className="text-single-100-regular">Semantic Regular</p>
```

### 🔧 Environment Variables

Set the store using environment variables:

```bash
# For server-side (next.config.js, etc.)
STORE=ottogusto

# For client-side (browser)
NEXT_PUBLIC_STORE=ottogusto
```

### 🏗️ Architecture

#### Layout Integration

The theme system is integrated at the root layout level:

```tsx
// next/app/layout.tsx
<ConfigProvider value={config}>
  <ThemeProvider>
    <TypographyProvider>
      {" "}
      {/* ← Automatic typography injection */}
      <OLDClientLayout>{children}</OLDClientLayout>
    </TypographyProvider>
  </ThemeProvider>
</ConfigProvider>
```

#### Component Usage

Components automatically inherit theme without additional setup:

```tsx
// Server Component
export default function MyServerComponent() {
  return (
    <div className="bg-color-primary-main text-color-text-on-brand">
      <h1 className="h1">Server Component</h1>
    </div>
  );
}

// Client Component
("use client");
export default function MyClientComponent() {
  return (
    <button className="bg-color-secondary-main hover:bg-color-secondary-main/80">
      Client Component
    </button>
  );
}
```

### 🎯 Store-Specific Mappings

#### Ottogusto Store

- **Primary**: Piston.900M (#0A4932)
- **Secondary**: Traffic.700M (#009F4D)
- **Accent**: Highway.400M (#FFD31A)
- **Background**: Beige.200 (#FCFCFB)
- **Text**: Tarmac.950M (#0C271D)
- **Fonts**: Anton (Title), Overpass (Body)

#### Qverde Store

- **Primary**: Green.500M (#03853E)
- **Secondary**: Green.500M (#03853E)
- **Accent**: Red.500M (#CF2B37)
- **Background**: Seafoam.100 (#FBFDF8)
- **Text**: Black.700 (#2C2C2C)
- **Fonts**: Oswald (Title), Public Sans (Body)

### 🔄 Dynamic Behavior

#### Color Behavior

- **Store-dependent**: Colors change based on `STORE`/`NEXT_PUBLIC_STORE` environment variable
- **Device-independent**: Colors remain the same regardless of device

#### Typography Behavior

- **Store-dependent**: Font families change based on store
- **Device-dependent**: Font sizes and line heights adapt to device (mobile/desktop)
- **Responsive**: Automatically updates on window resize

### 🚀 Benefits

1. **Zero Setup**: Works out of the box for all components
2. **Type Safe**: Full TypeScript support with autocomplete
3. **Performance**: Direct hex values in Tailwind config for optimal performance
4. **Flexible**: Easy to add new stores or modify existing themes
5. **Responsive**: Automatic device detection and adaptation
6. **Maintainable**: Centralized theme configuration
7. **Developer Experience**: Semantic class names and comprehensive test pages
