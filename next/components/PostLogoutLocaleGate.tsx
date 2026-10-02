"use client";

import React, { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import useRouter from "@unitools/router";
import {
  clearPostLogoutLocaleFlag,
  getLocaleFromPathname,
  getPostLogoutTargetLocale,
} from "@/utils/localeCookie";

type Props = {
  children: React.ReactNode;
};

/**
 * After Auth0 logout, soft-navigates to the persisted locale without unmounting the tree.
 * API calls stay blocked via provider guards (`isPostLogoutRedirectPending`) until the URL matches.
 * Children always render so SSR and hydration stay in sync (sessionStorage is client-only).
 */
export default function PostLogoutLocaleGate({ children }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  useLayoutEffect(() => {
    const target = getPostLogoutTargetLocale();
    if (!target) return;
    if (getLocaleFromPathname(pathname) === target) {
      clearPostLogoutLocaleFlag();
      return;
    }
    router.replace(`/${target}`);
  }, [pathname, router]);

  useEffect(() => {
    const target = getPostLogoutTargetLocale();
    if (!target) return;
    if (getLocaleFromPathname(pathname) === target) {
      clearPostLogoutLocaleFlag();
    }
  }, [pathname]);

  return <>{children}</>;
}
