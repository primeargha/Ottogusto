import {
  CLIENT_THEME_CONFIG,
  StoreName,
  DeviceMode,
  getStoreFromDomain,
} from "../config/client-theme-config";
import type { FeatureFlags } from "../config/feature-flags.types";
import { STORE_IDS, DEFAULT_STORE } from "../config/store-constants";
import {
  evaluateFeatureFlag,
  getCountryCodeFromLanguageCountrySegment,
  getLanguageCountryFromPathname,
} from "./feature-flag-env";

// Get current store from URL (client-side) or headers (server-side)
export function getCurrentStore(): StoreName {
  // For client-side, extract from window.location
  if (typeof window !== "undefined") {
    return getStoreFromDomain(window.location.href);
  }

  // For server-side, we'll need to get from headers or request
  // This will be handled by server-specific functions
  return DEFAULT_STORE; // Fallback
}

// Get current store from server-side (headers)
export function getServerStore(headers: Headers): StoreName {
  const host = headers.get("host") || "";
  return getStoreFromDomain(`https://${host}`);
}

// Get current device mode (for server-side)
export function getServerDeviceMode(): DeviceMode {
  // For server-side, we'll default to desktop
  // In a real implementation, you might want to detect from headers
  // You can enhance this by reading from request headers if needed
  return "desktop";
}

// Enhanced server device detection with user agent
export function getServerDeviceModeFromUserAgent(userAgent: string): DeviceMode {
  const mobileKeywords = [
    "Mobile",
    "Android",
    "iPhone",
    "iPad",
    "Windows Phone",
    "BlackBerry",
    "Opera Mini",
    "IEMobile",
    "Mobile Safari",
  ];

  return mobileKeywords.some((keyword) => userAgent.includes(keyword)) ? "mobile" : "desktop";
}

// Get current device mode (for client-side)
export function getClientDeviceMode(): DeviceMode {
  if (typeof window !== "undefined") {
    return window.innerWidth < CLIENT_THEME_CONFIG.settings.mobileBreakpoint ? "mobile" : "desktop";
  }
  return "desktop";
}

// Helper function to get nested object value by path
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && current !== null && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Get theme value by path for current store and device
export function getThemeValue(path: string, device?: DeviceMode): unknown {
  const store = getCurrentStore();
  const currentDevice = device || getServerDeviceMode();

  const themeConfig = CLIENT_THEME_CONFIG.stores[store][currentDevice];
  return getNestedValue(themeConfig, path);
}

// Get theme value by path for server-side (with headers)
export function getServerThemeValue(path: string, headers: Headers, device?: DeviceMode): unknown {
  const store = getServerStore(headers);
  const currentDevice = device || getServerDeviceMode();

  const themeConfig = CLIENT_THEME_CONFIG.stores[store][currentDevice];
  return getNestedValue(themeConfig, path);
}

// Get color value for current store only (colors don't change with device)
export function getColorValue(colorPath: string): string {
  const store = getCurrentStore();
  const themeConfig = CLIENT_THEME_CONFIG.stores[store].desktop; // Always use desktop for colors
  const fullPath = `Color.${colorPath}`;
  const value = getNestedValue(themeConfig, fullPath);

  if (typeof value === "string") {
    return value;
  }

  // Fallback to default color if not found
  console.warn(`Color not found: ${fullPath}, using fallback`);
  return "#000000";
}

// Get color value for server-side (with headers)
export function getServerColorValue(colorPath: string, headers: Headers): string {
  const store = getServerStore(headers);
  const themeConfig = CLIENT_THEME_CONFIG.stores[store].desktop; // Always use desktop for colors
  const fullPath = `Color.${colorPath}`;
  const value = getNestedValue(themeConfig, fullPath);

  if (typeof value === "string") {
    return value;
  }

  // Fallback to default color if not found
  console.warn(`Color not found: ${fullPath}, using fallback`);
  return "#000000";
}

// Get font value for current store and device
export function getFontValue(fontPath: string, device?: DeviceMode): string {
  const fullPath = `Font.${fontPath}`;
  const value = getThemeValue(fullPath, device);

  if (typeof value === "string") {
    return value;
  }

  // Fallback to default font if not found
  console.warn(`Font value not found: ${fullPath}, using fallback`);
  return "";
}

