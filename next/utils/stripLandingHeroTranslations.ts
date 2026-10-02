/**
 * Landing hero carousel keys from CMS / DEFAULT_LABELS.
 * Stripped from PDP `initialTranslations` so hero CDN URLs are not serialized in HTML.
 */
export const LANDING_HERO_TRANSLATION_KEY =
  /^(landing_page_hero_image_?\d+|hero_(title|body|url)_\d+)$/i;

export function isLandingHeroTranslationKey(key: string): boolean {
  return LANDING_HERO_TRANSLATION_KEY.test(key);
}

export function stripLandingHeroTranslations<T extends Record<string, unknown>>(
  labels: T | null | undefined,
): T {
  if (!labels || typeof labels !== "object" || Array.isArray(labels)) {
    return labels as T;
  }

  return Object.fromEntries(
    Object.entries(labels).filter(([key]) => !isLandingHeroTranslationKey(key)),
  ) as T;
}
