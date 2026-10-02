import React, { useEffect, useRef, useCallback, useState } from "react";

import { Box } from "@/components/ui/box";
import { useMedia } from "@/hooks/useMedia";
import { useFilterModalStore } from "@/stores/useFilterModal";
import OGCategoriesSearcBlock from "@/components/og-components/OGCategoriesSearcBlock";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useCategories } from "@/contexts/CategoriesContext";
import { useFilterStore } from "@/stores/useFilter";
import { useSearchParams } from "next/navigation";
import FilterModalHeader from "./FilterModalHeader";
import FilterModalFooter from "./FilterModalFooter";
import ManufacturerDrop from "./ManufacturerDrop";
import { getCategoryIdFromSearchParams } from "@/utils/categorySearchUrl";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { flattenTree } from "@/helpers/UtilityHelper";
import type { PartsCategoryInterface } from "@/types/categories";

const FilterModal = React.memo(() => {
  const isDesktop = useMedia("(min-width: 1200px)");
  const { isOpen, closeModal } = useFilterModalStore();
  const queryParams = useSearchParams();
  const { updateFilters } = useUrlParams();
  const { order } = useFilterStore();

  const initialCategoryIdRef = useRef<string | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);

  const { data: nestedCategories } = useCategories();

  // Snapshot URL category when modal opens; reset pending to match.
  useEffect(() => {
    if (!isOpen || !nestedCategories) return;
    const fromUrl = getCategoryIdFromSearchParams(queryParams);
    initialCategoryIdRef.current = fromUrl;
    setPendingCategoryId(fromUrl);

    const { setSelectedCategories, clearSelectedCategories } = useCategorySearchStore.getState();
    if (!fromUrl?.trim()) {
      clearSelectedCategories();
      return;
    }
    const flat = flattenTree(nestedCategories, "children") as PartsCategoryInterface[];
    const node = flat.find((n) => n.id === fromUrl);
    if (node) {
      setSelectedCategories([node]);
    }
  }, [isOpen, queryParams, nestedCategories]);

  // Revert store to URL when modal closes without applying (deferred picks only touched pending state).
  useEffect(() => {
    if (isOpen || !nestedCategories) return;

    const categoryIdParam = getCategoryIdFromSearchParams(queryParams);
    const { setSelectedCategories, clearSelectedCategories } = useCategorySearchStore.getState();

    if (!categoryIdParam?.trim()) {
      clearSelectedCategories();
      return;
    }

    const flat = flattenTree(nestedCategories, "children") as PartsCategoryInterface[];
    const node = flat.find((n) => n.id === categoryIdParam);
    if (node) {
      setSelectedCategories([node]);
    }
  }, [isOpen, queryParams, nestedCategories]);

  const isNewChangedCategory =
    isOpen && (pendingCategoryId ?? null) !== (initialCategoryIdRef.current ?? null);

  const handleNewCategoryFilter = useCallback(() => {
    const categoryId = pendingCategoryId ?? null;

    if (nestedCategories && categoryId) {
      const flat = flattenTree(nestedCategories, "children") as PartsCategoryInterface[];
      const node = flat.find((n) => n.id === categoryId);
      if (node) {
        useCategorySearchStore.getState().setSelectedCategories([node]);
      }
    } else if (!categoryId) {
      useCategorySearchStore.getState().clearSelectedCategories();
    }

    updateFilters(
      {
        categoryId,
        order,
      },
      "/products",
      "mobile",
    );
    closeModal();
  }, [pendingCategoryId, order, updateFilters, closeModal, nestedCategories]);

  if (isDesktop) return null;
  if (!isOpen) return null;

  return (
    <Box className="fixed inset-0 z-50 flex h-[100dvh] flex-row items-start justify-center bg-black/50">
      <Box className="flex w-full flex-row items-center justify-center base:h-full gtsm:pl-[24px] gtsm:pr-[24px]">
        <Box className="w-full bg-color-background-l1 base:h-[100dvh] gtsm:mx-auto gtsm:h-[790px] gtsm:max-h-[85dvh] gtsm:max-w-[714px] gtsm:rounded-[8px]">
          <FilterModalHeader onClose={closeModal} />

          <Box className="h-full w-full overflow-y-auto bg-color-background-l1 base:px-[12px] gtsm:px-[24px]">
            <Box className="custom-scrollbar h-full pt-0">
              <Box className="mb-3 h-px bg-gray-200" />

              <OGCategoriesSearcBlock
                categoryApplyMode="deferred"
                pendingCategoryId={pendingCategoryId}
                onCategorySelect={setPendingCategoryId}
              />
              {getClientFeatureFlag("brands_filter_feature_flag") && <ManufacturerDrop />}
            </Box>
          </Box>
          <FilterModalFooter
            onFilter={handleNewCategoryFilter}
            isChanged={isNewChangedCategory}
            requireMake={false}
          />
        </Box>
      </Box>
    </Box>
  );
});

FilterModal.displayName = "FilterModal";

export default FilterModal;
