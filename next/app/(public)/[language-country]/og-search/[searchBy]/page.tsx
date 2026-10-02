// import { Blank } from "@/screens/blank";
import React from "react";

import OgSearchHeroSection from "@/screens/og-search/OGSearchHeroSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "OG Search | Ottogusto",
  keywords: "",
  description: "OG Search...",
};

const OGSearchPage = () => {
  return (
    <>
      <OgSearchHeroSection />
    </>
  );
};

export default OGSearchPage;
