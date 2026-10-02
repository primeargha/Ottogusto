import React from "react";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import CategoryList from "./CategoryList";
import { useCategories } from "@/contexts/CategoriesContext";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";

export const L1CategoriesBlock = () => {
  const { gotoStep, setSelectedCategories } = useAdvancedSearchStore();
  const { data: CategoryNestedList = [], isPending } = useCategories();

  if (isPending) {
    return (
      <Box className="flex h-[50dvh] w-full items-center justify-center">
        <Spinner size="large" color="#0a4932" />
      </Box>
    );
  }

  return (
    <CategoryList
      categories={CategoryNestedList}
      gotoStep={gotoStep}
      setSelectedCategories={setSelectedCategories}
    />
  );
};
