import React from "react";
import CategoryList from "../advanced-search/category-list";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";

export default function CategoryContent() {
  const { L1Categories, gotoStep, setSelectedCategories } = useAdvancedSearchStore();
  // return <div>CategoryContent</div>;

  return (
    <CategoryList
      categories={L1Categories}
      gotoStep={gotoStep}
      setSelectedCategories={setSelectedCategories}
      forOGSearch={true}
    />
  );
}
