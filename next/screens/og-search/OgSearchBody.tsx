import React from "react";

import CarContent from "./CarContent";
import OEContent from "./OEContent";
import CategoryContent from "./CategoryContent";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import SavedCarContent from "./SavedCarContent";

export default function OgSearchBody() {
  const { ogSearchModalContent } = useSearchModalStore();

  return (
    <>
      {ogSearchModalContent === "saved" ? (
        <SavedCarContent />
      ) : ogSearchModalContent === "car" ? (
        <CarContent />
      ) : ogSearchModalContent === "oe" ? (
        <OEContent />
      ) : ogSearchModalContent === "category" ? (
        <CategoryContent />
      ) : (
        <CarContent />
      )}
    </>
  );
}
