// Client Configuration File - This file can be modified by clients
// Supports multiple stores and device modes
// Structure: Store -> Device -> Theme Values

import { STORE_IDS, DEFAULT_STORE, StoreId, isValidStoreId } from "./store-constants";

// Re-export StoreId as StoreName for backward compatibility
export type StoreName = StoreId;
export type DeviceMode = "mobile" | "desktop";

export type { FeatureFlags } from "./feature-flags.types";
export { FEATURE_FLAG_KEYS } from "./feature-flags.types";

// Ottogusto theme - Font/Weight, Font/Family, Font/LineHeight, Font/Size, and Color configuration
const ottogustoTheme = {
  Color: {
    Background: {
      white: "#FFFFFF",
    },
    Brand: {
      100: "#EAF6EF",
      200: "#A0CFB6",
      300: "#87C0A1",
      400: "#64AF87",
      500: "#4E9770",
      600: "#047C52",
      700: "#006341",
      800: "#0A4932",
      900: "#083C29",
      950: "#0C271D",
      Racing: {
        Green: "#006341",
      },
    },
    Accent: {
      100: "#FCF3DB",
      200: "#F9E7B8",
      300: "#F7DC94",
      400: "#F4D071",
      500: "#FFD31A",
      600: "#CAA921",
      700: "#91762E",
      800: "#604E1F",
      900: "#30270F",
      950: "#181307",
    },
    Neutral: {
      white: "#FFFFFF",
      black: "#000000",
      100: "#FAF9F6",
      200: "#F5F4F0",
      300: "#EBE9E2",
      400: "#E8E5DC",
      500: "#E1DED3",
      600: "#9C9886",
      700: "#6E6959",
      800: "#525049",
      900: "#28261F",
      950: "#1D1B16",
    },
    Info: {
      100: "#ECF3FD",
      200: "#CFDFF8",
      300: "#93B6EB",
      400: "#335CA4",
      500: "#00338D",
      600: "#002971",
      700: "#001F55",
      800: "#001438",
      900: "#000A1C",
      950: "#07120D",
    },
    Danger: {
      100: "#FFEAE6",
      200: "#FFD4CC",
      300: "#E87B6F",
      400: "#DB5046",
      500: "#CF2721",
      600: "#C20000",
      700: "#9C0005",
      800: "#750008",
      900: "#4F0008",
      950: "#2E0005",
    },
    Warning: {
      100: "#FCEDE0",
      200: "#F8D7BE",
      300: "#F0BE92",
      400: "#E6A368",
      500: "#DE7920",
      600: "#C46215",
      700: "#9C4C0A",
      800: "#6E3304",
      900: "#4B2103",
      950: "#281100",
    },
    Positive: {
      100: "#EEF6F4",
      200: "#DDEEE9",
      300: "#5CD697",
      400: "#17CF70",
      500: "#09BE61",
      600: "#009F4D",
      700: "#068443",
      800: "#036331",
      900: "#0E2519",
      950: "#08160F",
    },
    // OLD COLORS
    White: "#FFFFFF",
    Black: "#000000",
    Piston: {
      50: "#EDFCF3",
      100: "#D3F8E2",
      200: "#ACEFC9",
      300: "#75E0AB",
      400: "#3ECA89",
      500: "#1AAF6F",
      600: "#0C8E58",
      700: "#0B714A",
      800: "#0C5A3C",
      "900M": "#0A4932",
      950: "#042A1D",
      Muted: "#AEC1BA",
    },
    Racing: {
      50: "#ECFEF4",
      100: "#CDFDE2",
      200: "#A1F8CB",
      300: "#66EFB0",
      400: "#28DE91",
      500: "#08C47A",
      600: "#01A063",
      700: "#008052",
      "800M": "#016341",
      900: "#025338",
      950: "#012F20",
    },
    Traffic: {
      50: "#EDFFF5",
      100: "#D6FFEA",
      200: "#B0FFD5",
      300: "#71FFB6",
      400: "#30FB8F",
      500: "#00E56F",
      600: "#03BF58",
      "700M": "#009F4D",
      800: "#07753C",
      900: "#076034",
      950: "#00361C",
      Muted: "#BBD7C9",
    },
    Highway: {
      50: "#FEFCE8",
      100: "#FFFBC2",
      200: "#FFF386",
      300: "#FFE543",
      "400M": "#FFD31A",
      500: "#EEB801",
      600: "#CE8E00",
      700: "#A46504",
      800: "#884E0C",
      900: "#733F11",
      950: "#422105",
      Muted: "#FFFFFF",
    },
    Beige: {
      200: "#FCFCFB",
      600: "#F7F7F3",
      800: "#F2F1EB",
      "200-Overlay": "#FCFCFB",
      "200-Overlay-2": "#FCFCFB",
      "600-Overlay": "#F7F7F3",
      "800-Overlay": "#F2F1EB",
    },
    Chrome: {
      50: "#F5F4F0",
      200: "#EBE9E2",
      400: "#E1DED3",
      600: "#D7D3C5",
      800: "#CDC8B6",
    },
    Blue: {
      50: "#f0f0f0",
      100: "#DEEAF8",
      200: "#8DB7EA",
      300: "#3C91E6",
      400: "#3B78D2",
      "500M": "#707070",
      600: "#606060",
      700: "#505050",
      800: "#404040",
      900: "#303030",
      950: "#202020",
    },
    Green: {
      50: "#E5FEF6",
      100: "#E5FEF6",
      200: "#8AC0AE",
      300: "#026341",
      400: "#013B27",
      "500M": "#013B27",
      600: "#013B27",
      700: "#013B27",
      800: "#013B27",
      900: "#013B27",
      950: "#013B27",
    },
    Red: {
      50: "#FDEDEE",
      100: "#FDEDEE",
      200: "#E0868B",
      300: "#E84855",
      400: "#C83434",
      "500M": "#C83434",
      600: "#C83434",
      700: "#C83434",
      800: "#C83434",
      900: "#C83434",
      950: "#C83434",
    },
    Orange: {
      50: "#f0f0f0",
      100: "#FDF7EC",
      200: "#F3C980",
      300: "#F9A620",
      400: "#CF8D32",
      "500M": "#707070",
      600: "#606060",
      700: "#505050",
      800: "#404040",
      900: "#303030",
      950: "#202020",
    },
    Hovers: {
      // Main: "rgba(10, 73, 50, 0.3)",
      Main: "#AEC1BA",
      Error: "#EFBEBE",
    },
    Tarmac: {
      50: "#F0F9F4",
      100: "#DAF1E2",
      200: "#B7E3C9",
      300: "#87CEAA",
      400: "#54B284",
      500: "#359567",
      600: "#237852",
      700: "#1C6043",
      800: "#1A4C36",
      900: "#163F2E",
      "950M": "#0C271D",
    },
    Grey: {
      50: "#F5F6F5",
      100: "#E6E7E6",
      200: "#D0D2D0",
      300: "#ADB3B1",
      400: "#979E9B",
      500: "#68716E",
      600: "#5A605E",
      700: "#4C5250",
      800: "#434746",
      900: "#3C3E3D",
      "950M": "#252726",
    },
  },
  Font: {
    Weight: {
      Regular: "400",
      Medium: "500",
      SemiBold: "600",
      Bold: "700",
    },
    Family: {
      display: "Anton",
      body: "Overpass",
      heading: "Overpass",
      mono: "Overpass Mono",
    },
    LineHeight: {
      compact: "1.1", // new: smallest ratio
      snug: "1.25", // new: ratio for large headings
      standard: "1.25rem", // new: default heading/utility radio
      spacious: "1.375", // new: optimal body readability ratio

      // DEPRECATED LINE HEIGHTS (Old Line Heights - for Archive Classes)
      "xs-deprecated": "16px", // old xs: 16px / 12px = 1.33
      "sm-deprecated": "28px", // old sm: 28px / 16px = 1.75
      "md-deprecated": "36px", // old md: 36px / 20px = 1.8
      "lg-deprecated": "48px", // old lg: 48px / 24px = 2.0
      "xl-deprecated": "64px", // old xl: 64px / 32px = 2.0

      // xs: "16px",
      // sm: "28px",
      // md: "36px",
      // lg: "48px",
      // xl: "64px",
    },
    Size: {
      xs: "0.75rem", // ~12px
      sm: "0.875rem", // ~14px
      md: "1rem", // ~16px
      lg: "1.25rem", // ~20px
      xl: "1.5rem", // ~24px
      "2xl": "1.875rem", // ~30px
      "3xl": "2.375rem", // ~38px

      // DEPRECATED SIZES (Old Scale - for Archive Classes)
      "xs-deprecated": "0.75rem", // old xs: 12px
      "sm-deprecated": "1rem", // old sm: 16px
      "md-deprecated": "1.25rem", // old md: 20px
      "lg-deprecated": "1.5rem", // old lg: 24px
      "xl-deprecated": "2rem", // old xl: 32px
      "2xl-deprecated": "2.5rem", // old 2xl: 40px
      "3xl-deprecated": "3.5rem", // old 3xl: 56px
    },
    letterSpacing: {
      tight: "-0.01em", // equivalent to roughly: -1%
      normal: "0em", // equivalent to roughly: 0
      wide: "0.005em", // equivalent to roughly: 0.5%
      wider: "0.01em", // equivalent to roughly: 1%
    },
  },
  Layout: {
    Space: {
      none: 0, // 0px
      "2xs": 4, // 4px (Half unit)
      xs: 8, // 8px (1 unit)
      sm: 12, // 12px (1.5 units)
      md: 16, // 16px (2 units)
      lg: 24, // 24px (3 units)
      xl: 32, // 32px (4 units)
      "2xl": 40, // 40px (5 units)
      "3xl": 64, // 64px (8 units)
      "4xl": 80, // 80px (10 units)
    },
    BorderRadius: {
      none: 0,
      small: 4, // 4px (Inputs)
      medium: 6, // 6px (Cards, Standard Components)
      large: 12, // 12px (Modals, Drawers)
      full: 9999, // Pills/Badges
    },
    Sizing: {
      // Page Constraints
      "layout-width-header": "1200px", // Header container max-width
      "layout-width-content": "1200px", // Standard Section max-width
      "layout-width-footer": "1200px", // Footer max-width
      "layout-width-text": "640px", // Narrow text columns (Policies/Articles)
      // Component Fixed Widths
      "layout-width-sidepanel": "320px", // Fixed width for Filters/Cart Sidebars
      // Navigation Heights
      "nav-height-desktop": "64px",
      "nav-height-mobile": "56px",
    },
    Breakpoint: {
      "min-tablet": "768px", // Start of Tablet (Airy spacing, Stacked layout)
      "min-desktop": "1024px", // Start of Desktop (Grid layouts, Sidebars visible)
      "min-xl": "1280px", // Large screens
    },
    IconSize: {
      "icon-xs": "12px",
      "icon-sm": "16px",
      "icon-md": "24px", // Default size
      "icon-lg": "32px",
      "icon-display": "120px", // Large illustration (404 Page, Empty States)
    },
  },
  LayoutUsage: {
    // --- 1. PAGE & SECTION LAYOUT (Structure) ---
    "section-gutter-h": {
      base: "12px", // var(--space-sm)
      desktop: "40px", // var(--space-2xl) - *Updated to 40px*
    },
    "gap-section-to-section": {
      base: "32px", // var(--space-xl)
      desktop: "64px", // var(--space-3xl)
    },
    "gap-content-to-footer": {
      base: "64px",
      desktop: "80px", // var(--space-4xl)
    },
    "gap-panel-to-content": {
      base: "24px",
      desktop: "32px", // Spacing between Content & Side Panel (360px)
    },
    // --- 2. VERTICAL RHYTHM (Header & Titles) ---
    "gap-header-to-title": {
      base: "24px",
      desktop: "40px",
    },
    "gap-title-to-content": {
      base: "24px",
      desktop: "32px",
    },
    // --- 3. COMPONENT DENSITY (Cards & Grids) ---
    "grid-gap-listing": {
      base: "12px",
      desktop: "24px", // Grid gap for Category/Product lists
    },
    "card-padding-compact": {
      base: "12px",
      desktop: "16px", // Product Cards
    },
    "card-gap-compact": {
      base: "8px",
      desktop: "12px",
    },
    "card-padding-default": {
      base: "16px",
      desktop: "16px", // Universal for Checkout/Cart/Price
    },
    "card-gap-default": {
      base: "16px",
      desktop: "24px",
    },
    "card-padding-hero-btm": {
      base: "16px",
      desktop: "16px", // Special override for Hero Vehicle Card bottom
    },
    // --- 4. HEADER & HERO SPECIALS ---
    "header-padding-v": {
      base: "12px",
      desktop: "24px",
    },
    "nav-height": {
      base: "56px",
      desktop: "64px",
    },
    "hero-padding-h": {
      base: "0px", // Full bleed on mobile
      desktop: "40px", // Standard alignment on desktop
    },
    "hero-gap-internal": {
      base: "0px", // Mobile relies on vertical stacking
      desktop: "24px",
    },
    // --- 5. MODAL & DRAWER INTERNALS ---
    "modal-padding-header": {
      base: "16px",
      desktop: "24px",
    },
    "modal-padding-content-v": {
      base: "24px",
      desktop: "40px",
    },
    "modal-padding-content-h": {
      base: "16px",
      desktop: "24px",
    },
    "modal-gap-internal": {
      base: "16px",
      desktop: "24px", // Replaces legacy 20px
    },
    // --- 6. FORMS & GEOMETRY (Universal/Static) ---
    "gap-input-to-label": "8px",
    "gap-form-row": "24px", // Used for .form-stack
    "radius-input": "4px", // var(--radius-small)
    "radius-card": "6px", // var(--radius-medium)
    "radius-modal": "12px", // var(--radius-large) - *New Premium Standard*
  },
};

