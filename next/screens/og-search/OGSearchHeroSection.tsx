import React from "react";

import { Box } from "@/components/ui/box";
import LeftNavBar from "../landing/left-navbar";
import SearchPanel from "./SearchPanel";

export default function OgSearchHeroSection() {
  return (
    <Box
      className={`relative min-h-[calc(100vh-75px)] bg-og-search-hero-image bg-cover bg-center bg-no-repeat transition-all duration-1000`}
    >
      <LeftNavBar />

      <SearchPanel />
    </Box>
  );
}
