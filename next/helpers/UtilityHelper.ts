import { DEFAULT_LABELS } from "@/data/branding/labels";
import type { PartsCategoryInterface } from "@/types/categories";
import axios from "axios";
import { UAParser } from "ua-parser-js";
// PERF: Removed moment (~300KB) — replaced with native Date APIs

// Lazy import to avoid circular dependency: UtilityHelper → advancedSearchService → config/api → stores → UtilityHelper
const lazyGetCategories = async (id?: string) => {
  const { getCategories } = await import("@/services/advancedSearchService");
  return getCategories(id);
};
interface ItemsInterFace {
  [key: string]: any;
}

/**
 *
 * @param items GroupBy array with key
 * @param key
 * @returns
 */
export const groupBy = (items: ItemsInterFace[], key: string | number) =>
  items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item],
    }),
    {},
  );

export const getTitleOfCategory = (
  category: PartsCategoryInterface,
  locale: string = "en",
): string => {
  const { titles = {}, name } = category as {
    titles?: { [languageCode: string]: string };
    name: string;
  };
  if (titles && typeof titles === "object" && !Array.isArray(titles) && locale in titles) {
    return String(titles[locale]);
  }
  return name;
};

type Locale = "en" | "fr" | "nl";

export const formatTitle = (str: string | undefined | null, locale: Locale): string => {
  if (!str) return "";

  return str.toLocaleLowerCase(locale).replace(/^\p{L}/u, (char) => char.toLocaleUpperCase(locale));
};

let cachedParts: any[] | null = null;
// export const getPartsForStaticPageGenration = async () => {
//   if (cachedParts) {
//     return cachedParts;
//   }
//   let data = JSON.stringify({
//     vendorId: null,
//     language: "nl",
//     search: null,
//     name: null,
//     oeReference: null,
//     makeModelTypeId: null,
//     categoryId: null,
//     take: null,
//     continuationToken: null,
//   });

//   let config = {
//     method: "post",
//     maxBodyLength: Infinity,
//     url: "https://api-dev.ottogusto.com/api/Parts",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": "",
//     },
//     data: data,
//   };

//   const response = await axios.request(config);
//   cachedParts = response.data.parts || [];
//   return cachedParts;
// };

export const flattenTree = <T extends Record<string, any>>(
  arr: T[],
  childKey: keyof T = "children" as keyof T,
): Omit<T, "children">[] => {
  const result: Omit<T, "children">[] = [];

  const recurse = (items: T[]) => {
    for (const item of items) {
      const { [childKey]: children, ...rest } = item;
      result.push(rest as Omit<T, "children">);
      if (Array.isArray(children)) {
        recurse(children as T[]);
      }
    }
  };

  recurse(arr || []);
  return result;
};

export const getFrontendBaseUrl = (): string => {
  const envBase = process.env.NEXT_PUBLIC_FRONTEND_PROD_URL;

  if (typeof window !== "undefined") {
    return envBase || window.location.origin;
  }

  return envBase || "";
};

export const getRouteLocaleString = (routeCallback: any, params: any) => {
  if (params && typeof params["language-country"] === "string") {
    return routeCallback(params["language-country"]);
  }
  return "#";
};
export const randomcartidgenerator = () => {
  const randomLetters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join("");

  const now = new Date();
  const time =
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");
  const date = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();

  return `${randomLetters}${time}${date}${month}${year}`;
};

// Move this component to a .tsx file if you want to use JSX, or use React.createElement as below:
import React from "react";

export const ImageWithFallback = ({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/assets/profile/placeholder-profile-image.png";
  };

  return React.createElement("img", {
    src,
    alt,
    width,
    height,
    onError: handleError,
  });
};

export const mmtExtractFromMMTY_ID = (mmty_id: string) => {
  return {
    makeID: mmty_id.substring(0, 3),
    modelId: mmty_id.substring(3, 6),
    type: mmty_id.substring(6, 9),
    year: mmty_id.substring(9, 11),
    options: mmty_id.substring(11, 14),
  };
};

export const getImageMimeType = (filename: string): string | null => {
  const extension = filename.split(".").pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    svg: "image/svg+xml",
    tif: "image/tiff",
    tiff: "image/tiff",
    ico: "image/vnd.microsoft.icon",
  };

  return extension && mimeTypes[extension] ? mimeTypes[extension] : null;
};

