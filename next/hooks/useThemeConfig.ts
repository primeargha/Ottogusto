"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  StoreName,
  DeviceMode,
  CLIENT_THEME_CONFIG,
  getStoreFromDomain,
  getDeviceMode,
} from "../config/client-theme-config";
import { STORE_IDS, isValidStoreId } from "../config/store-constants";
import { useStore } from "../contexts/StoreContext";

interface ThemeConfig {
  currentStore: StoreName;
  currentDevice: DeviceMode;
  screenWidth: number;
  getValue: (path: string) => string;
  updateValue: (path: string, value: string) => void;
  switchStore: (store: StoreName) => void;
  switchDevice: (device: DeviceMode) => void;
}

export function useThemeConfig(): ThemeConfig {
  // PERF: Seed from the SSR-detected store (StoreProvider) instead of a hardcoded
  // default — the server already injected matching CSS vars into
  // <style id="typography-variables">/<style id="runtime-colors">, so starting from
  // the same store avoids an unnecessary re-apply/repaint right after hydration.
  const { currentStore: serverStore } = useStore();
  const [currentStore, setCurrentStore] = useState<StoreName>(serverStore);
  const [currentDevice, setCurrentDevice] = useState<DeviceMode>("desktop");
  const [screenWidth, setScreenWidth] = useState<number>(1024);

  // Initialize theme on mount
  useEffect(() => {
    // Detect store from domain using the new URL-based approach
    const detectedStore = getStoreFromDomain(window.location.href);

    // Ensure we have a valid store
    const resolvedStore =
      detectedStore && isValidStoreId(detectedStore)
        ? detectedStore
        : CLIENT_THEME_CONFIG.settings.defaultStore;

    if (!detectedStore || !isValidStoreId(detectedStore)) {
      console.warn(
        `Invalid store detected: ${detectedStore}, using default: ${CLIENT_THEME_CONFIG.settings.defaultStore}`,
      );
    }

    if (resolvedStore !== serverStore) {
      setCurrentStore(resolvedStore);
    }

    // Detect device from screen width
    const detectedDevice = getDeviceMode(window.innerWidth);
    setCurrentDevice(detectedDevice);
    setScreenWidth(window.innerWidth);

    // Note: applying the resolved theme to the document happens in the
    // store/device-change effect below, which skips its first run (matching
    // the server-rendered CSS) and only fires when a state update above
    // actually changes currentStore/currentDevice.
  }, [serverStore]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newDevice = getDeviceMode(newWidth);

      setScreenWidth(newWidth);

      if (newDevice !== currentDevice) {
        setCurrentDevice(newDevice);
        applyThemeToDocument(currentStore, newDevice);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentDevice, currentStore]);

  // Apply theme when store or device changes.
  // PERF: Skip the very first run — on mount, currentStore/currentDevice still
  // match what the server already rendered into <style id="typography-variables">
  // /<style id="runtime-colors">, so re-applying here would just force an
  // unnecessary style recalc/repaint. Only genuine post-mount changes
  // (switchStore/switchDevice) should trigger a re-apply.
  const isFirstApplyRun = useRef(true);
  useEffect(() => {
    if (isFirstApplyRun.current) {
      isFirstApplyRun.current = false;
      return;
    }
    applyThemeToDocument(currentStore, currentDevice);
  }, [currentStore, currentDevice]);

  // Get theme value by path
  const getValue = useCallback(
    (path: string): string => {
      // Ensure we have valid store and device
      const validStore = currentStore || CLIENT_THEME_CONFIG.settings.defaultStore;
      const validDevice = currentDevice || "desktop";

      // Validate that the store and device exist in config
      if (!CLIENT_THEME_CONFIG.stores[validStore]) {
        console.error(`Store "${validStore}" not found in theme config`);
        return "#000000"; // Fallback color
      }

      if (!CLIENT_THEME_CONFIG.stores[validStore][validDevice]) {
        console.error(`Device "${validDevice}" not found for store "${validStore}"`);
        return "#000000"; // Fallback color
      }

      const themeConfig = CLIENT_THEME_CONFIG.stores[validStore][validDevice];
      const pathArray = path.split("/");
      let current: any = themeConfig;

      for (const key of pathArray) {
        if (current && typeof current === "object" && key in current) {
          current = current[key];
        } else {
          console.warn(`Path not found: ${path} for store: ${validStore}, device: ${validDevice}`);
          return "#000000"; // Fallback color
        }
      }

      return current || "#000000";
    },
    [currentStore, currentDevice],
  );

  // Update theme value (for dynamic theming)
  const updateValue = useCallback((path: string, value: string) => {
    // This would update the theme configuration and regenerate CSS
    // For now, just log the update
  }, []);

  // Switch store
  const switchStore = useCallback((store: StoreName) => {
    setCurrentStore(store);
  }, []);

  // Switch device (for testing)
  const switchDevice = useCallback((device: DeviceMode) => {
    setCurrentDevice(device);
  }, []);

  return {
    currentStore,
    currentDevice,
    screenWidth,
    getValue,
    updateValue,
    switchStore,
    switchDevice,
  };
}