// Qverde theme - Font/Weight, Font/Family, Font/LineHeight, Font/Size, and Color configuration
const qverdeTheme = {
  Color: {
    Brand: {
      100: "#CBE2FB",
      200: "#94C9F9",
      300: "#38AFF6",
      400: "#2C90CC",
      500: "#2274A5",
      600: "#195C84",
      700: "#104666",
      800: "#083149",
      900: "#031B2B",
      950: "#02121F",
    },
    Accent: {
      100: "#FCE6E1",
      200: "#F9D2C5",
      300: "#F8B8A2",
      400: "#F6A180",
      500: "#F58549",
      600: "#C66730",
      700: "#924B21",
      800: "#653214",
      900: "#381907",
      950: "#270F03",
    },
    Neutral: {
      white: "#FFFFFF",
      black: "#000000",
      100: "#F8F8F8",
      200: "#F2F2F2",
      300: "#E8E8E8",
      400: "#E2E2E2",
      500: "#D9D9D9",
      600: "#8D8D8D",
      700: "#646464",
      800: "#535353",
      900: "#242424",
      950: "#1A1A1A",
    },
    Info: {
      100: "#ECF3FD",
      200: "#CFDFF8",
      300: "#93B6EB",
      400: "#335CA4",
      500: "#00338D",
      600: "#002971",
      700: "#001F55",
      800: "#001438",
      900: "#000A1C",
      950: "#07120D",
    },
    Danger: {
      100: "#FFEAE6",
      200: "#FFD4CC",
      300: "#E87B6F",
      400: "#DB5046",
      500: "#CF2721",
      600: "#C20000",
      700: "#9C0005",
      800: "#750008",
      900: "#4F0008",
      950: "#2E0005",
    },
    Warning: {
      100: "#FCEDE0",
      200: "#F8D7BE",
      300: "#F0BE92",
      400: "#E6A368",
      500: "#DE7920",
      600: "#C46215",
      700: "#9C4C0A",
      800: "#6E3304",
      900: "#4B2103",
      950: "#281100",
    },
    Positive: {
      100: "#EEF6F4",
      200: "#DDEEE9",
      300: "#5CD697",
      400: "#17CF70",
      500: "#09BE61",
      600: "#009F4D",
      700: "#068443",
      800: "#036331",
      900: "#0E2519",
      950: "#08160F",
    },
    // OLD COLORS
    White: "#FFFFFF",
    Green: {
      50: "#C3FFD0",
      100: "#64FF96",
      200: "#06E16D",
      300: "#08C25D",
      400: "#01A44D",
      "500M": "#03853E",
      600: "#016B31",
      700: "#005023",
      800: "#013715",
      900: "#00210B",
      950: "#011405",
    },
    Terracotta: {
      50: "#FAE6E4",
      100: "#F8CDC8",
      200: "#F39989",
      300: "#E6623C",
      400: "#AE482A",
      "500M": "#772F1A",
      600: "#632614",
      700: "#4E1C0E",
      800: "#3B1408",
      900: "#260A05",
      950: "#1A0502",
    },
    Red: {
      50: "#FDEDEE",
      100: "#FAD8D8",
      200: "#F6AFB1",
      300: "#F38286",
      400: "#F14F58",
      "500M": "#CF2B37",
      600: "#A8212B",
      700: "#7F151E",
      800: "#5A0E13",
      900: "#390508",
      950: "#290305",
    },
    Grey: {
      50: "#FCFCFC",
      100: "#F6F6F6",
      200: "#EEEEEE",
      300: "#E5E5E5",
      400: "#DDDDDD",
      500: "#D5D5D5",
      600: "#A6A6A6",
      700: "#797979",
      800: "#505050",
      900: "#2A2A2A",
      "950M": "#191919",
    },
    Black: {
      50: "#E8E8E8",
      100: "#D1D1D1",
      200: "#A3A3A3",
      300: "#797979",
      400: "#505050",
      "500M": "#2C2C2C",
      600: "#242424",
      700: "#1D1D1D",
      800: "#151515",
      900: "#0E0E0E",
      950: "#070707",
    },
    Seafoam: {
      50: "#FFFFFF",
      100: "#FBFDF8",
      200: "#F9FBF0",
      300: "#F4F8E9",
      400: "#F0F6E0",
      "500M": "#EEF5DB",
      600: "#B8BEA5",
      700: "#868878",
      800: "#595B4E",
      900: "#2D2F27",
      950: "#1B1C16",
      "L1-Overlay": "#FBFDF8",
      "L2-Overlay": "#F4F8E9",
      "L3-Overlay": "#EEF5DB",
    },
    Peach: {
      50: "#FDFCFA",
      100: "#FCF5EF",
      200: "#F9ECDD",
      300: "#F6E2CA",
      400: "#F5D9B7",
      "500M": "#F2D0A4",
      600: "#C79F62",
      700: "#937548",
      800: "#614D2E",
      900: "#342815",
      950: "#22180B",
    },
    Blue: {
      50: "#E8F2FE",
      100: "#CBE2FB",
      200: "#94C9F9",
      300: "#38AFF6",
      400: "#2C90CC",
      "500M": "#2274A5",
      600: "#195C84",
      700: "#104666",
      800: "#083149",
      900: "#031B2B",
      950: "#02121F",
    },
    Hovers: {
      Main: "#ACD5B6",
      Error: "#EFBEBE",
    },
    Scroll: {
      White: "#FFFFFF",
    },
    Orange: {
      50: "#FFF5F2",
      100: "#FCE6E1",
      200: "#F9D2C5",
      300: "#F8B8A2",
      400: "#F6A180",
      "500M": "#F58549",
      600: "#C66730",
      700: "#924B21",
      800: "#653214",
      900: "#381907",
      950: "#270F03",
    },
  },
  Font: {
    Weight: {
      Regular: "400",
      Medium: "500",
      SemiBold: "600",
      Bold: "700",
    },
    Family: {
      display: "Oswald",
      body: "Public sans",
      heading: "Public sans",
      mono: "Chivo Mono",
    },
    LineHeight: {
      compact: "1.1", // new: smallest ratio
      snug: "1.25", // new: ratio for large headings
      standard: "1.25rem", // new: default heading/utility radio
      spacious: "1.375", // new: optimal body readability ratio

      // DEPRECATED LINE HEIGHTS (Old Line Heights - for Archive Classes)
      "xs-deprecated": "16px", // old xs: 16px / 12px = 1.33
      "sm-deprecated": "28px", // old sm: 28px / 16px = 1.75
      "md-deprecated": "36px", // old md: 36px / 20px = 1.8
      "lg-deprecated": "48px", // old lg: 48px / 24px = 2.0
      "xl-deprecated": "64px", // old xl: 64px / 32px = 2.0
    },
    Size: {
      xs: "0.75rem", // ~12px
      sm: "0.875rem", // ~14px
      md: "1rem", // ~16px
      lg: "1.25rem", // ~20px
      xl: "1.5rem", // ~24px
      "2xl": "1.875rem", // ~30px
      "3xl": "2.375rem", // ~38px

      // DEPRECATED SIZES (Old Scale - for Archive Classes)
      "xs-deprecated": "0.75rem", // old xs: 12px
      "sm-deprecated": "1rem", // old sm: 16px
      "md-deprecated": "1.25rem", // old md: 20px
      "lg-deprecated": "1.5rem", // old lg: 24px
      "xl-deprecated": "2rem", // old xl: 32px
      "2xl-deprecated": "2.5rem", // old 2xl: 40px
      "3xl-deprecated": "3.5rem", // old 3xl: 56px
    },
    letterSpacing: {
      tight: "-0.01em", // equivalent to roughly: -1%
      normal: "0em", // equivalent to roughly: 0
      wide: "0.005em", // equivalent to roughly: 0.5%
      wider: "0.01em", // equivalent to roughly: 1%
    },
  },
  Layout: {
    Space: {
      none: 0, // 0px
      "2xs": 4, // 4px (Half unit)
      xs: 8, // 8px (1 unit)
      sm: 12, // 12px (1.5 units)
      md: 16, // 16px (2 units)
      lg: 24, // 24px (3 units)
      xl: 32, // 32px (4 units)
      "2xl": 40, // 40px (5 units)
      "3xl": 64, // 64px (8 units)
      "4xl": 80, // 80px (10 units)
    },
    BorderRadius: {
      none: 0,
      small: 4, // 4px (Inputs)
      medium: 6, // 6px (Cards, Standard Components)
      large: 12, // 12px (Modals, Drawers)
      full: 9999, // Pills/Badges
    },
    Sizing: {
      // Page Constraints
      "layout-width-header": "1200px", // Header container max-width
      "layout-width-content": "1200px", // Standard Section max-width
      "layout-width-footer": "1200px", // Footer max-width
      "layout-width-text": "640px", // Narrow text columns (Policies/Articles)
      // Component Fixed Widths
      "layout-width-sidepanel": "360px", // Fixed width for Filters/Cart Sidebars
      // Navigation Heights
      "nav-height-desktop": "64px",
      "nav-height-mobile": "56px",
    },
    Breakpoint: {
      "min-tablet": "768px", // Start of Tablet (Airy spacing, Stacked layout)
      "min-desktop": "1024px", // Start of Desktop (Grid layouts, Sidebars visible)
      "min-xl": "1280px", // Large screens
    },
    IconSize: {
      "icon-xs": "12px",
      "icon-sm": "16px",
      "icon-md": "24px", // Default size
      "icon-lg": "32px",
      "icon-display": "120px", // Large illustration (404 Page, Empty States)
    },
  },
  LayoutUsage: {
    // --- 1. PAGE & SECTION LAYOUT (Structure) ---
    "section-gutter-h": {
      base: "12px", // var(--space-sm)
      desktop: "40px", // var(--space-2xl) - *Updated to 40px*
    },
    "gap-section-to-section": {
      base: "32px", // var(--space-xl)
      desktop: "64px", // var(--space-3xl)
    },
    "gap-content-to-footer": {
      base: "64px",
      desktop: "80px", // var(--space-4xl)
    },
    "gap-panel-to-content": {
      base: "24px",
      desktop: "32px", // Spacing between Content & Side Panel (360px)
    },
    // --- 2. VERTICAL RHYTHM (Header & Titles) ---
    "gap-header-to-title": {
      base: "24px",
      desktop: "40px",
    },
    "gap-title-to-content": {
      base: "24px",
      desktop: "32px",
    },
    // --- 3. COMPONENT DENSITY (Cards & Grids) ---
    "grid-gap-listing": {
      base: "12px",
      desktop: "24px", // Grid gap for Category/Product lists
    },
    "card-padding-compact": {
      base: "12px",
      desktop: "16px", // Product Cards
    },
    "card-gap-compact": {
      base: "8px",
      desktop: "12px",
    },
    "card-padding-default": {
      base: "16px",
      desktop: "16px", // Universal for Checkout/Cart/Price
    },
    "card-gap-default": {
      base: "16px",
      desktop: "24px",
    },
    "card-padding-hero-btm": {
      base: "16px",
      desktop: "16px", // Special override for Hero Vehicle Card bottom
    },
    // --- 4. HEADER & HERO SPECIALS ---
    "header-padding-v": {
      base: "12px",
      desktop: "24px",
    },
    "nav-height": {
      base: "56px",
      desktop: "64px",
    },
    "hero-padding-h": {
      base: "0px", // Full bleed on mobile
      desktop: "40px", // Standard alignment on desktop
    },
    "hero-gap-internal": {
      base: "0px", // Mobile relies on vertical stacking
      desktop: "24px",
    },
    // --- 5. MODAL & DRAWER INTERNALS ---
    "modal-padding-header": {
      base: "16px",
      desktop: "24px",
    },
    "modal-padding-content-v": {
      base: "24px",
      desktop: "40px",
    },
    "modal-padding-content-h": {
      base: "16px",
      desktop: "24px",
    },
    "modal-gap-internal": {
      base: "16px",
      desktop: "24px", // Replaces legacy 20px
    },
    // --- 6. FORMS & GEOMETRY (Universal/Static) ---
    "gap-input-to-label": "8px",
    "gap-form-row": "24px", // Used for .form-stack
    "radius-input": "4px", // var(--radius-small)
    "radius-card": "6px", // var(--radius-medium)
    "radius-modal": "12px", // var(--radius-large) - *New Premium Standard*
  },
};

