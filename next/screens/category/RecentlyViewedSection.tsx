"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import {
  useRecentlyViewedProductStore,
  useRecentlyViewedHydrated,
} from "@/stores/useRecentlyViewedProductStore";
import Productfrequentlybought from "@/screens/productdetails/productfrequentlybought";
import { RecentlyViewedSkeleton } from "@/screens/category/CategorySkeletons";

export default function RecentlyViewedSection() {
  const { recentlyViewed } = useRecentlyViewedProductStore();
  const hydrated = useRecentlyViewedHydrated();

  if (!hydrated) return <RecentlyViewedSkeleton />;

  if (!recentlyViewed || recentlyViewed.length === 0) return null;

  return (
    <Box className="section-standard">
      <Productfrequentlybought products={recentlyViewed} />
    </Box>
  );
}
