/**
 * Server-side CSS generation for theme variables.
 *
 * Replaces the client-side useEffect in ColorProvider and TypographyProvider
 * so that CSS custom properties are available on first paint (no FOUC, lower TBT).
 *
 * The generated CSS is identical to what the client-side providers produce.
 */
import { CLIENT_THEME_CONFIG, StoreName } from "../config/client-theme-config";
import { STORE_IDS } from "../config/store-constants";
import { getNestedValue } from "./theme-utils";

// ---------------------------------------------------------------------------
// Color helpers (server-safe — no window/DOM access)
// ---------------------------------------------------------------------------

function getColorValueForStore(store: StoreName, colorPath: string): string {
  const themeConfig = CLIENT_THEME_CONFIG.stores[store].desktop;
  const fullPath = `Color.${colorPath}`;
  const value = getNestedValue(themeConfig, fullPath);
  if (typeof value === "string") return value;
  return "#000000";
}

function getStoreColorMapping(store: StoreName, ottogustoPath: string, qverdePath: string): string {
  return store === STORE_IDS.OTTOGUSTO
    ? getColorValueForStore(store, ottogustoPath)
    : getColorValueForStore(store, qverdePath);
}

// ---------------------------------------------------------------------------
// generateColorCSS — mirrors ColorProvider useEffect logic exactly
// ---------------------------------------------------------------------------

