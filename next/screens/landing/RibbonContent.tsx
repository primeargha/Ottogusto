import { CrossIconModal } from "@/components/icons/CrossIconModal";
import Typography from "@/components/og-components/Typography";
import { Box } from "@/components/ui/box";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { DEFAULT_STORE, STORE_IDS } from "@/config/store-constants";
import { useBranding } from "@/contexts/BrandingContext";
import { getFrontendBaseUrl } from "@/helpers/UtilityHelper";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
import { RIBBON_LINKS_LABELS } from "@/data/branding/ribbonLinks";
import {
  containsUnresolvedLabelPlaceholders,
  safeNextLinkHref,
} from "@/utils/translationDisplayMode";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface RibbonLinkItem {
  text: string;
  link: string;
}

interface RibbonContentProps {
  showRibbon?: boolean;
  hideRibbon?: () => void;
  ribbonLinks?: RibbonLinkItem[];
}

export default function RibbonContent({
  showRibbon,
  hideRibbon,
  ribbonLinks = [],
}: RibbonContentProps) {
  const { getLabel, getLocale } = useBranding();
  const { locale } = useLandingPageDataStore();
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;

  const [activeIndex, setActiveIndex] = useState(0);

  const activeLangCountry = locale || `${getLocale()}-BE`;
  const activeLanguage = activeLangCountry.split("-")[0] || getLocale();

  const getLocaleRelativeTail = (path: string): string => {
    if (!path) return "/";

    const trimmed = path.trim();

    // Case 1: Placeholder like /[locale]/support or /[local]/car-parts
    const placeholderMatch = trimmed.match(/^\/?\[(?:locale|local)\]\/?(.*)$/i);
    if (placeholderMatch) {
      const rest = placeholderMatch[1] || "";
      return rest ? `/${rest}` : "/";
    }

    // Case 2: Path already starts with a locale segment, e.g. /en-BE/support or /en/support
    const localeMatch = trimmed.match(/^\/[a-z]{2}(?:-[A-Za-z]{2})?(\/.*)?$/i);
    if (localeMatch) {
      const rest = localeMatch[1] || "";
      return rest ? rest : "/";
    }

    // Case 3: Plain relative path like "support" or "/support"
    if (!trimmed.startsWith("/")) {
      return `/${trimmed}`;
    }
    return trimmed;
  };

  const buildRibbonHref = (linkKey: string) => {
    const baseUrl = getFrontendBaseUrl().replace(/\/$/, "");
    let baseHost = "";
    try {
      baseHost = new URL(baseUrl).host;
    } catch {
      baseHost = "";
    }

    const fallbackRedirect = (RIBBON_LINKS_LABELS[linkKey] as string) || "";

    const rawRedirectFromLabels = getLabel(linkKey, { locale: activeLanguage }) || "";

    if (containsUnresolvedLabelPlaceholders(rawRedirectFromLabels)) {
      const tail = getLocaleRelativeTail(fallbackRedirect);
      return safeNextLinkHref(`${baseUrl}/${activeLangCountry}${tail}`, "#");
    }

    const normalizedFromLabels = String(rawRedirectFromLabels)
      .trim()
      .replace(/^https\/\//i, "https://")
      .replace(/^http\/\//i, "http://");

    let pathSource = normalizedFromLabels || fallbackRedirect;

    if (/^https?:\/\//i.test(pathSource)) {
      try {
        const parsed = new URL(pathSource);
        //
        // If we are on Ottogusto but translations point to another domain (e.g. qverde.com),
        // fall back to the local ribbonLinks config instead of using that external URL.
        if (
          currentStore === STORE_IDS.OTTOGUSTO &&
          baseHost &&
          parsed.host !== baseHost &&
          fallbackRedirect
        ) {
          pathSource = fallbackRedirect;
        } else {
          pathSource = `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
        }
      } catch {
        pathSource = fallbackRedirect || "/";
      }
    }

    const tail = getLocaleRelativeTail(pathSource);
    const finalUrl = `${baseUrl}/${activeLangCountry}${tail}`;

    return safeNextLinkHref(finalUrl, "#");
  };

  // 🔁 Auto-rotate links every 4 seconds
  useEffect(() => {
    if (!ribbonLinks.length) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ribbonLinks.length);
    }, 10_000);

    return () => clearInterval(interval);
  }, [ribbonLinks]);

  if (!showRibbon || !ribbonLinks.length) return null;

  return (
    <Box className="z-50 flex w-full flex-row items-center justify-between bg-color-accent-main px-space-lg base:min-h-10 gtsm:min-h-11 gtlg:min-h-11">
      {/* Left spacer */}
      <Box />

      {/* 🔥 Animated link area */}
      <Box className="relative flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex h-full items-center justify-center"
          >
            {ribbonLinks[activeIndex] && (
              <Link href={buildRibbonHref(ribbonLinks[activeIndex].link)} prefetch>
                <Typography
                  className={`cursor-pointer ${
                    currentStore === STORE_IDS.OTTOGUSTO
                      ? "text-color-text-emphasis"
                      : "text-color-text-inverse"
                  } typography-mono-caption hover:underline`}
                >
                  {getLabel(ribbonLinks[activeIndex].text)}
                </Typography>
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Close icon */}
      <Box className="cursor-pointer rounded-md p-1" onClick={hideRibbon as any}>
        <CrossIconModal
          className={
            currentStore === STORE_IDS.OTTOGUSTO
              ? "text-color-icon-emphasis"
              : "text-color-icon-inverse"
          }
        />
      </Box>
    </Box>
  );
}
