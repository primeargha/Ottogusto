import { CLIENT_THEME_CONFIG, StoreName, getStoreFromDomain } from "./next/config/client-theme-config";

// Minimal nested getter to avoid importing browser-oriented utils
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function getColorFromPath(store: StoreName, colorPath: string): string {
  try {
    const themeConfig = CLIENT_THEME_CONFIG.stores[store].desktop;
    const value = getNestedValue(themeConfig, `Color.${colorPath}`);

    if (typeof value === "string") {
      return value;
    }
  } catch (error) {
    // fall through to default
  }
  return "#000000";
}

export type NodeColorMappingOptions = {
  store?: StoreName;
  url?: string; // e.g. https://www.ottogusto.be/path
  host?: string; // e.g. www.ottogusto.be
};

// Node-compatible version (no window). Prefers explicit store, then url/host, else defaults to ottogusto.
export function getRuntimeStoreColorMapping(
  ottogustoPath: string,
  qverdePath: string,
  options: NodeColorMappingOptions = {}
): string {
  let resolvedStore: StoreName = "ottogusto";

  if (options.store) {
    resolvedStore = options.store;
  } else if (options.url) {
    resolvedStore = getStoreFromDomain(options.url);
  } else if (options.host) {
    resolvedStore = getStoreFromDomain(`https://${options.host}`);
  }

  if (resolvedStore === "ottogusto") {
    return getColorFromPath("ottogusto", ottogustoPath);
  }
  return getColorFromPath("qverde", qverdePath);
} 