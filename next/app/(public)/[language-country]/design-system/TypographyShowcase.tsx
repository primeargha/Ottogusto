"use client";

import React, { useState } from "react";
import { CLIENT_THEME_CONFIG } from "@/config/client-theme-config";
import { getCurrentStore } from "@/utils/theme-utils";

export default function TypographyShowcase() {
  const currentStore = getCurrentStore();
  const theme = CLIENT_THEME_CONFIG.stores[currentStore].desktop;
  const [activeTab, setActiveTab] = useState<"deprecated" | "new">("new");

  const deprecatedClasses = [
    { class: "h1", description: "Main heading", example: "Main Page Title" },
    { class: "h2", description: "Section heading", example: "Section Title" },
    { class: "h3", description: "Subsection heading", example: "Subsection Title" },
    { class: "body-bold-xs", description: "Small bold text", example: "Small Bold Text" },
    { class: "body-bold-sm", description: "Medium bold text", example: "Medium Bold Text" },
    { class: "body-bold-md", description: "Large bold text", example: "Large Bold Text" },
    {
      class: "body-bold-lg",
      description: "Extra large bold text",
      example: "Extra Large Bold Text",
    },
    { class: "body-medium-xs", description: "Small medium text", example: "Small Medium Text" },
    { class: "body-medium-sm", description: "Medium medium text", example: "Medium Medium Text" },
    { class: "body-medium-md", description: "Large medium text", example: "Large Medium Text" },
    {
      class: "body-medium-lg",
      description: "Extra large medium text",
      example: "Extra Large Medium Text",
    },
    { class: "body-regular-xs", description: "Small regular text", example: "Small Regular Text" },
    {
      class: "body-regular-sm",
      description: "Medium regular text",
      example: "Medium Regular Text",
    },
    { class: "body-regular-md", description: "Large regular text", example: "Large Regular Text" },
    {
      class: "body-regular-lg",
      description: "Extra large regular text",
      example: "Extra Large Regular Text",
    },
  ];

  const newClasses = [
    {
      class: "typography-display-01",
      description: "Main display text",
      example: "Main Display Text",
      category: "Display",
    },
    {
      class: "typography-heading-01",
      description: "Primary heading",
      example: "Primary Heading",
      category: "Heading",
    },
    {
      class: "typography-heading-02",
      description: "Secondary heading",
      example: "Secondary Heading",
      category: "Heading",
    },
    {
      class: "typography-heading-03",
      description: "Tertiary heading",
      example: "Tertiary Heading",
      category: "Heading",
    },
    {
      class: "typography-heading-04",
      description: "Quaternary heading",
      example: "Quaternary Heading",
      category: "Heading",
    },
    {
      class: "typography-subtitle-01",
      description: "Primary subtitle",
      example: "Primary Subtitle",
      category: "Subtitle",
    },
    {
      class: "typography-subtitle-02",
      description: "Secondary subtitle",
      example: "Secondary Subtitle",
      category: "Subtitle",
    },
    {
      class: "typography-body-01",
      description: "Primary body text",
      example: "Primary body text for main content",
      category: "Body",
    },
    {
      class: "typography-body-02",
      description: "Secondary body text",
      example: "Secondary body text for supporting content",
      category: "Body",
    },
    {
      class: "typography-body-strong-01",
      description: "Primary strong body",
      example: "Primary strong body text",
      category: "Body",
    },
    {
      class: "typography-body-strong-02",
      description: "Secondary strong body",
      example: "Secondary strong body text",
      category: "Body",
    },
    {
      class: "typography-button-01",
      description: "Primary button text",
      example: "Button Text",
      category: "Button",
    },
    {
      class: "typography-button-02",
      description: "Secondary button text",
      example: "Small Button",
      category: "Button",
    },
    {
      class: "typography-caption",
      description: "Caption text",
      example: "Caption text for images or descriptions",
      category: "Utility",
    },
    {
      class: "typography-overline",
      description: "Overline text",
      example: "OVERLINE TEXT",
      category: "Utility",
    },
    {
      class: "typography-link-01",
      description: "Primary link text",
      example: "Primary Link Text",
      category: "Link",
    },
    {
      class: "typography-link-02",
      description: "Secondary link text",
      example: "Secondary Link Text",
      category: "Link",
    },
    {
      class: "typography-link-03",
      description: "Tertiary link text",
      example: "Tertiary Link Text",
      category: "Link",
    },
    {
      class: "typography-mono-caption",
      description: "Monospace caption",
      example: "mono-caption",
      category: "Mono",
    },
    {
      class: "typography-mono-body-01",
      description: "Primary monospace",
      example: "Primary monospace text",
      category: "Mono",
    },
    {
      class: "typography-mono-body-02",
      description: "Secondary monospace",
      example: "Secondary monospace text",
      category: "Mono",
    },
    {
      class: "typography-mono-body-strong-01",
      description: "Primary strong mono",
      example: "Primary strong monospace",
      category: "Mono",
    },
    {
      class: "typography-mono-body-strong-02",
      description: "Secondary strong mono",
      example: "Secondary strong monospace",
      category: "Mono",
    },
    {
      class: "typography-mono-large",
      description: "Large monospace",
      example: "Large Monospace Text",
      category: "Mono",
    },
    {
      class: "typography-mono-extra-large",
      description: "Extra large monospace",
      example: "Extra Large Mono",
      category: "Mono",
    },
  ];

  const getTypographySpecs = (className: string) => {
    // Get the actual CSS custom properties and their values from theme config
    const getCSSVariable = (property: string, value: string) => ({
      variable: `--${property}`,
      value: value,
    });

    // Map each typography class to its actual CSS custom properties
    const typographyCSSMap: { [key: string]: any } = {
      "typography-display-01": {
        fontFamily: getCSSVariable("font-family-display", theme.Font.Family.display),
        fontSize: getCSSVariable("font-size-3xl", theme.Font.Size["3xl"]),
        lineHeight: getCSSVariable("font-line-height-snug", theme.Font.LineHeight.snug),
        letterSpacing: getCSSVariable("font-letter-spacing-wider", theme.Font.letterSpacing.wider),
        fontWeight: getCSSVariable("font-weight-regular", theme.Font.Weight.Regular),
      },
      "typography-heading-01": {
        fontFamily: getCSSVariable("font-family-display", theme.Font.Family.display),
        fontSize: getCSSVariable("font-size-2xl", theme.Font.Size["2xl"]),
        lineHeight: getCSSVariable("font-line-height-snug", theme.Font.LineHeight.snug),
        letterSpacing: getCSSVariable("font-letter-spacing-wider", theme.Font.letterSpacing.wider),
        fontWeight: getCSSVariable("font-weight-regular", theme.Font.Weight.Regular),
      },
      "typography-heading-02": {
        fontFamily: getCSSVariable("font-family-heading", theme.Font.Family.heading),
        fontSize: getCSSVariable("font-size-xl", theme.Font.Size.xl),
        lineHeight: getCSSVariable("font-line-height-standard", theme.Font.LineHeight.standard),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-heading-03": {
        fontFamily: getCSSVariable("font-family-heading", theme.Font.Family.heading),
        fontSize: getCSSVariable("font-size-lg", theme.Font.Size.lg),
        lineHeight: getCSSVariable("font-line-height-standard", theme.Font.LineHeight.standard),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-heading-04": {
        fontFamily: getCSSVariable("font-family-heading", theme.Font.Family.heading),
        fontSize: getCSSVariable("font-size-md", theme.Font.Size.md),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-bold", theme.Font.Weight.Bold),
      },
      "typography-subtitle-01": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-md", theme.Font.Size.md),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable("font-letter-spacing-wider", theme.Font.letterSpacing.wider),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-subtitle-02": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-sm", theme.Font.Size.sm),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable("font-letter-spacing-wider", theme.Font.letterSpacing.wider),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-body-01": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-md", theme.Font.Size.md),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-regular", theme.Font.Weight.Regular),
      },
      "typography-body-02": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-sm", theme.Font.Size.sm),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-regular", theme.Font.Weight.Regular),
      },
      "typography-body-strong-01": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-md", theme.Font.Size.md),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-body-strong-02": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-sm", theme.Font.Size.sm),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-button-01": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-sm", theme.Font.Size.sm),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-button-02": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-xs", theme.Font.Size.xs),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-caption": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-xs", theme.Font.Size.xs),
        lineHeight: getCSSVariable("font-line-height-standard", theme.Font.LineHeight.standard),
        letterSpacing: getCSSVariable("font-letter-spacing-wider", theme.Font.letterSpacing.wider),
        fontWeight: getCSSVariable("font-weight-regular", theme.Font.Weight.Regular),
      },
      "typography-overline": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-xs", theme.Font.Size.xs),
        lineHeight: getCSSVariable("font-line-height-standard", theme.Font.LineHeight.standard),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-link-01": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-md", theme.Font.Size.md),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable("font-letter-spacing-wide", theme.Font.letterSpacing.wide),
        fontWeight: getCSSVariable("font-weight-medium", theme.Font.Weight.Medium),
      },
      "typography-link-02": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-sm", theme.Font.Size.sm),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-medium", theme.Font.Weight.Medium),
      },
      "typography-link-03": {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-sm", theme.Font.Size.xs),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-medium", theme.Font.Weight.Medium),
      },
      "typography-mono-caption": {
        fontFamily: getCSSVariable("font-family-mono", theme.Font.Family.mono),
        fontSize: getCSSVariable("font-size-xs", theme.Font.Size.xs),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-mono-body-01": {
        fontFamily: getCSSVariable("font-family-mono", theme.Font.Family.mono),
        fontSize: getCSSVariable("font-size-md", theme.Font.Size.md),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-regular", theme.Font.Weight.Regular),
      },
      "typography-mono-body-02": {
        fontFamily: getCSSVariable("font-family-mono", theme.Font.Family.mono),
        fontSize: getCSSVariable("font-size-sm", theme.Font.Size.sm),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-regular", theme.Font.Weight.Regular),
      },
      "typography-mono-body-strong-01": {
        fontFamily: getCSSVariable("font-family-mono", theme.Font.Family.mono),
        fontSize: getCSSVariable("font-size-md", theme.Font.Size.md),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-bold", theme.Font.Weight.Bold),
      },
      "typography-mono-body-strong-02": {
        fontFamily: getCSSVariable("font-family-mono", theme.Font.Family.mono),
        fontSize: getCSSVariable("font-size-sm", theme.Font.Size.sm),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-mono-large": {
        fontFamily: getCSSVariable("font-family-mono", theme.Font.Family.mono),
        fontSize: getCSSVariable("font-size-lg", theme.Font.Size.lg),
        lineHeight: getCSSVariable("font-line-height-standard", theme.Font.LineHeight.standard),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-semibold", theme.Font.Weight.SemiBold),
      },
      "typography-mono-extra-large": {
        fontFamily: getCSSVariable("font-family-mono", theme.Font.Family.mono),
        fontSize: getCSSVariable("font-size-2xl", theme.Font.Size["2xl"]),
        lineHeight: getCSSVariable("font-line-height-snug", theme.Font.LineHeight.snug),
        letterSpacing: getCSSVariable("font-letter-spacing-wider", theme.Font.letterSpacing.wider),
        fontWeight: getCSSVariable("font-weight-bold", theme.Font.Weight.Bold),
      },
    };

    return (
      typographyCSSMap[className] || {
        fontFamily: getCSSVariable("font-family-body", theme.Font.Family.body),
        fontSize: getCSSVariable("font-size-md", theme.Font.Size.md),
        lineHeight: getCSSVariable("font-line-height-spacious", theme.Font.LineHeight.spacious),
        letterSpacing: getCSSVariable(
          "font-letter-spacing-normal",
          theme.Font.letterSpacing.normal,
        ),
        fontWeight: getCSSVariable("font-weight-regular", theme.Font.Weight.Regular),
      }
    );
  };

  const renderTypographyExample = (item: any) => {
    const specs = getTypographySpecs(item.class);

    return (
      <div
        key={item.class}
        className="rounded-lg border border-color-background-l8 bg-color-background-l1 p-4"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Visual Example */}
          <div className="lg:col-span-2">
            <div className="mb-2">
              <span className={`${item.class} text-color-text-body`}>{item.example}</span>
            </div>
          </div>

          {/* Applied CSS Custom Properties */}
          <div className="space-y-2">
            <div className="font-medium typography-caption">Applied CSS:</div>
            <div className="text-color-text-placeholder typography-caption">
              <div className="space-y-1 font-mono text-xs">
                <div>
                  <span className="text-color-primary-main">{specs.fontFamily.variable}</span>:{" "}
                  {specs.fontFamily.value}
                </div>
                <div>
                  <span className="text-color-primary-main">{specs.fontSize.variable}</span>:{" "}
                  {specs.fontSize.value}
                </div>
                <div>
                  <span className="text-color-primary-main">{specs.lineHeight.variable}</span>:{" "}
                  {specs.lineHeight.value}
                </div>
                <div>
                  <span className="text-color-primary-main">{specs.letterSpacing.variable}</span>:{" "}
                  {specs.letterSpacing.value}
                </div>
                <div>
                  <span className="text-color-primary-main">{specs.fontWeight.variable}</span>:{" "}
                  {specs.fontWeight.value}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-3 rounded border bg-color-background-l2 p-3">
          <div className="mb-1 font-medium typography-caption">Code:</div>
          <code className="text-color-text-body typography-mono-body-02">
            &lt;span className=&quot;{item.class}&quot;&gt;{item.example}&lt;/span&gt;
          </code>
        </div>
      </div>
    );
  };

  const groupedNewClasses = newClasses.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      // @ts-ignore
      acc[item.category].push(item);
      return acc;
    },
    {} as { [key: string]: any[] },
  );

  return (
    <div className="mb-8 rounded-lg border border-color-background-l8 bg-color-background-l1 p-6">
      <h2 className="mb-6 typography-heading-02">
        Typography System - {currentStore.charAt(0).toUpperCase() + currentStore.slice(1)}
      </h2>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("new")}
          className={`rounded-lg px-4 py-2 typography-button-01 ${
            activeTab === "new"
              ? "bg-color-primary-main text-color-text-on-brand"
              : "bg-color-background-l2 text-color-text-body hover:bg-color-background-l3"
          }`}
        >
          New Typography Classes
        </button>
        <button
          onClick={() => setActiveTab("deprecated")}
          className={`rounded-lg px-4 py-2 typography-button-01 ${
            activeTab === "deprecated"
              ? "bg-color-primary-main text-color-text-on-brand"
              : "bg-color-background-l2 text-color-text-body hover:bg-color-background-l3"
          }`}
        >
          Deprecated Classes
        </button>
      </div>

      {/* Content */}
      {activeTab === "new" ? (
        <div className="space-y-8">
          {Object.entries(groupedNewClasses).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-4 typography-heading-03">{category}</h3>
              <div className="grid grid-cols-1 gap-4">{items.map(renderTypographyExample)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-color-system-warning-main bg-color-system-warning-extra-light p-4">
            <div className="mb-2 text-color-system-warning-dark typography-body-strong-01">
              ⚠️ Deprecated Classes
            </div>
            <div className="text-color-system-warning-dark typography-body-02">
              These classes are maintained for backward compatibility but should not be used in new
              components. Use the new typography classes instead.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {deprecatedClasses.map(renderTypographyExample)}
          </div>
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="mt-8 rounded-lg bg-color-background-l2 p-4">
        <h3 className="mb-2 typography-subtitle-01">Usage Guidelines</h3>
        <ul className="space-y-1 text-color-text-placeholder typography-body-02">
          <li>• Use new typography classes for all new components</li>
          <li>• Typography automatically adapts to the selected store theme</li>
          <li>
            • Font families change based on store: {theme.Font.Family.display} (display),{" "}
            {theme.Font.Family.body} (body), {theme.Font.Family.mono} (mono)
          </li>
          <li>• Line heights and letter spacing are optimized for readability</li>
          <li>• Deprecated classes are maintained for backward compatibility only</li>
        </ul>
      </div>
    </div>
  );
}
