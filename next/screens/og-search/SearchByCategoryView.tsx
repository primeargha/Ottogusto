import React, { useState } from "react";

import { Box } from "@/components/ui/box";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import CategoryList from "../advanced-search/category-list";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";

export default function SearchByCategoryView() {
  const { categories, L1Categories, gotoStep, setSelectedCategories } = useAdvancedSearchStore();
  const { setL1CatExpanded, setL2CatExpanded } = useNewCategorySearchStore();
  const [DisableNext, setDisableNext] = useState(false);

  const BlurOverlay = () => (
    <Box
      className="pointer-events-none absolute right-0 top-[5px] h-[150px] w-[150px] bg-[linear-gradient(92deg,rgba(114,114,114,0)_13.75%,rgba(18,18,18,0.4)_110.66%)]"
      style={
        {
          backdropFilter: "blur(10px)",
          WebkitMask:
            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,1) 100%)",
          mask: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,1) 100%)",
          boxShadow: "inset 0 0 20px rgba(255,255,255,0.5), inset 0 0 20px rgba(255,255,255,0.3)",
        } as any
      }
    />
  );

  return (
    <Box className="relative min-h-[284px] gtsm:text-center gtsm:text-gray-500 gtlg:py-5">
      <CategoryList
        categories={L1Categories}
        disableNextCallback={(a) => {
          setDisableNext(a);
        }}
        gotoStep={(a) => {}}
        setSelectedCategories={(a) => {
          setL1CatExpanded(a.id);
          setL2CatExpanded(null);
        }}
        forOGSearch={true}
      />
      {!DisableNext && <BlurOverlay />}
    </Box>
  );
}
