"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LeftArrowPage from "@/components/og-components/icons/LeftArrowPage";
import {
  applyLocalePrefixToPath,
  getPreferredLocaleFromStorage,
  navigateBackViaHistory,
} from "@/utils/navigationBack";

type ProductNavigationProps = {
  backroute?: string | null;
  isOverrideBackButton?: boolean;
};

const Productnavigation: React.FC<ProductNavigationProps> = ({
  backroute,
  isOverrideBackButton,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleBack = () => {
    const locale = getPreferredLocaleFromStorage();
    const query = searchParams?.toString();
    const currentPath = `${pathname ?? "/"}${query ? `?${query}` : ""}`;

    if (isOverrideBackButton) {
      navigateBackViaHistory(
        (url) => router.push(url),
        () => router.back(),
        { locale, currentPath },
      );
      return;
    }

    if (backroute) {
      router.push(applyLocalePrefixToPath(backroute, locale));
      return;
    }

    router.back();
  };

  return <LeftArrowPage className="cursor-pointer text-color-icon-emphasis" onClick={handleBack} />;
};

export default Productnavigation;
