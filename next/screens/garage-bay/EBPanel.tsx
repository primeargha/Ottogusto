"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import NoSavedCarEBPanel from "./NoSavedCarEBPanel";
// import SavedCarEBPanel from "./SavedCarEBPanel";
import NotLoggedInEBPanel from "./NotLoggedInEBPanel";
import { useParams, useRouter } from "next/navigation";
import { Box } from "@/components/ui/box";
import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";

export default function EBPanel() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  // ✅ Use SavedCarsContext instead of direct API call (prevents duplicate API calls)
  const { savedCars, isLoading } = useSavedCars();
  const mySavedCars = savedCars || [];
  const hasSavedCars = isAuthenticated && mySavedCars.length > 0;

  // Redirect to My Garage when authenticated, not loading, and has saved cars
  useEffect(() => {
    if (isAuthenticated && !isLoading && hasSavedCars) {
      const redirectRoute = getRouteLocaleString(Routes.mySavedCars, params);
      router.push(redirectRoute);
    }
  }, [isAuthenticated, isLoading, hasSavedCars, router, params]);

  // Handle navigation in useEffect with delay to prevent race conditions
  // useEffect(() => {
  //   if (isAuthenticated && hasSavedCars) {
  //     // Add a small delay to ensure the component has rendered properly
  //     const timer = setTimeout(() => {
  //       if (params && typeof params["language-country"] === "string") {
  //         router.push(Routes.mySavedCars(params["language-country"]));
  //       }
  //     }, 100);

  //     return () => clearTimeout(timer);
  //   }
  // }, [isAuthenticated, hasSavedCars, router, params]);

  if (!isAuthenticated) {
    return (
      <Box className="h-full w-full">
        <NotLoggedInEBPanel />
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box className="h-full w-full">
        <Box className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="animate-spin mx-auto mb-4 h-8 w-8 rounded-full border-4 border-gray-300 border-t-[--brand-traffic-light-green-2]"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </Box>
      </Box>
    );
  }

  if (!isLoading && !hasSavedCars) {
    return (
      <Box className="h-full w-full">
        <NoSavedCarEBPanel />
      </Box>
    );
  }

  return (
    <Box className="h-full w-full">
      <Box className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4 h-8 w-8 rounded-full border-4 border-gray-300 border-t-[--brand-traffic-light-green-2]"></div>
          <p className="text-gray-600">Redirecting to saved cars...</p>
        </div>
      </Box>
    </Box>
  );
}
