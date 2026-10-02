"use client";
import { OGButton } from "@/components/og-components/OGButton";
import OGCategoriesSearcBlock from "@/components/og-components/OGCategoriesSearcBlock";
import OGPill from "@/components/og-components/OGPill";
import { Box } from "@/components/ui/box";
import React, { useState, useEffect } from "react";
import { getClientDeviceMode, getClientFeatureFlag } from "@/utils/theme-utils";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { DEFAULT_STORE } from "@/config/store-constants";

type Props = {};

export default function TestPage() {
  const [deviceMode, setDeviceMode] = useState<string>("desktop");
  const [vinFeatureEnabled, setVinFeatureEnabled] = useState<boolean>(false);

  useEffect(() => {
    setDeviceMode(getClientDeviceMode());

    const handleResize = () => {
      setDeviceMode(getClientDeviceMode());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check feature flags
  useEffect(() => {
    setVinFeatureEnabled(getClientFeatureFlag("vin_feature_flag"));
  }, []);

  // Update typography debug info
  useEffect(() => {
    const updateTypographyDebug = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      const titleFamily = computedStyle.getPropertyValue("--font-family-title").trim();
      const sizeMd = computedStyle.getPropertyValue("--font-size-md").trim();
      const lineHeightMd = computedStyle.getPropertyValue("--font-line-height-md").trim();

      const titleElement = document.getElementById("font-family-title");
      const sizeElement = document.getElementById("font-size-md");
      const lineHeightElement = document.getElementById("font-line-height-md");

      if (titleElement) titleElement.textContent = titleFamily || "Not set";
      if (sizeElement) sizeElement.textContent = sizeMd || "Not set";
      if (lineHeightElement) lineHeightElement.textContent = lineHeightMd || "Not set";
    };

    // Update after a short delay to allow CSS variables to be set
    const timer = setTimeout(updateTypographyDebug, 100);
    return () => clearTimeout(timer);
  }, [deviceMode]);

  return (
    <div className="min-h-screen space-y-8 p-8 pt-28">
      <h1 className="mb-8 text-4xl font-bold text-color-primary-main">
        🎨 Store-Specific Theme System Test Page
      </h1>

      {/* System Info */}
      <section className="mb-8 rounded-lg bg-color-background-l1 p-4">
        <h2 className="mb-4 text-2xl font-semibold text-color-text-body">System Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-medium text-color-primary-main">New Features</h3>
            <ul className="space-y-1 text-color-text-body">
              <li>✅ Store-specific color mapping (ottogusto vs qverde)</li>
              <li>✅ Colors depend ONLY on STORE (not device)</li>
              <li>✅ Typography depends on STORE + DEVICE</li>
              <li>
                ✅ Opacity support:{" "}
                <code className="rounded bg-color-background-l2 px-2 py-1">
                  bg-color-primary-main/80
                </code>
              </li>
              <li>✅ Direct hex values from client-theme-config.ts</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-medium text-color-primary-main">Current Settings</h3>
            <ul className="space-y-1 text-color-text-body">
              <li>
                <strong>Store:</strong>{" "}
                {typeof window !== "undefined"
                  ? getStoreFromDomain(window.location.href)
                  : DEFAULT_STORE}
              </li>
              <li>
                <strong>Device:</strong> {deviceMode}
              </li>
              <li>
                <strong>Environment:</strong> {process.env.NODE_ENV || "development"}
              </li>
              <li>
                <strong>Colors:</strong> Store-specific mapping
              </li>
              <li>
                <strong>Typography:</strong> Store + Device responsive
              </li>
              <li>
                <strong>Font Family (Title):</strong> <span id="font-family-title">Loading...</span>
              </li>
              <li>
                <strong>Font Size (MD):</strong> <span id="font-size-md">Loading...</span>
              </li>
              <li>
                <strong>Line Height (MD):</strong> <span id="font-line-height-md">Loading...</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Store-Specific Color Testing */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">
          Store-Specific Color Testing
        </h2>
        <div className="rounded-lg bg-color-background-l2 p-4">
          <h3 className="mb-4 text-lg font-medium text-color-primary-main">
            Color Mapping Examples
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-color-text-body">Primary Colors</h4>
              <div className="rounded bg-color-primary-main p-2">
                <p className="text-sm text-color-text-on-brand">Primary Main</p>
                <code className="text-xs text-color-text-on-brand opacity-75">
                  bg-color-primary-main
                </code>
              </div>
              <div className="rounded bg-color-primary-hover p-2">
                <p className="text-sm text-color-text-on-brand">Primary Hover</p>
                <code className="text-xs text-color-text-on-brand opacity-75">
                  bg-color-primary-hover
                </code>
              </div>
              <div className="rounded bg-color-primary-disabled p-2">
                <p className="text-sm text-color-text-on-brand">Primary Disabled</p>
                <code className="text-xs text-color-text-on-brand opacity-75">
                  bg-color-primary-disabled
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-color-text-body">Text Colors</h4>
              <div className="rounded border bg-color-background-none p-2">
                <p className="text-sm text-color-text-body">Text Body</p>
                <code className="text-xs text-color-text-body opacity-75">
                  text-color-text-body
                </code>
              </div>
              <div className="rounded border bg-color-background-none p-2">
                <p className="text-sm text-color-text-placeholder">Text Placeholder</p>
                <code className="text-xs text-color-text-placeholder opacity-75">
                  text-color-text-placeholder
                </code>
              </div>
              <div className="rounded border bg-color-background-none p-2">
                <p className="text-sm text-color-text-disabled">Text Disabled</p>
                <code className="text-xs text-color-text-disabled opacity-75">
                  text-color-text-disabled
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-color-text-body">Background Colors</h4>
              <div className="rounded bg-color-background-l1 p-2">
                <p className="text-sm text-color-text-body">Background L1</p>
                <code className="text-xs text-color-text-body opacity-75">
                  bg-color-background-l1
                </code>
              </div>
              <div className="rounded bg-color-background-l2 p-2">
                <p className="text-sm text-color-text-body">Background L2</p>
                <code className="text-xs text-color-text-body opacity-75">
                  bg-color-background-l2
                </code>
              </div>
              <div className="rounded bg-color-background-l3 p-2">
                <p className="text-sm text-color-text-body">Background L3</p>
                <code className="text-xs text-color-text-body opacity-75">
                  bg-color-background-l3
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div>
        <div>
          <h2 className="bg-color-hover-action-primary text-2xl font-semibold text-color-text-body">
            Store-Specific Color Testing (Server)
          </h2>
        </div>
        <div>
          <h2 className="border border-color-text-body bg-color-text-body text-2xl font-semibold text-color-text-on-dark">
            Store-Specific Color Testing (Server)
          </h2>
        </div>
        <div>
          <h2 className="border border-color-text-body bg-color-text-body text-2xl font-semibold text-color-text-on-dark hover:bg-color-hover-action-primary">
            Store-Specific Color Testing (Server)
          </h2>
        </div>
      </div>

      {/* Hover Effects Testing */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">Hover Effects Testing</h2>
        <div className="rounded-lg bg-color-background-l2 p-4">
          <h3 className="mb-4 text-lg font-medium text-color-primary-main">
            Tailwind Hover Effects
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="mb-3 text-lg font-medium text-color-text-body">
                Button Hover Effects
              </h4>
              <div className="flex flex-wrap gap-4">
                <button className="rounded-lg bg-color-primary-main px-4 py-2 text-white transition-colors hover:bg-color-primary-hover">
                  Primary Button (hover:bg-color-primary-hover)
                </button>
                <button className="rounded-lg bg-color-secondary-main px-4 py-2 text-white transition-colors hover:bg-color-secondary-hover">
                  Secondary Button (hover:bg-color-secondary-hover)
                </button>
                <button className="rounded-lg bg-color-accent-main px-4 py-2 text-white transition-colors hover:bg-color-accent-dark">
                  Accent Button (hover:bg-color-accent-dark)
                </button>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-lg font-medium text-color-text-body">
                Background Hover Effects
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="cursor-pointer rounded-lg bg-color-background-l1 p-4 transition-colors hover:bg-color-background-l2">
                  <p className="text-color-text-body">Background L1 → L2</p>
                  <code className="text-xs text-color-text-body opacity-75">
                    hover:bg-color-background-l2
                  </code>
                </div>
                <div className="cursor-pointer rounded-lg bg-color-background-l2 p-4 transition-colors hover:bg-color-background-l3">
                  <p className="text-color-text-body">Background L2 → L3</p>
                  <code className="text-xs text-color-text-body opacity-75">
                    hover:bg-color-background-l3
                  </code>
                </div>
                <div className="cursor-pointer rounded-lg bg-color-neutral-main p-4 transition-colors hover:bg-color-neutral-hover">
                  <p className="text-color-text-body">Neutral Main → Hover</p>
                  <code className="text-xs text-color-text-body opacity-75">
                    hover:bg-color-neutral-hover
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-lg font-medium text-color-text-body">Opacity Effects</h4>
              <div className="flex flex-wrap gap-4">
                <div className="rounded-lg bg-color-primary-main p-4">
                  <p className="text-white">Primary Main</p>
                  <div className="bg-color-primary-main/80 mt-2 rounded p-2">
                    <p className="text-sm text-white">Primary Main 80% opacity</p>
                    <code className="text-xs text-white opacity-75">bg-color-primary-main/80</code>
                  </div>
                </div>
                <div className="rounded-lg bg-color-secondary-main p-4">
                  <p className="text-white">Secondary Main</p>
                  <div className="bg-color-secondary-main/60 mt-2 rounded p-2">
                    <p className="text-sm text-white">Secondary Main 60% opacity</p>
                    <code className="text-xs text-white opacity-75">
                      bg-color-secondary-main/60
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography Testing (Store + Device) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">
          Typography Testing (Store + Device)
        </h2>
        <div className="rounded-lg bg-color-background-l2 p-4">
          <h3 className="mb-4 text-lg font-medium text-color-primary-main">Typography Examples</h3>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-color-text-body">
                Headings (Dynamic Font Family & Size)
              </h4>
              <div className="space-y-2">
                <h1 className="text-color-text-body h1">H1 Heading - Font changes with store</h1>
                <code className="text-xs text-color-text-body opacity-75">h1</code>
                <h2 className="text-color-text-body h2">H2 Heading - Font changes with store</h2>
                <code className="text-xs text-color-text-body opacity-75">h2</code>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-color-text-body">
                Body Text (Dynamic Font Family & Size)
              </h4>
              <div className="space-y-2">
                <p className="text-color-text-body body-bold-lg">
                  Body Bold Large - Font changes with store
                </p>
                <code className="text-xs text-color-text-body opacity-75">body-bold-lg</code>
                <p className="text-color-text-body body-medium-md">
                  Body Medium Medium - Font changes with store
                </p>
                <code className="text-xs text-color-text-body opacity-75">body-medium-md</code>
                <p className="text-color-text-body body-regular-sm">
                  Body Regular Small - Font changes with store
                </p>
                <code className="text-xs text-color-text-body opacity-75">body-regular-sm</code>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-color-text-body">
                Semantic Text (Dynamic Font Family & Size)
              </h4>
              <div className="space-y-2">
                <p className="text-color-text-body text-single-300-bold">
                  Text Single 300 Bold - Font changes with store
                </p>
                <code className="text-xs text-color-text-body opacity-75">
                  text-single-300-bold
                </code>
                <p className="text-color-text-body text-single-200-medium">
                  Text Single 200 Medium - Font changes with store
                </p>
                <code className="text-xs text-color-text-body opacity-75">
                  text-single-200-medium
                </code>
                <p className="text-color-text-body text-single-100-regular">
                  Text Single 100 Regular - Font changes with store
                </p>
                <code className="text-xs text-color-text-body opacity-75">
                  text-single-100-regular
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Opacity Examples - Now Working! */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">
          Opacity Examples (Now Working!)
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-color-primary-main/25 rounded-lg p-4">
            <h3 className="mb-2 text-lg font-medium text-color-text-on-brand">25% Opacity</h3>
            <p className="text-color-text-on-brand">Primary background with 25% opacity</p>
          </div>

          <div className="bg-color-primary-main/50 rounded-lg p-4">
            <h3 className="mb-2 text-lg font-medium text-color-text-on-brand">50% Opacity</h3>
            <p className="text-color-text-on-brand">Primary background with 50% opacity</p>
          </div>

          <div className="bg-color-primary-main/75 rounded-lg p-4">
            <h3 className="mb-2 text-lg font-medium text-color-text-on-brand">75% Opacity</h3>
            <p className="text-color-text-on-brand">Primary background with 75% opacity</p>
          </div>

          <div className="rounded-lg bg-color-primary-main p-4">
            <h3 className="mb-2 text-lg font-medium text-color-text-on-brand">100% Opacity</h3>
            <p className="text-color-text-on-brand">Primary background with 100% opacity</p>
          </div>
        </div>
      </section>

      {/* Hover Effects with Opacity */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">Hover Effects with Opacity</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="hover:bg-color-primary-main/80 cursor-pointer rounded-lg bg-color-primary-main p-4 transition-colors">
            <h3 className="mb-2 text-lg font-medium text-color-text-on-brand">
              Primary Hover (80% opacity)
            </h3>
            <p className="text-color-text-on-brand">Hover to see background become 80% opacity</p>
          </div>

          <div className="hover:bg-color-secondary-main/70 cursor-pointer rounded-lg bg-color-secondary-main p-4 transition-colors">
            <h3 className="mb-2 text-lg font-medium text-color-text-on-brand">
              Secondary Hover (70% opacity)
            </h3>
            <p className="text-color-text-on-brand">Hover to see background become 70% opacity</p>
          </div>

          <div className="hover:bg-color-accent-main/60 cursor-pointer rounded-lg bg-color-accent-main p-4 transition-colors">
            <h3 className="mb-2 text-lg font-medium text-color-text-on-brand">
              Accent Hover (60% opacity)
            </h3>
            <p className="text-color-text-on-brand">Hover to see background become 60% opacity</p>
          </div>
        </div>
      </section>

      {/* Color Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">Color Examples</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-medium">Primary Colors</h3>
            <p className="text-color-primary-main">Primary main text</p>
            <p className="text-color-primary-hover">Primary hover text</p>
            <p className="text-color-primary-disabled">Primary disabled text</p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-medium">Secondary Colors</h3>
            <p className="text-color-secondary-main">Secondary main text</p>
            <p className="text-color-secondary-hover">Secondary hover text</p>
            <p className="text-color-secondary-disabled">Secondary disabled text</p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-medium">Accent Colors</h3>
            <p className="text-color-accent-main">Accent main text</p>
            <p className="text-color-accent-dark">Accent dark text</p>
            <p className="text-color-accent-light">Accent light text</p>
          </div>
        </div>
      </section>

      {/* Background Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">Background Examples</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-color-background-l1 p-4">
            <h3 className="mb-2 text-lg font-medium">Background L1</h3>
            <p className="text-color-text-body">Light background level 1</p>
          </div>

          <div className="rounded-lg bg-color-background-l2 p-4">
            <h3 className="mb-2 text-lg font-medium">Background L2</h3>
            <p className="text-color-text-body">Light background level 2</p>
          </div>

          <div className="rounded-lg bg-color-background-l3 p-4">
            <h3 className="mb-2 text-lg font-medium">Background L3</h3>
            <p className="text-color-text-body">Light background level 3</p>
          </div>

          <div className="rounded-lg bg-color-background-l4 p-4">
            <h3 className="mb-2 text-lg font-medium">Background L4</h3>
            <p className="text-color-text-body">Light background level 4</p>
          </div>
        </div>
      </section>

      {/* Button Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">Button Examples</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Primary Buttons</h3>
            <button className="hover:bg-color-primary-main/80 w-full rounded-lg bg-color-primary-main px-4 py-2 text-color-text-on-brand transition-colors">
              Primary Button
            </button>
            <button className="bg-color-primary-main/50 hover:bg-color-primary-main/70 w-full rounded-lg px-4 py-2 text-color-text-on-brand transition-colors">
              Primary Button (50% opacity)
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Secondary Buttons</h3>
            <button className="hover:bg-color-secondary-main/80 w-full rounded-lg bg-color-secondary-main px-4 py-2 text-color-text-on-brand transition-colors">
              Secondary Button
            </button>
            <button className="bg-color-secondary-main/75 hover:bg-color-secondary-main/90 w-full rounded-lg px-4 py-2 text-color-text-on-brand transition-colors">
              Secondary Button (75% opacity)
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Accent Buttons</h3>
            <button className="hover:bg-color-accent-main/80 w-full rounded-lg bg-color-accent-main px-4 py-2 text-color-text-on-brand transition-colors">
              Accent Button
            </button>
            <button className="hover:bg-color-accent-main/60 w-full rounded-lg bg-color-accent-light px-4 py-2 text-color-text-body transition-colors">
              Accent Light Button
            </button>
          </div>
        </div>
      </section>

      {/* System Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">System Colors</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-color-system-warning-light bg-color-system-warning-extra-light p-4">
            <h3 className="mb-2 text-lg font-medium text-color-system-warning-dark">Warning</h3>
            <p className="text-color-system-warning-main">This is a warning message</p>
          </div>

          <div className="rounded-lg border border-color-system-info-light bg-color-system-info-extra-light p-4">
            <h3 className="mb-2 text-lg font-medium text-color-system-info-dark">Info</h3>
            <p className="text-color-system-info-main">This is an info message</p>
          </div>

          <div className="rounded-lg border border-color-system-success-light bg-color-system-success-extra-light p-4">
            <h3 className="mb-2 text-lg font-medium text-color-system-success-dark">Success</h3>
            <p className="text-color-system-success-main">This is a success message</p>
          </div>

          <div className="rounded-lg border border-color-system-error-light bg-color-system-error-extra-light p-4">
            <h3 className="mb-2 text-lg font-medium text-color-system-error-dark">Error</h3>
            <p className="text-color-system-error-main">This is an error message</p>
          </div>
        </div>
      </section>

      {/* Feature Flags Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">Feature Flags Demo</h2>
        <div className="rounded-lg bg-color-background-l2 p-4">
          <h3 className="mb-4 text-lg font-medium text-color-primary-main">VIN SEARCH Feature</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div
                className={`rounded-lg px-4 py-2 ${vinFeatureEnabled ? "bg-color-system-success-extra-light text-color-system-success-dark" : "bg-color-system-error-extra-light text-color-system-error-dark"}`}
              >
                <span className="font-medium">
                  VIN SEARCH: {vinFeatureEnabled ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <div className="text-sm text-color-text-body">
                <p>
                  Feature flag:{" "}
                  <code className="rounded bg-color-background-l3 px-2 py-1">vin_feature_flag</code>
                </p>
                <p>
                  Current value:{" "}
                  <code className="rounded bg-color-background-l3 px-2 py-1">
                    {vinFeatureEnabled.toString()}
                  </code>
                </p>
              </div>
            </div>

            {vinFeatureEnabled && (
              <div className="mt-4 rounded-lg border border-color-system-success-light bg-color-system-success-extra-light p-4">
                <h4 className="mb-2 font-medium text-color-system-success-dark">
                  VIN SEARCH Component
                </h4>
                <p className="text-sm text-color-system-success-main">
                  This feature is enabled for the current store. Users can now access VIN search
                  functionality.
                </p>
                <div className="mt-3">
                  <button className="rounded-lg bg-color-system-success-main px-4 py-2 text-white transition-colors hover:bg-color-system-success-dark">
                    Search VIN
                  </button>
                </div>
              </div>
            )}

            {!vinFeatureEnabled && (
              <div className="mt-4 rounded-lg border border-color-system-error-light bg-color-system-error-extra-light p-4">
                <h4 className="mb-2 font-medium text-color-system-error-dark">
                  VIN SEARCH Disabled
                </h4>
                <p className="text-sm text-color-system-error-main">
                  This feature is disabled for the current store. VIN search functionality is not
                  available.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Store Comparison */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-color-text-body">Store Comparison</h2>
        <div className="rounded-lg bg-color-background-l2 p-4">
          <h3 className="mb-4 text-lg font-medium text-color-primary-main">
            Current Store:{" "}
            {typeof window !== "undefined"
              ? getStoreFromDomain(window.location.href)
              : DEFAULT_STORE}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium text-color-text-body">
                Ottogusto Colors (if current store)
              </h4>
              <ul className="space-y-1 text-sm text-color-text-body">
                <li>Primary: Piston.900M (#0A4932)</li>
                <li>Secondary: Traffic.700M (#009F4D)</li>
                <li>Accent: Highway.400M (#FFD31A)</li>
                <li>Background: Beige.200 (#FCFCFB)</li>
                <li>Text: Tarmac.950M (#0C271D)</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-color-text-body">
                Qverde Colors (if current store)
              </h4>
              <ul className="space-y-1 text-sm text-color-text-body">
                <li>Primary: Green.500M (#03853E)</li>
                <li>Secondary: Green.500M (#03853E)</li>
                <li>Accent: Red.500M (#CF2B37)</li>
                <li>Background: Seafoam.100 (#FBFDF8)</li>
                <li>Text: Black.700 (#2C2C2C)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
