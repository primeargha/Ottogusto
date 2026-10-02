import {
  LANG_COUNTRY_COMBINATIONS,
  PUBLIC_LANG_COUNTRY_COMBINATIONS,
  ROBOTS_DISALLOW,
  ROBOTS_DISALLOW_INTERNAL_PATHS,
  ROBOTS_DISALLOW_QUERY_PATTERNS,
} from "@/config/robots";
import { isTranslationKeysLang } from "@/utils/translationDisplayMode";

type RobotsContentOptions = {
  isProd: boolean;
  prodUrl: string | undefined;
  devUrl: string | undefined;
};

export function buildRobotsContent({ isProd, prodUrl, devUrl }: RobotsContentOptions): string {
  const lines: string[] = ["User-agent: *"];
  const sitemapBaseUrl = isProd ? prodUrl : devUrl;

  lines.push(`Sitemap: ${sitemapBaseUrl}/sitemap.xml`);
  lines.push(
    ...PUBLIC_LANG_COUNTRY_COMBINATIONS.flatMap((locale) =>
      ROBOTS_DISALLOW.map((path) => `Disallow: /${locale}${path}`),
    ),
  );
  lines.push(...ROBOTS_DISALLOW_INTERNAL_PATHS.map((path) => `Disallow: ${path}`));

  // Internal translation-key debug pseudo-locale — never crawlable.
  const keyLocales = LANG_COUNTRY_COMBINATIONS.filter(isTranslationKeysLang);
  lines.push(...keyLocales.map((locale) => `Disallow: /${locale}/`));

  if (isProd) {
    lines.push(...ROBOTS_DISALLOW_QUERY_PATTERNS.map((pattern) => `Disallow: ${pattern}`));
  } else {
    lines.push("Disallow: /");
  }

  return lines.join("\n");
}
