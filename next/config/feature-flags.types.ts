/**
 * Feature flag keys used with getClientFeatureFlag / getServerFeatureFlag.
 * Runtime values come only from NEXT_PUBLIC_<KEY_UPPER_SNAKE> env vars (JSON), not from theme config.
 */
export interface FeatureFlags {
  header_countrylanguage_flag: boolean;
  new_mme_feature_flag: boolean;
  mme_feature_flag: boolean;
  brands_filter_feature_flag: boolean;
  show_left_nav_flag: boolean;
  vin_feature_flag: boolean;
  engine_trim_feature_flag: boolean;
  fbt_feature_flag: boolean;
  mobile_bottom_nav_enabled: boolean;
  saved_car_feature_flag: boolean;
  view_all_brands_page_flag: boolean;
  featured_makes_feature_flag: boolean;
  delivery_method_flag: boolean;
  social_pages_feature_flag: boolean;
  testimonials_feature_flag: boolean;
  footer_PopularLinks_feature_flag: boolean;
  pride_job_well_done_flag: boolean;
  homepage_ottogusto_way_flag: boolean;
  MyGarage_page_feature_flag: boolean;
  compatible_car_section_flag: boolean;
  payment_method_feature_flag: boolean;
  checkout_email_capture_feature_flag: boolean;
  Notcompatibilepop_up_feature_flag: boolean;
  selected_car_componentPDP_feature_flag: boolean;
  confirm_car_popup_feature_flag: boolean;
  manufacturer_hamburger_nav: boolean;
  home_previous_search_feature_flag: boolean;
  end_to_end_vin_flow_feature_flag: boolean;
  top_car_brands_category_feature_flag: boolean;
  gcr_opt_in_feature_flag: boolean;
  /** When false: pre–VIN-check Support-only PDP/checkout UIs. When true: current VinCheck API UIs. Orthogonal to end_to_end_vin_flow. */
  checkout_vin_api_flow_feature_flag: boolean;
}

/** All known flag keys (for tooling / FlagsShowcase). */
export const FEATURE_FLAG_KEYS: readonly (keyof FeatureFlags)[] = [
  "header_countrylanguage_flag",
  "new_mme_feature_flag",
  "mme_feature_flag",
  "brands_filter_feature_flag",
  "show_left_nav_flag",
  "vin_feature_flag",
  "engine_trim_feature_flag",
  "fbt_feature_flag",
  "mobile_bottom_nav_enabled",
  "saved_car_feature_flag",
  "view_all_brands_page_flag",
  "featured_makes_feature_flag",
  "delivery_method_flag",
  "social_pages_feature_flag",
  "testimonials_feature_flag",
  "footer_PopularLinks_feature_flag",
  "pride_job_well_done_flag",
  "homepage_ottogusto_way_flag",
  "MyGarage_page_feature_flag",
  "compatible_car_section_flag",
  "payment_method_feature_flag",
  "checkout_email_capture_feature_flag",
  "Notcompatibilepop_up_feature_flag",
  "selected_car_componentPDP_feature_flag",
  "confirm_car_popup_feature_flag",
  "manufacturer_hamburger_nav",
  "home_previous_search_feature_flag",
  "end_to_end_vin_flow_feature_flag",
  "top_car_brands_category_feature_flag",
  "gcr_opt_in_feature_flag",
  "checkout_vin_api_flow_feature_flag",
];
