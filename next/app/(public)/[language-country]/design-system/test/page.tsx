"use client";

import React, { useEffect, useState } from "react";

export default function TestPage() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [computedValues, setComputedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get window width
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
      // Get computed CSS variable values
      const root = document.documentElement;
      const tokens = [
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
      tokens.forEach((token) => {
        const value = getComputedStyle(root).getPropertyValue(`--${token}`).trim();
        values[token] = value || "not set";
      });
      setComputedValues(values);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 768;

  return (
    <div className="min-h-screen bg-color-background-default text-color-text-default">
      {/* Header */}
      <header className="u-header-padding-v bg-header-background text-header-action-text">
        <div className="max-w-layout-header mx-auto">
          <h1 className="typography-heading-01">Semantic Layout Tokens Test</h1>
          <p className="mt-2 typography-body-02">
            Current Viewport: {windowWidth}px ({isMobile ? "Mobile" : "Desktop"})
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="u-section-gutter">
        <div className="max-w-layout-content mx-auto py-8">
          {/* Responsive Values Display */}
          <section className="u-gap-stack mb-8">
            <h2 className="mb-4 typography-heading-02">Responsive CSS Variable Values</h2>
            <div className="rounded-radius-medium bg-color-background-emphasis p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(computedValues).map(([token, value]) => (
                  <div key={token} className="rounded-radius-small bg-color-background-default p-3">
                    <div className="text-color-text-muted typography-caption">--{token}</div>
                    <div className="mt-1 text-color-text-emphasis typography-body-strong-01">
                      {value}
                    </div>
                    <div className="mt-1 text-color-text-muted typography-caption">
                      {isMobile ? "Mobile" : "Desktop"} value
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section Gutter Test */}
          <section className="u-gap-stack mb-8">
            <h2 className="mb-4 typography-heading-02">Section Gutter (Horizontal Padding)</h2>
            <div className="rounded-radius-medium bg-color-background-emphasis p-4">
              <div className="rounded-radius-small bg-color-background-brand-emphasis p-4 text-color-text-inverse">
                <p className="typography-body-01">
                  This section uses{" "}
                  <code className="rounded-radius-small bg-color-background-inverse px-2 py-1">
                    u-section-gutter
                  </code>{" "}
                  class
                </p>
                <p className="mt-2 typography-body-02">
                  Expected: <strong>12px</strong> on mobile, <strong>40px</strong> on desktop
                </p>
                <p className="mt-2 typography-caption">
                  Current: <strong>{computedValues["section-gutter-h"]}</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Gap Section to Section Test */}
          <section className="u-gap-stack mb-8">
            <h2 className="mb-4 typography-heading-02">Gap Section to Section</h2>
            <div className="rounded-radius-medium bg-color-background-emphasis p-4">
              <div className="u-gap-stack flex flex-col">
                <div className="rounded-radius-small bg-color-background-brand-muted p-4">
                  Section 1
                </div>
                <div className="rounded-radius-small bg-color-background-brand-muted p-4">
                  Section 2
                </div>
                <div className="rounded-radius-small bg-color-background-brand-muted p-4">
                  Section 3
                </div>
              </div>
              <p className="mt-2 text-color-text-muted typography-caption">
                Gap: <strong>{computedValues["gap-section-to-section"]}</strong> (Expected: 32px
                mobile, 64px desktop)
              </p>
            </div>
          </section>

          {/* Card Examples */}
          <section className="u-gap-stack mb-8">
            <h2 className="mb-4 typography-heading-02">Card Padding & Gap Examples</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Compact Card */}
              <div className="rounded-radius-medium bg-color-background-emphasis p-4">
                <h3 className="mb-2 typography-heading-03">Compact Card</h3>
                <div className="rounded-radius-card u-card-padding-compact u-card-gap-compact flex flex-col bg-color-background-default">
                  <div className="rounded-radius-small bg-color-background-brand-muted p-2">
                    Item 1
                  </div>
                  <div className="rounded-radius-small bg-color-background-brand-muted p-2">
                    Item 2
                  </div>
                </div>
                <p className="mt-2 text-color-text-muted typography-caption">
                  Padding: <strong>{computedValues["card-padding-compact"]}</strong>, Gap:{" "}
                  <strong>{computedValues["card-gap-compact"]}</strong>
                </p>
              </div>

              {/* Default Card */}
              <div className="rounded-radius-medium bg-color-background-emphasis p-4">
                <h3 className="mb-2 typography-heading-03">Default Card</h3>
                <div className="rounded-radius-card u-card-padding-default u-card-gap-default flex flex-col bg-color-background-default">
                  <div className="rounded-radius-small bg-color-background-brand-muted p-2">
                    Item 1
                  </div>
                  <div className="rounded-radius-small bg-color-background-brand-muted p-2">
                    Item 2
                  </div>
                </div>
                <p className="mt-2 text-color-text-muted typography-caption">
                  Padding: <strong>{computedValues["card-padding-default"]}</strong>, Gap:{" "}
                  <strong>{computedValues["card-gap-default"]}</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Hero Padding Test */}
          <section className="u-gap-stack mb-8">
            <h2 className="mb-4 typography-heading-02">Hero Padding Horizontal (Special Case)</h2>
            <div className="rounded-radius-medium bg-color-background-emphasis p-4">
              <div className="u-hero-padding-h rounded-radius-small bg-color-background-brand-emphasis py-8 text-color-text-inverse">
                <p className="typography-body-01">
                  Hero Section with{" "}
                  <code className="rounded-radius-small bg-color-background-inverse px-2 py-1">
                    u-hero-padding-h
                  </code>
                </p>
                <p className="mt-2 typography-body-02">
                  Expected: <strong>0px</strong> on mobile (full bleed), <strong>40px</strong> on
                  desktop
                </p>
                <p className="mt-2 typography-caption">
                  Current: <strong>{computedValues["hero-padding-h"]}</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Grid Gap Listing Test */}
          <section className="u-gap-stack mb-8">
            <h2 className="mb-4 typography-heading-02">Grid Gap Listing</h2>
            <div className="rounded-radius-medium bg-color-background-emphasis p-4">
              <div className="u-grid-gap-listing grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div
                    key={item}
                    className="rounded-radius-small bg-color-background-brand-muted p-4 text-center"
                  >
                    Item {item}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-color-text-muted typography-caption">
                Gap: <strong>{computedValues["grid-gap-listing"]}</strong> (Expected: 12px mobile,
                24px desktop)
              </p>
            </div>
          </section>

          {/* Border Radius Examples */}
          <section className="u-gap-stack mb-8">
            <h2 className="mb-4 typography-heading-02">Border Radius Tokens (Static)</h2>
            <div className="rounded-radius-medium bg-color-background-emphasis p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="u-radius-input bg-color-background-brand-muted p-4">
                  <p className="typography-body-01">Input Radius</p>
                  <p className="mt-1 text-color-text-muted typography-caption">
                    {computedValues["radius-input"]}
                  </p>
                </div>
                <div className="u-radius-card bg-color-background-brand-muted p-4">
                  <p className="typography-body-01">Card Radius</p>
                  <p className="mt-1 text-color-text-muted typography-caption">
                    {computedValues["radius-card"]}
                  </p>
                </div>
                <div className="u-radius-modal bg-color-background-brand-muted p-4">
                  <p className="typography-body-01">Modal Radius (Premium)</p>
                  <p className="mt-1 text-color-text-muted typography-caption">
                    {computedValues["radius-modal"]}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Modal Example */}
          <section className="u-gap-stack mb-8">
            <h2 className="mb-4 typography-heading-02">Modal Padding Example</h2>
            <div className="rounded-radius-medium bg-color-background-emphasis p-4">
              <div className="u-radius-modal mx-auto max-w-md border border-color-border-default bg-color-background-default">
                <div className="u-modal-padding-header border-b border-color-border-default bg-color-background-emphasis">
                  <h3 className="typography-heading-03">Modal Header</h3>
                </div>
                <div className="u-modal-padding-content-v u-modal-padding-content-h">
                  <p className="mb-4 typography-body-01">Modal Content</p>
                  <div className="u-modal-gap-internal flex flex-col">
                    <div className="rounded-radius-small bg-color-background-emphasis p-2">
                      Item 1
                    </div>
                    <div className="rounded-radius-small bg-color-background-emphasis p-2">
                      Item 2
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-color-text-muted typography-caption">
                Header: <strong>{computedValues["modal-padding-header"]}</strong>, Content V:{" "}
                <strong>{computedValues["modal-padding-content-v"]}</strong>, Content H:{" "}
                <strong>{computedValues["modal-padding-content-h"]}</strong>, Gap:{" "}
                <strong>{computedValues["modal-gap-internal"]}</strong>
              </p>
            </div>
          </section>

          {/* Form Example */}
          <section className="u-gap-stack mb-8">
            <h2 className="mb-4 typography-heading-02">Form Spacing Example</h2>
            <div className="rounded-radius-medium bg-color-background-emphasis p-4">
              <form className="mx-auto max-w-md">
                <div className="u-gap-form-row">
                  <label className="u-gap-input-to-label block typography-body-strong-01">
                    Label 1
                  </label>
                  <input
                    type="text"
                    className="u-radius-input w-full border border-color-border-default p-2"
                    placeholder="Input 1"
                  />
                </div>
                <div className="u-gap-form-row">
                  <label className="u-gap-input-to-label block typography-body-strong-01">
                    Label 2
                  </label>
                  <input
                    type="text"
                    className="u-radius-input w-full border border-color-border-default p-2"
                    placeholder="Input 2"
                  />
                </div>
              </form>
              <p className="mt-2 text-center text-color-text-muted typography-caption">
                Input to Label: <strong>{computedValues["gap-input-to-label"]}</strong>, Form Row:{" "}
                <strong>{computedValues["gap-form-row"]}</strong>
              </p>
            </div>
          </section>

          {/* Summary */}
          <section className="mb-8">
            <h2 className="mb-4 typography-heading-02">Test Summary</h2>
            <div className="rounded-radius-medium bg-color-background-emphasis p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      computedValues["section-gutter-h"] === (isMobile ? "12px" : "40px")
                        ? "bg-color-background-positive-emphasis"
                        : "bg-color-background-danger-emphasis"
                    }`}
                  />
                  <span className="typography-body-01">
                    Section Gutter: {computedValues["section-gutter-h"]} (Expected:{" "}
                    {isMobile ? "12px" : "40px"})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      computedValues["hero-padding-h"] === (isMobile ? "0px" : "40px")
                        ? "bg-color-background-positive-emphasis"
                        : "bg-color-background-danger-emphasis"
                    }`}
                  />
                  <span className="typography-body-01">
                    Hero Padding: {computedValues["hero-padding-h"]} (Expected:{" "}
                    {isMobile ? "0px" : "40px"})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      computedValues["radius-modal"] === "12px"
                        ? "bg-color-background-positive-emphasis"
                        : "bg-color-background-danger-emphasis"
                    }`}
                  />
                  <span className="typography-body-01">
                    Modal Radius: {computedValues["radius-modal"]} (Expected: 12px)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      computedValues["gap-panel-to-content"] === (isMobile ? "24px" : "32px")
                        ? "bg-color-background-positive-emphasis"
                        : "bg-color-background-danger-emphasis"
                    }`}
                  />
                  <span className="typography-body-01">
                    Panel to Content Gap: {computedValues["gap-panel-to-content"]} (Expected:{" "}
                    {isMobile ? "24px" : "32px"})
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