// Ottogusto-specific mobile overrides
const ottogustoMobileOverrides = {
  Font: {
    LineHeight: {
      compact: "1.1", // new: smallest ratio
      snug: "1.25", // new: ratio for large headings
      standard: "1.25rem", // new: default heading/utility radio
      spacious: "1.375", // new: optimal body readability ratio

      "xs-deprecated": "16px",
      "sm-deprecated": "24px",
      "md-deprecated": "32px",
      "lg-deprecated": "40px",
      "xl-deprecated": "48px",
    },
    Size: {
      xs: "0.75rem", // ~12px
      sm: "0.875rem", // ~14px
      md: "1rem", // ~16px
      lg: "1.25rem", // ~20px
      xl: "1.5rem", // ~24px
      "2xl": "1.875rem", // ~30px
      "3xl": "2.375rem", // ~38px

      // DEPRECATED SIZES (Old Scale - for Archive Classes)
      "xs-deprecated": "0.75rem", // old xs: 12px
      "sm-deprecated": "1rem", // old sm: 16px
      "md-deprecated": "1.125rem", // old md: 18px
      "lg-deprecated": "1.25rem", // old lg: 20px
      "xl-deprecated": "1.5rem", // old xl: 24px
      "2xl-deprecated": "2rem", // old 2xl: 32px
      "3xl-deprecated": "2.5rem", // old 3xl: 40px
    },
  },
};