/**
 * Gets level of category based on providedId
 *
 * @param id
 * @returns
 */
export const getTypeFromCategoryId = (id: string) => {
  if (id.length === 3) {
    // For L1
    return 1;
  }
  if (id.length === 6) {
    // For L2
    return 2;
  }
  if (id.length === 9) {
    // For L3
    return 3;
  }
};

/**
 * Get CategoryID of Specific Level from specific category id
 * @param id
 * @param level
 * @returns
 */
export const extractLevelIDFromCategoryId = (id: string, level: number) => {
  if (level === 1) {
    return id.substring(0, 3);
  }
  if (level === 2) {
    return id.substring(3, 6);
  }
  if (level === 3) {
    return id.substring(6, 9);
  }
};

export const getCategoryLevel = (categoryId: string) => {
  if (categoryId.length === 3) {
    return 1;
  }
  if (categoryId.length === 6) {
    return 2;
  }
  if (categoryId.length >= 9) {
    return 3;
  }
};
/**
 * Category Selection logic for Search Results page
 * Handles the logic of category selection after *updateCategoryList*
 * @param existingIds
 * @param newId
 * @returns
 */
export const updateCategoryListSub = async (
  existingIds: PartsCategoryInterface[],
  newId: string,
  newParentId?: string,
  newNode?: PartsCategoryInterface,
  nestedCategoryData?: PartsCategoryInterface[],
): Promise<PartsCategoryInterface[]> => {
  // debugger;
  // const ids = existingIds?.map((obj) => obj.id);
  const level = getCategoryLevel(newId);

  if (level === 3) {
    // if direct parent exists
    // const ifParentInList = existingIds.find((node) => (node.id === newParentId ? true : false))
    //   ? true
    //   : false;

    // if any parent exist
    const ifParentInList = existingIds.find((node) =>
      newParentId?.startsWith(node.id) ? true : false,
    )
      ? true
      : false;
    const parentNode = existingIds.find((node) => newParentId?.startsWith(node.id));

    // check if child of it exists and it does'nt exist in list
    const ifItExist = existingIds.find((node) => node.id === newId) ? true : false;
    // const newlist = existingIds.filter((node) => !node.id.startsWith(newId)); // without current one
    const newlist = existingIds.filter((node) => !newId.startsWith(node.id)); // without current one

    if (ifParentInList) {
      // User is adding (selecting) this L3: replace parent with only this L3.
      // Previously this returned all siblings except newId (inverse); now return only the selected L3.
      if (newNode) {
        const withoutParentAndSiblings = newlist.filter((node) => {
          if (node.id === newParentId) return false;
          if (parentNode && node.id === parentNode.id) return false;
          if (newParentId && node.id.startsWith(newParentId) && node.id.length === newId.length)
            return false;
          return true;
        });
        return [...withoutParentAndSiblings, newNode].filter(Boolean);
      }
      // Legacy/uncheck path: remove parent from list but add all children except the unchecked one
      if (newParentId?.length === 6 && parentNode?.id.length === 3) {
        const child1NewListResponse = await lazyGetCategories(parentNode?.id);
        const { data: child1NewListData } = child1NewListResponse;
        const childNewListResponse = await lazyGetCategories(newParentId);
        const { data: childNewListData } = childNewListResponse;
        const finalList: PartsCategoryInterface[] = [
          ...(child1NewListData as PartsCategoryInterface[]),
          ...(childNewListData as PartsCategoryInterface[]),
          ...newlist,
        ];
        return finalList.filter(
          (node) =>
            !(
              node.id === newId ||
              node.id === newParentId ||
              parentNode?.id === newParentId ||
              parentNode?.id === newId
            ),
        );
      } else {
        const childNewListResponse = await lazyGetCategories(newParentId);
        const { data: childNewListData } = childNewListResponse;
        const finalList: PartsCategoryInterface[] = [
          ...(childNewListData as PartsCategoryInterface[]),
          ...newlist,
        ];
        return finalList.filter((node) => !(node.id === newId || node.id === newParentId));
      }
    }

    if (ifItExist) {
      return [...newlist];
    } else {
      return newNode ? [...newlist, newNode] : [...newlist];
    }
  }
  if (level === 2) {
    const ifParentInList = existingIds.find((node) => (node.id === newParentId ? true : false))
      ? true
      : false;
    const ifItExist = existingIds.find((node) => node.id === newId) ? true : false;
    const newlist = existingIds.filter((node) => !node.id.startsWith(newId)); // without current one

    if (ifParentInList) {
      // User is adding (selecting) this L2: replace parent with only this L2 (no siblings)
      if (newNode) {
        const withoutParentAndSiblings = newlist.filter((node) => {
          if (node.id === newParentId) return false;
          if (newParentId && node.id.startsWith(newParentId) && node.id.length === newId.length)
            return false;
          return true;
        });
        return [...withoutParentAndSiblings, newNode].filter(Boolean);
      }
      // Legacy: remove parent and add all children except the unchecked one
      const childNewListResponse = await lazyGetCategories(newParentId);
      const { data: childNewListData } = childNewListResponse;
      const finalList: PartsCategoryInterface[] = [
        ...(childNewListData as PartsCategoryInterface[]),
        ...newlist,
      ];
      return finalList.filter((node) => !(node.id === newId || node.id === newParentId));
    }

    if (ifItExist) {
      return [...newlist];
    } else {
      return newNode ? [...newlist, newNode] : [...newlist];
    }
  }
  if (level === 1) {
    // check if child of it exists and it does'nt exist in list
    const ifItExist = existingIds.find((node) => node.id === newId) ? true : false;
    const newlist = existingIds.filter((node) => !node.id.startsWith(newId)); // without current one
    if (ifItExist) {
      return [...newlist];
    } else {
      return newNode ? [...newlist, newNode] : [...newlist];
    }
  }

  return [];
};

