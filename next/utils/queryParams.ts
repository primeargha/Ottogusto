/**
 * Converts URL search params string to an object, handling arrays with comma separation
 * @param queryString - URL search params string (e.g. "category=1,2&lang=en")
 */
export const convertQueryParamsToObj = (queryString: string): Record<string, string | string[]> => {
  if (!queryString) return {};

  const searchParams = new URLSearchParams(
    queryString.startsWith("?") ? queryString.slice(1) : queryString,
  );

  const result: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (!value) return;

    // Handle comma-separated values as arrays
    if (value.includes(",")) {
      result[key] = value.split(",").filter(Boolean);
    } else {
      result[key] = value;
    }
  });

  return result;
};

/**
 * Converts an object to URL search params string, handling arrays and nullish values
 * @param obj - Object to convert
 */
export const convertObjToSearchParams = (obj: Record<string, string | string[]>): string => {
  if (!obj || typeof obj !== "object") return "";

  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    // Skip null, undefined, or empty values
    if (value == null || value === "") return;

    // Handle arrays by joining with commas
    if (Array.isArray(value)) {
      const filtered = value.filter(Boolean);
      if (filtered.length > 0) {
        params.append(key, filtered.join(","));
      }
    } else {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};
