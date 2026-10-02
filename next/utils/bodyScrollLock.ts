/**
 * Nested-safe body scroll lock for overlays (sidebar + confirmation modal).
 * Without ref-counting, closing an inner modal can restore `overflow: hidden`
 * that was inherited from an outer drawer and leave the page unscrolled.
 */

let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

export function lockBodyScroll(): void {
  if (typeof document === "undefined") return;

  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    savedPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  lockCount += 1;
}

export function unlockBodyScroll(): void {
  if (typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  document.body.style.overflow = savedOverflow;
  document.body.style.paddingRight = savedPaddingRight;
  savedOverflow = "";
  savedPaddingRight = "";
}

/** Test / emergency reset — clears any stuck lock. */
export function resetBodyScrollLock(): void {
  if (typeof document === "undefined") return;
  lockCount = 0;
  savedOverflow = "";
  savedPaddingRight = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
}