/**
 * Category Selection logic for Search Results page
 * If all childs selected then add the parent in the list
 * otherwise rest of the logic is written in *updateCategoryListSub(...)* method
 * @param existingIds
 * @param newId
 * @returns
 */
export const updateCategoryList = async (
  existingIds: PartsCategoryInterface[],
  newId: string,
  newParentId?: string,
  newNode?: PartsCategoryInterface,
  nestedCategoryData?: PartsCategoryInterface[],
): Promise<PartsCategoryInterface[]> => {
  const level = getCategoryLevel(newId);

  // =============================================================================
  // SPECIAL HANDLING FOR HIERARCHICAL CATEGORY SELECTION
  // =============================================================================

  // Case 1: L1 is selected and L2 from same L1 is being added
  // Behavior: Select all L2 siblings except the clicked one
  if (level === 2 && newParentId && nestedCategoryData) {
    const l1Category = existingIds.find((cat) => cat.id === newParentId);
    if (l1Category) {
      // Get all L2 categories under this L1 parent
      const allL2Categories =
        nestedCategoryData
          .find((cat) => cat.id === newParentId)
          ?.children?.map((child) => ({
            ...child,
            parentId: newParentId,
          })) || [];

      // Preserve other selected categories that are not related to this L1
      const otherCategories = existingIds.filter(
        (cat) =>
          cat.id !== newParentId && // Remove the L1 itself
          !cat.id.startsWith(newParentId), // Remove any existing children of this L1
      );

      // Return: other categories + all L2 categories except the clicked one
      return [...otherCategories, ...allL2Categories.filter((cat) => cat.id !== newId)];
    }
  }

  // Case 2: L1 is selected and L3 from same L1 is being added (but L2 is not selected)
  // This handles the scenario where user expands L1 and directly clicks an L3
  // Behavior: First click converts L1 to all L2, second click handles L2->L3 logic
  if (level === 3 && newParentId && nestedCategoryData) {
    const l1ParentId = newParentId.substring(0, 3);
    const l1Category = existingIds.find((cat) => cat.id === l1ParentId);
    const l2Category = existingIds.find((cat) => cat.id === newParentId);

    // Only trigger if L1 is selected but L2 is NOT selected
    if (l1Category && !l2Category) {
      // Check if this L3's parent L2 is already selected (indicates this is second click)
      const parentL2Selected = existingIds.find((cat) => cat.id === newParentId);

      if (parentL2Selected) {
        // Second click: L2 is now selected, so use L2->L3 logic
        const isL3AlreadySelected = existingIds.find((cat) => cat.id === newId);

        if (isL3AlreadySelected) {
          // Toggle off: Remove all L2 categories of this L1
          const otherCategories = existingIds.filter(
            (cat) => !cat.id.startsWith(l1ParentId), // Remove L1 and all its L2 children
          );
          return otherCategories;
        } else {
          // Toggle on: Select all L3 siblings except the clicked one
          const allL3Categories =
            nestedCategoryData
              .find((cat) => cat.id === l1ParentId)
              ?.children?.find((child) => child.id === newParentId)
              ?.children?.map((child) => ({
                ...child,
                parentId: newParentId,
              })) || [];

          const otherCategories = existingIds.filter(
            (cat) =>
              cat.id !== newParentId && // Remove the L2 itself
              !cat.id.startsWith(newParentId), // Remove any existing children of this L2
          );

          return [...otherCategories, ...allL3Categories.filter((cat) => cat.id !== newId)];
        }
      } else {
        // First click: Convert L1 to all L2 categories
        const allL2Categories =
          nestedCategoryData
            .find((cat) => cat.id === l1ParentId)
            ?.children?.map((child) => ({
              ...child,
              parentId: l1ParentId,
            })) || [];

        const otherCategories = existingIds.filter(
          (cat) =>
            cat.id !== l1ParentId && // Remove L1 itself
            !cat.id.startsWith(l1ParentId), // Remove any existing children of this L1
        );

        return [...otherCategories, ...allL2Categories];
      }
    }
  }

  // Case 3: L2 is selected and L3 from same L2 is being added
  // Behavior: Toggle between selecting all L3 siblings and deselecting all
  if (level === 3 && newParentId && nestedCategoryData) {
    const l2Category = existingIds.find((cat) => cat.id === newParentId);
    if (l2Category) {
      const isL3AlreadySelected = existingIds.find((cat) => cat.id === newId);

      if (isL3AlreadySelected) {
        // Toggle off: Remove L2 and all its L3 children
        const otherCategories = existingIds.filter(
          (cat) => !cat.id.startsWith(newParentId), // Remove L2 and all its L3 children
        );
        return otherCategories;
      } else {
        // Toggle on: Select all L3 siblings except the clicked one
        const l1ParentId = newParentId.substring(0, 3);
        const allL3Categories =
          nestedCategoryData
            .find((cat) => cat.id === l1ParentId)
            ?.children?.find((child) => child.id === newParentId)
            ?.children?.map((child) => ({
              ...child,
              parentId: newParentId,
            })) || [];

        const otherCategories = existingIds.filter(
          (cat) =>
            cat.id !== newParentId && // Remove the L2 itself
            !cat.id.startsWith(newParentId), // Remove any existing children of this L2
        );

        return [...otherCategories, ...allL3Categories.filter((cat) => cat.id !== newId)];
      }
    }
  }

  // =============================================================================
  // ORIGINAL LOGIC FOR OTHER CASES
  // =============================================================================
  // This handles standard category selection behavior and edge cases
  const preSelectionData = await updateCategoryListSub(
    existingIds,
    newId,
    newParentId,
    newNode,
    nestedCategoryData,
  );

  let results: PartsCategoryInterface[] = preSelectionData;
  const flattenedMaster = flattenTree(nestedCategoryData || [], "children");
  const currentLevelTotalItemCount = flattenedMaster.filter(
    (a) => newParentId && a.id.startsWith(newParentId) && a.id.length === newId.length,
  );
  const currentLevelSelectedItemCount = preSelectionData.filter(
    (a) => newParentId && a.id.startsWith(newParentId) && a.id.length === newId.length,
  );
  if (
    currentLevelTotalItemCount.length === currentLevelSelectedItemCount.length &&
    currentLevelTotalItemCount.length !== 0
  ) {
    const a = preSelectionData.filter((a) => {
      return !a.parentId.startsWith(newParentId ?? "");
    });

    // Selected parent category
    const b = flattenedMaster.find((a) => a.id === newParentId);

    // debugger;
    results = [...a.filter((node): node is PartsCategoryInterface => node !== undefined), b].filter(
      (node): node is PartsCategoryInterface => node !== undefined,
    );

    // check if all l2 are selected then select l1
    if (level === 3) {
      const l1Id = nestedCategoryData?.find((c1) => c1.id === b?.parentId);
      if (
        l1Id &&
        (l1Id.children?.length ?? 0) - 1 === a.filter((cc) => cc.parentId === l1Id.id).length
      ) {
        // debugger;
        const updatedList = preSelectionData.filter(
          (c2) => c2.parentId !== l1Id.id && !c2.parentId.startsWith(l1Id.id),
        );
        results = [...updatedList, l1Id];
        // results = [l1Id];
      }
    }
  }
  // debugger;

  // Return only unique items by id
  const uniqueResults = results.filter(
    (item, index, self) => self.findIndex((i) => i.id === item.id) === index,
  );
  // // debugger;
  // if(level === 3){
  //   debugger;
  //   // const x = await updateCategoryList(uniqueResults, newParentId, flattenedMaster.find((a) => a.id === newParentId).id)
  // }
  return uniqueResults;
};

