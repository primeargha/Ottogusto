import { useEffect, useMemo, useRef } from "react";

import { Product } from "@/types/product";
// import InfiniteScroll from "react-infinite-scroll-component";
import { OGProductcard } from "@/components/og-components/OGProductcard";
import { useMedia } from "@/hooks/useMedia";
// import Image from "next/image";
import { useBranding } from "@/contexts/BrandingContext";
import useRouter from "@unitools/router";
import { useCartStore } from "@/stores/useCartStore";
import { useToast } from "@/components/ui/toast";
import { useParams, usePathname, useSearchParams } from "next/navigation";
// import { LANG_COUNTRY_COMBINATIONS, DEFAULT_HOMEPAGE_LOCALE } from "@/config/locale-constants";
import {
  trackViewItemList,
  convertProductToGTMItem,
  type ViewItemListCategoryContext,
} from "@/utils/gtm";
import { useCategories } from "@/contexts/CategoriesContext";
import {
  getCategoryIdFromSearchParams,
  getCarIdsFromSearchParams,
} from "@/utils/categorySearchUrl";
import { gtmCategoryContextForSearchResultPart } from "./searchResultsTaxonomyPath";
// import { askConfirmation } from "@/utils/confirmation";
// import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import { useMmeStore } from "@/stores/useMmeStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
// import partImage from "@/assets/Frame.svg";
// import testProduct from "@/assets/Ottogusto/testproduct.svg";
// import { ProductCard } from "./ProductCard";
import OGScrollList from "@/components/og-components/OGScrollList";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import { resolvePartImageDisplay } from "@/utils/partImageUtils";
import {
  buildPartPdpHrefFromPathname,
  partPdpOptionsFromSearchParams,
} from "@/utils/build-part-pdp-url";
import {
  clearListingScroll,
  consumeListingScroll,
  getListingScrollKey,
  markPreservePartsCache,
  saveListingScroll,
} from "@/utils/listingScrollRestore";

type ViewMode = "grid" | "list";

