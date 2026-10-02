"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { normalizeAuthProfile } from "@/utils/accountCartSession";
import { restoreAccountCartOnLogin } from "@/utils/restoreServerCart";

/**
 * After login, restore cart only when a logout snapshot exists for the same user.
 */
export function useRestoreCartOnLogin() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const authUser = useAuthStore((s) => s.authUser);
  const attemptedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      attemptedKeyRef.current = null;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const profile = normalizeAuthProfile(authUser);
    if (!profile) return;

    const attemptKey = profile.id ?? profile.email ?? "";
    if (!attemptKey || attemptedKeyRef.current === attemptKey) return;

    let cancelled = false;

    void (async () => {
      await restoreAccountCartOnLogin(authUser);
      if (!cancelled) {
        attemptedKeyRef.current = attemptKey;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken, authUser]);
}