// export const currencyFormat = (value: number, locale: string, currency: string = "EUR"): string => {
//   if (typeof window === "undefined") {
//     return value.toFixed(2);
//   }
//   return new Intl.NumberFormat(locale, {
//     style: "currency",
//     currency: currency,
//   }).format(value);
// };
// export const currencyFormat = (
//   value: number,
//   locale: string,
//   options?: {
//     symbolPosition?: 'before' | 'after',
//     showSymbol?: boolean
//   }
// ): string => {
//   const currency: string = "EUR"
//   if (typeof window === "undefined") {
//     return value.toFixed(2);
//   }

//   // If showSymbol is false, return number only
//   if (options?.showSymbol === false) {
//     return new Intl.NumberFormat(locale, {
//       style: "decimal",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(value);
//   }

//   const formattedNumber = new Intl.NumberFormat(locale, {
//     style: "currency",
//     currency: currency,
//     currencyDisplay: "symbol",
//   }).format(value);

//   // Handle symbol position if specified
//   if (options?.symbolPosition === 'after') {
//     const symbol = new Intl.NumberFormat(locale, {
//       style: "currency",
//       currency: currency,
//       currencyDisplay: "symbol",
//     }).formatToParts(value).find(part => part.type === 'currency')?.value || '€';

//     return formattedNumber.replace(symbol, '').trim() + ' ' + symbol;
//   }

