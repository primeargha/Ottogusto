const gluestackPlugin = require("@gluestack-ui/nativewind-utils/tailwind-plugin");
const rippleEffectPlugin = require("tailwind-plugin-ripple-effect");

// Import theme utilities
const {
  getCurrentStore,
  getColorValue,
  getTypographyValues,
  getBuildTimeColorMapping,
  getStoreTypographyMapping,
} = require("./utils/theme-utils");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./.storybook/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "gap-x-2",
    "gap-y-6",
    "pl-4",
    "flex-wrap",
    "mb-12",
    "basis-[10%]",
    {
      pattern: /^bg-hero-n-[1-5]$/,
    },
  ],
  important: "html",
  theme: {
    animation: {
      fadeIn: "fadeIn 1.5s ease-in-out",
      expandWidth: "expandWidth var(--rotation-interval) ease-in-out infinite",
      expandWidthNew: "expandWidth var(--rotation-interval) ease-in-out",
    },
    keyframes: {
      fadeIn: {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
      expandWidth: {
        "0%": { width: "0%" },
        "7.14%": { width: "100%" }, // 1s for opening
        "92.86%": { width: "100%" }, // 12s for staying
        "100%": { width: "0%" }, // 1s for closing
      },
    },
    screens: {
      base: "0",
      xs: "400px",
      sm: "480px",
      gtsm: "640px",
      md: "768px",
      lg: "992px",
      gtlg: "1024px",
      "between-0-640": { min: "0px", max: "640px" },
      "between-640-1080": { min: "640px", max: "1080px" },
      "between-768-868": { min: "768px", max: "868px" },
      "between-768-991": { min: "768px", max: "991px" },
      "between-869-969": { min: "869px", max: "969px" },
      "between-1024-1077": { min: "1024px", max: "1077px" },
      "between-900-1080": { min: "900px", max: "1080px" },
      "between-992-1024": { min: "992px", max: "1024px" },
      "between-640-827": { min: "640px", max: "827px" },
      "between-640-767": { min: "640px", max: "727px" },
      "between-768-1023": { min: "768px", max: "1023px" },
      "between-728-767": { min: "728px", max: "767px" },
      "not-1024-1200-low": { max: "1023px" },
      "not-1024-1200-high": { min: "1201px" },
      "between-1024-1200": { min: "1024px", max: "1200px" },
      ml: "1200px", // Condition screen size added
      xl: "1280px",
      portrait: {
        raw: "(orientation: portrait)",
      },
      "2xl": "1600px",
      "3xl": "1960px",
      "between-1280-1599": { min: "1280px", max: "1599px" },
      "between-1383-1716": { min: "1383px", max: "1716px" },
      "between-1216-1382": { min: "1216px", max: "1382px" },
      "between-1024-1215": { min: "1024px", max: "1215px" },
      "between-1216-1270": { min: "1216px", max: "1270px" },
      "between-1081-1100": { min: "1081px", max: "1100px" },
      "between-1024-1075": { min: "1024px", max: "1075px" },
      // Breakpoint tokens from Layout.Breakpoint
      "min-tablet": "var(--breakpoint-min-tablet)",
      "min-desktop": "var(--breakpoint-min-desktop)",
      "min-xl": "var(--breakpoint-min-xl)",
    },
    extend: {
      colors: {
        // --- TEXT STYLES ---
        "color-text-emphasis": "var(--color-text-emphasis)",
        "color-text-default": "var(--color-text-default)",
        "color-text-muted": "var(--color-text-muted)",
        "color-text-disabled": "var(--color-text-disabled)",
        "color-text-inverse": "var(--color-text-inverse)",
        "color-text-brand": "var(--color-text-brand)",
        "color-text-neutral": "var(--color-text-neutral)",
        "color-text-accent": "var(--color-text-accent)",
        "color-text-link": "var(--color-text-link)",
        "color-text-visited": "var(--color-text-visited)",
        "color-text-info": "var(--color-text-info)",
        "color-text-danger": "var(--color-text-danger)",
        "color-text-attention": "var(--color-text-attention)",
        "color-text-positive": "var(--color-text-positive)",

        // --- ICON STYLES ---
        "color-icon-emphasis": "var(--color-icon-emphasis)",
        "color-icon-default": "var(--color-icon-default)",
        "color-icon-muted": "var(--color-icon-muted)",
        "color-icon-disabled": "var(--color-icon-disabled)",
        "color-icon-inverse": "var(--color-icon-inverse)",
        "color-icon-brand": "var(--color-icon-brand)",
        "color-icon-neutral": "var(--color-icon-neutral)",
        "color-icon-accent": "var(--color-icon-accent)",
        "color-icon-link": "var(--color-icon-link)",
        "color-icon-visited": "var(--color-icon-visited)",
        "color-icon-info": "var(--color-icon-info)",
        "color-icon-danger": "var(--color-icon-danger)",
        "color-icon-attention": "var(--color-icon-attention)",
        "color-icon-positive": "var(--color-icon-positive)",

        // Background style
        "color-background-neutral-white": "var(--color-background-neutral-white)",
        "color-border-default": "var(--neutral-400)",
        "color-background-emphasis": "var(--color-background-emphasis)",
        "color-background-default": "var(--color-background-default)",
        "color-header-divider": "var(--color-header-divider)",
        "color-header-searchbar-bg": "var(--color-header-searchbar-bg)",
        "color-background-disabled": "var(--color-background-disabled)",
        "color-background-inverse": "var(--color-background-inverse)",
        "color-background-brand-emphasis": "var(--color-background-brand-emphasis)",
        "color-background-brand-muted": "var(--color-background-brand-muted)",
        "color-background-neutral-emphasis": "var(--color-background-neutral-emphasis)",
        "color-background-neutral-muted": "var(--color-background-neutral-muted)",
        "color-background-accent-emphasis": "var(--color-background-accent-emphasis)",
        "color-background-accent-muted": "var(--color-background-accent-muted)",
        "color-background-link-emphasis": "var(--color-background-link-emphasis)",
        "color-background-link-muted": "var(--color-background-link-muted)",
        "color-background-visited-emphasis": "var(--color-background-visited-emphasis)",
        "color-background-visited-muted": "var(--color-background-visited-muted)",
        "color-background-info-emphasis": "var(--color-background-info-emphasis)",
        "color-background-info-muted": "var(--color-background-info-muted)",
        "color-background-danger-emphasis": "var(--color-background-danger-emphasis)",
        "color-background-danger-muted": "var(--color-background-danger-muted)",
        "color-background-attention-emphasis": "var(--color-background-attention-emphasis)",
        "color-background-attention-muted": "var(--color-background-attention-muted)",
        "color-background-warning-muted": "var(--color-background-warning-muted)",
        "color-background-positive-emphasis": "var(--color-background-positive-emphasis)",
        "color-background-positive-muted": "var(--color-background-positive-muted)",
        "color-border-emphasis": "var(--color-border-emphasis)",
        "color-border-default": "var(--color-border-default)",
        "color-border-muted": "var(--color-border-muted)",
        "color-border-disabled": "var(--color-border-disabled)",
        "color-border-inverse": "var(--color-border-inverse)",
        "color-border-focus": "var(--color-border-focus)",
        "color-border-brand": "var(--color-border-brand)",
        "color-border-neutral": "var(--color-border-neutral)",
        "color-border-accent": "var(--color-border-accent)",
        "color-border-link": "var(--color-border-link)",
        "color-border-visited": "var(--color-border-visited)",
        "color-border-info": "var(--color-border-info)",
        "color-border-danger": "var(--color-border-danger)",
        "color-border-attention": "var(--color-border-attention)",
        "color-border-warning": "var(--color-border-warning)",
        "color-border-positive": "var(--color-border-positive)",

        // --- BUTTON STYLES ---
        // "primary-bg-default": "var(--primary-bg-default)",
        // "primary-bg-hover": "var(--primary-bg-hover)",

        /* === Button tokens === */
        button: {
          // Primary
          "primary-bg-default": "var(--button-primary-bg-default)",
          "primary-bg-hover": "var(--button-primary-bg-hover)",
          "primary-bg-disabled": "var(--button-primary-bg-disabled)",
          "primary-text": "var(--button-primary-text)",
          "primary-text-disabled": "var(--button-primary-text-disabled)",
          "primary-icon": "var(--button-primary-icon)",
          "primary-icon-disabled": "var(--button-primary-icon-disabled)",

          // Outline
          "outline-border": "var(--color-button-outline-border)",
          "outline-bg-default": "var(--color-button-outline-bg-default)",
          "outline-bg-hover": "var(--color-button-outline-bg-hover)",
          "outline-bg-disabled": "var(--color-button-outline-bg-disabled)",
          "outline-text": "var(--color-button-outline-text)",
          "outline-text-disabled": "var(--color-button-outline-text-disabled)",
          "outline-icon": "var(--color-button-outline-icon)",
          "outline-icon-disabled": "var(--color-button-outline-icon-disabled)",

          // Ghost
          "ghost-bg-hover": "var(--button-ghost-bg-hover)",
          "ghost-text": "var(--button-ghost-text)",
          "ghost-text-disabled": "var(--button-ghost-text-disabled)",
          "ghost-icon": "var(--button-ghost-icon)",
          "ghost-icon-disabled": "var(--button-ghost-icon-disabled)",

          // Danger
          "danger-bg-default": "var(--button-danger-bg-default)",
          "danger-bg-hover": "var(--button-danger-bg-hover)",
          "danger-bg-disabled": "var(--button-danger-bg-disabled)",
          "danger-text": "var(--button-danger-text)",
          "danger-text-disabled": "var(--button-danger-text-disabled)",
          "danger-icon": "var(--button-danger-icon)",
          "danger-icon-disabled": "var(--button-danger-icon-disabled)",

          // Danger Outline
          "danger-outline-border": "var(--color-button-danger-outline-border)",
          "danger-outline-bg-default": "var(--color-button-danger-outline-bg-default)",
          "danger-outline-bg-hover": "var(--color-button-danger-outline-bg-hover)",
          "danger-outline-bg-disabled": "var(--color-button-danger-outline-bg-disabled)",
          "danger-outline-text": "var(--color-button-danger-outline-text)",
          "danger-outline-text-disabled": "var(--color-button-danger-outline-text-disabled)",
          "danger-outline-icon": "var(--color-button-danger-outline-icon)",
          "danger-outline-icon-disabled": "var(--color-button-danger-outline-icon-disabled)",

          // Danger Ghost
          "danger-ghost-bg-hover": "var(--button-danger-ghost-bg-hover)",
          "danger-ghost-text": "var(--button-danger-ghost-text)",
          "danger-ghost-text-disabled": "var(--button-danger-ghost-text-disabled)",
          "danger-ghost-icon": "var(--button-danger-ghost-icon)",
          "danger-ghost-icon-disabled": "var(--button-danger-ghost-icon-disabled)",
        },

        /* === Header tokens === */
        header: {
          background: "var(--header-background)",
          divider: "var(--header-divider)",
          "action-bg-default": "var(--header-action-bg-default)",
          "action-bg-hover": "var(--header-action-bg-hover)",
          "action-text": "var(--header-action-text)",
          "action-icon": "var(--header-action-icon)",
          "badge-dot-bg": "var(--header-badge-dot-bg)",
          "badge-count-bg": "var(--header-badge-count-bg)",
          "badge-count-text": "var(--header-badge-count-text)",
        },

        /* === Footer tokens === */
        footer: {
          background: "var(--footer-background)",
          divider: "var(--footer-divider)",
        },

        // Deprecated classes
        "color-primary-main": "var(--color-deprecated-color-primary-main)",
        "color-primary-hover": "var(--color-deprecated-color-primary-hover)",
        "color-primary-disabled": "var(--color-deprecated-color-primary-disabled)",

        "color-secondary-main": "var(--color-deprecated-color-secondary-main)",
        "color-secondary-hover": "var(--color-deprecated-color-secondary-hover)",
        "color-secondary-disabled": "var(--color-deprecated-color-secondary-disabled)",

        "color-accent-main": "var(--color-deprecated-color-accent-main)",
        "color-accent-dark": "var(--color-deprecated-color-accent-dark)",
        "color-accent-light": "var(--color-deprecated-color-accent-light)",

        "color-background-none": "var(--color-deprecated-color-background-none)",
        "color-background-l1": "var(--color-deprecated-color-background-l1)",
        "color-background-l2": "var(--color-deprecated-color-background-l2)",
        "color-background-l3": "var(--color-deprecated-color-background-l3)",
        "color-background-l4": "var(--color-deprecated-color-background-l4)",
        "color-background-l5": "var(--color-deprecated-color-background-l5)",
        "color-background-l6": "var(--color-deprecated-color-background-l6)",
        "color-background-l7": "var(--color-deprecated-color-background-l7)",
        "color-background-l8": "var(--color-deprecated-color-background-l8)",
        "color-background-overlay": "var(--color-deprecated-color-background-overlay)",
        "color-background-brand": "var(--color-deprecated-color-background-brand)",

        "color-text-body": "var(--color-deprecated-color-text-body)",
        "color-text-placeholder": "var(--color-deprecated-color-text-placeholder)",
        "color-text-disabled": "var(--color-deprecated-color-text-disabled)",
        "color-text-on-dark": "var(--color-deprecated-color-text-on-dark)",
        "color-text-on-brand": "var(--color-deprecated-color-text-on-brand)",

        "color-neutral-main": "var(--color-deprecated-color-neutral-main)",
        "color-neutral-disabled": "var(--color-deprecated-color-neutral-disabled)",
        "color-neutral-hover": "var(--color-deprecated-color-neutral-hover)",

        "color-system-warning-extra-light":
          "var(--color-deprecated-color-system-warning-extra-light)",
        "color-system-warning-light": "var(--color-deprecated-color-system-warning-light)",
        "color-system-warning-main": "var(--color-deprecated-color-system-warning-main)",
        "color-system-warning-dark": "var(--color-deprecated-color-system-warning-dark)",

        "color-system-info-extra-light": "var(--color-deprecated-color-system-info-extra-light)",
        "color-system-info-light": "var(--color-deprecated-color-system-info-light)",
        "color-system-info-main": "var(--color-deprecated-color-system-info-main)",
        "color-system-info-dark": "var(--color-deprecated-color-system-info-dark)",

        "color-system-success-extra-light":
          "var(--color-deprecated-color-system-success-extra-light)",
        "color-system-success-light": "var(--color-deprecated-color-system-success-light)",
        "color-system-success-main": "var(--color-deprecated-color-system-success-main)",
        "color-system-success-dark": "var(--color-deprecated-color-system-success-dark)",

        "color-system-error-extra-light": "var(--color-deprecated-color-system-error-extra-light)",
        "color-system-error-light": "var(--color-deprecated-color-system-error-light)",
        "color-system-error-main": "var(--color-deprecated-color-system-error-main)",
        "color-system-error-dark": "var(--color-deprecated-color-system-error-dark)",

        "color-hover-action-primary": "var(--color-deprecated-color-hover-action-primary)",
        "color-hover-action-error": "var(--color-deprecated-color-hover-action-error)",

        "color-scroll-fade-white": "var(--color-deprecated-color-scroll-fade-white)",
        "color-scroll-fade-l1": "var(--color-deprecated-color-scroll-fade-l1)",
        "color-scroll-fade-l2": "var(--color-deprecated-color-scroll-fade-l2)",
        "color-scroll-fade-l3": "var(--color-deprecated-color-scroll-fade-l3)",

        // Legacy colors (keeping for backward compatibility)
        primary: {
          0: "var(--color-primary-0)",
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
        },
        secondary: {
          0: "var(--color-secondary-0)",
          50: "var(--color-secondary-50)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
          900: "var(--color-secondary-900)",
          950: "var(--color-secondary-950)",
        },
        tertiary: {
          50: "var(--color-tertiary-50)",
          100: "var(--color-tertiary-100)",
          200: "var(--color-tertiary-200)",
          300: "var(--color-tertiary-300)",
          400: "var(--color-tertiary-400)",
          500: "var(--color-tertiary-500)",
          600: "var(--color-tertiary-600)",
          700: "var(--color-tertiary-700)",
          800: "var(--color-tertiary-800)",
          900: "var(--color-tertiary-900)",
          950: "var(--color-tertiary-950)",
        },
        error: {
          0: "var(--color-error-0)",
          50: "var(--color-error-50)",
          100: "var(--color-error-100)",
          200: "var(--color-error-200)",
          300: "var(--color-error-300)",
          400: "var(--color-error-400)",
          500: "var(--color-error-500)",
          600: "var(--color-error-600)",
          700: "var(--color-error-700)",
          800: "var(--color-error-800)",
          900: "var(--color-error-900)",
          950: "var(--color-error-950)",
        },
        success: {
          0: "var(--color-success-0)",
          50: "var(--color-success-50)",
          100: "var(--color-success-100)",
          200: "var(--color-success-200)",
          300: "var(--color-success-300)",
          400: "var(--color-success-400)",
          500: "var(--color-success-500)",
          600: "var(--color-success-600)",
          700: "var(--color-success-700)",
          800: "var(--color-success-800)",
          900: "var(--color-success-900)",
          950: "var(--color-success-950)",
        },
        warning: {
          0: "var(--color-warning-0)",
          50: "var(--color-warning-50)",
          100: "var(--color-warning-100)",
          200: "var(--color-warning-200)",
          300: "var(--color-warning-300)",
          400: "var(--color-warning-400)",
          500: "var(--color-warning-500)",
          600: "var(--color-warning-600)",
          700: "var(--color-warning-700)",
          800: "var(--color-warning-800)",
          900: "var(--color-warning-900)",
          950: "var(--color-warning-950)",
        },
        info: {
          0: "var(--color-info-0)",
          50: "var(--color-info-50)",
          100: "var(--color-info-100)",
          200: "var(--color-info-200)",
          300: "var(--color-info-300)",
          400: "var(--color-info-400)",
          500: "var(--color-info-500)",
          600: "var(--color-info-600)",
          700: "var(--color-info-700)",
          800: "var(--color-info-800)",
          900: "var(--color-info-900)",
          950: "var(--color-info-950)",
        },
        typography: {
          0: "var(--color-typography-0)",
          50: "var(--color-typography-50)",
          100: "var(--color-typography-100)",
          200: "var(--color-typography-200)",
          300: "var(--color-typography-300)",
          400: "var(--color-typography-400)",
          500: "var(--color-typography-500)",
          600: "var(--color-typography-600)",
          700: "var(--color-typography-700)",
          800: "var(--color-typography-800)",
          900: "var(--color-typography-900)",
          950: "var(--color-typography-950)",
          white: "#FFFFFF",
          gray: "#D4D4D4",
          black: "#181718",
        },
        outline: {
          0: "var(--color-outline-0)",
          50: "var(--color-outline-50)",
          100: "var(--color-outline-100)",
          200: "var(--color-outline-200)",
          300: "var(--color-outline-300)",
          400: "var(--color-outline-400)",
          500: "var(--color-outline-500)",
          600: "var(--color-outline-600)",
          700: "var(--color-outline-700)",
          800: "var(--color-outline-800)",
          900: "var(--color-outline-900)",
          950: "var(--color-outline-950)",
        },
        background: {
          0: "var(--color-background-0)",
          50: "var(--color-background-50)",
          100: "var(--color-background-100)",
          200: "var(--color-background-200)",
          300: "var(--color-background-300)",
          400: "var(--color-background-400)",
          500: "var(--color-background-500)",
          600: "var(--color-background-600)",
          700: "var(--color-background-700)",
          800: "var(--color-background-800)",
          900: "var(--color-background-900)",
          950: "var(--color-background-950)",
          error: "var(--color-background-error)",
          warning: "var(--color-background-warning)",
          muted: "var(--color-background-muted)",
          success: "var(--color-background-success)",
          info: "var(--color-background-info)",
          light: "#FBFBFB",
          dark: "#181719",
        },
        border: {
          0: "var(--color-border-0)",
          50: "var(--color-border-50)",
          100: "var(--color-border-100)",
          200: "var(--color-border-200)",
          300: "var(--color-border-300)",
          400: "var(--color-border-400)",
          500: "var(--color-border-500)",
          600: "var(--color-border-600)",
          700: "var(--color-border-700)",
          800: "var(--color-border-800)",
          900: "var(--color-border-900)",
          950: "var(--color-border-950)",
          error: "var(--color-border-error)",
          warning: "var(--color-border-warning)",
          muted: "var(--color-border-muted)",
          success: "var(--color-border-success)",
          info: "var(--color-border-info)",
          light: "#FBFBFB",
          dark: "#181719",
        },
      },
      spacing: {
        // Space tokens from Layout.Space (8pt grid)
        "space-none": "var(--space-none)",
        "space-2xs": "var(--space-2xs)",
        "space-xs": "var(--space-xs)",
        "space-sm": "var(--space-sm)",
        "space-md": "var(--space-md)",
        "space-lg": "var(--space-lg)",
        "space-xl": "var(--space-xl)",
        "space-2xl": "var(--space-2xl)",
        "space-3xl": "var(--space-3xl)",
        "space-4xl": "var(--space-4xl)",
      },
      borderRadius: {
        // Border radius tokens from Layout.BorderRadius
        "radius-none": "var(--border-radius-none)",
        "radius-small": "var(--border-radius-small)",
        "radius-medium": "var(--border-radius-medium)",
        "radius-large": "var(--border-radius-large)",
        "radius-full": "var(--border-radius-full)",
      },
      width: {
        // Layout width tokens from Layout.Sizing
        "layout-header": "var(--layout-width-header)",
        "layout-content": "var(--layout-width-content)",
        "layout-footer": "var(--layout-width-footer)",
        "layout-text": "var(--layout-width-text)",
        "layout-sidepanel": "var(--layout-width-sidepanel)",
        // Icon size tokens from Layout.IconSize
        "icon-xs": "var(--icon-xs)",
        "icon-sm": "var(--icon-sm)",
        "icon-md": "var(--icon-md)",
        "icon-lg": "var(--icon-lg)",
        "icon-display": "var(--icon-display)",
      },
      height: {
        // Navigation height tokens from Layout.Sizing
        "nav-desktop": "var(--nav-height-desktop)",
        "nav-mobile": "var(--nav-height-mobile)",
        // Icon size tokens from Layout.IconSize
        "icon-xs": "var(--icon-xs)",
        "icon-sm": "var(--icon-sm)",
        "icon-md": "var(--icon-md)",
        "icon-lg": "var(--icon-lg)",
        "icon-display": "var(--icon-display)",
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        Overpass: ["var(--font-overpass)"],
        "Overpass Mono": ["var(--font-overpass-mono)"],
        Anton: ["var(--font-anton)"],
        Oswald: ["var(--font-oswald)"],
        "Chivo Mono": ["var(--font-chivo-mono)"],
        "Public sans": ["var(--font-public-sans)"],
      },
      fontWeight: {
        hairline: "100",
        extraBlack: "950",
      },
      fontSize: {
        "fluid-catgoryies": "clamp(15px, 20px, 25px)",
        "fluid-catgoryies-sub": "clamp(4px, 16px, 20px)",
        "2xs": "10px",
      },
      border: {
        2: "2px",
      },
      backgroundImage: {
        // "hero-1": "url('/assets/bg.jpg')",
        // "hero-2": "url('/assets/bg1.png')",
        "hero-n-1": "url('/assets/hero-bg/bg1-min-n.webp')",
        "hero-n-2": "url('/assets/hero-bg/bg2-min-n.webp')",
        "hero-n-3": "url('/assets/hero-bg/bg3-min-n.webp')",
        "hero-n-4": "url('/assets/hero-bg/bg4-min-n.webp')",
        "hero-n-5": "url('/assets/hero-bg/bg5-min-n.webp')",
        "og-search-hero-image": "url('/assets/og-search/og-search-bg-image.png')",
        "eb-panel-hero-image": "url('/assets/eb-panel/eb-panel-bg-image.png')",
        "car-detail-default": "url('/assets/search/final-step-car.png')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      clipPath: {
        "top-left-bottom-right": `polygon(
              0 2.9rem,
              4.4rem 0,
              100% 0,
              100% calc(100% - 3.2rem),
              calc(100% - 6.4rem) 100%,
              0 100%
            )`,
      },
      scale: {
        80: "0.8",
      },
      transformOrigin: {
        left: "0% 50%",
        right: "100% 50%",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities(
        {
          ".clip-top-left-bottom-right": {
            clipPath: `polygon(
              0 2.9rem,
              4.4rem 0,
              100% 0,
              100% calc(100% - 3.2rem),
              calc(100% - 6.4rem) 100%,
              0 100%
            )`,
          },
        },
        ["responsive", "hover"],
      );

      addUtilities({
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",
          /* Firefox */
          "scrollbar-width": "none",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
      addUtilities(
        {
          ".scrollbar-hide": {
            /* Firefox */
            "scrollbar-width": "none",
            /* IE + Edge */
            "-ms-overflow-style": "none",
          },
          ".scrollbar-hide::-webkit-scrollbar": {
            /* Chrome, Safari */
            display: "none",
          },
        },
        ["responsive"],
      );

      addUtilities(
        {
          ".clip-top-left-bottom-right-key-features": {
            clipPath: `polygon(
              0 0.6rem,
              0.8rem 0,
              100% 0,
              100% calc(100% - 0.9rem),
              calc(100% - 1.2rem) 100%,
              0 100%
            )`,
          },
        },
        ["responsive", "hover"],
      );
    },
    // Semantic Layout Usage Utility Classes
    function ({ addUtilities }) {
      addUtilities({
        // Section Gutter (Horizontal Padding)
        ".section-gutter": {
          "padding-left": "var(--section-gutter-h)",
          "padding-right": "var(--section-gutter-h)",
        },
        // Gap Stack (Vertical Spacing Between Sections)
        ".gap-stack": {
          gap: "var(--gap-section-to-section)",
        },
        // Gap Content to Footer
        ".gap-content-to-footer": {
          "margin-bottom": "var(--gap-content-to-footer)",
        },
        // Gap Panel to Content
        ".gap-panel-to-content": {
          gap: "var(--gap-panel-to-content)",
        },
        // Gap Header to Title
        ".gap-header-to-title": {
          "margin-top": "var(--gap-header-to-title)",
        },
        // Gap Title to Content
        ".gap-title-to-content": {
          "margin-bottom": "var(--gap-title-to-content)",
        },
        // Grid Gap Listing
        ".grid-gap-listing": {
          gap: "var(--grid-gap-listing)",
        },
        // Card Padding Compact
        ".card-padding-compact": {
          padding: "var(--card-padding-compact)",
        },
        // Card Gap Compact
        ".card-gap-compact": {
          gap: "var(--card-gap-compact)",
        },
        // Card Padding Default
        ".card-padding-default": {
          padding: "var(--card-padding-default)",
        },
        // Card Gap Default
        ".card-gap-default": {
          gap: "var(--card-gap-default)",
        },
        // Card Padding Hero Bottom
        ".card-padding-hero-btm": {
          "padding-bottom": "var(--card-padding-hero-btm)",
        },
        // Header Padding Vertical
        ".header-padding-v": {
          "padding-left": "var(--header-padding-v)",
          "padding-right": "var(--header-padding-v)",
        },
        // Hero Padding Horizontal
        ".hero-padding-h": {
          "padding-left": "var(--hero-padding-h)",
          "padding-right": "var(--hero-padding-h)",
        },
        // Hero Gap Internal
        ".hero-gap-internal": {
          gap: "var(--hero-gap-internal)",
        },
        // Modal Padding Header
        ".modal-padding-header": {
          padding: "var(--modal-padding-header)",
        },
        // Modal Padding Content Vertical
        ".modal-padding-content-v": {
          "padding-top": "var(--modal-padding-content-v)",
          "padding-bottom": "var(--modal-padding-content-v)",
        },
        // Modal Padding Content Horizontal
        ".modal-padding-content-h": {
          "padding-left": "var(--modal-padding-content-h)",
          "padding-right": "var(--modal-padding-content-h)",
        },
        // Modal Gap Internal
        ".modal-gap-internal": {
          gap: "var(--modal-gap-internal)",
        },
        // Gap Input to Label
        ".gap-input-to-label": {
          "margin-bottom": "var(--gap-input-to-label)",
        },
        // Gap Form Row
        ".gap-form-row": {
          "margin-bottom": "var(--gap-form-row)",
        },
        // Radius Input
        ".radius-input": {
          "border-radius": "var(--radius-input)",
        },
        // Radius Card
        ".radius-card": {
          "border-radius": "var(--radius-card)",
        },
        // Radius Modal
        ".radius-modal": {
          "border-radius": "var(--radius-modal)",
        },
        // Sizing Tokens - Layout Widths (max-width)
        ".layout-width-header": {
          "max-width": "var(--layout-width-header)",
        },
        ".layout-width-content": {
          "max-width": "var(--layout-width-content)",
        },
        ".layout-width-footer": {
          "max-width": "var(--layout-width-footer)",
        },
        ".layout-width-text": {
          "max-width": "var(--layout-width-text)",
        },
        // Sizing Tokens - Layout Widths (width)
        ".layout-width-sidepanel": {
          width: "var(--layout-width-sidepanel)",
        },
        // Sizing Tokens - Navigation Heights
        ".nav-height-desktop": {
          height: "var(--nav-height-desktop)",
        },
        ".nav-height-mobile": {
          height: "var(--nav-height-mobile)",
        },
      });
    },
    // Section-Based Layout Templates
    function ({ addUtilities }) {
      addUtilities({
        // ====================================================================
        // 1. PAGE WRAPPER (Vertical Rhythm)
        // ====================================================================
        ".page-wrapper": {
          width: "100%",
          display: "flex",
          "flex-direction": "column",
          // Applies the 32px (M) / 64px (D) gap between major sections
          gap: "var(--gap-section-to-section)",
          // Applies the 64px (M) / 80px (D) buffer before footer
          "padding-bottom": "var(--gap-content-to-footer)",
        },
        // ====================================================================
        // 2. BASE SECTION UTILITY (Horizontal Rhythm)
        // ====================================================================
        ".section-base": {
          width: "100%",
          "margin-left": "auto",
          "margin-right": "auto",
          // Applies the 12px (M) / 40px (D) horizontal gutter
          "padding-left": "var(--section-gutter-h)",
          "padding-right": "var(--section-gutter-h)",
        },
        // ====================================================================
        // 3. STANDARD SECTION
        // ====================================================================
        ".section-standard": {
          width: "100%",
          "margin-left": "auto",
          "margin-right": "auto",
          "padding-left": "var(--section-gutter-h)",
          "padding-right": "var(--section-gutter-h)",
          "max-width": "var(--layout-width-content)", // 1200px
        },
        // ====================================================================
        // 4. TEXT SECTION
        // ====================================================================
        ".section-text": {
          width: "100%",
          "margin-left": "auto",
          "margin-right": "auto",
          "padding-left": "var(--section-gutter-h)",
          "padding-right": "var(--section-gutter-h)",
          "max-width": "var(--layout-width-text)", // 640px
        },
        // ====================================================================
        // 5. SPLIT LAYOUT: PRIMARY LEFT (Filters/Search)
        // ====================================================================
        ".section-split-primary-left": {
          width: "100%",
          "margin-left": "auto",
          "margin-right": "auto",
          "padding-left": "var(--section-gutter-h)",
          "padding-right": "var(--section-gutter-h)",
          "max-width": "var(--layout-width-content)",
          display: "flex",
          "flex-direction": "column",
          gap: "var(--gap-panel-to-content)", // 24px (M) / 32px (D)
        },
        // ====================================================================
        // 6. SPLIT LAYOUT: PRIMARY RIGHT (Checkout/Cart)
        // ====================================================================
        ".section-split-primary-right": {
          width: "100%",
          "margin-left": "auto",
          "margin-right": "auto",
          "padding-left": "var(--section-gutter-h)",
          "padding-right": "var(--section-gutter-h)",
          "max-width": "var(--layout-width-content)",
          display: "flex",
          "flex-direction": "column",
          gap: "var(--gap-panel-to-content)", // 24px (M) / 32px (D)
        },
        // ====================================================================
        // 7. VIEWPORT CENTER (404/Status Pages)
        // ====================================================================
        ".section-viewport-center": {
          width: "100%",
          "max-width": "var(--layout-width-text)", // 640px
          "margin-left": "auto",
          "margin-right": "auto",
          // Center vertically occupying full viewport minus header
          "min-height": "calc(100dvh - var(--nav-height))",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          "text-align": "center",
          // The 12px spacing requirement for icon + text stack
          gap: "var(--space-sm)", // 12px
          // Prevent edge touching on mobile
          "padding-left": "var(--section-gutter-h)",
          "padding-right": "var(--section-gutter-h)",
        },
        // ====================================================================
        // 8. STATUS ICON HELPER (for viewport center)
        // ====================================================================
        ".status-icon": {
          width: "var(--icon-display)", // 120px
          height: "var(--icon-display)",
          "flex-shrink": "0",
        },
      });
    },
    gluestackPlugin,
    rippleEffectPlugin,
    require("tailwind-scrollbar"),
    // Custom typography plugin with dynamic CSS custom properties
    function ({ addUtilities }) {
      const typographyUtilities = {
        // Heading styles
        ".h1": {
          "font-family": "var(--font-family-display)",
          "font-weight": "var(--font-weight-regular)",
          "font-size": "var(--font-size-3xl-deprecated)",
          "line-height": "var(--font-line-height-xl-deprecated)",
        },
        ".h2": {
          "font-family": "var(--font-family-display)",
          "font-weight": "var(--font-weight-regular)",
          "font-size": "var(--font-size-2xl-deprecated)",
          "line-height": "var(--font-line-height-lg-deprecated)",
        },
        ".h3": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-bold)",
          "font-size": "var(--font-size-xl-deprecated)",
          "line-height": "var(--font-line-height-md-deprecated)",
        },

        // Body styles - Bold
        ".body-bold-xs": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-bold)",
          "font-size": "var(--font-size-xs-deprecated)",
          "line-height": "var(--font-line-height-xs-deprecated)",
        },
        ".body-bold-sm": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-bold)",
          "font-size": "var(--font-size-sm-deprecated)",
          "line-height": "var(--font-line-height-sm-deprecated)",
        },
        ".body-bold-md": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-bold)",
          "font-size": "var(--font-size-md-deprecated)",
          "line-height": "var(--font-line-height-md-deprecated)",
        },
        ".body-bold-lg": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-bold)",
          "font-size": "var(--font-size-lg-deprecated)",
          "line-height": "var(--font-line-height-lg-deprecated)",
        },

        // Body styles - Medium
        ".body-medium-xs": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-medium)",
          "font-size": "var(--font-size-xs-deprecated)",
          "line-height": "var(--font-line-height-xs-deprecated)",
        },
        ".body-medium-sm": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-medium)",
          "font-size": "var(--font-size-sm-deprecated)",
          "line-height": "var(--font-line-height-sm-deprecated)",
        },
        ".body-medium-md": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-medium)",
          "font-size": "var(--font-size-md-deprecated)",
          "line-height": "var(--font-line-height-md-deprecated)",
        },
        ".body-medium-lg": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-medium)",
          "font-size": "var(--font-size-lg-deprecated)",
          "line-height": "var(--font-line-height-lg-deprecated)",
        },

        // Body styles - Regular
        ".body-regular-xs": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-regular)",
          "font-size": "var(--font-size-xs-deprecated)",
          "line-height": "var(--font-line-height-xs-deprecated)",
        },
        ".body-regular-sm": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-regular)",
          "font-size": "var(--font-size-sm-deprecated)",
          "line-height": "var(--font-line-height-sm-deprecated)",
        },
        ".body-regular-md": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-regular)",
          "font-size": "var(--font-size-md-deprecated)",
          "line-height": "var(--font-line-height-md-deprecated)",
        },
        ".body-regular-lg": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-regular)",
          "font-size": "var(--font-size-lg-deprecated)",
          "line-height": "var(--font-line-height-lg-deprecated)",
        },

        // Semantic text styles
        ".text-single-300-regular": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-regular)",
          "font-size": "var(--font-size-lg-deprecated)",
          "line-height": "var(--font-line-height-lg-deprecated)",
        },
        ".text-single-300-medium": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-medium)",
          "font-size": "var(--font-size-lg-deprecated)",
          "line-height": "var(--font-line-height-lg-deprecated)",
        },
        ".text-single-300-bold": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-bold)",
          "font-size": "var(--font-size-lg-deprecated)",
          "line-height": "var(--font-line-height-lg-deprecated)",
        },
        ".text-single-200-regular": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-regular)",
          "font-size": "var(--font-size-md-deprecated)",
          "line-height": "var(--font-line-height-md-deprecated)",
        },
        ".text-single-200-medium": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-medium)",
          "font-size": "var(--font-size-md-deprecated)",
          "line-height": "var(--font-line-height-md-deprecated)",
        },
        ".text-single-200-bold": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-bold)",
          "font-size": "var(--font-size-md-deprecated)",
          "line-height": "var(--font-line-height-md-deprecated)",
        },
        ".text-single-100-regular": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-regular)",
          "font-size": "var(--font-size-sm-deprecated)",
          "line-height": "var(--font-line-height-sm-deprecated)",
        },
        ".text-single-100-medium": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-medium)",
          "font-size": "var(--font-size-sm-deprecated)",
          "line-height": "var(--font-line-height-sm-deprecated)",
        },
        ".text-single-100-bold": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-bold)",
          "font-size": "var(--font-size-sm-deprecated)",
          "line-height": "var(--font-line-height-sm-deprecated)",
        },
        ".text-single-50-regular": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-regular)",
          "font-size": "var(--font-size-xs-deprecated)",
          "line-height": "var(--font-line-height-xs-deprecated)",
        },
        ".text-single-50-medium": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-medium)",
          "font-size": "var(--font-size-xs-deprecated)",
          "line-height": "var(--font-line-height-xs-deprecated)",
        },
        ".text-single-50-bold": {
          "font-family": "var(--font-family-body)",
          "font-weight": "var(--font-weight-bold)",
          "font-size": "var(--font-size-xs-deprecated)",
          "line-height": "var(--font-line-height-xs-deprecated)",
        },

        // new classes
        /* ==================================================================== */
        /* 1. NEW CORE TYPOGRAPHY SYSTEM CLASSES (Primary Source of Truth)      */
        /* Use these classes for all new components.                            */
        /* ==================================================================== */

        /* --- Display Styles (family: Anton) --- */
        ".typography-display-01": {
          /* display/display-01: 3xl, snug (1.25), wider (0.01em), regular */
          "font-family": "var(--font-family-display)",
          "font-size": "var(--font-size-3xl)",
          "line-height": "var(--font-line-height-snug)",
          "letter-spacing": "var(--font-letter-spacing-wider)",
          "font-weight": "var(--font-weight-regular)",
        },

        /* --- Heading Styles (family: Overpass / heading) --- */
        ".typography-heading-01": {
          /* heading/heading-01: 2xl, snug (1.25), wider (0.01em), regular (NOTE: uses display family) */
          "font-family": "var(--font-family-display)",
          "font-size": "var(--font-size-2xl)",
          "line-height": "var(--font-line-height-snug)",
          "letter-spacing": "var(--font-letter-spacing-wider)",
          "font-weight": "var(--font-weight-regular)",
          "size-adjust": "var(--font-size-2xl)",
          "ascent-override": "var(--font-line-height-snug)",
          "descent-override": "var(--font-line-height-snug)",
        },

        ".typography-heading-02": {
          /* heading/heading-02: xl, standard (1.4), normal (0em), semibold */
          "font-family": "var(--font-family-heading)",
          "font-size": "var(--font-size-xl)",
          "line-height": "var(--font-line-height-standard)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-semibold)",
          "size-adjust": "var(--font-size-2xl)",
          "ascent-override": "var(--font-line-height-spacious)",
          "descent-override": "var(--font-line-height-spacious)",
        },

        ".typography-heading-03": {
          /* heading/heading-03: lg, standard (1.4), normal (0em), semibold */
          "font-family": "var(--font-family-heading)",
          "font-size": "var(--font-size-lg)",
          "line-height": "var(--font-line-height-standard)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-semibold)",
          "size-adjust": "var(--font-size-2xl)",
          "ascent-override": "var(--font-line-height-spacious)",
          "descent-override": "var(--font-line-height-spacious)",
        },

        ".typography-heading-04": {
          /* heading/heading-04: md, spacious (1.6), normal (0em), bold */
          "font-family": "var(--font-family-heading)",
          "font-size": "var(--font-size-md)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-bold)",
          "size-adjust": "var(--font-size-2xl)",
          "ascent-override": "var(--font-line-height-spacious)",
          "descent-override": "var(--font-line-height-spacious)",
        },

        /* --- Subtitle Styles (family: Overpass / body) --- */
        ".typography-subtitle-01": {
          /* subtitle/subtitle-01: md, spacious (1.6), wider (0.01em), semibold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-md)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-wider)",
          "font-weight": "var(--font-weight-semibold)",
        },

        ".typography-subtitle-02": {
          /* subtitle/subtitle-02: sm, spacious (1.6), wider (0.01em), semibold */
          "font-family": "var(--font-family-body)",
          " font-size": "var(--font-size-sm)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-wider)",
          "font-weight": "var(--font-weight-semibold)",
          "size-adjust": "var(--font-size-2xl)",
          "ascent-override": "var(--font-line-height-spacious)",
          "descent-override": "var(--font-line-height-spacious)",
        },

        /* --- Body Styles (family: Overpass / body) --- */
        ".button-button-01": {
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-sm)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-regular)",
        },
        ".typography-body-01": {
          /* body/body-01: md, spacious (1.6), normal (0em), regular */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-md)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-regular)",
          "size-adjust": "var(--font-size-2xl)",
          "ascent-override": "var(--font-line-height-spacious)",
          "descent-override": "var(--font-line-height-spacious)",
        },

        ".typography-body-02": {
          /* body/body-02: sm, spacious (1.6), normal (0em), regular */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-sm)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-regular)",
          "size-adjust": "var(--font-size-2xl)",
          "ascent-override": "var(--font-line-height-spacious)",
          "descent-override": "var(--font-line-height-spacious)",
        },

        ".typography-body-strong-01": {
          /* body/body-strong-01: md, spacious (1.6), normal (0em), semibold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-md)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-semibold)",
          "size-adjust": "var(--font-size-2xl)",
          "ascent-override": "var(--font-line-height-spacious)",
          "descent-override": "var(--font-line-height-spacious)",
        },

        ".typography-body-strong-02": {
          /* body/body-strong-02: sm, spacious (1.6), normal (0em), semibold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-sm)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-semibold)",
          "size-adjust": "var(--font-size-2xl)",
          "ascent-override": "var(--font-line-height-spacious)",
          "descent-override": "var(--font-line-height-spacious)",
        },

        /* --- Button Styles (family: Overpass / body) --- */
        ".typography-button-01": {
          /* button/button-01: sm, spacious (1.6), normal (0em), semibold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-sm)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-semibold)",
        },

        ".typography-button-02": {
          /* button/button-02: xs, spacious (1.6), normal (0em), semibold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-xs)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-semibold)",
        },

        /* --- Caption & Utility Styles (family: Overpass / body) --- */
        ".typography-caption": {
          /* caption/caption: xs, standard (1.4), wider (0.01em), regular */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-xs)",
          "line-height": "var(--font-line-height-standard)",
          "letter-spacing": "var(--font-letter-spacing-wider)",
          "font-weight": "var(--font-weight-regular)",
        },

        ".typography-overline": {
          /* overline/overline: xs, standard (1.4), normal (0em), semibold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-xs)",
          "line-height": "var(--font-line-height-standard)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-semibold)",
        },

        /* --- Link Styles (family: Overpass / body) --- */
        ".typography-link-01": {
          /* link/link-01: md, spacious (1.6), wide (0.005em), medium */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-md)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-wide)",
          "font-weight": "var(--font-weight-medium)",
        },

        ".typography-link-02": {
          /* link/link-02: sm, spacious (1.6), normal (0em), medium */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-sm)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-medium)",
        },

        ".typography-link-03": {
          /* link/link-02: sm, spacious (1.6), normal (0em), medium */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-xs)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-medium)",
        },

        /* --- Mono Styles (family: Overpass Mono / mono) --- */
        ".typography-mono-caption": {
          /* mono/caption: xs, spacious (1.6), normal (0em), semibold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-xs)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-semibold)",
        },

        ".typography-mono-body-01": {
          /* mono/body-01: md, spacious (1.6), normal (0em), regular */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-md)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-regular)",
        },

        ".typography-mono-body-02": {
          /* mono/body-02: sm, spacious (1.6), normal (0em), regular */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-sm)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-regular)",
        },

        ".typography-mono-body-strong-01": {
          /* mono/body-strong-01: md, spacious (1.6), normal (0em), bold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-md)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-bold)",
        },

        ".typography-mono-body-strong-02": {
          /* mono/body-strong-02: sm, spacious (1.6), normal (0em), semibold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-sm)",
          "line-height": "var(--font-line-height-spacious)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-semibold)",
        },

        ".typography-mono-large": {
          /* mono/large: lg, standard (1.4), normal (0em), semibold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-lg)",
          "line-height": "var(--font-line-height-standard)",
          "letter-spacing": "var(--font-letter-spacing-normal)",
          "font-weight": "var(--font-weight-semibold)",
        },

        ".typography-mono-extra-large": {
          /* mono/extra-large: 2xl, snug (1.25), wider (0.01em), bold */
          "font-family": "var(--font-family-body)",
          "font-size": "var(--font-size-2xl)",
          "line-height": "var(--font-line-height-snug)",
          "letter-spacing": "var(--font-letter-spacing-wider)",
          "font-weight": "var(--font-weight-bold)",
        },
      };

      addUtilities(typographyUtilities);
    },
  ],
};
