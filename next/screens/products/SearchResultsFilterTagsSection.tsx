"use client";
import OGPill from "@/components/og-components/OGPill";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { useBranding } from "@/contexts/BrandingContext";
import { getTitleOfCategory } from "@/helpers/UtilityHelper";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useFilterStore } from "@/stores/useFilter";
import { debounce } from "@/utils/debounce";
import { pickPrimaryCategoryId } from "@/utils/categorySearchUrl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMedia } from "@/hooks/useMedia";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useMmeStore } from "@/stores/useMmeStore";
import { useManufacturersQuery } from "@/hooks/manufacturers";

type Props = {};
interface PillInterface {
  label: string;
  id: string;
  data: any;
  type: "category" | "brand" | "price" | "OERef";
}

const SearchResultsFilterTagsSection = (props: Props) => {
  const debouncedFnRef = useRef<any>(null);
  const isLowResDesktop = useMedia("(min-width: 1200px) and (max-width: 1400px)");
  const { filters, resetFilters, updateFilters, removePriceFilters } = useUrlParams("/products");
  const { searchData } = useSearchModalStore();
  const { getLocale, getLabel } = useBranding();
  const { SelectedCategories, appendToSelectedCategories, clearSelectedCategories } =
    useCategorySearchStore();
  const { minPrice, maxPrice, defaultPriceRange, setMinPrice, setMaxPrice, setDefaultPriceRange } =
    useFilterStore();
  // manufacturerIds are URL-driven (not stored in useFilterStore)
  const { data: manufacturersData } = useManufacturersQuery();
  const { oeReference, clearOeReference, resetOeRefSearch } = useMmeStore();
  const [Pills, setPills] = useState<PillInterface[]>([]);
  const [ShowAllPills, setShowAllPills] = useState(false);
  const router = useRouter();
  const params = useParams();

  // Initialize the debounced function once using useRef
  // useEffect(() => {
  //   debouncedFnRef.current = debounce((pills: PillInterface[]) => {
  //     updateFilters({
  //       manufacturerIds: pills.filter((itm) => itm.type == "brand")?.map((itm) => itm.id),
  //       categoryIds: pills.filter((itm) => itm.type == "category")?.map((itm) => itm.id),
  //     });
  //   }, 1000);

  //   // Cleanup
  //   return () => {
  //     debouncedFnRef.current?.cancel();
  //   };
  // }, [updateFilters]);

  useEffect(() => {
    const pills: PillInterface[] = [];
    SelectedCategories?.map((item) => {
      pills.push({
        label: getTitleOfCategory(item, getLocale()),
        id: item.id,
        data: item,
        type: "category",
      });
    });
    const selectedManufacturerIdsRaw = filters?.manufacturerIds as any;
    const selectedManufacturerIds: string[] = Array.isArray(selectedManufacturerIdsRaw)
      ? selectedManufacturerIdsRaw
          .map((x: any) => (typeof x === "string" ? x : x?.id))
          .filter((x: any) => typeof x === "string" && x.length > 0)
      : typeof selectedManufacturerIdsRaw === "string" && selectedManufacturerIdsRaw.length > 0
        ? [selectedManufacturerIdsRaw]
        : [];

    const manufacturerNameById = new Map<string, string>();
    (manufacturersData?.data || []).forEach((m: any) => {
      if (m?.id) manufacturerNameById.set(String(m.id), String(m.name ?? m.id));
    });

    selectedManufacturerIds.map((id) => {
      pills.push({
        label: manufacturerNameById.get(id) ?? id,
        id,
        data: id,
        type: "brand",
      });
    });
    if (oeReference) {
      pills.push({
        label: oeReference,
        id: oeReference,
        data: oeReference,
        type: "OERef",
      });
    }
    if (
      defaultPriceRange.min !== undefined &&
      defaultPriceRange.max !== undefined &&
      minPrice !== null &&
      maxPrice !== null &&
      (defaultPriceRange.min !== minPrice || defaultPriceRange.max !== maxPrice)
    ) {
      pills.push({
        label: `Price: ${minPrice} - ${maxPrice} €`,
        id: "price",
        data: "price",
        type: "price",
      });
    }
    setPills(pills);

    if (debouncedFnRef.current) {
      debouncedFnRef.current(pills);
    }
  }, [
    SelectedCategories,
    filters?.manufacturerIds,
    defaultPriceRange,
    minPrice,
    maxPrice,
    oeReference,
    getLocale,
    manufacturersData,
  ]);

  const handleremove = async (node: any) => {
    if (node.type == "category") {
      await appendToSelectedCategories(node);
      const remaining = useCategorySearchStore.getState().SelectedCategories;
      updateFilters({
        categoryId:
          remaining.length > 0 ? pickPrimaryCategoryId(remaining.map((c: any) => c.id)) : null,
      });
    }
    if (node.type === "brand") {
      const selectedManufacturerIdsRaw = filters?.manufacturerIds as any;
      const selectedManufacturerIds: string[] = Array.isArray(selectedManufacturerIdsRaw)
        ? selectedManufacturerIdsRaw
            .map((x: any) => (typeof x === "string" ? x : x?.id))
            .filter((x: any) => typeof x === "string" && x.length > 0)
        : typeof selectedManufacturerIdsRaw === "string" && selectedManufacturerIdsRaw.length > 0
          ? [selectedManufacturerIdsRaw]
          : [];

      const remaining = selectedManufacturerIds.filter((id) => id !== node.data);
      updateFilters({
        manufacturerIds: remaining.length > 0 ? remaining : null,
      });
    }
    if (node.type === "price") {
      removePriceFilters();
    }
    if (node.type === "OERef") {
      resetOeRefSearch();
      clearOeReference();
      setTimeout(() => {
        updateFilters(
          {
            oeReference: undefined as any,
          },
          undefined,
          "desktop",
          false,
          true,
        );
      }, 100);
    }
  };
  const handleRemoveFilters = () => {
    resetOeRefSearch();
    const refNode = Pills.find((node) => node.type === "OERef");
    if (refNode) {
      clearOeReference();
      setTimeout(() => {
        updateFilters(
          {
            oeReference: undefined as any,
          },
          undefined,
          "desktop",
          false,
          true,
        );
      }, 100);
    }
    resetFilters("products", true);
    // updateFilters({
    //   oeReference: undefined,
    // });
  };

  let maxPillCount = 3;
  if (isLowResDesktop) {
    maxPillCount = 3;
  }

  return (
    <Box
      className={`flex flex-row items-center gap-3 gtsm:w-full gtlg:w-auto ${ShowAllPills ? "flex-wrap items-center" : ""} `}
    >
      {Pills?.map((node, indx) => {
        if (!ShowAllPills && indx > maxPillCount - 1) {
          return null;
        }
        return (
          <OGPill
            key={indx}
            label={node.label}
            onRemove={() => {
              handleremove(node);
            }}
          />
        );
      })}

      {Pills.length > maxPillCount && !ShowAllPills && (
        <OGPill
          label={`+${Pills.length - maxPillCount}`}
          onShowMore={() => {
            setShowAllPills(true);
          }}
        />
      )}
      {ShowAllPills && Pills.length > 0 && (
        <Pressable
          className="mx-[6px]"
          onPress={() => {
            setShowAllPills(false);
          }}
        >
          <Box className="text-sm text-color-primary-main underline">
            {getLabel("minimise_filter")}
          </Box>
        </Pressable>
      )}

      {Pills.length > 0 && (
        <Pressable className="mx-[6px]" onPress={handleRemoveFilters}>
          <Box className="text-sm text-color-primary-main underline">
            {getLabel("remove_filter")}
          </Box>
        </Pressable>
      )}
    </Box>
  );
};

export default SearchResultsFilterTagsSection;
