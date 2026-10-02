// config/routes.ts
import {
  getCategoryRouteSegmentForLang,
  getManufacturersRouteSegmentForLang,
  getPartsRouteSegmentForLang,
} from "@/config/url-segments";

export const Routes = {
  aboutUs: (lang: string) => `/${lang}/about-us/`,
  pitStop: (lang: string) => `/${lang}/`,
  profile: (lang: string) => `/${lang}/profile/`,
  profileInfo: (lang: string) => `/${lang}/profile/info/`,
  profileOrders: (lang: string) => `/${lang}/profile/orders-returns`,
  ogSearch: (lang: string) => `/${lang}/og-search/`,

  // Needs to be upgraded like below for tab routes also
  // ogSearch: (lang: string) => `/${lang}/og-search/by-car`,
  // ogSearchByPartNo: (lang: string) => `/${lang}/og-search/by-car`,
  // ogSearchByCategory: (lang: string) => `/${lang}/og-search/by-category`,
  garageBay: (lang: string) => `/${lang}/garage-bay/`,
  driveAssist: (lang: string) => `/${lang}/support/`,
  mySavedCars: (lang: string) => `/${lang}/garage-bay/my-saved-cars/`,
  orderReturns: (lang: string) => `/${lang}/profile/orders-returns/`,
  orderDetails: (lang: string) => `/${lang}/profile/order-details/`,
  returns: (lang: string) => `/${lang}/returns/`,
  savedAddress: (lang: string) => `/${lang}/profile/saved-addresses/`,
  shoppingCart: (lang: string) => `/${lang}/shoppingcart/`,
  products: (lang: string) => `/${lang}/products/`,
  manufacturers: (lang: string) => {
    const segment = getManufacturersRouteSegmentForLang(lang);
    return `/${lang}/${segment}/`;
  },
  carPartBrand: (lang: string, brandSlug: string) => {
    const segment = getManufacturersRouteSegmentForLang(lang);
    return `/${lang}/${segment}/${brandSlug}`;
  },
  carPartBrandL3: (lang: string, brandSlug: string, l3Slug: string) => {
    const segment = getManufacturersRouteSegmentForLang(lang);
    return `/${lang}/${segment}/${brandSlug}/${l3Slug}`;
  },
  // Backward compatibility for existing call sites; use `manufacturers` moving forward.
  maufacturers: (lang: string) => {
    const segment = getManufacturersRouteSegmentForLang(lang);
    return `/${lang}/${segment}/`;
  },
  parts: (lang: string) => {
    const segment = getPartsRouteSegmentForLang(lang);
    return `/${lang}/${segment}/`;
  },
  // part_url: (lang: string)
  paymentStatus: (lang: string) => `/${lang}/payment-status/`,
  support: (lang: string) => `/${lang}/support/`,
  supportReturn: (lang: string) => `/${lang}/support/return`,
  checkout: (lang: string) => `/${lang}/shoppingcart/checkout/`,
  checkoutOptions: (lang: string) => `/${lang}/checkout-options/`,
  allbrands: (lang: string) => `/${lang}/allbrands/`,
  brandpage: (lang: string, slugWithID: string) => `/${lang}/${slugWithID}`,
  returnPolicy: (lang: string) => `/${lang}/return-policy/`,
  vinnumbersearch: (lang: string) => `/${lang}/search/vin-number/`,
  fitmentDetails: (lang: string) => `/${lang}/fitment-details`,
  manualsearch: (lang: string) => `/${lang}/search/manually/`,
  search: (lang: string) => `/${lang}/search/`,
  categoriessearch: (lang: string) => `/${lang}/search/categories/`,
  searchresults: (lang: string) => `/${lang}/search-results/`,
  viewCategory: (lang: string) => `/${lang}/search-results?`,
  viewMMECategory: (lang: string, mmeSlug: string) => `/${lang}/${mmeSlug}?`,
  categorySelection: (lang: string) => {
    const segment = getPartsRouteSegmentForLang(lang);
    return `/${lang}/${segment}/`;
  },
  categoryL1: (lang: string, l1Slug: string) => {
    const partsSeg = getPartsRouteSegmentForLang(lang);
    const catSeg = getCategoryRouteSegmentForLang(lang);
    return `/${lang}/${partsSeg}/${catSeg}/${l1Slug}`;
  },
  categoryL2: (lang: string, l1Slug: string, l2Slug: string) => {
    const partsSeg = getPartsRouteSegmentForLang(lang);
    const catSeg = getCategoryRouteSegmentForLang(lang);
    return `/${lang}/${partsSeg}/${catSeg}/${l1Slug}/${l2Slug}`;
  },
  categoryL3: (lang: string, l1Slug: string, l2Slug: string, l3Slug: string) => {
    const partsSeg = getPartsRouteSegmentForLang(lang);
    const catSeg = getCategoryRouteSegmentForLang(lang);
    return `/${lang}/${partsSeg}/${catSeg}/${l1Slug}/${l2Slug}/${l3Slug}`;
  },
};
