"use client";

import React, { useCallback, useMemo } from "react";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import Typography from "@/components/og-components/Typography";
import { useCategories } from "@/contexts/CategoriesContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useSearchParams } from "next/navigation";
import { useUrlParams } from "@/hooks/useUrlParams";
import { flattenTree, formatTitle, getTitleOfCategory } from "@/helpers/UtilityHelper";
import type { PartsCategoryInterface } from "@/types/categories";
import {
  createSyntheticOtherCategory,
  isCategoryRowBold,
  partitionL1Categories,
  resolveCategorySelection,
  shouldExpandL1,
  shouldShowL3Children,
} from "@/utils/singleCategoryFilter";
import { getCategoryIdFromSearchParams } from "@/utils/categorySearchUrl";

export type CategoryApplyMode = "immediate" | "deferred";

export type SingleCategorySidebarFilterProps = {
  /** Desktop sidebar: apply to URL on click. Mobile modal: defer until Apply. */
  applyMode?: CategoryApplyMode;
  /** Pending selection in deferred mode (drives bold/expand before URL updates). */
  pendingCategoryId?: string | null;
  /** Called when user picks a category in deferred mode. */
  onCategorySelect?: (id: string) => void;
};

type CategoryRowProps = {
  category: PartsCategoryInterface;
  level: 1 | 2 | 3;
  indentPx: number;
  bold: boolean;
  onSelect: (id: string) => void;
  locale: string;
};

// Row-width variation for the loading skeleton — visually distinct from a monotonous block.
const SKELETON_ROW_WIDTHS: string[] = [
  "w-3/5",
  "w-2/5",
  "w-4/5",
  "w-1/2",
  "w-3/5",
  "w-2/5",
  "w-3/5",
  "w-1/2",
];

function getRowTypographyClass(bold: boolean): string {
  if (!bold) {
    return "text-left text-color-text-default typography-body-02 hover:opacity-70";
  }
  return "text-left text-color-text-emphasis typography-body-strong-02 hover:opacity-70";
}

function CategoryRow({ category, level, indentPx, bold, onSelect, locale }: CategoryRowProps) {
  const title = formatTitle(getTitleOfCategory(category, locale), locale as "en" | "fr" | "nl");

  return (
    <Pressable
      onPress={() => onSelect(category.id)}
      className="hover:bg-color-background-subtle w-full cursor-pointer rounded-[4px] py-2 pr-2 transition-colors"
      style={{ paddingLeft: indentPx }}
      accessibilityRole="button"
      accessibilityState={{ selected: bold }}
    >
      <Typography onlyTypo className={getRowTypographyClass(bold)}>
        {title}
      </Typography>
    </Pressable>
  );
}

export default function SingleCategorySidebarFilter({
  applyMode = "immediate",
  pendingCategoryId = null,
  onCategorySelect,
}: SingleCategorySidebarFilterProps) {
  const { data: tree = [], isPending } = useCategories();
  const searchParams = useSearchParams();
  const { updateFilters } = useUrlParams();
  const { getLocale, getLabel } = useBranding();
  const locale = getLocale();

  const urlCategoryId = getCategoryIdFromSearchParams(searchParams);
  const activeCategoryId = applyMode === "deferred" ? (pendingCategoryId ?? null) : urlCategoryId;

  const selection = useMemo(
    () => resolveCategorySelection(tree as PartsCategoryInterface[], activeCategoryId),
    [tree, activeCategoryId],
  );

  const l1Categories = useMemo(() => {
    const { regularL1s, otherNode } = partitionL1Categories(tree as PartsCategoryInterface[]);
    const otherLabel = getLabel("category_other") || "Other";
    const labeledOther = createSyntheticOtherCategory(otherLabel);
    const other = otherNode
      ? { ...otherNode, titles: labeledOther.titles, name: labeledOther.name }
      : labeledOther;
    return [...regularL1s, other];
  }, [tree, getLabel]);

  const handleSelect = useCallback(
    (id: string) => {
      if (id === activeCategoryId) return;

      if (applyMode === "deferred") {
        onCategorySelect?.(id);
        return;
      }

      updateFilters({ categoryId: id }, "/products");
    },
    [activeCategoryId, applyMode, onCategorySelect, updateFilters],
  );

  const renderL1Branch = (l1: PartsCategoryInterface) => {
    const expanded = shouldExpandL1(l1.id, selection);

    return (
      <Box key={l1.id} className="flex w-full flex-col">
        <CategoryRow
          category={l1}
          level={1}
          indentPx={0}
          bold={isCategoryRowBold(1, l1.id, selection)}
          onSelect={handleSelect}
          locale={locale}
        />
        {expanded &&
          (l1.children ?? []).map((l2) => (
            <Box key={l2.id} className="flex w-full flex-col">
              <CategoryRow
                category={l2}
                level={2}
                indentPx={12}
                bold={isCategoryRowBold(2, l2.id, selection)}
                onSelect={handleSelect}
                locale={locale}
              />
              {shouldShowL3Children(l2.id, selection) &&
                (l2.children ?? []).map((l3) => (
                  <CategoryRow
                    key={l3.id}
                    category={l3}
                    level={3}
                    indentPx={24}
                    bold={isCategoryRowBold(3, l3.id, selection)}
                    onSelect={handleSelect}
                    locale={locale}
                  />
                ))}
            </Box>
          ))}
      </Box>
    );
  };

  if (isPending) {
    // Same wrapper classes + row padding as the real list below, so the reserved
    // height closely matches the resolved content and swapping in real rows causes
    // little to no layout shift (a fixed-height spinner box does not).
    return (
      <Box
        className="flex w-full flex-col gap-1 pb-4"
        aria-busy={true}
        aria-label="Loading categories"
      >
        {SKELETON_ROW_WIDTHS.map((widthClass, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box key={index} className="w-full py-2 pr-2">
            <Box
              className={`animate-pulse h-4 ${widthClass} rounded bg-color-background-emphasis`}
            />
          </Box>
        ))}
      </Box>
    );
  }

  return <Box className="flex w-full flex-col gap-1 pb-4">{l1Categories.map(renderL1Branch)}</Box>;
}