export function generateColorCSS(store: StoreName): string {
  const colorMappings: Array<{
    name: string;
    [STORE_IDS.OTTOGUSTO]: string;
    [STORE_IDS.QVERDE]: string;
  }> = [
    // --- TEXT STYLES ---
    {
      name: "color-text-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Neutral.900",
      [STORE_IDS.QVERDE]: "Neutral.900",
    },
    {
      name: "color-text-default",
      [STORE_IDS.OTTOGUSTO]: "Neutral.800",
      [STORE_IDS.QVERDE]: "Neutral.800",
    },
    {
      name: "color-text-muted",
      [STORE_IDS.OTTOGUSTO]: "Neutral.700",
      [STORE_IDS.QVERDE]: "Neutral.700",
    },
    {
      name: "color-text-disabled",
      [STORE_IDS.OTTOGUSTO]: "Neutral.600",
      [STORE_IDS.QVERDE]: "Neutral.600",
    },
    {
      name: "color-text-inverse",
      [STORE_IDS.OTTOGUSTO]: "Neutral.100",
      [STORE_IDS.QVERDE]: "Neutral.100",
    },
    {
      name: "color-text-brand",
      [STORE_IDS.OTTOGUSTO]: "Brand.700",
      [STORE_IDS.QVERDE]: "Brand.700",
    },
    {
      name: "color-text-neutral",
      [STORE_IDS.OTTOGUSTO]: "Neutral.700",
      [STORE_IDS.QVERDE]: "Neutral.700",
    },
    {
      name: "color-text-accent",
      [STORE_IDS.OTTOGUSTO]: "Accent.500",
      [STORE_IDS.QVERDE]: "Accent.500",
    },
    {
      name: "color-text-link",
      [STORE_IDS.OTTOGUSTO]: "Brand.700",
      [STORE_IDS.QVERDE]: "Brand.700",
    },
    {
      name: "color-text-visited",
      [STORE_IDS.OTTOGUSTO]: "Brand.800",
      [STORE_IDS.QVERDE]: "Brand.800",
    },
    { name: "color-text-info", [STORE_IDS.OTTOGUSTO]: "Info.800", [STORE_IDS.QVERDE]: "Info.800" },
    {
      name: "color-text-danger",
      [STORE_IDS.OTTOGUSTO]: "Danger.700",
      [STORE_IDS.QVERDE]: "Danger.700",
    },
    {
      name: "color-text-attention",
      [STORE_IDS.OTTOGUSTO]: "Warning.800",
      [STORE_IDS.QVERDE]: "Warning.800",
    },
    {
      name: "color-text-positive",
      [STORE_IDS.OTTOGUSTO]: "Positive.800",
      [STORE_IDS.QVERDE]: "Positive.800",
    },
    // --- ICON STYLES ---
    {
      name: "color-icon-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Neutral.700",
      [STORE_IDS.QVERDE]: "Neutral.700",
    },
    {
      name: "color-icon-default",
      [STORE_IDS.OTTOGUSTO]: "Neutral.600",
      [STORE_IDS.QVERDE]: "Neutral.600",
    },
    {
      name: "color-icon-muted",
      [STORE_IDS.OTTOGUSTO]: "Neutral.500",
      [STORE_IDS.QVERDE]: "Neutral.500",
    },
    {
      name: "color-icon-disabled",
      [STORE_IDS.OTTOGUSTO]: "Neutral.600",
      [STORE_IDS.QVERDE]: "Neutral.600",
    },
    {
      name: "color-icon-inverse",
      [STORE_IDS.OTTOGUSTO]: "Neutral.200",
      [STORE_IDS.QVERDE]: "Neutral.200",
    },
    {
      name: "color-icon-brand",
      [STORE_IDS.OTTOGUSTO]: "Brand.500",
      [STORE_IDS.QVERDE]: "Brand.500",
    },
    {
      name: "color-icon-neutral",
      [STORE_IDS.OTTOGUSTO]: "Neutral.500",
      [STORE_IDS.QVERDE]: "Neutral.500",
    },
    {
      name: "color-icon-accent",
      [STORE_IDS.OTTOGUSTO]: "Accent.600",
      [STORE_IDS.QVERDE]: "Accent.600",
    },
    {
      name: "color-icon-link",
      [STORE_IDS.OTTOGUSTO]: "Brand.500",
      [STORE_IDS.QVERDE]: "Brand.500",
    },
    {
      name: "color-icon-visited",
      [STORE_IDS.OTTOGUSTO]: "Brand.600",
      [STORE_IDS.QVERDE]: "Brand.600",
    },
    { name: "color-icon-info", [STORE_IDS.OTTOGUSTO]: "Info.600", [STORE_IDS.QVERDE]: "Info.600" },
    {
      name: "color-icon-danger",
      [STORE_IDS.OTTOGUSTO]: "Danger.600",
      [STORE_IDS.QVERDE]: "Danger.600",
    },
    {
      name: "color-icon-attention",
      [STORE_IDS.OTTOGUSTO]: "Warning.600",
      [STORE_IDS.QVERDE]: "Warning.600",
    },
    {
      name: "color-icon-positive",
      [STORE_IDS.OTTOGUSTO]: "Positive.600",
      [STORE_IDS.QVERDE]: "Positive.600",
    },
    // --- BACKGROUND STYLES ---
    {
      name: "color-background-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Neutral.100",
      [STORE_IDS.QVERDE]: "Neutral.100",
    },
    {
      name: "color-background-default",
      [STORE_IDS.OTTOGUSTO]: "Neutral.white",
      [STORE_IDS.QVERDE]: "Neutral.white",
    },
    {
      name: "color-header-divider",
      [STORE_IDS.OTTOGUSTO]: "Brand.700",
      [STORE_IDS.QVERDE]: "Neutral.300",
    },
    {
      name: "color-header-searchbar-bg",
      [STORE_IDS.OTTOGUSTO]: "Neutral.100",
      [STORE_IDS.QVERDE]: "Neutral.100",
    },
    {
      name: "color-background-disabled",
      [STORE_IDS.OTTOGUSTO]: "Neutral.300",
      [STORE_IDS.QVERDE]: "Neutral.300",
    },
    {
      name: "color-background-inverse",
      [STORE_IDS.OTTOGUSTO]: "Neutral.900",
      [STORE_IDS.QVERDE]: "Neutral.800",
    },
    {
      name: "color-background-brand-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Brand.700",
      [STORE_IDS.QVERDE]: "Brand.700",
    },
    {
      name: "color-background-brand-muted",
      [STORE_IDS.OTTOGUSTO]: "Brand.100",
      [STORE_IDS.QVERDE]: "Brand.100",
    },
    {
      name: "color-background-neutral-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Neutral.600",
      [STORE_IDS.QVERDE]: "Neutral.600",
    },
    {
      name: "color-background-neutral-muted",
      [STORE_IDS.OTTOGUSTO]: "Neutral.100",
      [STORE_IDS.QVERDE]: "Neutral.100",
    },
    {
      name: "color-background-neutral-white",
      [STORE_IDS.OTTOGUSTO]: "Neutral.white",
      [STORE_IDS.QVERDE]: "Neutral.white",
    },
    {
      name: "color-background-accent-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Accent.500",
      [STORE_IDS.QVERDE]: "Accent.500",
    },
    {
      name: "color-background-accent-muted",
      [STORE_IDS.OTTOGUSTO]: "Accent.100",
      [STORE_IDS.QVERDE]: "Accent.100",
    },
    {
      name: "color-background-link-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Brand.700",
      [STORE_IDS.QVERDE]: "Brand.700",
    },
    {
      name: "color-background-link-muted",
      [STORE_IDS.OTTOGUSTO]: "Brand.100",
      [STORE_IDS.QVERDE]: "Brand.100",
    },
    {
      name: "color-background-visited-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Brand.800",
      [STORE_IDS.QVERDE]: "Brand.800",
    },
    {
      name: "color-background-visited-muted",
      [STORE_IDS.OTTOGUSTO]: "Brand.100",
      [STORE_IDS.QVERDE]: "Brand.100",
    },
    {
      name: "color-background-info-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Info.600",
      [STORE_IDS.QVERDE]: "Info.600",
    },
    {
      name: "color-background-info-muted",
      [STORE_IDS.OTTOGUSTO]: "Info.100",
      [STORE_IDS.QVERDE]: "Info.100",
    },
    {
      name: "color-background-danger-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Danger.600",
      [STORE_IDS.QVERDE]: "Danger.600",
    },
    {
      name: "color-background-danger-muted",
      [STORE_IDS.OTTOGUSTO]: "Danger.100",
      [STORE_IDS.QVERDE]: "Danger.100",
    },
    {
      name: "color-background-attention-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Warning.600",
      [STORE_IDS.QVERDE]: "Warning.600",
    },
    {
      name: "color-background-attention-muted",
      [STORE_IDS.OTTOGUSTO]: "Warning.100",
      [STORE_IDS.QVERDE]: "Warning.100",
    },
    {
      name: "color-background-warning-muted",
      [STORE_IDS.OTTOGUSTO]: "Warning.100",
      [STORE_IDS.QVERDE]: "Warning.100",
    },
    {
      name: "color-background-positive-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Positive.600",
      [STORE_IDS.QVERDE]: "Positive.600",
    },
    {
      name: "color-background-positive-muted",
      [STORE_IDS.OTTOGUSTO]: "Positive.100",
      [STORE_IDS.QVERDE]: "Positive.100",
    },
    // --- BORDER STYLES ---
    {
      name: "color-border-emphasis",
      [STORE_IDS.OTTOGUSTO]: "Neutral.500",
      [STORE_IDS.QVERDE]: "Neutral.500",
    },
    {
      name: "color-border-default",
      [STORE_IDS.OTTOGUSTO]: "Neutral.400",
      [STORE_IDS.QVERDE]: "Neutral.400",
    },
    {
      name: "color-border-muted",
      [STORE_IDS.OTTOGUSTO]: "Neutral.300",
      [STORE_IDS.QVERDE]: "Neutral.300",
    },
    {
      name: "color-border-disabled",
      [STORE_IDS.OTTOGUSTO]: "Neutral.300",
      [STORE_IDS.QVERDE]: "Neutral.300",
    },
    {
      name: "color-border-inverse",
      [STORE_IDS.OTTOGUSTO]: "Neutral.800",
      [STORE_IDS.QVERDE]: "Neutral.800",
    },
    {
      name: "color-border-focus",
      [STORE_IDS.OTTOGUSTO]: "Positive.600",
      [STORE_IDS.QVERDE]: "Accent.600",
    },
    {
      name: "color-border-brand",
      [STORE_IDS.OTTOGUSTO]: "Brand.700",
      [STORE_IDS.QVERDE]: "Brand.700",
    },
    {
      name: "color-border-neutral",
      [STORE_IDS.OTTOGUSTO]: "Neutral.700",
      [STORE_IDS.QVERDE]: "Neutral.700",
    },
    {
      name: "color-border-accent",
      [STORE_IDS.OTTOGUSTO]: "Accent.600",
      [STORE_IDS.QVERDE]: "Accent.600",
    },
    {
      name: "color-border-link",
      [STORE_IDS.OTTOGUSTO]: "Brand.700",
      [STORE_IDS.QVERDE]: "Brand.700",
    },
    {
      name: "color-border-visited",
      [STORE_IDS.OTTOGUSTO]: "Brand.800",
      [STORE_IDS.QVERDE]: "Brand.800",
    },
    {
      name: "color-border-info",
      [STORE_IDS.OTTOGUSTO]: "Info.600",
      [STORE_IDS.QVERDE]: "Info.600",
    },
    {
      name: "color-border-danger",
      [STORE_IDS.OTTOGUSTO]: "Danger.600",
      [STORE_IDS.QVERDE]: "Danger.600",
    },
    {
      name: "color-border-attention",
      [STORE_IDS.OTTOGUSTO]: "Warning.600",
      [STORE_IDS.QVERDE]: "Warning.600",
    },
    {
      name: "color-border-warning",
      [STORE_IDS.OTTOGUSTO]: "Warning.600",
      [STORE_IDS.QVERDE]: "Warning.600",
    },
    {
      name: "color-border-positive",
      [STORE_IDS.OTTOGUSTO]: "Positive.600",
      [STORE_IDS.QVERDE]: "Positive.600",
    },
    // --- DEPRECATED OLD CLASSES ---
    {
      name: "color-deprecated-color-primary-main",
      [STORE_IDS.OTTOGUSTO]: "Brand.900",
      [STORE_IDS.QVERDE]: "Green.500M",
    },
    {
      name: "color-deprecated-color-primary-hover",
      [STORE_IDS.OTTOGUSTO]: "Piston.800",
      [STORE_IDS.QVERDE]: "Green.600",
    },
    {
      name: "color-deprecated-color-primary-disabled",
      [STORE_IDS.OTTOGUSTO]: "Piston.Muted",
      [STORE_IDS.QVERDE]: "Green.50",
    },
    {
      name: "color-deprecated-color-secondary-main",
      [STORE_IDS.OTTOGUSTO]: "Traffic.700M",
      [STORE_IDS.QVERDE]: "Green.500M",
    },
    {
      name: "color-deprecated-color-secondary-hover",
      [STORE_IDS.OTTOGUSTO]: "Traffic.800",
      [STORE_IDS.QVERDE]: "Green.600",
    },
    {
      name: "color-deprecated-color-secondary-disabled",
      [STORE_IDS.OTTOGUSTO]: "Traffic.Muted",
      [STORE_IDS.QVERDE]: "Green.50",
    },
    {
      name: "color-deprecated-color-accent-main",
      [STORE_IDS.OTTOGUSTO]: "Highway.400M",
      [STORE_IDS.QVERDE]: "Red.500M",
    },
    {
      name: "color-deprecated-color-accent-hover",
      [STORE_IDS.OTTOGUSTO]: "Highway.500",
      [STORE_IDS.QVERDE]: "Red.600",
    },
    {
      name: "color-deprecated-color-accent-dark",
      [STORE_IDS.OTTOGUSTO]: "Highway.700",
      [STORE_IDS.QVERDE]: "Red.700",
    },
    {
      name: "color-deprecated-color-accent-light",
      [STORE_IDS.OTTOGUSTO]: "Highway.100",
      [STORE_IDS.QVERDE]: "Red.300",
    },
    {
      name: "color-deprecated-color-background-none",
      [STORE_IDS.OTTOGUSTO]: "White",
      [STORE_IDS.QVERDE]: "White",
    },
    {
      name: "color-deprecated-color-background-l1",
      [STORE_IDS.OTTOGUSTO]: "Beige.200",
      [STORE_IDS.QVERDE]: "Seafoam.100",
    },
    {
      name: "color-deprecated-color-background-l2",
      [STORE_IDS.OTTOGUSTO]: "Beige.600",
      [STORE_IDS.QVERDE]: "Seafoam.200",
    },
    {
      name: "color-deprecated-color-background-l3",
      [STORE_IDS.OTTOGUSTO]: "Beige.800",
      [STORE_IDS.QVERDE]: "Seafoam.300",
    },
    {
      name: "color-deprecated-color-background-l4",
      [STORE_IDS.OTTOGUSTO]: "Chrome.50",
      [STORE_IDS.QVERDE]: "Peach.50",
    },
    {
      name: "color-deprecated-color-background-l5",
      [STORE_IDS.OTTOGUSTO]: "Chrome.200",
      [STORE_IDS.QVERDE]: "Peach.100",
    },
    {
      name: "color-deprecated-color-background-l6",
      [STORE_IDS.OTTOGUSTO]: "Chrome.400",
      [STORE_IDS.QVERDE]: "Peach.200",
    },
    {
      name: "color-deprecated-color-background-l7",
      [STORE_IDS.OTTOGUSTO]: "Chrome.600",
      [STORE_IDS.QVERDE]: "Peach.300",
    },
    {
      name: "color-deprecated-color-background-l8",
      [STORE_IDS.OTTOGUSTO]: "Chrome.800",
      [STORE_IDS.QVERDE]: "Peach.400",
    },
    {
      name: "color-deprecated-color-background-overlay",
      [STORE_IDS.OTTOGUSTO]: "Grey.950M",
      [STORE_IDS.QVERDE]: "Black.950M",
    },
    {
      name: "color-deprecated-color-background-brand",
      [STORE_IDS.OTTOGUSTO]: "Piston.900M",
      [STORE_IDS.QVERDE]: "Green.500M",
    },
    {
      name: "color-deprecated-color-text-body",
      [STORE_IDS.OTTOGUSTO]: "Tarmac.950M",
      [STORE_IDS.QVERDE]: "Black.700",
    },
    {
      name: "color-deprecated-color-text-placeholder",
      [STORE_IDS.OTTOGUSTO]: "Grey.700",
      [STORE_IDS.QVERDE]: "Black.400",
    },
    {
      name: "color-deprecated-color-text-disabled",
      [STORE_IDS.OTTOGUSTO]: "Grey.500",
      [STORE_IDS.QVERDE]: "Black.300",
    },
    {
      name: "color-deprecated-color-text-on-dark",
      [STORE_IDS.OTTOGUSTO]: "White",
      [STORE_IDS.QVERDE]: "White",
    },
    {
      name: "color-deprecated-color-text-on-brand",
      [STORE_IDS.OTTOGUSTO]: "Highway.400M",
      [STORE_IDS.QVERDE]: "White",
    },
    {
      name: "color-deprecated-color-neutral-main",
      [STORE_IDS.OTTOGUSTO]: "Grey.300",
      [STORE_IDS.QVERDE]: "Grey.500M",
    },
    {
      name: "color-deprecated-color-neutral-disabled",
      [STORE_IDS.OTTOGUSTO]: "Grey.100",
      [STORE_IDS.QVERDE]: "Grey.300",
    },
    {
      name: "color-deprecated-color-neutral-hover",
      [STORE_IDS.OTTOGUSTO]: "Grey.400",
      [STORE_IDS.QVERDE]: "Grey.600",
    },
    {
      name: "color-deprecated-color-system-warning-extra-light",
      [STORE_IDS.OTTOGUSTO]: "Orange.100",
      [STORE_IDS.QVERDE]: "Orange.100",
    },
    {
      name: "color-deprecated-color-system-warning-light",
      [STORE_IDS.OTTOGUSTO]: "Orange.200",
      [STORE_IDS.QVERDE]: "Orange.300",
    },
    {
      name: "color-deprecated-color-system-warning-main",
      [STORE_IDS.OTTOGUSTO]: "Orange.300",
      [STORE_IDS.QVERDE]: "Orange.500M",
    },
    {
      name: "color-deprecated-color-system-warning-hover",
      [STORE_IDS.OTTOGUSTO]: "Orange.400",
      [STORE_IDS.QVERDE]: "Orange.600",
    },
    {
      name: "color-deprecated-color-system-warning-dark",
      [STORE_IDS.OTTOGUSTO]: "Orange.400",
      [STORE_IDS.QVERDE]: "Orange.600",
    },
    {
      name: "color-deprecated-color-system-info-extra-light",
      [STORE_IDS.OTTOGUSTO]: "Blue.100",
      [STORE_IDS.QVERDE]: "Blue.50",
    },
    {
      name: "color-deprecated-color-system-info-light",
      [STORE_IDS.OTTOGUSTO]: "Blue.200",
      [STORE_IDS.QVERDE]: "Blue.200",
    },
    {
      name: "color-deprecated-color-system-info-main",
      [STORE_IDS.OTTOGUSTO]: "Blue.300",
      [STORE_IDS.QVERDE]: "Blue.500M",
    },
    {
      name: "color-deprecated-color-system-info-hover",
      [STORE_IDS.OTTOGUSTO]: "Blue.400",
      [STORE_IDS.QVERDE]: "Blue.600",
    },
    {
      name: "color-deprecated-color-system-info-dark",
      [STORE_IDS.OTTOGUSTO]: "Blue.400",
      [STORE_IDS.QVERDE]: "Blue.700",
    },
    {
      name: "color-deprecated-color-system-success-extra-light",
      [STORE_IDS.OTTOGUSTO]: "Green.100",
      [STORE_IDS.QVERDE]: "Green.50",
    },
    {
      name: "color-deprecated-color-system-success-light",
      [STORE_IDS.OTTOGUSTO]: "Green.200",
      [STORE_IDS.QVERDE]: "Green.100",
    },
    {
      name: "color-deprecated-color-system-success-main",
      [STORE_IDS.OTTOGUSTO]: "Green.300",
      [STORE_IDS.QVERDE]: "Green.500M",
    },
    {
      name: "color-deprecated-color-system-success-hover",
      [STORE_IDS.OTTOGUSTO]: "Green.400",
      [STORE_IDS.QVERDE]: "Green.600",
    },
    {
      name: "color-deprecated-color-system-success-dark",
      [STORE_IDS.OTTOGUSTO]: "Green.400",
      [STORE_IDS.QVERDE]: "Green.800",
    },
    {
      name: "color-deprecated-color-system-error-extra-light",
      [STORE_IDS.OTTOGUSTO]: "Red.100",
      [STORE_IDS.QVERDE]: "Red.50",
    },
    {
      name: "color-deprecated-color-system-error-light",
      [STORE_IDS.OTTOGUSTO]: "Red.200",
      [STORE_IDS.QVERDE]: "Red.200",
    },
    {
      name: "color-deprecated-color-system-error-main",
      [STORE_IDS.OTTOGUSTO]: "Red.300",
      [STORE_IDS.QVERDE]: "Red.500M",
    },
    {
      name: "color-deprecated-color-system-error-hover",
      [STORE_IDS.OTTOGUSTO]: "Red.400",
      [STORE_IDS.QVERDE]: "Red.600",
    },
    {
      name: "color-deprecated-color-system-error-dark",
      [STORE_IDS.OTTOGUSTO]: "Red.400",
      [STORE_IDS.QVERDE]: "Red.700",
    },
    {
      name: "color-deprecated-color-hover-action-primary",
      [STORE_IDS.OTTOGUSTO]: "Hovers.Main",
      [STORE_IDS.QVERDE]: "Hovers.Main",
    },
    {
      name: "color-deprecated-color-hover-action-error",
      [STORE_IDS.OTTOGUSTO]: "Hovers.Error",
      [STORE_IDS.QVERDE]: "Hovers.Error",
    },
    {
      name: "color-deprecated-color-scroll-fade-white",
      [STORE_IDS.OTTOGUSTO]: "White",
      [STORE_IDS.QVERDE]: "White",
    },
    {
      name: "color-deprecated-color-scroll-fade-l1",
      [STORE_IDS.OTTOGUSTO]: "Beige.200",
      [STORE_IDS.QVERDE]: "Seafoam.L1-Overlay",
    },
    {
      name: "color-deprecated-color-scroll-fade-l2",
      [STORE_IDS.OTTOGUSTO]: "Beige.600",
      [STORE_IDS.QVERDE]: "Seafoam.L2-Overlay",
    },
    {
      name: "color-deprecated-color-scroll-fade-l3",
      [STORE_IDS.OTTOGUSTO]: "Beige.800",
      [STORE_IDS.QVERDE]: "Seafoam.L3-Overlay",
    },
  ];

  // --- COMPONENT SPECIFIC TOKENS ---
  const componentTokens = {
    Button: {
      "primary-bg-default": { [STORE_IDS.OTTOGUSTO]: "Brand.700", [STORE_IDS.QVERDE]: "Brand.700" },
      "primary-bg-hover": { [STORE_IDS.OTTOGUSTO]: "Brand.800", [STORE_IDS.QVERDE]: "Brand.800" },
      "primary-bg-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.300",
        [STORE_IDS.QVERDE]: "Neutral.300",
      },
      "primary-text": { [STORE_IDS.OTTOGUSTO]: "Neutral.100", [STORE_IDS.QVERDE]: "Neutral.100" },
      "primary-text-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "primary-icon": { [STORE_IDS.OTTOGUSTO]: "Neutral.200", [STORE_IDS.QVERDE]: "Neutral.200" },
      "primary-icon-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "outline-border": { [STORE_IDS.OTTOGUSTO]: "Brand.700", [STORE_IDS.QVERDE]: "Brand.700" },
      "outline-bg-default": {
        [STORE_IDS.OTTOGUSTO]: "transparent",
        [STORE_IDS.QVERDE]: "transparent",
      },
      "outline-bg-hover": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.100",
        [STORE_IDS.QVERDE]: "Neutral.100",
      },
      "outline-bg-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.300",
        [STORE_IDS.QVERDE]: "Neutral.300",
      },
      "outline-text": { [STORE_IDS.OTTOGUSTO]: "Brand.700", [STORE_IDS.QVERDE]: "Brand.700" },
      "outline-text-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "outline-icon": { [STORE_IDS.OTTOGUSTO]: "Brand.500", [STORE_IDS.QVERDE]: "Brand.500" },
      "outline-icon-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "ghost-bg-hover": { [STORE_IDS.OTTOGUSTO]: "Neutral.100", [STORE_IDS.QVERDE]: "Neutral.100" },
      "ghost-text": { [STORE_IDS.OTTOGUSTO]: "Brand.700", [STORE_IDS.QVERDE]: "Brand.700" },
      "ghost-text-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "ghost-icon": { [STORE_IDS.OTTOGUSTO]: "Brand.500", [STORE_IDS.QVERDE]: "Brand.500" },
      "ghost-icon-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "danger-bg-default": {
        [STORE_IDS.OTTOGUSTO]: "Danger.600",
        [STORE_IDS.QVERDE]: "Danger.600",
      },
      "danger-bg-hover": { [STORE_IDS.OTTOGUSTO]: "Danger.700", [STORE_IDS.QVERDE]: "Danger.700" },
      "danger-bg-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.300",
        [STORE_IDS.QVERDE]: "Neutral.300",
      },
      "danger-text": { [STORE_IDS.OTTOGUSTO]: "Neutral.100", [STORE_IDS.QVERDE]: "Neutral.100" },
      "danger-text-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "danger-icon": { [STORE_IDS.OTTOGUSTO]: "Neutral.200", [STORE_IDS.QVERDE]: "Neutral.200" },
      "danger-icon-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "danger-outline-border": {
        [STORE_IDS.OTTOGUSTO]: "Danger.600",
        [STORE_IDS.QVERDE]: "Danger.600",
      },
      "danger-outline-bg-default": {
        [STORE_IDS.OTTOGUSTO]: "transparent",
        [STORE_IDS.QVERDE]: "transparent",
      },
      "danger-outline-bg-hover": {
        [STORE_IDS.OTTOGUSTO]: "Danger.100",
        [STORE_IDS.QVERDE]: "Danger.100",
      },
      "danger-outline-bg-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.300",
        [STORE_IDS.QVERDE]: "Neutral.300",
      },
      "danger-outline-text": {
        [STORE_IDS.OTTOGUSTO]: "Danger.700",
        [STORE_IDS.QVERDE]: "Danger.700",
      },
      "danger-outline-text-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "danger-outline-icon": {
        [STORE_IDS.OTTOGUSTO]: "Danger.600",
        [STORE_IDS.QVERDE]: "Danger.600",
      },
      "danger-outline-icon-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "danger-ghost-bg-hover": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.100",
        [STORE_IDS.QVERDE]: "Neutral.100",
      },
      "danger-ghost-text": {
        [STORE_IDS.OTTOGUSTO]: "Danger.700",
        [STORE_IDS.QVERDE]: "Danger.700",
      },
      "danger-ghost-text-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
      "danger-ghost-icon": {
        [STORE_IDS.OTTOGUSTO]: "Danger.600",
        [STORE_IDS.QVERDE]: "Danger.600",
      },
      "danger-ghost-icon-disabled": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.600",
        [STORE_IDS.QVERDE]: "Neutral.600",
      },
    } as Record<string, Record<string, string>>,
    Header: {
      background: { [STORE_IDS.OTTOGUSTO]: "Brand.800", [STORE_IDS.QVERDE]: "Neutral.white" },
      divider: { [STORE_IDS.OTTOGUSTO]: "Neutral.300", [STORE_IDS.QVERDE]: "Neutral.400" },
      "action-bg-default": {
        [STORE_IDS.OTTOGUSTO]: "Brand.800",
        [STORE_IDS.QVERDE]: "Neutral.white",
      },
      "action-bg-hover": { [STORE_IDS.OTTOGUSTO]: "Brand.900", [STORE_IDS.QVERDE]: "Neutral.100" },
      "action-text": { [STORE_IDS.OTTOGUSTO]: "Neutral.100", [STORE_IDS.QVERDE]: "Neutral.900" },
      "action-icon": { [STORE_IDS.OTTOGUSTO]: "Neutral.200", [STORE_IDS.QVERDE]: "Neutral.700" },
      "badge-dot-bg": { [STORE_IDS.OTTOGUSTO]: "Accent.500", [STORE_IDS.QVERDE]: "Danger.500" },
      "badge-count-bg": { [STORE_IDS.OTTOGUSTO]: "Accent.500", [STORE_IDS.QVERDE]: "Danger.500" },
      "badge-count-text": {
        [STORE_IDS.OTTOGUSTO]: "Neutral.900",
        [STORE_IDS.QVERDE]: "Neutral.100",
      },
    } as Record<string, Record<string, string>>,
    Footer: {
      background: { [STORE_IDS.OTTOGUSTO]: "Brand.900", [STORE_IDS.QVERDE]: "Brand.900" },
      divider: { [STORE_IDS.OTTOGUSTO]: "Brand.800", [STORE_IDS.QVERDE]: "Brand.800" },
    } as Record<string, Record<string, string>>,
  };

  const themeConfig = CLIENT_THEME_CONFIG.stores[store].desktop;
  const layout = themeConfig.Layout;
  const layoutUsage = themeConfig.LayoutUsage;

  // Layout variables
  const layoutVariables = [
    ...Object.entries(layout.Space).map(([key, value]) => `--space-${key}: ${value}px;`),
    ...Object.entries(layout.BorderRadius).map(
      ([key, value]) => `--border-radius-${key}: ${value}px;`,
    ),
    ...Object.entries(layout.Sizing).map(([key, value]) => `--${key}: ${value};`),
    ...Object.entries(layout.Breakpoint).map(([key, value]) => `--breakpoint-${key}: ${value};`),
    ...Object.entries(layout.IconSize).map(([key, value]) => `--${key}: ${value};`),
  ];

  // Layout Usage tokens (responsive)
  const layoutUsageBaseVariables: string[] = [];
  const layoutUsageDesktopVariables: string[] = [];

  Object.entries(layoutUsage).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null && "base" in value) {
      layoutUsageBaseVariables.push(`--${key}: ${(value as any).base};`);
      if ((value as any).desktop) {
        layoutUsageDesktopVariables.push(`--${key}: ${(value as any).desktop};`);
      }
    } else {
      layoutUsageBaseVariables.push(`--${key}: ${value};`);
    }
  });

  // Build CSS variables
  const cssVariables = [
    ...colorMappings.map(({ name, ottogusto, qverde }) => {
      const colorValue = getStoreColorMapping(store, ottogusto, qverde);
      return `--${name}: ${colorValue};`;
    }),
    ...Object.entries(componentTokens.Button).map(([key, val]) => {
      const ottogustoVal = val[STORE_IDS.OTTOGUSTO];
      const qverdeVal = val[STORE_IDS.QVERDE];
      let colorValue: string;
      if (ottogustoVal === "transparent" || qverdeVal === "transparent") {
        colorValue = "transparent";
      } else {
        colorValue = getStoreColorMapping(store, ottogustoVal || "", qverdeVal || "");
      }
      const varPrefix =
        key.startsWith("outline") || key.startsWith("danger-outline")
          ? "--color-button"
          : "--button";
      return `${varPrefix}-${key}: ${colorValue};`;
    }),
    ...Object.entries(componentTokens.Header).map(([key, val]) => {
      const colorValue = getStoreColorMapping(
        store,
        val[STORE_IDS.OTTOGUSTO] || "",
        val[STORE_IDS.QVERDE] || "",
      );
      return `--header-${key}: ${colorValue};`;
    }),
    ...Object.entries(componentTokens.Footer).map(([key, val]) => {
      const colorValue = getStoreColorMapping(
        store,
        val[STORE_IDS.OTTOGUSTO] || "",
        val[STORE_IDS.QVERDE] || "",
      );
      return `--footer-${key}: ${colorValue};`;
    }),
    ...layoutVariables,
  ].join("\n    ");

  // Responsive desktop overrides
  const desktopBreakpoint = layout.Breakpoint["min-tablet"];
  const layoutUsageCSS =
    layoutUsageDesktopVariables.length > 0
      ? `
    @media (min-width: ${desktopBreakpoint}) {
      :root {
        ${layoutUsageDesktopVariables.join("\n        ")}
      }
    }`
      : "";

  // Layout Template Media Queries (for split layouts)
  const minDesktopBreakpoint = layout.Breakpoint["min-desktop"];
  const layoutTemplateCSS = `
    @media (min-width: ${minDesktopBreakpoint}) {
      .section-split-primary-left {
        display: grid !important;
        grid-template-columns: var(--layout-width-sidepanel) 1fr !important;
        gap: var(--gap-panel-to-content) !important;
      }
      .section-split-primary-right {
        display: grid !important;
        grid-template-columns: 1fr var(--layout-width-sidepanel) !important;
        gap: var(--gap-panel-to-content) !important;
      }
    }`;

  return `
    :root {
      ${cssVariables}
      ${layoutUsageBaseVariables.join("\n      ")}
    }${layoutUsageCSS}${layoutTemplateCSS}`;
}

