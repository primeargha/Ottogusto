/**
 * Pure helpers for PDP banner VIN part-check URL sync
 * (`useE2EPdpBannerVinCheck` — browser BACK vs mid-Add race).
 */

/** Build the in-flight check key used to ignore stale mutation responses. */
export function buildPdpPartVinCheckKey(vin: string, partId: string): string {
  return `${vin}:${partId}`;
}

/**
 * URL lost `vin` (browser BACK / deselect) → reset Fit chrome.
 * Still no `vin` after Add car VIN (URL catching up) → keep mid-check result.
 */
export function shouldResetPdpBannerVinCheckOnUrlVinLoss(
  previousUrlVin: string | null,
  currentUrlVin: string | null,
): boolean {
  return Boolean(previousUrlVin) && !currentUrlVin;
}

/** True when this mutation response still matches the latest check request. */
export function isCurrentPdpPartVinCheckKey(
  lastCheckedKey: string | null,
  vin: string,
  partId: string,
): boolean {
  return lastCheckedKey === buildPdpPartVinCheckKey(vin, partId);
}
