import { normalizeAuthProfile } from "@/utils/accountCartSession";

/** Language code selected in OGLanguageSelectionModel ("Key" option). */
export const TRANSLATION_KEYS_LANG = "key";

export const LOCALE_PATH_SEGMENT_RE = /^((?:key)|[a-z]{2})-([A-Z]{2})$/i;

export function parseLocalePathSegment(segment: string): { lang: string; country: string } | null {
  const m = segment.trim().match(LOCALE_PATH_SEGMENT_RE);
  if (!m?.[1] || !m[2]) return null;
  return { lang: m[1].toLowerCase(), country: m[2].toUpperCase() };
}

export function isTranslationKeysLang(lang: string | undefined | null): boolean {
  const langOnly = (lang ?? "").split("-")[0]?.toLowerCase() || "";
  return langOnly === TRANSLATION_KEYS_LANG;
}

export function isCp2StaffEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  return email.toLowerCase().includes("@cp2digital");
}

/** Logged-in user may see the Key language option and translation-key labels. */
export function canAccessTranslationKeysLanguage(
  authUser: unknown,
  auth0Email?: string | null | undefined,
): boolean {
  const profile = normalizeAuthProfile(authUser);
  if (profile?.email && isCp2StaffEmail(profile.email)) return true;
  if (auth0Email && isCp2StaffEmail(auth0Email)) return true;
  return false;
}

export function canShowTranslationKeys(
  lang: string,
  authUser: unknown,
  auth0Email?: string | null | undefined,
): boolean {
  return isTranslationKeysLang(lang) && canAccessTranslationKeysLanguage(authUser, auth0Email);
}

/** Never apply API `show_code`; keys are gated by cp2 email + Key language only. */
export function stripShowCodeFromLabels(labels: Record<string, string>): Record<string, string> {
  if (!labels || typeof labels !== "object") return labels;
  const { show_code: _removed, ...rest } = labels;
  return rest;
}

export function stripLocalePrefixFromPath(pathString: string): string {
  const match = pathString.match(/^\/((?:key)|[a-z]{2})-[A-Z]{2}/i);
  if (match?.[0]) {
    return pathString.replace(match[0], "");
  }
  return pathString;
}

/** True when label is shown as `[key_name]` (Key mode) — must not be used as Link href. */
export function isTranslationKeyPlaceholder(value: string | null | undefined): boolean {
  const s = String(value ?? "").trim();
  return /^\[[^\]]+\]$/.test(s);
}

/** Bracket segments left in URLs/paths (e.g. `/[footer_link_1_url]`) break next/link in App Router. */
export function containsUnresolvedLabelPlaceholders(value: string | null | undefined): boolean {
  const s = String(value ?? "").trim();
  if (!s) return false;
  if (isTranslationKeyPlaceholder(s)) return true;
  return /\[[a-zA-Z0-9_.]+\]/.test(s);
}

/** Safe href for `<Link>` — returns fallback when value is a translation key placeholder. */
export function safeNextLinkHref(href: string | null | undefined, fallback = "#"): string {
  const s = String(href ?? "").trim();
  if (!s || containsUnresolvedLabelPlaceholders(s)) return fallback;
  return s;
}

/** Default placeholder when translation keys would break `next/image` src parsing. */
export const FALLBACK_NEXT_IMAGE_SRC = "/assets/Frame.svg";

/**
 * Safe `src` for `next/image` when labels may resolve to `[key_name]?query` in Key mode.
 */
export function safeNextImageSrc(
  src: string | null | undefined,
  fallback = FALLBACK_NEXT_IMAGE_SRC,
): string {
  const raw = String(src ?? "").trim();
  if (!raw || containsUnresolvedLabelPlaceholders(raw)) return fallback;

  const pathOnly = (raw.split("?")[0] ?? raw).split("#")[0] ?? "";
  if (!pathOnly) return fallback;

  if (pathOnly.startsWith("/")) return raw;
  if (/^https?:\/\//i.test(pathOnly)) return raw;

  return fallback;
}
