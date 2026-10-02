/**
 * Mobile hero search panel layout — shared between loaded UI and skeleton.
 * Wrapper height must match loaded content; adjust MOBILE_HERO_SEARCH_PANEL_HEIGHT only here.
 */

/** Outer wrapper in hero-card-mobile (skeleton + HeroCarDataCard / HeroNewCarSelectionCard). */
export const MOBILE_HERO_SEARCH_PANEL_HEIGHT = "h-auto min-h-[258px]";

export const MOBILE_HERO_PANEL_ROOT_CLASS =
  "flex h-full min-h-0 w-full max-w-full flex-col rounded-md border border-color-border-emphasis bg-color-background-default";

/** heroCard2 search column: mobile card below `md`, in-flow panel from `md` up. */
export const MOBILE_HERO_SEARCH_PANEL_WRAPPER_CLASS = `${MOBILE_HERO_PANEL_ROOT_CLASS} gtsm:max-w-[440px] gtsm:w-[440px] overflow-hidden rounded-lg shadow-lg md:h-auto md:min-h-0 md:max-h-none md:overflow-visible md:rounded-none md:shadow-none`;

/** Matches HeroCarDataCard root (saved cars state). */
export const MOBILE_HERO_PANEL_BODY_CLASS =
  "relative flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-t-md bg-white px-4 pb-2 pt-4";

export const MOBILE_HERO_PANEL_CAROUSEL_CLASS =
  "relative min-h-[72px] w-full flex-1 overflow-hidden";

/** Mobile footer: same as HeroCarDataCard below gtsm (px-4 py-3, no fixed min-h on base). */
export const MOBILE_HERO_PANEL_FOOTER_CLASS =
  "relative z-0 flex w-full shrink-0 flex-row items-center justify-end gap-2 rounded-b-md border-t border-color-border-default bg-white px-4 py-3";

/** Matches HeroSavedCarSlide padding / radius on mobile. */
export const MOBILE_HERO_CAR_SLIDE_CLASS =
  "h-full w-full min-h-[72px] rounded-[8px] bg-color-background-emphasis";
