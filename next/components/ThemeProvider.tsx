"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useThemeConfig } from "../hooks/useThemeConfig";
import { StoreName, DeviceMode } from "../config/client-theme-config";

// Theme context type
interface ThemeContextType {
  currentStore: StoreName;
  currentDevice: DeviceMode;
  screenWidth: number;
  getValue: (path: string) => string;
  updateValue: (path: string, value: string) => void;
  switchStore: (store: StoreName) => void;
  switchDevice: (device: DeviceMode) => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeConfig = useThemeConfig();

  return <ThemeContext.Provider value={themeConfig}>{children}</ThemeContext.Provider>;
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Export the context for advanced usage
export { ThemeContext };
