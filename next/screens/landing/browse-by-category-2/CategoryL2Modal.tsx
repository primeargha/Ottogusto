"use client";
import Typography from "@/components/og-components/Typography";
import { Box } from "@/components/ui/box";
import React, { useEffect, useCallback, useState } from "react";
import closeImg from "./close.svg";
import Image from "next/image";
import { PartsCategoryInterface } from "@/stores/useAdvancedSearchStore";
import { formatTitle, toTitleCase, getTitleOfCategory } from "@/helpers/UtilityHelper";
import { useBranding } from "@/contexts/BrandingContext";
import CategoryL3Card from "./CategoryL3Card";
import Link from "next/link";
import { OGButton } from "@/components/og-components/OGButton";
import { OGBrandOption } from "@/components/og-components/OGBrandOption";
import { OGDropdownTray } from "@/components/og-components/OGDropdownTray";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMedia } from "@/hooks/useMedia";
import { useMmeStore } from "@/stores/useMmeStore";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { detectPage } from "@/utils/detectPage";

type Props = {
  selectedL2Cat?: PartsCategoryInterface | null;
  onL3Click?: (cat: PartsCategoryInterface) => void;
  close: () => void;
  createRoute: (cat: PartsCategoryInterface) => string;
  onCategoryClick?: (cat: PartsCategoryInterface) => void;
};

