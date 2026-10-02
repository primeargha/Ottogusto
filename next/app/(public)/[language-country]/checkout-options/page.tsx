// import { Blank } from "@/screens/blank";
import React from "react";

import CheckoutOptions from "@/screens/checkout-options/CheckoutOptions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout Options | Ottogusto",
  keywords: "",
  description: "Checkout Options...",
};

const CheckoutOptionsPage = () => {
  return (
    <>
      <CheckoutOptions />
    </>
  );
};

export default CheckoutOptionsPage;