//   return formattedNumber;
// };
export const currencyFormat = (
  value: number,
  locale: string,
  nospacebetweensymbolandnumber: boolean = true,
  options?: {
    symbolPosition?: "before" | "after";
    showSymbol?: boolean;
  },
): string => {
  const currency = "EUR";
  locale = "nl-BE"; // [OD-1199] Forced currency to Europe

  // Format without currency symbol
  if (options?.showSymbol === false) {
    return new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Get number parts
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  }).formatToParts(value);

  // Format with spacing based on position
  const numberParts = parts?.map((part) => {
    if (part.type === "currency") {
      return options?.symbolPosition === "after"
        ? ` ${part.value}` // Space before symbol when after
        : `${part.value}`; // Space after symbol when before
    }
    return part.value;
  });
  // Assemble final string based on position
  const formattedString = nospacebetweensymbolandnumber
    ? numberParts.join("")
    : numberParts.filter((part) => part.trim() !== "").join("");
  // Handle symbol position
  if (options?.symbolPosition === "after") {
    const symbol = parts.find((part) => part.type === "currency")?.value || "€";
    const numericPart = formattedString.replace(symbol, "").trim();
    return `${numericPart} ${symbol}`;
  }

  return formattedString.replaceAll(/\s/gi, "");
};

export const getdaysbetween = (date1: string | Date | null, date2: string | Date) => {
  if (!date1) return 0;
  const MS_PER_DAY = 86_400_000;
  const old_time = new Date(date1).getTime();
  const new_time = new Date(date2).getTime();
  return Math.floor((new_time - old_time) / MS_PER_DAY);
};