// Get typography values for current store and device (typography changes with both store and device)
export function getTypographyValues(device?: DeviceMode) {
  const store = getCurrentStore();
  const currentDevice = device || getServerDeviceMode();
  const themeConfig = CLIENT_THEME_CONFIG.stores[store][currentDevice];

  return {
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
}

// Get typography values for server-side (with headers)
export function getServerTypographyValues(headers: Headers, device?: DeviceMode) {
  const store = getServerStore(headers);
  const currentDevice = device || getServerDeviceMode();
  const themeConfig = CLIENT_THEME_CONFIG.stores[store][currentDevice];

  return {
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
}

// Helper function to get store-specific color mapping
export function getStoreColorMapping(ottogustoPath: string, qverdePath: string): string {
  const store = getCurrentStore();

  if (store === STORE_IDS.OTTOGUSTO) {
    return getColorValue(ottogustoPath);
  } else {
    return getColorValue(qverdePath);
  }
}

// Helper function to get store-specific typography mapping
export function getStoreTypographyMapping(
  ottogustoPath: string,
  qverdePath: string,
  device: DeviceMode = "desktop",
): string {
  const store = getCurrentStore();
  const themeConfig = CLIENT_THEME_CONFIG.stores[store][device];

  if (store === STORE_IDS.OTTOGUSTO) {
    return String(getNestedValue(themeConfig, `Font.${ottogustoPath}`));
  } else {
    return String(getNestedValue(themeConfig, `Font.${qverdePath}`));
  }
}

// Generate typography CSS custom properties for current store and device
export function generateTypographyCSSVariables(device?: DeviceMode): string {
  const typography = getTypographyValues(device);

  // Map font names to Next.js font variables with fallbacks
  const getFontVariable = (fontName: string): string => {
    if (!fontName || typeof fontName !== "string") {
      console.warn(`Invalid font name: ${fontName}, using fallback`);
      return "'system-ui', sans-serif";
    }

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
        console.warn(`Font not found: ${fontName}, using fallback`);
        return `'${fontName}', system-ui, sans-serif`;
    }
  };

  return `
    :root {
      /* Font Families - Semantic variables that adapt to store */
      --font-family-display: ${getFontVariable(typography.fontFamily.display)};
      --font-family-body: ${getFontVariable(typography.fontFamily.body)};
      --font-family-heading: ${getFontVariable(typography.fontFamily.heading)};
      --font-family-mono: ${getFontVariable(typography.fontFamily.body)};
      
      /* Font Weights */
      --font-weight-regular: ${typography.fontWeight.regular};
      --font-weight-medium: ${typography.fontWeight.medium};
      --font-weight-semibold: ${typography.fontWeight.semiBold};
      --font-weight-bold: ${typography.fontWeight.bold};
      
      /* Font Sizes */
      /* new ones */
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
      
      /* Line Heights */
      /* new ones */
      --font-line-height-compact: ${typography.lineHeight.compact};
      --font-line-height-snug: ${typography.lineHeight.snug};
      --font-line-height-standard: ${typography.lineHeight.standard};
      --font-line-height-spacious: ${typography.lineHeight.spacious};

      --font-line-height-xs-deprecated: ${typography.lineHeight["xs-deprecated"]};
      --font-line-height-sm-deprecated: ${typography.lineHeight["sm-deprecated"]};
      --font-line-height-md-deprecated: ${typography.lineHeight["md-deprecated"]};
      --font-line-height-lg-deprecated: ${typography.lineHeight["lg-deprecated"]};
      --font-line-height-xl-deprecated: ${typography.lineHeight["xl-deprecated"]};

      /* Letter Spacing */
      --font-letter-spacing-tight: ${typography.letterSpacing.tight};
      --font-letter-spacing-normal: ${typography.letterSpacing.normal};
      --font-letter-spacing-wide: ${typography.letterSpacing.wide};
      --font-letter-spacing-wider: ${typography.letterSpacing.wider};
    }
  `;
}

// Build-time safe version of getStoreColorMapping for tailwind.config.js
export function getBuildTimeColorMapping(ottogustoPath: string, qverdePath: string): string {
  // During build time, we can't determine the store, so we'll use fallback colors
  // This prevents the "Cannot read properties of undefined (reading 'startsWith')" error

  try {
    // Try to get the ottogusto color as fallback
    const ottogustoTheme = CLIENT_THEME_CONFIG.stores.ottogusto.desktop;
    const ottogustoColor = getNestedValue(ottogustoTheme, `Color.${ottogustoPath}`);

    if (typeof ottogustoColor === "string" && ottogustoColor.startsWith("#")) {
      return ottogustoColor;
    }
  } catch (error) {
    console.warn(`Could not get color for path: ${ottogustoPath}`, error);
  }

  // Ultimate fallback
  return "#000000";
}

// Runtime version of getStoreColorMapping (for client-side use)
export function getRuntimeStoreColorMapping(ottogustoPath: string, qverdePath: string): string {
  const store = getCurrentStore();

  if (store === STORE_IDS.OTTOGUSTO) {
    return getColorValue(ottogustoPath);
  } else {
    return getColorValue(qverdePath);
  }
}

// Feature flag utilities — values only from NEXT_PUBLIC_* env JSON (see feature-flag-env.ts)
export function getFeatureFlag(
  featureName: keyof FeatureFlags,
  countryCode: string | null,
): boolean {
  try {
    return evaluateFeatureFlag(featureName, countryCode);
  } catch (error) {
    console.warn(`Could not get feature flag ${String(featureName)}:`, error);
    return false;
  }
}

export function getClientFeatureFlag(
  featureName: keyof FeatureFlags,
  languageCountrySegment?: string,
): boolean {
  try {
    let countryCode: string | null = null;
    if (typeof window !== "undefined") {
      const locale = getLanguageCountryFromPathname(window.location.pathname);
      countryCode = locale ? getCountryCodeFromLanguageCountrySegment(locale) : null;
    } else if (languageCountrySegment) {
      countryCode = getCountryCodeFromLanguageCountrySegment(languageCountrySegment);
    }
    return evaluateFeatureFlag(featureName, countryCode);
  } catch (error) {
    console.warn(`Could not get client feature flag ${String(featureName)}:`, error);
    return false;
  }
}