interface ProductListProps {
  items: Product[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
  viewMode: ViewMode;
  vatString?: string;
  /** URL `categoryId` breadcrumb taxonomy → GA4 item_category* fallback when part has no resolvable categories */
  viewItemListCategoryContext?: ViewItemListCategoryContext | undefined;
}

export function ProductList({
  items,
  hasMore,
  onLoadMore,
  isLoading,
  viewMode,
  vatString,
  viewItemListCategoryContext,
}: ProductListProps) {
  const isMobile = useMedia("(max-width: 639px)");
  const isDesktop = useMedia("(min-width: 1200px)");
  const toast = useToast();
  const { getLabel } = useBranding();
  const { getLocale } = useBranding();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const makeModelTypeId = searchParams?.get("makeModelTypeId");
  const carIds = getCarIdsFromSearchParams(searchParams);
  const isNewMmeEnabled = getClientFeatureFlag("new_mme_feature_flag");
  const pdpVehicleOptions = useMemo(() => {
    const opts: { includeCarIds: boolean; makeModelTypeId?: string | null } = {
      includeCarIds: isNewMmeEnabled,
    };
    if (makeModelTypeId != null && makeModelTypeId !== "") {
      opts.makeModelTypeId = makeModelTypeId;
    }
    return partPdpOptionsFromSearchParams(searchParams, opts);
  }, [searchParams, isNewMmeEnabled, makeModelTypeId]);

  const oeReference = searchParams?.get("oeReference");
  const categoryId = getCategoryIdFromSearchParams(searchParams);
  const language = params?.["language-country"] as string;
  const { data: categoriesData } = useCategories();
  const searchLang = useMemo(
    () => (typeof language === "string" ? language.split("-")[0] : "") || "en",
    [language],
  );
  const { navigate } = useRouter();
  const { cartitems, addItem, updateItem, setiscartchanged, compatibilityCheckBasic } =
    useCartStore();

  const { addToPreviousSearches } = useMmeStore();

  // Track previous URL parameters to detect changes
  const prevUrlParams = useRef<string>("");
  const pendingScrollRestoreRef = useRef<{ y: number; itemCount: number } | null>(null);
  const scrollRestoreAttemptedRef = useRef(false);

  const listingUrlKey = getListingScrollKey(pathname, searchParams?.toString() ?? "");

  const persistListingScrollForPdp = () => {
    markPreservePartsCache();
    saveListingScroll({
      urlKey: listingUrlKey,
      y: window.scrollY,
      itemCount: items.length,
    });
  };

  // Track view_item_list when products are loaded
  useEffect(() => {
    if (items && items.length > 0) {
      const gtmItems = items.slice(0, 10).map((product, index) => {
        const ctx = gtmCategoryContextForSearchResultPart(
          product,
          categoriesData as any,
          viewItemListCategoryContext,
          searchLang,
        );
        return convertProductToGTMItem(product as any, 1, index + 1, ctx);
      });

      // Determine list name based on context
      const search = searchParams?.get("search") || "";
      const categoryIdParam = getCategoryIdFromSearchParams(searchParams) || "";

      let listName = "Product Search Results";
      let listId = "search_results";

      if (search) {
        listName = `Search Results: ${search}`;
        listId = "search_results";
      } else if (categoryIdParam) {
        listName = "Category Products";
        listId = `category_${categoryIdParam}`;
      }

      trackViewItemList(gtmItems, listName, listId);
    }
  }, [items, searchParams, viewItemListCategoryContext, categoriesData, searchLang]);

  // Add to MME Previous Searches - Track URL parameter changes
  useEffect(() => {
    // Only run once on mount
    // if (isMounted.current) return;
    // isMounted.current = true;

    // Create current URL params string for comparison
    const primaryCarId = carIds[0] ?? null;
    const currentUrlParams = `${primaryCarId || makeModelTypeId || "null"}-${oeReference || "null"}-${categoryId || "null"}`;

    if (
      prevUrlParams.current !== currentUrlParams &&
      (primaryCarId || makeModelTypeId || oeReference || categoryId)
    ) {
      const params: {
        carIds?: string[];
        makeModelTypeId?: string;
        oeReference?: string;
        categoryId?: string;
      } = {};

      if (isNewMmeEnabled && carIds.length > 0) {
        params.carIds = carIds;
      } else if (makeModelTypeId) {
        params.makeModelTypeId = makeModelTypeId;
      }

      if (oeReference) {
        params.oeReference = oeReference;
      }

      if (categoryId) {
        params.categoryId = categoryId;
      }

      addToPreviousSearches(params);

      // Update the previous params reference
      prevUrlParams.current = currentUrlParams;
    } else {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makeModelTypeId, carIds, oeReference, categoryId, isNewMmeEnabled]);

  useEffect(() => {
    if (scrollRestoreAttemptedRef.current && !pendingScrollRestoreRef.current) return;

    if (!pendingScrollRestoreRef.current) {
      pendingScrollRestoreRef.current = consumeListingScroll(listingUrlKey);
      if (!pendingScrollRestoreRef.current) {
        scrollRestoreAttemptedRef.current = true;
        return;
      }
    }

    const pending = pendingScrollRestoreRef.current;
    if (!pending || items.length === 0) return;

    if (pending.itemCount > items.length && hasMore && !isLoading) {
      onLoadMore();
      return;
    }

    if (isLoading) return;

    scrollRestoreAttemptedRef.current = true;
    pendingScrollRestoreRef.current = null;
    clearListingScroll();
    const targetY = pending.y;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: "auto" });
      });
    });
  }, [hasMore, isLoading, items.length, listingUrlKey, onLoadMore]);

  const getView = () => {
    if (isMobile) {
      return "Mobile";
    }
    if (viewMode === "list") {
      return "list";
    }
    if (viewMode === "grid") {
      return "Card";
    }
    return "Card";
  };

  /**
   * This method adds the given product item to cart
   * @param product
   */

  const handlenavigate = (id: string | number) => {
    const productUrl = buildPartPdpHrefFromPathname(pathname, id, pdpVehicleOptions);
    if (productUrl) {
      persistListingScrollForPdp();
      navigate(productUrl);
    }
  };

  const extractOEReference = (html?: string): string | null => {
    if (!html) return null;

    const match = html.match(/OE Reference:<\/strong>\s*([^<]+)/i);
    return match?.[1]?.trim() ?? null;
  };

  const getProductImage = (product: any): string => {
    const categoryId = product?.categories?.[0]?.slice(0, 9) ?? "001001";
    const { src } = resolvePartImageDisplay(product?.images, {
      categoryId,
      categoryImageOptions: { width: 180, quality: 80 },
    });
    return src ?? getCategoryImageUrl("001001", { width: 180, quality: 80 });
  };

  const uniqueItems = useMemo(() => {
    const map = new Map();

    items.forEach((item) => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    return Array.from(map.values());
  }, [items]);

  return (
    <OGScrollList
      items={items}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      isLoading={isLoading}
      viewMode={viewMode}
      scrollTargetId="scrollableDiv"
    >
      <div
        className={`${
          viewMode === "grid"
            ? "base:flex base:flex-col base:grid-gap-listing gtsm:flex gtsm:flex-col gtsm:grid-gap-listing gtlg:grid gtlg:grid-cols-3 gtlg:gap-6 2xl:grid-cols-3"
            : "flex flex-col grid-gap-listing"
        }`}
      >
        {items.length > 0 &&
          items.map((product) => {
            const productImage = getProductImage(product);
            const itemCategoryContext = gtmCategoryContextForSearchResultPart(
              product,
              categoriesData as any,
              viewItemListCategoryContext,
              searchLang,
            );
            // debugger;
            const seoName = product?.seo?.name ?? product?.name;
            const oeReference = product?.oeReference || "";
            const isOEM =
              typeof product?.description === "string"
                ? product.description.toLowerCase().includes("(oem)")
                : typeof product?.fullDescription === "string"
                  ? product.fullDescription.toLowerCase().includes("(oem)")
                  : false;
            return (
              <OGProductcard
                key={product?.id}
                product={product as any}
                view={getView()}
                id={product?.id}
                description={product?.fullDescription}
                onClick={() => {
                  const productUrlWithId = buildPartPdpHrefFromPathname(pathname, product?.id, {
                    seoName: product?.seo?.name ?? product?.name,
                    ...pdpVehicleOptions,
                  });
                  if (productUrlWithId) {
                    persistListingScrollForPdp();
                    navigate(productUrlWithId);
                  }
                }}
                // onClick={()=>handlenavigate(product.id)}
                // onClick={()=>handlenavigate(product.id)}
                imgcomp={productImage}
                partname={product?.title}
                pricecomp={product?.priceInclVat}
                className="justify-between"
                vatData={vatString}
                availability={product?.availability}
                oeReference={oeReference}
                isOEM={isOEM}
                manufacturer={product?.manufacturer}
                itemCategoryContext={itemCategoryContext}
              />
            );
          })}
      </div>
    </OGScrollList>
  );
}
