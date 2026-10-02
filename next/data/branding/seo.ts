interface SEO_LABELS_Interface {
  [key: string]: string;
}

const siteName = process.env.NEXT_PUBLIC_STORE
  ? process.env.NEXT_PUBLIC_STORE.charAt(0).toUpperCase() + process.env.NEXT_PUBLIC_STORE.slice(1)
  : "Ottogusto";
const siteNameLower = (process.env.NEXT_PUBLIC_STORE || "ottogusto").toLowerCase();

export const SEO_LABELS: SEO_LABELS_Interface = {
  // Landing page
  seo_home_title: `Find & Order Genuine Spare Parts Online | ${siteName}`,
  seo_home_desc:
    "Find and order genuine spare parts for your appliances, electronics, and more. Fast shipping, easy returns, and expert support.",
  seo_home_keyword:
    "spare parts, appliance parts, genuine parts, order parts online, replacement parts",

  // About us page
  seo_about_us_title: `About Us - ${siteName} | Your Trusted Automotive Parts Partner`,
  seo_about_us_desc: `Learn about ${siteName}'s mission to provide quality automotive spare parts. Discover our story, values, and commitment to excellence in the automotive industry.`,
  seo_about_us_keyword: `about ${siteNameLower}, automotive parts company, spare parts supplier, car parts, automotive industry, quality parts, trusted supplier, automotive excellence`,

  // Return policy page
  seo_return_policy_title: `Return Policy | ${siteName}`,
  seo_return_policy_desc: `${siteName} return policy explained. Discover how to return items, refund conditions, timelines, and important eligibility details.`,
  seo_return_policy_keyword: `return policy, refunds, ${siteNameLower}`,

  // Fitment details page
  seo_fitment_details_title: `Fitment Details | ${siteName}`,
  seo_fitment_details_desc: `Check fitment details for your parts at ${siteName}. Ensure your spare parts fit your vehicle perfectly.`,
  seo_fitment_details_keyword: `fitment details, vehicle compatibility, car parts fitment, ${siteNameLower}`,
  // Migration FAQ page
  seo_migration_faq_title: `Migration FAQ | ${siteName}`,
  seo_migration_faq_desc: `Find answers to frequently asked questions about our migration process at ${siteName}. Get insights on account transitions, data handling, and more.`,
  seo_migration_faq_keyword: `migration FAQ, account transition, ${siteNameLower}`,

  // All brands page
  "seo.all_brands.title": "Ottogusto | OEM & Premium Car Parts by Make",
  "seo.all_brands.description":
    "Select your vehicle's brand to browse our complete catalog. Ottogusto offers OEM and premium auto parts for all major makes with fast, secure shipping.",
  "seo.all_brands.keywords": `OEM car parts, premium auto parts, car parts by make, all brands, catalog, ${siteNameLower}`,

  // Car part brands list
  "seo.car_part_brands.title": `Car Part Brands |  ${siteName}`,
  "seo.car_part_brands.description": `Browse our full range of trusted OEM and premium car part brands. Select a brand to explore the parts it offers for your vehicle, with fast and secure delivery.`,
  "seo.car_part_brands.keyword": `OEM car parts, premium auto parts, car parts by make, all brands, catalog, ${siteNameLower}`,

  // Car part brand landing page
  "seo.car_part_brands_brand.title": `[brand]`,
  "seo.car_part_brands_brand.description": `[sdesc]`,
  "seo.car_part_brands_brand.keyword": `[brand], [categories]`,

  // Car part brand × L3 (OD-2433)
  "seo.car_part_brands_brand_category.title": `[brand] [category] |  ${siteName}`,
  "seo.car_part_brands_brand_category.description": `$BRAND_DESCRIPTION$ $L3_DESCRIPTION$ Genuine OE parts for Alfa Romeo, Fiat, Lancia, Abarth and Jeep, available at ${siteName}.`,
  "seo.car_part_brands_brand_category.keyword": `OEM car parts, premium auto parts, car parts by make, all brands, catalog, ${siteNameLower}`,

  // Car parts landing page
  "seo.car_parts.title": `Car Parts Online for All Makes & Models such as Alfa Romeo, Fiat, Lancia, Abarth, Jeep | ${siteName}`,
  "seo.car_parts.description": `Buy car parts online at ${siteName} | Genuine OE parts for all makes and models such as Alfa Romeo, Fiat, Lancia, Abarth, Jeep. 1 million parts in stock, fast EU delivery and easy returns.`,
  // Shopping cart Page
  seo_shopping_cart_title: `Shopping Cart | ${siteName}`,

  // Checkout page
  seo_checkout_title: `Checkout | ${siteName}`,
};
