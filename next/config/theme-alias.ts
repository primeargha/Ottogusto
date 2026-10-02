import { STORE_IDS, DEFAULT_STORE } from "./store-constants";

export const store = process.env.STORE || process.env.NEXT_PUBLIC_STORE || DEFAULT_STORE;

export const color_primary_main =
  store === STORE_IDS.OTTOGUSTO ? "--color-piston-900m" : "--color-green-500m";

export const color_primary_hover =
  store === STORE_IDS.OTTOGUSTO ? "--color-piston-700" : "--color-green-600";

export const color_primary_disabled =
  store === STORE_IDS.OTTOGUSTO ? "--color-piston-muted" : "--color-green-50";

export const color_secondary_main =
  store === STORE_IDS.OTTOGUSTO ? "--color-traffic-700m" : "--color-green-500m";

export const color_secondary_hover =
  store === STORE_IDS.OTTOGUSTO ? "--color-traffic-800" : "--color-green-600";

export const color_secondary_disabled =
  store === STORE_IDS.OTTOGUSTO ? "--color-traffic-muted" : "--color-green-50";

export const color_accent_main =
  store === STORE_IDS.OTTOGUSTO ? "--color-highway-400m" : "--color-red-500m";

export const color_accent_dark =
  store === STORE_IDS.OTTOGUSTO ? "--color-highway-700" : "--color-red-700";

export const color_accent_light =
  store === STORE_IDS.OTTOGUSTO ? "--color-highway-100" : "--color-red-300";

export const color_background_none =
  store === STORE_IDS.OTTOGUSTO ? "--color-white" : "--color-white";

export const color_background_l1 =
  store === STORE_IDS.OTTOGUSTO ? "--color-beige-200" : "--color-seafoam-100";

export const color_background_l2 =
  store === STORE_IDS.OTTOGUSTO ? "--color-beige-600" : "--color-seafoam-200";

export const color_background_l3 =
  store === STORE_IDS.OTTOGUSTO ? "--color-beige-800" : "--color-seafoam-300";

export const color_background_l4 =
  store === STORE_IDS.OTTOGUSTO ? "--color-chrome-50" : "--color-peach-50";

export const color_background_l5 =
  store === STORE_IDS.OTTOGUSTO ? "--color-chrome-200" : "--color-peach-100";

export const color_background_l6 =
  store === STORE_IDS.OTTOGUSTO ? "--color-chrome-400" : "--color-peach-200";

export const color_background_l7 =
  store === STORE_IDS.OTTOGUSTO ? "--color-chrome-600" : "--color-peach-300";

export const color_background_l8 =
  store === STORE_IDS.OTTOGUSTO ? "--color-chrome-800" : "--color-peach-400";

export const color_background_overlay =
  store === STORE_IDS.OTTOGUSTO ? "--color-grey-950m" : "--color-black";

export const color_background_brand =
  store === STORE_IDS.OTTOGUSTO ? "--color-piston-900m" : "--color-green-500m";

export const color_text_body =
  store === STORE_IDS.OTTOGUSTO ? "--color-tarmac-950m" : "--color-black-700";

export const color_text_placeholder =
  store === STORE_IDS.OTTOGUSTO ? "--color-grey-700" : "--color-black-400";

export const color_text_disabled =
  store === STORE_IDS.OTTOGUSTO ? "--color-grey-500" : "--color-black-300";

export const color_text_on_dark = store === STORE_IDS.OTTOGUSTO ? "--color-white" : "--color-white";

export const color_text_on_brand =
  store === STORE_IDS.OTTOGUSTO ? "--color-highway-400m" : "--color-white";

export const color_neutral_main =
  store === STORE_IDS.OTTOGUSTO ? "--color-grey-300" : "--color-grey-500m";

export const color_neutral_disabled =
  store === STORE_IDS.OTTOGUSTO ? "--color-grey-100" : "--color-grey-300";

export const color_neutral_hover =
  store === STORE_IDS.OTTOGUSTO ? "--color-grey-700" : "--color-grey-700";

export const color_system_warning_extra_light =
  store === STORE_IDS.OTTOGUSTO ? "--color-orange-100" : "--color-orange-100";

export const color_system_warning_light =
  store === STORE_IDS.OTTOGUSTO ? "--color-orange-200" : "--color-orange-300";

export const color_system_warning_main =
  store === STORE_IDS.OTTOGUSTO ? "--color-orange-300" : "--color-orange-500m";

export const color_system_warning_dark =
  store === STORE_IDS.OTTOGUSTO ? "--color-orange-400" : "--color-orange-600";

export const color_system_info_extra_light =
  store === STORE_IDS.OTTOGUSTO ? "--color-blue-100" : "--color-blue-50";

export const color_system_info_light =
  store === STORE_IDS.OTTOGUSTO ? "--color-blue-200" : "--color-blue-200";

export const color_system_info_main =
  store === STORE_IDS.OTTOGUSTO ? "--color-blue-300" : "--color-blue-500m";

export const color_system_info_dark =
  store === STORE_IDS.OTTOGUSTO ? "--color-blue-400" : "--color-blue-700";

export const color_system_success_extra_light =
  store === STORE_IDS.OTTOGUSTO ? "--color-green-100" : "--color-green-50";

export const color_system_success_light =
  store === STORE_IDS.OTTOGUSTO ? "--color-green-200" : "--color-green-100";

export const color_system_success_main =
  store === STORE_IDS.OTTOGUSTO ? "--color-green-300" : "--color-green-500m";

export const color_system_success_dark =
  store === STORE_IDS.OTTOGUSTO ? "--color-green-400" : "--color-green-800";

export const color_system_error_extra_light =
  store === STORE_IDS.OTTOGUSTO ? "--color-red-100" : "--color-red-50";

export const color_system_error_light =
  store === STORE_IDS.OTTOGUSTO ? "--color-red-200" : "--color-red-200";

export const color_system_error_main =
  store === STORE_IDS.OTTOGUSTO ? "--color-red-300" : "--color-red-500m";

export const color_system_error_dark =
  store === STORE_IDS.OTTOGUSTO ? "--color-red-400" : "--color-red-700";

export const color_hover_action_primary =
  store === STORE_IDS.OTTOGUSTO ? "--color-hovers-main" : "--color-hovers-main";

export const color_hover_action_error =
  store === STORE_IDS.OTTOGUSTO ? "--color-hovers-error" : "--color-hovers-error";

export const color_scroll_fade_white =
  store === STORE_IDS.OTTOGUSTO ? "#FFFFFF - 0%" : "#FFFFFF - 0%";

export const color_scroll_fade_l1 =
  store === STORE_IDS.OTTOGUSTO ? "--color-beige-200" : "--color-seafoam-l1-overlay";

export const color_scroll_fade_l2 =
  store === STORE_IDS.OTTOGUSTO ? "--color-beige-600" : "--color-seafoam-l2-overlay";

export const color_scroll_fade_l3 =
  store === STORE_IDS.OTTOGUSTO ? "--color-beige-800" : "--color-seafoam-l3-overlay";
