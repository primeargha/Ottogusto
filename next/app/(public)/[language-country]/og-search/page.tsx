// import { Blank } from "@/screens/blank";
import React from "react";

import OgSearchHeroSection from "@/screens/og-search/OGSearchHeroSection";
import { Metadata } from "next";
import { redirect, RedirectType } from "next/navigation";

export const metadata: Metadata = {
  title: "OG Search | Ottogusto",
  keywords: "",
  description: "OG Search...",
};

const OGSearchPage = ({ params }) => {
  const locale = params["language-country"] || false;
  redirect(`/${locale ? locale + "/" : ""}`); // 308 Permanent redirect

  return (
    <>
      <OgSearchHeroSection />
    </>
  );
};

export default OGSearchPage;
