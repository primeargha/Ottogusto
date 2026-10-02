"use client";

import { useEffect } from "react";
import { useCarsInitialMakesStore } from "@/stores/useCarsInitialMakesStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useIsRestoring } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { isPostLogoutRedirectPending } from "@/utils/localeCookie";

/** Loads POST /Cars (empty payload) into session Zustand on app load — one request per full refresh. */
export default function CarsInitialMakesPrefetch() {
  const pathname = usePathname();
  const isRestoring = useIsRestoring();
  const featureEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const enabled = featureEnabled && !isRestoring && !isPostLogoutRedirectPending(pathname);

  useEffect(() => {
    if (!enabled) return;
    void useCarsInitialMakesStore.getState().ensureInitialMakes();
  }, [enabled]);

  return null;
}