export const getLatestDeliveryDate = (
  tracking:
    Array<{ deliveryDate?: string | null; DeliveryDate?: string | null }> | null | undefined,
): string | null => {
  if (!tracking || tracking.length === 0) return null;

  const validDates = tracking
    .map((item) => item?.deliveryDate ?? item?.DeliveryDate ?? null)
    .filter((date): date is string => {
      if (date == null || String(date).trim() === "") return false;
      const time = new Date(date).getTime();
      return !Number.isNaN(time);
    });

  if (validDates.length === 0) return null;

  const sortedDates = [...validDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return sortedDates[0] ?? null;
};

export const camelToKebab = (str?: string): string => {
  if (!str || typeof str !== "string") return "";

  return str
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // handle camelCase + numbers
    .replace(/[\s_]+/g, "-") // spaces & underscores → hyphen
    .replace(/-+/g, "-") // remove duplicate hyphens
    .toLowerCase();
};

/**
 * Text Utilities
 * @param str
 * @returns
 */
export const camalize = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_m: string, chr: string) => chr.toUpperCase());
};

/**
 * Convert any string to Title 
 * @param str 

 * @returns 
 */
export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Text Utilities
 * @param str
 * @returns
 */
export const slugToWords = (str: string): string => {
  // Converts a URL slug (e.g., "my-awesome-product") to words (e.g., "My Awesome Product")
  if (!str) return "";
  return str
    .replace(/[-_]+/g, " ") // Replace hyphens and underscores with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim() // Remove leading/trailing spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
};

/**
 * Common function to get labels for both SSR and Client Side
 * @param WhiteLabels await getTranslations(lang)
 * @param keyName keyName
 * @param replaceKeys replaceKeys
 * @returns string
 */
export const getLabelUtility = (
  WhiteLabels: { [key: string]: string },
  keyName: string,
  replaceKeys?: { [key: string]: string | number },
  showTranslationKeys = false,
): any => {
  if (showTranslationKeys) {
    return `[${keyName}]`;
  }

  let finalKeyValue =
    WhiteLabels[keyName] ||
    WhiteLabels[keyName?.toLowerCase()] ||
    (DEFAULT_LABELS.default as Record<string, string>)[keyName] ||
    keyName;

  if (!replaceKeys) {
    return finalKeyValue;
  }

  // Replace dynamic placeholders: `[title]` (legacy) and `{brand_name}` (CMS-style).
  const placeholders = finalKeyValue.match(/\[\w+\]|\{\w+\}/gm) ?? [];
  for (const node of placeholders) {
    const keyName = node.slice(1, -1);
    const escaped = keyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regexp = new RegExp(node.startsWith("{") ? `\\{${escaped}\\}` : `\\[${escaped}\\]`, "g");
    finalKeyValue = finalKeyValue.replace(
      regexp,
      typeof replaceKeys === "object"
        ? String(replaceKeys[keyName] ?? keyName)
        : `key missing : ${keyName}`,
    );
  }
  return finalKeyValue;
};

/**
 * Method to get common key prefix from object keys
 * @param obj
 * @returns
 */
export const getCommonKeyPrefix = (obj: Record<string, unknown>): string => {
  const keys = Object.keys(obj);
  if (keys.length === 0) return "";

  const first3 = keys[0]?.slice(0, 3) || "";
  const first6 = keys[0]?.slice(0, 6) || "";

  const allMatch6 = keys.every((key) => key.startsWith(first6));
  if (allMatch6) return first6;

  const allMatch3 = keys.every((key) => key.startsWith(first3));
  if (allMatch3) return first3;

  return ""; // No common prefix
};

/**
 * Trims whitespace from object keys
 * @param obj
 * @returns
 */
type AnyObject = { [key: string]: any };
export const trimObjectKeys = (obj: AnyObject): AnyObject => {
  const newObj: AnyObject = {};

  Object.entries(obj).forEach(([key, value]) => {
    const trimmedKey = key.trim(); // Remove leading/trailing spaces

    // If the value is an object, trim its keys recursively
    if (value && typeof value === "object" && !Array.isArray(value)) {
      newObj[trimmedKey] = trimObjectKeys(value);
    } else {
      newObj[trimmedKey] = value;
    }
  });

  return newObj;
};

export function getClientOS() {
  if (typeof window === "undefined") return null; // SSR safety

  const parser = new UAParser();
  const { os, browser } = parser.getResult();

  return {
    osName: os.name || "",
    browserName: browser.name || "",
    isIOS: os.name === "iOS",
    isAndroid: os.name === "Android",
    isSafari: browser.name === "Safari",
  };
}