// Apply theme to document by regenerating CSS variables
function applyThemeToDocument(store: StoreName, device?: DeviceMode): void {
  // Ensure we have valid store and device
  const validStore = store || CLIENT_THEME_CONFIG.settings.defaultStore;
  const validDevice = device || "desktop";

  // Validate that the store and device exist in config
  if (!CLIENT_THEME_CONFIG.stores[validStore]) {
    console.error(`Store "${validStore}" not found in theme config`);
    return;
  }

  if (!CLIENT_THEME_CONFIG.stores[validStore][validDevice]) {
    console.error(`Device "${validDevice}" not found for store "${validStore}"`);
    return;
  }

  const themeConfig = CLIENT_THEME_CONFIG.stores[validStore][validDevice];

  // Convert nested object to CSS variables
  const cssVars = flattenObjectToCSSVars(themeConfig);

  // Apply to document root
  const root = document.documentElement;

  Object.entries(cssVars).forEach(([varName, value]) => {
    root.style.setProperty(varName, value);
  });
}

// Helper function to flatten nested objects to CSS variables
function flattenObjectToCSSVars(obj: any, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};

  // Safety check: ensure obj is valid
  if (!obj || typeof obj !== "object") {
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    // Safety check: skip if key is undefined or null
    if (key == null) {
      continue;
    }

    const currentPath = prefix ? `${prefix}/${key}` : key;

    // Font.Family.* is owned by TypographyProvider/generateTypographyCSSVariables,
    // which maps font names through getFontVariable() to var(--font-oswald), etc.
    // Flattening it here would set the raw bare name (e.g. "Oswald") as an inline
    // --font-family-* style, which wins over the correctly-mapped stylesheet value.
    if (prefix === "Font" && key === "Family") {
      continue;
    }

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Recursively flatten nested objects
      const nested = flattenObjectToCSSVars(value, currentPath);
      Object.assign(result, nested);
    } else if (typeof value === "string") {
      // Convert path to CSS variable name
      const cssVarName = pathToCSSVariable(currentPath);
      if (cssVarName) {
        result[cssVarName] = value;
      }
    }
  }

  return result;
}

// Helper function to convert path to CSS variable name
function pathToCSSVariable(path: string): string {
  // Safety check: ensure path is a valid string
  if (!path || typeof path !== "string") {
    console.warn(`Invalid path provided to pathToCSSVariable: ${path}`);
    return "";
  }

  const parts = path.split("/");
  const cssParts = parts
    ?.map((part) => {
      if (!part || typeof part !== "string") {
        return "";
      }
      return toKebabCase(part);
    })
    .filter(Boolean);

  if (cssParts.length === 0) {
    return "";
  }

  return `--${cssParts.join("-")}`;
}

// Helper function to convert camelCase to kebab-case
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, "$1-$2")
    .toLowerCase();
}

// Simplified hook for common use cases
export function useTheme() {
  const { currentStore, currentDevice, getValue } = useThemeConfig();
  return { currentStore, currentDevice, getValue };
}
