"use client";

import React from "react";
import { FEATURE_FLAG_KEYS } from "@/config/client-theme-config";
import { getClientFeatureFlag, getCurrentStore } from "@/utils/theme-utils";

export default function FlagsShowcase() {
  const currentStore = getCurrentStore();

  const renderFlagItem = (flagName: string, flagValue: boolean) => {
    return (
      <div
        key={flagName}
        className="rounded-lg border border-color-background-l8 bg-color-background-l1 p-4"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-2">
              <span className="text-color-text-body typography-body-strong-01">{flagName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  flagValue
                    ? "bg-color-system-success-extra-light text-color-system-success-dark"
                    : "bg-color-system-error-extra-light text-color-system-error-dark"
                }`}
              >
                {flagValue ? "✓ Enabled" : "✗ Disabled"}
              </span>
              <span className="text-color-text-placeholder typography-caption">
                {flagValue ? "Feature is active" : "Feature is inactive"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium typography-caption">Flag Details:</div>
            <div className="text-color-text-placeholder typography-caption">
              <div className="space-y-1 font-mono text-xs">
                <div>
                  <span className="text-color-primary-main">Flag Name:</span> {flagName}
                </div>
                <div>
                  <span className="text-color-primary-main">Current Value:</span>{" "}
                  {flagValue.toString()}
                </div>
                <div>
                  <span className="text-color-primary-main">Store:</span> {currentStore}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const entries = FEATURE_FLAG_KEYS.map((key) => [key, getClientFeatureFlag(key)] as const);
  const enabledFlags = entries.filter(([_, value]) => value === true);
  const disabledFlags = entries.filter(([_, value]) => value === false);

  return (
    <div className="mb-8 rounded-lg border border-color-background-l8 bg-color-background-l1 p-6">
      <h2 className="mb-6 typography-heading-02">
        Feature Flags (env) — {currentStore.charAt(0).toUpperCase() + currentStore.slice(1)}
      </h2>

      {enabledFlags.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-color-system-success-dark typography-heading-03">
            ✓ Enabled Features ({enabledFlags.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {enabledFlags.map(([flagName, flagValue]) => renderFlagItem(flagName, flagValue))}
          </div>
        </div>
      )}

      {disabledFlags.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-color-system-error-dark typography-heading-03">
            ✗ Disabled Features ({disabledFlags.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {disabledFlags.map(([flagName, flagValue]) => renderFlagItem(flagName, flagValue))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-lg bg-color-background-l2 p-4">
        <h3 className="mb-2 typography-subtitle-01">Feature Flags Summary</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-color-system-success-dark typography-display-01">
              {enabledFlags.length}
            </div>
            <div className="text-color-text-placeholder typography-caption">Enabled</div>
          </div>
          <div className="text-center">
            <div className="text-color-system-error-dark typography-display-01">
              {disabledFlags.length}
            </div>
            <div className="text-color-text-placeholder typography-caption">Disabled</div>
          </div>
          <div className="text-center">
            <div className="text-color-text-body typography-display-01">
              {FEATURE_FLAG_KEYS.length}
            </div>
            <div className="text-color-text-placeholder typography-caption">Total Flags</div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg bg-color-background-l2 p-4">
        <h3 className="mb-2 typography-subtitle-01">Usage Guidelines</h3>
        <ul className="space-y-1 text-color-text-placeholder typography-body-02">
          <li>• Feature flags are read from NEXT_PUBLIC_* JSON in environment variables only</li>
          <li>• Ops can change flags per deployment (dev/prod/store) without code changes</li>
          <li>• Values depend on the current locale country in the URL (e.g. en-BE → BE)</li>
          <li>
            • Use getClientFeatureFlag() in components; use getServerFeatureFlag() in server layouts
          </li>
        </ul>
      </div>
    </div>
  );
}
