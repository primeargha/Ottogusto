"use client";

import React, { useMemo, useState } from "react";
import { getCurrentStore } from "@/utils/theme-utils";
import {
  NEW_COLOR_SECTIONS,
  DEPRECATED_COLOR_SECTIONS,
  ColorSection,
  ColorToken,
} from "./colorTokens";

type ColorTab = "new" | "deprecated";

const TAB_OPTIONS: Array<{ id: ColorTab; label: string; helper: string }> = [
  {
    id: "new",
    label: "New Color Tokens",
    helper: "Semantic palette aligned with the new design system.",
  },
  {
    id: "deprecated",
    label: "Deprecated Tokens",
    helper: "Legacy aliases kept for backward compatibility.",
  },
];

function renderTokenCard(token: ColorToken) {
  return (
    <div
      key={`${token.cssVar}-${token.tailwindClass}`}
      className="flex flex-col gap-4 rounded-lg border border-color-background-l8 bg-color-background-l1 p-4"
    >
      <div className="flex items-center gap-4">
        <div
          className="h-12 w-12 shrink-0 rounded border border-color-background-l8"
          style={{ backgroundColor: `var(--${token.cssVar})` }}
          aria-hidden="true"
        />
        <div>
          <div className="text-color-text-body typography-body-strong-01">{token.label}</div>
          <div className="text-color-text-placeholder typography-caption">{token.description}</div>
        </div>
      </div>

      <div className="space-y-1 font-mono text-xs text-color-text-placeholder">
        <div>
          <span className="text-color-primary-main">CSS Var</span>: --
          {token.cssVar}
        </div>
        <div>
          <span className="text-color-primary-main">Tailwind</span>: {token.tailwindClass}
        </div>
      </div>
    </div>
  );
}

export default function ColorsShowcase() {
  const currentStore = getCurrentStore();
  const [activeTab, setActiveTab] = useState<ColorTab>("new");

  const sections: ColorSection[] = useMemo(
    () => (activeTab === "new" ? NEW_COLOR_SECTIONS : DEPRECATED_COLOR_SECTIONS),
    [activeTab],
  );

  return (
    <div className="mb-8 rounded-lg border border-color-background-l8 bg-color-background-l1 p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="typography-heading-02">
          Color System - {currentStore.charAt(0).toUpperCase() + currentStore.slice(1)}
        </h2>
        <p className="text-color-text-placeholder typography-body-02">
          Explore semantic color tokens and legacy aliases. Values adapt automatically based on the
          selected store.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-left typography-button-01 ${
              activeTab === tab.id
                ? "bg-color-primary-main text-color-text-on-brand"
                : "bg-color-background-l2 text-color-text-body hover:bg-color-background-l3"
            }`}
          >
            <div>{tab.label}</div>
            <div className="text-color-text-placeholder typography-caption">{tab.helper}</div>
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <div>
              <h3 className="text-color-text-body typography-heading-03">{section.title}</h3>
              {section.description ? (
                <p className="text-color-text-placeholder typography-body-02">
                  {section.description}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {section.tokens.map((token) => renderTokenCard(token))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg bg-color-background-l2 p-4">
        <h3 className="mb-2 text-color-text-body typography-subtitle-01">Usage Notes</h3>
        <ul className="space-y-1 text-color-text-placeholder typography-body-02">
          <li>• Prefer semantic tokens for all new components.</li>
          <li>
            • Tailwind classes map directly to CSS variables defined in{" "}
            <code className="rounded bg-color-background-l3 px-1">tailwind.config.js</code>.
          </li>
          <li>
            • Deprecated tokens remain available for legacy components but will be removed in a
            future release.
          </li>
          <li>
            • Runtime values are injected via{" "}
            <code className="rounded bg-color-background-l3 px-1">ColorProvider</code> based on the
            current store.
          </li>
        </ul>
      </div>
    </div>
  );
}
