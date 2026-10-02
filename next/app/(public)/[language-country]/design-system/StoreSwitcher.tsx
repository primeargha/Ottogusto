"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import { OGSelectDropdown } from "@/components/og-components/OGSelectDropdown";
import { getCurrentStore } from "@/utils/theme-utils";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { STORE_IDS, STORE_DISPLAY_NAMES, DEFAULT_STORE } from "@/config/store-constants";

export default function StoreSwitcher() {
  const pathname = usePathname();
  const params = useParams();
  const [currentStore, setCurrentStore] = useState<string>(DEFAULT_STORE);

  useEffect(() => {
    // Get current store based on URL
    const store = getCurrentStore();
    setCurrentStore(store);
  }, [pathname]);

  const storeOptions = [
    { label: STORE_DISPLAY_NAMES[STORE_IDS.OTTOGUSTO], value: STORE_IDS.OTTOGUSTO },
    { label: STORE_DISPLAY_NAMES[STORE_IDS.QVERDE], value: STORE_IDS.QVERDE },
  ];

  const handleStoreChange = (value: string) => {
    setCurrentStore(value);

    // Create route callback functions for each store
    const ottogustoRoute = (locale: string) => `/${locale}/design-system/og/`;
    const qverdeRoute = (locale: string) => `/${locale}/design-system/qv/`;

    // Redirect to appropriate design system page using hard reload
    if (value === STORE_IDS.OTTOGUSTO) {
      const route = getRouteLocaleString(ottogustoRoute, params);
      window.location.href = route;
    } else if (value === STORE_IDS.QVERDE) {
      const route = getRouteLocaleString(qverdeRoute, params);
      window.location.href = route;
    }
  };

  return (
    <div className="mb-8 rounded-lg border border-color-background-l8 bg-color-background-l1 p-6">
      <h2 className="mb-4 typography-heading-02">Store Configuration</h2>
      <div className="flex items-center gap-4">
        <label className="typography-body-strong-01">Current Store:</label>
        <div className="w-64">
          <OGSelectDropdown
            title="Select Store"
            value={currentStore}
            onChange={handleStoreChange}
            options={storeOptions}
            placeholder="Choose a store"
          />
        </div>
        <div className="text-color-text-placeholder typography-caption">
          Switch between Ottogusto and Qverde themes to see how colors and typography adapt
        </div>
      </div>
    </div>
  );
}
