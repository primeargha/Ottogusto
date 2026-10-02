"use client";
import { useEffect } from "react";
import { generateTypographyCSSVariables, getClientDeviceMode } from "@/utils/theme-utils";

interface TypographyProviderProps {
  children: React.ReactNode;
}

export function TypographyProvider({ children }: TypographyProviderProps) {
  useEffect(() => {
    // Function to update typography CSS variables
    const updateTypographyVariables = () => {
      const device = getClientDeviceMode();
      const cssVariables = generateTypographyCSSVariables(device);

      // Create or update the typography style element
      let typographyStyle = document.getElementById("typography-variables");
      if (!typographyStyle) {
        typographyStyle = document.createElement("style");
        typographyStyle.id = "typography-variables";
        document.head.appendChild(typographyStyle);
      }

      typographyStyle.textContent = cssVariables;
    };

    // PERF: Skip the initial injection if the server already rendered the
    // typography-variables <style> tag (via layout.tsx). Only attach the
    // resize listener so responsive device-mode changes still work.
    const existingStyle = document.getElementById("typography-variables");
    const serverRendered =
      existingStyle && existingStyle.textContent && existingStyle.textContent.trim().length > 0;

    if (!serverRendered) {
      updateTypographyVariables();
    }

    // Update on window resize (always needed for responsive device-mode switching)
    let resizeTimeout: number | null = null;
    const handleResize = () => {
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }

      resizeTimeout = window.setTimeout(() => {
        resizeTimeout = null;
        updateTypographyVariables();
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }
    };
  }, []);

  return <>{children}</>;
}