// ---------------------------------------------------------------------------
// generateTypographyCSS — mirrors TypographyProvider useEffect logic
// ---------------------------------------------------------------------------

export function generateTypographyCSS(
  store: StoreName,
  device: "mobile" | "desktop" = "desktop",
): string {
  const themeConfig = CLIENT_THEME_CONFIG.stores[store][device];

  const getFontVariable = (fontName: string): string => {
    if (!fontName || typeof fontName !== "string") return "'system-ui', sans-serif";
    const fontNameLower = fontName.toLowerCase();
    switch (fontNameLower) {
      case "anton":
        return "var(--font-anton), sans-serif";
      case "overpass":
        return "var(--font-overpass), sans-serif";
      case "overpass mono":
      case "overpassmono":
        return "var(--font-overpass-mono), sans-serif";
      case "oswald":
        return "var(--font-oswald), sans-serif";
      case "chivo mono":
      case "chivomono":
        return "var(--font-chivo-mono), sans-serif";
      case "public sans":
      case "publicsans":
        return "var(--font-public-sans), system-ui, sans-serif";
      default:
        return `'${fontName}', system-ui, sans-serif`;
    }
  };

  const typography = {
    fontFamily: {
      display: themeConfig.Font.Family.display,
      body: themeConfig.Font.Family.body,
      heading: themeConfig.Font.Family.heading,
      mono: themeConfig.Font.Family.mono,
    },
    fontWeight: {
      regular: themeConfig.Font.Weight.Regular,
      medium: themeConfig.Font.Weight.Medium,
      semiBold: themeConfig.Font.Weight.SemiBold,
      bold: themeConfig.Font.Weight.Bold,
    },
    fontSize: themeConfig.Font.Size,
    lineHeight: themeConfig.Font.LineHeight,
    letterSpacing: themeConfig.Font.letterSpacing,
  };

  return `
    :root {
      --font-family-display: ${getFontVariable(typography.fontFamily.display)};
      --font-family-body: ${getFontVariable(typography.fontFamily.body)};
      --font-family-heading: ${getFontVariable(typography.fontFamily.heading)};
      --font-family-mono: ${getFontVariable(typography.fontFamily.body)};
      --font-weight-regular: ${typography.fontWeight.regular};
      --font-weight-medium: ${typography.fontWeight.medium};
      --font-weight-semibold: ${typography.fontWeight.semiBold};
      --font-weight-bold: ${typography.fontWeight.bold};
      --font-size-xs: ${typography.fontSize.xs};
      --font-size-sm: ${typography.fontSize.sm};
      --font-size-md: ${typography.fontSize.md};
      --font-size-lg: ${typography.fontSize.lg};
      --font-size-xl: ${typography.fontSize.xl};
      --font-size-2xl: ${typography.fontSize["2xl"]};
      --font-size-3xl: ${typography.fontSize["3xl"]};
      --font-size-xs-deprecated: ${typography.fontSize["xs-deprecated"]};
      --font-size-sm-deprecated: ${typography.fontSize["sm-deprecated"]};
      --font-size-md-deprecated: ${typography.fontSize["md-deprecated"]};
      --font-size-lg-deprecated: ${typography.fontSize["lg-deprecated"]};
      --font-size-xl-deprecated: ${typography.fontSize["xl-deprecated"]};
      --font-size-2xl-deprecated: ${typography.fontSize["2xl-deprecated"]};
      --font-size-3xl-deprecated: ${typography.fontSize["3xl-deprecated"]};
      --font-line-height-compact: ${typography.lineHeight.compact};
      --font-line-height-snug: ${typography.lineHeight.snug};
      --font-line-height-standard: ${typography.lineHeight.standard};
      --font-line-height-spacious: ${typography.lineHeight.spacious};
      --font-line-height-xs-deprecated: ${typography.lineHeight["xs-deprecated"]};
      --font-line-height-sm-deprecated: ${typography.lineHeight["sm-deprecated"]};
      --font-line-height-md-deprecated: ${typography.lineHeight["md-deprecated"]};
      --font-line-height-lg-deprecated: ${typography.lineHeight["lg-deprecated"]};
      --font-line-height-xl-deprecated: ${typography.lineHeight["xl-deprecated"]};
      --font-letter-spacing-tight: ${typography.letterSpacing.tight};
      --font-letter-spacing-normal: ${typography.letterSpacing.normal};
      --font-letter-spacing-wide: ${typography.letterSpacing.wide};
      --font-letter-spacing-wider: ${typography.letterSpacing.wider};
    }
  `;
}