// Qverde-specific mobile overrides
const qverdeMobileOverrides = {
  Font: {
    LineHeight: {
      compact: "1.1", // new: smallest ratio
      snug: "1.25", // new: ratio for large headings
      standard: "1.25rem", // new: default heading/utility radio
      spacious: "1.375", // new: optimal body readability ratio

      "xs-deprecated": "16px",
      "sm-deprecated": "24px",
      "md-deprecated": "32px",
      "lg-deprecated": "40px",
      "xl-deprecated": "48px",
    },
    Size: {
      xs: "0.75rem", // ~12px
      sm: "0.875rem", // ~14px
      md: "1rem", // ~16px
      lg: "1.25rem", // ~20px
      xl: "1.5rem", // ~24px
      "2xl": "1.875rem", // ~30px
      "3xl": "2.375rem", // ~38px

      // DEPRECATED SIZES (Old Scale - for Archive Classes)
      "xs-deprecated": "0.75rem", // old xs: 12px
      "sm-deprecated": "1rem", // old sm: 16px
      "md-deprecated": "1.125rem", // old md: 18px
      "lg-deprecated": "1.25rem", // old lg: 20px
      "xl-deprecated": "1.5rem", // old xl: 24px
      "2xl-deprecated": "2rem", // old 2xl: 32px
      "3xl-deprecated": "2.5rem", // old 3xl: 40px
    },
  },
};

