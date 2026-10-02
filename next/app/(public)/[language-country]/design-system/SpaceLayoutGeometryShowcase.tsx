"use client";

import React, { useEffect, useState } from "react";

export default function SpaceLayoutGeometryShowcase() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [computedValues, setComputedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateValues = () => {
      setWindowWidth(window.innerWidth);
      const root = document.documentElement;

      // Space tokens
      const spaceTokens = ["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"];
      // Radius tokens
      const radiusTokens = ["none", "small", "medium", "large", "full"];
      // Icon size tokens
      const iconSizeTokens = ["icon-xs", "icon-sm", "icon-md", "icon-lg", "icon-display"];
      // Sizing tokens (layout widths and nav heights)
      const sizingTokens = [
        "layout-width-header",
        "layout-width-content",
        "layout-width-footer",
        "layout-width-text",
        "layout-width-sidepanel",
        "nav-height-desktop",
        "nav-height-mobile",
      ];
      // Semantic usage tokens
      const semanticTokens = [
        "section-gutter-h",
        "gap-section-to-section",
        "gap-content-to-footer",
        "gap-panel-to-content",
        "gap-header-to-title",
        "gap-title-to-content",
        "grid-gap-listing",
        "card-padding-compact",
        "card-gap-compact",
        "card-padding-default",
        "card-gap-default",
        "header-padding-v",
        "nav-height",
        "hero-padding-h",
        "hero-gap-internal",
        "modal-padding-header",
        "modal-padding-content-v",
        "modal-padding-content-h",
        "modal-gap-internal",
        "gap-input-to-label",
        "gap-form-row",
        "radius-input",
        "radius-card",
        "radius-modal",
      ];

      const values: Record<string, string> = {};

      spaceTokens.forEach((token) => {
        const value = getComputedStyle(root).getPropertyValue(`--space-${token}`).trim();
        values[`space-${token}`] = value || "0px";
      });

      radiusTokens.forEach((token) => {
        const value = getComputedStyle(root).getPropertyValue(`--border-radius-${token}`).trim();
        values[`radius-${token}`] = value || "0px";
      });

      iconSizeTokens.forEach((token) => {
        const value = getComputedStyle(root).getPropertyValue(`--${token}`).trim();
        values[token] = value || "0px";
      });

      sizingTokens.forEach((token) => {
        const value = getComputedStyle(root).getPropertyValue(`--${token}`).trim();
        values[token] = value || "not set";
      });

      semanticTokens.forEach((token) => {
        const value = getComputedStyle(root).getPropertyValue(`--${token}`).trim();
        values[token] = value || "not set";
      });

      setComputedValues(values);
    };

    updateValues();
    window.addEventListener("resize", updateValues);
    return () => window.removeEventListener("resize", updateValues);
  }, []);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  return (
    <div className="rounded-lg border border-color-background-l8 bg-color-background-l1 p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-color-text-body typography-heading-01">
          Space, Layout, & Geometry
        </h2>
        <p className="text-color-text-placeholder typography-body-02">
          Visual demonstration of spacing tokens, border radius tokens, and layout templates.
          Current viewport: {windowWidth}px (
          {isMobile ? "Mobile" : isDesktop ? "Desktop" : "Tablet"})
        </p>
      </div>

      <div className="space-y-12">
        {/* Spacing Visualizer */}
        <section>
          <h3 className="mb-4 text-color-text-body typography-heading-02">
            Spacing Tokens (8pt Grid)
          </h3>
          <p className="mb-6 text-color-text-placeholder typography-body-02">
            All --space-* tokens with their resolved pixel values.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"].map((token) => {
              const value = computedValues[`space-${token}`] || "0px";
              return (
                <div
                  key={token}
                  className="flex items-center justify-between rounded-lg border border-color-background-l8 bg-color-background-default p-4"
                >
                  <div className="text-color-text-body typography-body-strong-01">
                    --space-{token}
                  </div>
                  <div className="text-color-text-placeholder typography-body-02">{value}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Radius Visualizer */}
        <section>
          <h3 className="mb-4 text-color-text-body typography-heading-02">Border Radius Tokens</h3>
          <p className="mb-6 text-color-text-placeholder typography-body-02">
            Visual demonstration of corner radius tokens applied to sample blocks.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[
              { token: "none", label: "None", description: "0px - Sharp corners" },
              { token: "small", label: "Small", description: "4px - Inputs" },
              { token: "medium", label: "Medium", description: "6px - Cards" },
              { token: "large", label: "Large", description: "12px - Modals" },
              { token: "full", label: "Full", description: "9999px - Pills" },
            ].map(({ token, label, description }) => {
              const value = computedValues[`radius-${token}`] || "0px";
              return (
                <div
                  key={token}
                  className="flex flex-col gap-3 rounded-lg border border-color-background-l8 bg-color-background-default p-4"
                >
                  <div
                    className="h-24 w-full bg-color-background-brand-emphasis"
                    style={{ borderRadius: `var(--border-radius-${token})` }}
                  />
                  <div>
                    <div className="text-color-text-body typography-body-strong-01">{label}</div>
                    <div className="text-color-text-placeholder typography-caption">
                      {description}
                    </div>
                    <div className="mt-1 font-mono text-xs text-color-text-placeholder">
                      --border-radius-{token}: {value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sizing Tokens */}
        <section>
          <h3 className="mb-4 text-color-text-body typography-heading-02">Sizing Tokens</h3>
          <p className="mb-6 text-color-text-placeholder typography-body-02">
            Layout width constraints and navigation heights used throughout the application.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Layout Widths */}
            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <div className="mb-3 text-color-text-body typography-body-strong-01">
                --layout-width-header
              </div>
              <div className="mb-3 text-color-text-placeholder typography-body-02">
                {computedValues["layout-width-header"]}
              </div>
              <div className="rounded-radius-small bg-color-background-brand-muted p-3">
                <div className="mx-auto rounded-radius-small bg-color-background-brand-emphasis p-2 text-center text-color-text-inverse layout-width-header typography-caption">
                  Header Container
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <div className="mb-3 text-color-text-body typography-body-strong-01">
                --layout-width-content
              </div>
              <div className="mb-3 text-color-text-placeholder typography-body-02">
                {computedValues["layout-width-content"]}
              </div>
              <div className="rounded-radius-small bg-color-background-brand-muted p-3">
                <div className="mx-auto rounded-radius-small bg-color-background-brand-emphasis p-2 text-center text-color-text-inverse layout-width-content typography-caption">
                  Content Container
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <div className="mb-3 text-color-text-body typography-body-strong-01">
                --layout-width-footer
              </div>
              <div className="mb-3 text-color-text-placeholder typography-body-02">
                {computedValues["layout-width-footer"]}
              </div>
              <div className="rounded-radius-small bg-color-background-brand-muted p-3">
                <div className="mx-auto rounded-radius-small bg-color-background-brand-emphasis p-2 text-center text-color-text-inverse layout-width-footer typography-caption">
                  Footer Container
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <div className="mb-3 text-color-text-body typography-body-strong-01">
                --layout-width-text
              </div>
              <div className="mb-3 text-color-text-placeholder typography-body-02">
                {computedValues["layout-width-text"]}
              </div>
              <div className="rounded-radius-small bg-color-background-brand-muted p-3">
                <div className="mx-auto rounded-radius-small bg-color-background-brand-emphasis p-2 text-center text-color-text-inverse layout-width-text typography-caption">
                  Text Column
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <div className="mb-3 text-color-text-body typography-body-strong-01">
                --layout-width-sidepanel
              </div>
              <div className="mb-3 text-color-text-placeholder typography-body-02">
                {computedValues["layout-width-sidepanel"]}
              </div>
              <div className="rounded-radius-small bg-color-background-brand-muted p-3">
                <div className="rounded-radius-small bg-color-background-brand-emphasis p-2 text-center text-color-text-inverse layout-width-sidepanel typography-caption">
                  Sidepanel
                </div>
              </div>
            </div>

            {/* Navigation Heights */}
            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <div className="mb-3 text-color-text-body typography-body-strong-01">
                --nav-height-desktop
              </div>
              <div className="mb-3 text-color-text-placeholder typography-body-02">
                {computedValues["nav-height-desktop"]}
              </div>
              <div className="rounded-radius-small bg-color-background-brand-muted p-3">
                <div className="flex items-center justify-center rounded-radius-small bg-color-background-brand-emphasis text-color-text-inverse nav-height-desktop typography-caption">
                  Desktop Nav
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <div className="mb-3 text-color-text-body typography-body-strong-01">
                --nav-height-mobile
              </div>
              <div className="mb-3 text-color-text-placeholder typography-body-02">
                {computedValues["nav-height-mobile"]}
              </div>
              <div className="rounded-radius-small bg-color-background-brand-muted p-3">
                <div className="flex items-center justify-center rounded-radius-small bg-color-background-brand-emphasis text-color-text-inverse nav-height-mobile typography-caption">
                  Mobile Nav
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Semantic Usage Tokens */}
        <section>
          <h3 className="mb-4 text-color-text-body typography-heading-02">Semantic Usage Tokens</h3>
          <p className="mb-6 text-color-text-placeholder typography-body-02">
            Responsive semantic tokens that map UI roles to spacing values. Values change at 768px
            breakpoint.
          </p>

          <div className="space-y-8">
            {/* Page & Section Layout */}
            <div>
              <h4 className="mb-4 text-color-text-body typography-heading-03">
                Page & Section Layout
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --section-gutter-h
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["section-gutter-h"]}
                  </div>
                  <div className="rounded-radius-small bg-color-background-brand-muted p-4 section-gutter">
                    <div className="text-color-text-body typography-caption">Visual Example</div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --gap-section-to-section
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["gap-section-to-section"]}
                  </div>
                  <div className="flex flex-col gap-stack">
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body typography-caption">
                      Section 1
                    </div>
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body typography-caption">
                      Section 2
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --gap-panel-to-content
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["gap-panel-to-content"]}
                  </div>
                  <div className="flex flex-col gap-panel-to-content md:flex-row">
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body typography-caption">
                      Panel
                    </div>
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body typography-caption">
                      Content
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --gap-content-to-footer
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["gap-content-to-footer"]}
                  </div>
                  <div className="flex flex-col">
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body gap-content-to-footer typography-caption">
                      Content Area
                    </div>
                    <div className="rounded-radius-small bg-color-background-brand-emphasis p-2 text-color-text-inverse typography-caption">
                      Footer
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --gap-header-to-title
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["gap-header-to-title"]}
                  </div>
                  <div className="flex flex-col">
                    <div className="rounded-radius-small bg-color-background-brand-emphasis p-2 text-color-text-inverse typography-caption">
                      Header
                    </div>
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body gap-header-to-title typography-caption">
                      Title
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --gap-title-to-content
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["gap-title-to-content"]}
                  </div>
                  <div className="flex flex-col">
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body gap-title-to-content typography-caption">
                      Title
                    </div>
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body typography-caption">
                      Content
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header & Hero */}
            <div>
              <h4 className="mb-4 text-color-text-body typography-heading-03">Header & Hero</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --hero-padding-h
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["hero-padding-h"]}
                  </div>
                  <div className="rounded-radius-small bg-color-background-brand-emphasis p-4 hero-padding-h">
                    <div className="text-color-text-inverse typography-caption">Hero Section</div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --header-padding-v
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["header-padding-v"]}
                  </div>
                  <div className="rounded-radius-small bg-color-background-brand-muted p-2 header-padding-v">
                    <div className="text-color-text-body typography-caption">Header</div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --nav-height
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["nav-height"]}
                  </div>
                  <div
                    className="rounded-radius-small bg-color-background-brand-muted"
                    style={{ height: computedValues["nav-height"] || "56px" }}
                  >
                    <div className="flex h-full items-center px-4 text-color-text-body typography-caption">
                      Navigation
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards & Grids */}
            <div>
              <h4 className="mb-4 text-color-text-body typography-heading-03">Cards & Grids</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --card-padding-compact
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["card-padding-compact"]}
                  </div>
                  <div className="rounded-radius-card bg-color-background-brand-muted card-padding-compact">
                    <div className="text-color-text-body typography-caption">Compact Card</div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --card-padding-default
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["card-padding-default"]}
                  </div>
                  <div className="rounded-radius-card bg-color-background-brand-muted card-padding-default">
                    <div className="text-color-text-body typography-caption">Default Card</div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --grid-gap-listing
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["grid-gap-listing"]}
                  </div>
                  <div className="grid grid-cols-2 grid-gap-listing">
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-center text-color-text-body typography-caption">
                      1
                    </div>
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-center text-color-text-body typography-caption">
                      2
                    </div>
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-center text-color-text-body typography-caption">
                      3
                    </div>
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-center text-color-text-body typography-caption">
                      4
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modals */}
            <div>
              <h4 className="mb-4 text-color-text-body typography-heading-03">Modals</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --modal-padding-header
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["modal-padding-header"]}
                  </div>
                  <div className="rounded-radius-small bg-color-background-brand-muted modal-padding-header">
                    <div className="text-color-text-body typography-caption">Modal Header</div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --modal-padding-content-v
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["modal-padding-content-v"]}
                  </div>
                  <div className="rounded-radius-small bg-color-background-brand-muted modal-padding-content-v">
                    <div className="text-color-text-body typography-caption">Content</div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --modal-padding-content-h
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["modal-padding-content-h"]}
                  </div>
                  <div className="rounded-radius-small bg-color-background-brand-muted modal-padding-content-h">
                    <div className="text-color-text-body typography-caption">Content</div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --modal-gap-internal
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["modal-gap-internal"]}
                  </div>
                  <div className="flex flex-col modal-gap-internal">
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body typography-caption">
                      Item 1
                    </div>
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body typography-caption">
                      Item 2
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Forms & Geometry */}
            <div>
              <h4 className="mb-4 text-color-text-body typography-heading-03">Forms & Geometry</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --gap-input-to-label
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["gap-input-to-label"]}
                  </div>
                  <div className="flex flex-col gap-input-to-label">
                    <div className="text-color-text-body typography-caption">Label</div>
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body typography-caption">
                      Input
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --gap-form-row
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["gap-form-row"]}
                  </div>
                  <div className="flex flex-col gap-form-row">
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body typography-caption">
                      Row 1
                    </div>
                    <div className="rounded-radius-small bg-color-background-brand-muted p-2 text-color-text-body typography-caption">
                      Row 2
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --radius-input
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["radius-input"]}
                  </div>
                  <div className="bg-color-background-brand-muted p-4 radius-input">
                    <div className="text-color-text-body typography-caption">Input</div>
                  </div>
                </div>

                <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
                  <div className="mb-3 text-color-text-body typography-body-strong-01">
                    --radius-modal
                  </div>
                  <div className="mb-3 text-color-text-placeholder typography-body-02">
                    {computedValues["radius-modal"]}
                  </div>
                  <div className="bg-color-background-brand-muted p-4 radius-modal">
                    <div className="text-color-text-body typography-caption">Modal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Layout Template Previews */}
        <section>
          <h3 className="mb-4 text-color-text-body typography-heading-02">Layout Templates</h3>
          <p className="mb-6 text-color-text-placeholder typography-body-02">
            Visual previews of layout templates demonstrating responsive behavior at different
            breakpoints.
          </p>

          <div className="space-y-8">
            {/* Split Panel Layout (Primary Left) */}
            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <h4 className="mb-3 text-color-text-body typography-heading-03">
                Split Layout: Primary Left (Filters/Search)
              </h4>
              <p className="mb-4 text-color-text-placeholder typography-body-02">
                Desktop (≥1024px): Sidebar left (360px) + Content right | Mobile: Stacked vertically
              </p>
              <div className="border border-color-border-default bg-color-background-emphasis p-4 section-split-primary-left">
                <aside className="rounded-radius-card bg-color-background-brand-muted p-4">
                  <div className="text-color-text-body typography-body-strong-01">Sidebar</div>
                  <div className="mt-1 text-color-text-placeholder typography-caption">
                    Fixed 360px on desktop
                  </div>
                </aside>
                <main className="rounded-radius-card bg-color-background-brand-muted p-4">
                  <div className="text-color-text-body typography-body-strong-01">Content Area</div>
                  <div className="mt-1 text-color-text-placeholder typography-caption">
                    Fluid width on desktop
                  </div>
                  <div className="mt-2 text-color-text-muted typography-caption">
                    Current layout: {isDesktop ? "Grid (Side-by-side)" : "Flex (Stacked)"}
                  </div>
                </main>
              </div>
            </div>

            {/* Split Panel Layout (Primary Right) */}
            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <h4 className="mb-3 text-color-text-body typography-heading-03">
                Split Layout: Primary Right (Checkout/Cart)
              </h4>
              <p className="mb-4 text-color-text-placeholder typography-body-02">
                Desktop (≥1024px): Content left + Sidebar right (360px) | Mobile: Stacked vertically
              </p>
              <div className="border border-color-border-default bg-color-background-emphasis p-4 section-split-primary-right">
                <main className="rounded-radius-card bg-color-background-brand-muted p-4">
                  <div className="text-color-text-body typography-body-strong-01">Content Area</div>
                  <div className="mt-1 text-color-text-placeholder typography-caption">
                    Fluid width on desktop
                  </div>
                  <div className="mt-2 text-color-text-muted typography-caption">
                    Current layout: {isDesktop ? "Grid (Side-by-side)" : "Flex (Stacked)"}
                  </div>
                </main>
                <aside className="rounded-radius-card bg-color-background-brand-muted p-4">
                  <div className="text-color-text-body typography-body-strong-01">Sidebar</div>
                  <div className="mt-1 text-color-text-placeholder typography-caption">
                    Fixed 360px on desktop
                  </div>
                </aside>
              </div>
            </div>

            {/* Standard Section Layout */}
            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <h4 className="mb-3 text-color-text-body typography-heading-03">Standard Section</h4>
              <p className="mb-4 text-color-text-placeholder typography-body-02">
                Max-width: 1200px with responsive horizontal gutters (12px mobile, 40px desktop)
              </p>
              <div className="border border-color-border-default bg-color-background-emphasis p-6 section-standard">
                <div className="rounded-radius-card bg-color-background-brand-muted p-4">
                  <div className="text-color-text-body typography-body-strong-01">
                    Standard Content
                  </div>
                  <div className="mt-1 text-color-text-placeholder typography-caption">
                    This section uses .section-standard with max-width 1200px
                  </div>
                  <div className="mt-2 text-color-text-muted typography-caption">
                    Horizontal padding: {computedValues["space-sm"] || "12px"} (mobile) /{" "}
                    {computedValues["space-2xl"] || "40px"} (desktop)
                  </div>
                </div>
              </div>
            </div>

            {/* Text Section Layout */}
            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <h4 className="mb-3 text-color-text-body typography-heading-03">Text Section</h4>
              <p className="mb-4 text-color-text-placeholder typography-body-02">
                Max-width: 640px for narrow text columns (Articles, Legal, Policies)
              </p>
              <div className="border border-color-border-default bg-color-background-emphasis p-6 section-text">
                <div className="rounded-radius-card bg-color-background-brand-muted p-4">
                  <div className="text-color-text-body typography-body-strong-01">
                    Narrow Text Content
                  </div>
                  <div className="mt-2 text-color-text-placeholder typography-body-02">
                    This section uses .section-text with max-width 640px, optimized for reading
                    long-form content like articles, legal documents, and policy pages.
                  </div>
                </div>
              </div>
            </div>

            {/* Viewport Center Layout */}
            <div className="rounded-lg border border-color-background-l8 bg-color-background-default p-4">
              <h4 className="mb-3 text-color-text-body typography-heading-03">
                Viewport Center (404/Status Pages)
              </h4>
              <p className="mb-4 text-color-text-placeholder typography-body-02">
                Centers content vertically (full viewport minus header) and horizontally. Max-width:
                640px. Icon size: 120px.
              </p>
              <div
                className="relative border border-color-border-default bg-color-background-emphasis"
                style={{ minHeight: "400px" }}
              >
                <div className="section-viewport-center">
                  <div className="flex items-center justify-center rounded-radius-medium bg-color-background-brand-emphasis status-icon">
                    <span className="text-color-text-inverse typography-heading-01">404</span>
                  </div>
                  <div>
                    <h5 className="mb-2 text-color-text-body typography-heading-02">
                      Page Not Found
                    </h5>
                    <p className="text-color-text-placeholder typography-body-02">
                      This section uses .section-viewport-center with full viewport height minus
                      navigation.
                    </p>
                    <div className="mt-2 text-color-text-muted typography-caption">
                      Icon size: {computedValues["icon-display"] || "120px"} | Min-height:
                      calc(100dvh - var(--nav-height))
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
