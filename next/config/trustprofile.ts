import { STORE_IDS } from "@/config/store-constants";

/**
 * Footer Becom / Ecommerce Europe quality mark.
 * `false` = hidden; set `true` on the next deployment to show it again.
 */
export const SHOW_BECOM_QUALITY_MARK = true;

/** Becom Trustmark / Trustprofile config for Ottogusto (NV Cp2 Digital). */
export const TRUSTPROFILE_CONFIG = {
  /** Domain-claim meta tag value from Trustprofile verification email. */
  claimToken: "2da230f755d205",
  /** Trustprofile webshop ID. */
  webshopId: 4217129,
  /** Public trust profile page. */
  profileUrl: "https://trustmark.becom.digital/nl/NV-Cp2-Digital_4217129",
  /** Static Becom Trustmark badge SVG from Trustprofile dashboard. */
  badgeImageUrl: "https://dashboard.trustprofile.com/banners/4000084/4217129/1790216506000.svg",
  sidebarScriptBaseUrl: "https://dashboard.trustprofile.com",
} as const;

export function isTrustprofileEnabled(store?: string): boolean {
  const currentStore = store || process.env.STORE || process.env.NEXT_PUBLIC_STORE || "";
  return currentStore === STORE_IDS.OTTOGUSTO;
}
