// import { Blank } from "@/screens/blank";
import React from "react";

import GarageBay from "@/screens/garage-bay/GarageBay";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garage Bay | Ottogusto",
  keywords: "",
  description: "Garage Bay...",
};

const GarageBayPage = () => {
  return (
    <>
      <GarageBay />
    </>
  );
};

export default GarageBayPage;
