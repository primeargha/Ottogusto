export function handleQueryStringPreservation(
  backendUrl: string,
  originalQueryString: string,
): string {
  try {
    const backendUrlObj = new URL(backendUrl, "https://example.com");

    if (backendUrlObj.search && backendUrlObj.search.length > 1) {
      return backendUrl;
    }

    // Otherwise, append original query string if present
    if (originalQueryString && originalQueryString.length > 0) {
      const cleanQueryString = originalQueryString.startsWith("?")
        ? originalQueryString.substring(1)
        : originalQueryString;
      return `${backendUrl}?${cleanQueryString}`;
    }

    return backendUrl;
  } catch (error) {
    // If URL parsing fails, return backend URL as-is
    console.warn("[Redirect] Error parsing URL, returning as-is:", error);
    return backendUrl;
  }
}

/**
 * Checks if a redirect would create a loop
 */
export function isRedirectLoop(currentPath: string, redirectPath: string): boolean {
  // Normalize paths for comparison (remove leading/trailing slashes)
  const normalizedCurrent = currentPath.replace(/^\/+|\/+$/g, "");
  const normalizedRedirect = redirectPath.replace(/^\/+|\/+$/g, "");

  return normalizedCurrent === normalizedRedirect;
}

/**
 * Checks if a path should be excluded from redirect checks
 */
export function shouldSkipRedirect(pathname: string): boolean {
  // Skip API routes
  if (pathname.startsWith("/api/")) {
    return true;
  }

  // Skip Next.js internal routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_vercel/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }

  // Skip static files (common extensions)
  const staticExtensions = [
    ".ico",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".css",
    ".js",
    ".json",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".webmanifest",
    ".xml",
    ".txt",
  ];
  const lowerPath = pathname.toLowerCase();
  if (staticExtensions.some((ext) => lowerPath.endsWith(ext))) {
    return true;
  }

  // Skip store-specific asset paths (e.g., /qverde-favicon/, /ottogusto-assets/)
  if (/^\/(qverde|ottogusto)-/.test(pathname)) {
    return true;
  }

  // Commented this because on homepage we need headers to be set
  // Skip locale-only paths (e.g., /en-BE, /nl-BE, /fr-BE)
  // These don't need redirect checks - they're valid locale routes
  // if (/^\/[a-z]{2}-[A-Z]{2}$/.test(pathname)) {
  //   return true;
  // }

  return false;
}