const CategoryL2Modal = (props: Props) => {
  const { close, selectedL2Cat, createRoute, onCategoryClick } = props;
  const { getLabel, getLocale } = useBranding();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { appendToSelectedCategories } = useCategorySearchStore();
  const [pendingL3Id, setPendingL3Id] = useState<string | null>(null);

  // Detect page type to determine if we're on a category catalog page
  const pageType = React.useMemo(() => {
    if (!pathname) return "search-results";
    return detectPage(pathname);
  }, [pathname]);

  const isCategoryCatalogPage = pageType === "category-catalog";

  // Handle category click - clear searchData if needed (for Link onClick handler)
  const handleCategoryClick = useCallback(
    (cat: PartsCategoryInterface) => {
      // Check if we need to clear searchData
      // Only clear if on category catalog page and URL doesn't have makeModelTypeId
      if (isCategoryCatalogPage && !searchParams?.get("makeModelTypeId")) {
        // Clear searchData before redirect
        useMmeStore.getState().setSearchData({
          make: null,
          model: null,
          engine: null,
        });
      }
      // Call parent handler if provided
      if (onCategoryClick) {
        onCategoryClick(cat);
      }
    },
    [isCategoryCatalogPage, searchParams, onCategoryClick],
  );

  useEffect(() => {
    if (selectedL2Cat) {
      appendToSelectedCategories(selectedL2Cat);
    }
    setPendingL3Id(null);
  }, [selectedL2Cat, appendToSelectedCategories]);

  const getViewAll = (selectedL1Category?: PartsCategoryInterface | null) => {
    if (!selectedL1Category) {
      return false;
    }
    const categoryText = getTitleOfCategory(selectedL1Category, getLocale()).toLocaleLowerCase(
      getLocale(),
    );

    return getLabel("CarParts_L2_viewall", {
      category: categoryText,
    });
  };

  const pendingL3Cat = selectedL2Cat?.children?.find((cat) => cat.id === pendingL3Id) ?? null;
  const hasPendingSelection = Boolean(pendingL3Cat);

  const navigateToCategory = useCallback(
    (cat: PartsCategoryInterface) => {
      appendToSelectedCategories(cat);
      handleCategoryClick(cat);
      router.push(createRoute(cat));
      close();
    },
    [appendToSelectedCategories, close, createRoute, handleCategoryClick, router],
  );

  const handleReset = useCallback(() => {
    setPendingL3Id(null);
  }, []);

  const handleSave = useCallback(() => {
    if (pendingL3Cat) {
      navigateToCategory(pendingL3Cat);
    }
  }, [navigateToCategory, pendingL3Cat]);

  const handleShowAll = useCallback(() => {
    if (selectedL2Cat) {
      navigateToCategory(selectedL2Cat);
    }
  }, [navigateToCategory, selectedL2Cat]);

  if (!selectedL2Cat) {
    return;
  }

  const headerLabel = `${toTitleCase(getTitleOfCategory(selectedL2Cat, getLocale()))} Subcategories`;
  const viewAllLabel = getViewAll(selectedL2Cat);
  const customText = typeof viewAllLabel === "string" ? viewAllLabel : undefined;

  return (
    <>
      <Box className="base:flex gtsm:hidden gtlg:hidden">
        <OGDropdownTray
          {...(customText ? { customText } : {})}
          headerLabel={headerLabel}
          hasHeader={true}
          hasFooter={true}
          hasResetButton={true}
          showTitleCloseIcon={true}
          showTopDivider={true}
          showBottomBorder={true}
          hasPendingSelection={hasPendingSelection}
          modalCloseHandler={close}
          resetHandler={handleReset}
          saveHandler={hasPendingSelection ? handleSave : handleShowAll}
          hasFooterResetButton={false}
          hasFooterSaveButton={true}
          filterName="categories"
        >
          <Box className="flex w-full flex-col overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 base:max-h-[350px] base:gap-space-2xs base:pb-[40px]">
            {selectedL2Cat.children?.map((l3Cat) => {
              const isActive = pendingL3Id === l3Cat.id;
              return (
                <OGBrandOption
                  key={l3Cat.id}
                  className=""
                  isActive={isActive}
                  labeltextClass="text-color-text-default"
                  hasLabel={true}
                  text={formatTitle(getTitleOfCategory(l3Cat, getLocale()), getLocale() as any)}
                  onClick={() => setPendingL3Id(l3Cat.id)}
                  buttonBG={
                    isActive ? "bg-color-background-emphasis" : "bg-color-background-default"
                  }
                />
              );
            })}
          </Box>
        </OGDropdownTray>
      </Box>

      <Box className="fixed inset-0 z-50 items-center justify-center bg-black/50 base:hidden gtsm:flex gtlg:flex">
        <Box className="h-auto max-h-[70vh] gtsm:w-[80%] gtlg:w-[70%]">
          <Box className="h-full w-full justify-between rounded bg-color-background-l2">
            <Box className="flex h-auto flex-row justify-between border-b border-color-border-default px-6 py-4 gtsm:h-auto gtlg:h-auto">
              <Typography type="h3" className="text-color-text-emphasis typography-heading-03">
                {headerLabel}
              </Typography>
              <Box onClick={close} className="cursor-pointer">
                <Image src={closeImg} height={24} width={24} alt="close" />
              </Box>
            </Box>

            <Box className="grid h-fit w-full gap-3 overflow-auto gtsm:grid-cols-2 gtsm:px-6 gtsm:py-8 gtlg:grid-cols-2 gtlg:px-6 gtlg:py-8">
              {selectedL2Cat.children?.map((l3Cat) => {
                return (
                  <Link
                    key={l3Cat.id}
                    prefetch
                    href={createRoute(l3Cat)}
                    onClick={() => {
                      appendToSelectedCategories(l3Cat);
                      handleCategoryClick(l3Cat);
                    }}
                    className="h-full"
                  >
                    <CategoryL3Card data={l3Cat} />
                  </Link>
                );
              })}
            </Box>

            <Box className="flex min-h-[90px] p-6">
              <Link
                onClick={() => {
                  appendToSelectedCategories(selectedL2Cat);
                  handleCategoryClick(selectedL2Cat);
                }}
                prefetch
                href={createRoute(selectedL2Cat)}
              >
                <OGButton size="medium" className="w-full" type="outlined">
                  {viewAllLabel}
                </OGButton>
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default CategoryL2Modal;
