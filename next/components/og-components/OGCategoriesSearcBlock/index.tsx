"use client";

import { Box } from "@/components/ui/box";
import { useCategories } from "@/contexts/CategoriesContext";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { flattenTree } from "@/helpers/UtilityHelper";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import type { PartsCategoryInterface } from "@/types/categories";
import SearchResultsNewMmeSidebar from "@/components/SearchResultsNewMmeSidebar";
import SingleCategorySidebarFilter, { type CategoryApplyMode } from "./SingleCategorySidebarFilter";
import { getCategoryIdFromSearchParams, pickPrimaryCategoryId } from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";

export type OGCategoriesSearcBlockProps = {
  categoryApplyMode?: CategoryApplyMode;
  pendingCategoryId?: string | null;
  onCategorySelect?: (id: string) => void;
};

/**
 * Search-results sidebar: MME block + single-select category list.
 * Desktop: URL is source of truth (immediate apply on click).
 * Mobile filter modal: deferred apply via FilterModal footer.
 */
const Index = ({
  categoryApplyMode = "immediate",
  pendingCategoryId = null,
  onCategorySelect,
}: OGCategoriesSearcBlockProps) => {
  const { data: nestedCategories } = useCategories();
  const searchParams = useSearchParams();
  const isNewMmeInRightSidebar = getClientFeatureFlag("new_mme_feature_flag");

  // URL → store (one-way). Skip in deferred mode so pending picks are not overwritten.
  useEffect(() => {
    if (categoryApplyMode === "deferred") return;
    if (!nestedCategories) return;

    const categoryIdParam = getCategoryIdFromSearchParams(searchParams);
    const { SelectedCategoriesId, setSelectedCategories, clearSelectedCategories } =
      useCategorySearchStore.getState();
    const storePrimaryId = pickPrimaryCategoryId(SelectedCategoriesId);

    if (!categoryIdParam?.trim()) {
      if (SelectedCategoriesId.length > 0) {
        clearSelectedCategories();
      }
      return;
    }

    if (storePrimaryId === categoryIdParam) {
      return;
    }

    const flatCategories = flattenTree(nestedCategories, "children") as PartsCategoryInterface[];
    const selectedNode = flatCategories.find((node) => node.id === categoryIdParam);
    if (selectedNode) {
      setSelectedCategories([selectedNode]);
    }
  }, [categoryApplyMode, searchParams, nestedCategories]);

  return (
    <Box className="min-h-400 card-gap-default">
      {!isNewMmeInRightSidebar && <SearchResultsNewMmeSidebar />}
      <SingleCategorySidebarFilter
        applyMode={categoryApplyMode}
        {...(categoryApplyMode === "deferred" && onCategorySelect
          ? { pendingCategoryId: pendingCategoryId ?? null, onCategorySelect }
          : {})}
      />
    </Box>
  );
};

export default Index;