// Main configuration object
export const CLIENT_THEME_CONFIG = {
  // Store-specific themes
  stores: {
    [STORE_IDS.OTTOGUSTO]: {
      desktop: ottogustoTheme,
      mobile: {
        ...ottogustoTheme,
        Font: {
          // Deep merge for Font
          ...ottogustoTheme.Font,
          ...ottogustoMobileOverrides.Font,
        },
      },
    },
    [STORE_IDS.QVERDE]: {
      desktop: qverdeTheme,
      mobile: {
        ...qverdeTheme,
        Font: {
          // Deep merge for Font
          ...qverdeTheme.Font,
          ...qverdeMobileOverrides.Font,
        },
      },
    },
  },

  // Global settings
  settings: {
    mobileBreakpoint: 640, // px
    // Default store fallback
    defaultStore: DEFAULT_STORE,
  },
} as const;

// Type for type safety
export type ClientThemeConfig = typeof CLIENT_THEME_CONFIG;
export type StoreThemeConfig = typeof ottogustoTheme | typeof qverdeTheme;

// Helper type for nested paths
export type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object ? `${K}/${NestedKeyOf<T[K]>}` : K;
}[keyof T & (string | number)];

export type ThemePath = NestedKeyOf<StoreThemeConfig>;

// Utility functions
export function getStoreFromDomain(domain: string): StoreName {
  // return STORE_IDS.QVERDE;
  // return STORE_IDS.OTTOGUSTO;
  // Extract store from various domain patterns

  try {
    // Parse the domain to extract hostname and pathname
    const url = new URL(domain.startsWith("http") ? domain : `https://${domain}`);
    const hostname = url.hostname;
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // For localhost: Check query parameter first, then environment variable, then default
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("localhost:")) {
      // Check for ?store=qverde or ?store=ottogusto query parameter (for testing)
      const storeParam = searchParams.get("store");
      if (storeParam && isValidStoreId(storeParam)) {
        return storeParam;
      }

      // Check environment variable for localhost testing (uses existing STORE/NEXT_PUBLIC_STORE)
      if (typeof process !== "undefined") {
        const envStore = process.env.NEXT_PUBLIC_STORE || process.env.STORE;
        if (envStore) {
          const normalizedStore = envStore.toLowerCase();
          if (isValidStoreId(normalizedStore)) {
            return normalizedStore;
          }
        }
      }

      // Default for local development
      return DEFAULT_STORE;
    }

    // Check for design system URL patterns first
    if (pathname.includes("/design-system/og")) {
      return STORE_IDS.OTTOGUSTO;
    }
    if (pathname.includes("/design-system/qv")) {
      return STORE_IDS.QVERDE;
    }

    const store = process.env.NEXT_PUBLIC_STORE || process.env.STORE;
    if (store && isValidStoreId(store)) {
      return store;
    }

    // Check for ottogusto domains
    if (
      hostname === "ottogusto.com" ||
      hostname === "dev.ottogusto.com" ||
      hostname === "dev-og.ottogusto.com" ||
      hostname.includes("ottogusto") ||
      hostname.startsWith("dev-og")
    ) {
      return STORE_IDS.OTTOGUSTO;
    }

    // Check for qverde domains
    if (
      hostname === "qverde.com" ||
      hostname === "dev-qv.ottogusto.com" ||
      hostname === "dev.qverde.com" ||
      hostname.includes("qverde") ||
      hostname.startsWith("dev-qv")
    ) {
      return STORE_IDS.QVERDE;
    }

    // Extract subdomain for dev-[store_name] pattern
    const subdomain = hostname.split(".")[0];
    if (subdomain?.startsWith("dev-")) {
      const storeCode = subdomain.substring(4); // Remove "dev-" prefix

      // Map store codes to store names
      switch (storeCode) {
        case "og":
          return STORE_IDS.OTTOGUSTO;
        case "qv":
          return STORE_IDS.QVERDE;
        default:
          console.warn(`Unknown store code: ${storeCode}, using default store`);
          return CLIENT_THEME_CONFIG.settings.defaultStore;
      }
    }

    // Fallback to default store if pattern doesn't match
    console.warn(`Domain pattern not recognized: ${hostname}, using default store`);
    return CLIENT_THEME_CONFIG.settings.defaultStore;
  } catch (error) {
    console.error(`Error parsing domain: ${domain}`, error);
    return CLIENT_THEME_CONFIG.settings.defaultStore;
  }
}

export function getDeviceMode(width: number): DeviceMode {
  return width < CLIENT_THEME_CONFIG.settings.mobileBreakpoint ? "mobile" : "desktop";
}

export function getThemeConfig(store: StoreName, device: DeviceMode): StoreThemeConfig {
  return CLIENT_THEME_CONFIG.stores[store][device];
}
