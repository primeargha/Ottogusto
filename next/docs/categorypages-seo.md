// --- REFER CODE UNDERSTANDING ------

1. **Landing `BrowseByCategory2` (L1/L2/L3 hierarchy & CDN images)**
   - **Hierarchy & state**
     - L1/L2/L3 use `PartsCategoryInterface` from `useCategories()` (nested list from BE) and are rendered via:
       - `BrowseByCategory2` (orchestrator)
       - `CategoryL1Card` (L1 tiles)
       - `CategoryL2Tab` (L2 horizontal tabs + inline L3 grid)
       - `CategoryL2Modal` (overlay with L3 grid + “view all” for the selected L2)
       - `CategoryL3Card` (L3 items)
     - `BrowseByCategory2` keeps:
       - `SelectedL1` = current active L1 category.
       - `SelectedL2` = current active L2 category (drives L2 modal).
     - Initial selection: when `CategoryNestedList` is loaded, `SelectedL1` is set to the **first L1 item**.
     - **L1 click** (`handleL1Click`) updates `SelectedL1` and triggers `scheduleScrollToTabs`, which:
       - Measures the L2 tab section (`categoryL2TabRef`) and
       - Smooth-scrolls the page to that y-position using `requestAnimationFrame` with an `easeInOutCubic` easing function.
     - **L2 tabs**:
       - `CategoryL2Tab` takes `items` + `selectCategory` and:
         - Renders horizontally scrollable L2 tabs (using `scrollContainerRef` + `selectedTabRef` and a 600ms smooth scroll to keep the active tab in view).
         - Beneath the tabs, it renders a grid of L3 `CategoryL3Card` for `selectCategory.children`.
       - Clicking an L3 item calls `onL2Click(l3Cat)` from `BrowseByCategory2`, which:
         - Sets `SelectedL2` and opens `CategoryL2Modal` with deeper L3 navigation.
     - **L2 modal** (`CategoryL2Modal`):
       - Shows a header with the L2 name and a grid of all L3 children (each is a `CategoryL3Card` wrapped in a `Link`).
       - Clicking L3:
         - Appends the L3 category into `useCategorySearchStore` history.
         - Optionally clears `useMmeStore.searchData` when on category‑catalog page without `makeModelTypeId` (see below).
         - Navigates using `createRoute(l3Cat)`.
       - Footer “View all” button navigates using `createRoute(selectedL2Cat)` and also appends to selected categories.

   - **Active state behavior (what “active L1 tab” really means)**
     - UI design clearly supports an “active” L1 state (`CategoryL1Card.isActive` toggles a `border-2 border-color-border-focus` style).
     - In the current code, `BrowseByCategory2` passes `isActive={false}` to each `CategoryL1Card`, with the real selection stored only in `SelectedL1`:
       - The original intent (commented code) was `isActive={SelectedL1?.id === category.id}`.
       - That means the **logical** active state is still `SelectedL1`, and the scroll behavior already assumes that when you click L1, that L1 becomes “focused” and the page scrolls to its L2/L3 section.
     - **For future work in section 5**: to visually highlight the active L1 category when clicked, we should wire back `isActive={SelectedL1?.id === category.id}` in `CategoryL1Card`, while keeping the current scroll + selection behavior intact. This gives a clear UX signal without changing navigation logic.

   - **Routing & SEO‑friendly URLs for category navigation**
     - `BrowseByCategory2` builds catalog URLs via `createRoute(cat: PartsCategoryInterface)`:
       - On **category catalog page** (`detectPage(pathname) === "category-catalog"`):
         - Always uses `makeModelTypeId` from the **URL query**, not from the store (prevents mismatches).
         - Derives a **stable slug** (`catalogSlugFromUrl`) from the current car (via `getCarDataFromMMYTId` and `buildSearchdataSlugFromCarData(brandName, modelName, typeName)`).
         - If slug and `params["language-country"]` exist:
           - Uses `Routes.viewMMECategory(language-country, slug)` as the base path.
       - On **non‑catalog pages**:
         - Resolves MME id (`mmeId`) from several sources in priority:
           1. `makeModelTypeId` from the URL query.
           2. `searchData.makeModelTypeId` (MME store).
           3. `selectedSavedCarInLandingPage.makeModelTypeId`.
           4. Fallback `getMMEId(searchData)`.
         - If an MME slug can be created from `searchData`/saved car (brand, model, optional type), it uses:
           - `Routes.viewMMECategory(language-country, mmeSlug)` as the base.
       - If an MME id is present but no slug can be safely computed, it falls back to the generic category route:
         - `getRouteLocaleString(Routes.viewCategory, params)`.
       - Final query string:
         - `?makeModelTypeId=<mmeId>&categoryIds=<cat.id>&take=12&order=priority`.
       - If no MME id at all:
         - Uses the locale route and only category filters:
         - `.../category?categoryIds=<cat.id>&take=12&order=priority`.
     - **Search data clearing**:
       - On category catalog pages, **if no MME in the URL**, clicking a category will:
         - Call `useMmeStore.getState().setSearchData({ make: null, model: null, engine: null })` before redirect.
         - This ensures the catalog is not “poisoned” by stale search MME when no explicit car context is present.

   - **CDN image usage (performance + consistency)**
     - **L1 images** (`CategoryL1Card`):
       - Uses `NEXT_PUBLIC_CDN_BASE_URL` to construct category image URLs:
         - `cat_<id>.png?height=140&quality=80`.
       - Example: `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/ottogusto/cat_${data.id}.png?height=140&quality=80`.
       - Marked as `priority` and `unoptimized`:
         - `priority` because they’re key hero/hub content on the landing section.
         - `unoptimized` because images are already on a tuned CDN; avoids Next.js image processing overhead.
       - Adds UX/performance details:
         - `mix-blend-darken` to keep visual consistency on light backgrounds.
         - Semantic `alt` from `getTitleOfCategory(data, getLocale())`.
     - **L3 images** (`CategoryL3Card`):
       - Also built from `NEXT_PUBLIC_CDN_BASE_URL`:
         - `cat_<id>.png?width=64&quality=80`.
       - Allows `imgSrcOveride` to override the CDN URL when needed.
       - Uses `unoptimized` again for the same CDN reason and has localized `alt`.
     - **SEO & Lighthouse impact**
       - Using a dedicated CDN base, fixed dimensions, and query params for `height/width/quality` keeps layout stable (prevents CLS) and reduces transfer size.
       - Not going through Next.js image optimizer reduces server work and keeps TTFB lean, important for Lighthouse performance on the landing page.

2. **`OGFeatureMakes` component (UI & behavior to reuse as‑is)**
   - **Purpose & data flow**
     - Renders a “Featured makes / Our brands” section as a responsive grid of brand cards.
     - Uses:
       - `useSavedCarsStore` to pull the user’s saved cars (client state).
       - `useBrands()` context to fetch and cache brand list once for the app (no duplicate API calls).
       - `getImageUrl(brand.image)` to convert raw brand image info into CDN URLs.
     - Workflow:
       1. `useBrands()` returns `brandsData` with `id`, `brand`, `sortIdx`, `image`.
       2. `useEffect` maps this into a local `brands` array with `{ id, brand, sortIdx, icon: getImageUrl(image) }`.
       3. `mergeBrands`:
          - Builds a set of saved car IDs.
          - **Filters out brands already represented by saved cars**.
          - Creates `OGCardProps` for:
            - Saved cars (using their pictures first, falling back to brand icon).
            - Remaining brands (brand name + icon).
          - Merges into `mergedData` with saved cars first, then remaining brands.
       4. The grid shows up to `limit` items (default 8), with optional “show more / show less” toggle when `showAll` is true.

   - **UI & interaction**
     - Wrapper uses `OGLayoutXL` and `Typography` for consistent OG layout & styling.
     - Desktop adds dividing borders above and below; mobile omits to avoid clutter.
     - The actual brand cards are rendered via `OGCardGrid`:
       - Applies `grid-gap-listing` and responsive columns:
         - 2 columns on small, up to 4 on large (`grid-cols-2 md:grid-cols-2 lg:grid-cols-4`).
       - For each item, it injects `href` dynamically using current route params:
         - `getRouteLocaleString(Routes.categorySelection, params)` as base.
         - Query: `?makeModelTypeId=<item.id>&from=brand`.
       - Uses `OGCard` for each tile:
         - A `Link` with `prefetch`, title/about metadata, and a right arrow icon.
         - Focus/hover states optimized for accessibility and Lighthouse (border + background changes, no extra JS).
     - “View all brands” button is currently disabled (`false && ...`), but the structure exists to navigate to `Routes.allbrands`.

   - **What to copy for new tasks**
     - Keep the **grid structure**, **typography**, and **card interaction model** exactly the same (that’s the requirement).
     - When using this in another section:
       - Respect the `limit`, `showAll`, and responsive grid behavior to keep layout & performance predictable.
       - Navigation should still go through `Routes.categorySelection` with `makeModelTypeId` to keep catalog deep‑links consistent and SEO‑friendly.

3. **`SearchContainer` on category catalog page (`/en-BE/car-parts?makeModelTypeId=...`)**
   - **High‑level role**
     - Acts as a smart shell that decides which search UI view to show:
       - **View 1**: base search input (`BaseSearchComponent`) – for selecting a car or searching generally.
       - **View 2**: saved car dropdown (`SavedCarDropdownComponent`) – for quickly switching between saved vehicles.
     - Behavior is heavily driven by:
       - URL query `makeModelTypeId`.
       - `SavedCarsContext` (has saved cars or not).
       - Authentication state.
       - `useSearchContainerStore` flags (`currentView`, `userExplicitlyChoseView1`).

   - **View selection logic & URL coupling**
     - Computes `currentPageType` with `detectPage(pathname)` and exposes:
       - `isCategoryCatalogPage = currentPageType === "category-catalog"`.
     - Checks saved cars:
       - `hasSavedCars = isAuthenticated && savedCars.length > 0`.
     - Derives `urlMakeModelTypeIdMatchesSavedCar`:
       - If there is a `makeModelTypeId` in the URL and saved cars exist, it ensures that ID is present in saved car list.
       - If not present, it **forces View 1** (no misleading saved‑car dropdown for a non‑saved car).
     - Auto-switch behavior:
       - On initial mount or after login, if:
         - `hasSavedCars` is true, and
         - URL MME either matches a saved car or is empty, and
         - `currentView === "view1"`, and
         - user has **not** explicitly chosen view1,
         - then `switchToView2()` is called and `hasInitialized` is set, so it happens once per route/auth change.
     - Final `activeView` selection:
       - If URL has a `makeModelTypeId` that does **not** match any saved car ⇒ `activeView = "view1"`.
       - Otherwise:
         - `activeView = hasSavedCars ? currentView : "view1"`.

   - **Styling & SEO/performance impact**
     - Border/background classes depend on:
       - `isCategoryCatalogPage`.
       - `isIncompatible` flag (red styling for incompatible MME + product).
       - Whether the MME in URL matches the search store (`getMMEId(searchData)`).
     - On **category catalog pages**:
       - Styling is always “positive” (green) state:
         - `border-color-border-positive` and `bg-color-background-positive-muted`.
       - This prevents noisy red errors on catalog pages and keeps UX stable for search bots and users.
     - Because all navigation happens client‑side and mostly via context/URL flags (no extra data fetching inside the component itself), the impact on Lighthouse is mainly visual, not network‑bound.
     - The code avoids re-running initialization on every render by using `useRef` flags and carefully scoped `useEffect` dependencies.

   - **How it is used on `/car-parts` category catalog**
     - When the user lands on `/en-BE/car-parts?makeModelTypeId=00a00000000000000`:
       - `detectPage` identifies a category‑catalog route.
       - `SearchContainer`:
         - Reads `makeModelTypeId` from the URL.
         - Chooses the correct view (saved car dropdown vs base search) based on whether that MME is a saved car.
         - Sets positive styling for the whole search strip to reflect a valid, compatible car context.
     - This ensures:
       - **SEO**: URLs are stable and carry the full context (`makeModelTypeId`), which is also used by other components like `BrowseByCategory2`.
       - **Performance**: No unnecessary API calls in the container; it defers to context stores and keeps UI pure.

4. **Product details page – server data, SEO, CDN images, `params` usage**
   - **Route & params**
     - File: `app/(public)/[language-country]/car-parts/[partname]/[partid]/page.tsx`.
     - Next.js dynamic segments (see Next docs: `dynamic-routes` at `https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes`):
       - `params["language-country"]` (e.g. `en-BE`, `nl-BE`).
       - `params.partid` (actual product id from API).
       - `params.partname` is present in the URL for SEO readability but isn’t used for fetching; we rely on `partid`.
     - Component type:
       - Default export is an **async Server Component** using `Suspense` for child sections.

   - **Server‑side data fetching & caching**
     - Uses the shared **server‑side API client** from `config/newApiClient.ts`:
       - `createApiClient({ isServer: true })` is the central entry point for all server calls.
       - Actual REST requests and URL building live in `services/*` modules (e.g. products, categories, car data).
       - This keeps server logic typed and centralized, and separates concerns between route handlers/pages and low‑level HTTP wiring.
     - In this route we combine that client with `cache` from React for both:
       - `fetchProduct(partid)`:
         - Calls `/parts/<partid>` API.
         - Returns `res.data` or `null` on error.
       - `fetchMatchingCars(partid)`:
         - Calls `/MakeModelType/part/<partid>`.
         - Normalizes result into `{ data: res.data }` if raw array.
     - In the page component:
       - `Promise.all([fetchProduct(partid), fetchMatchingCars(partid)])` is used for parallel fetching to reduce TTFB.
       - If product is `null`, the page falls back to `<NotFound />` (404‑like UX).

   - **SEO metadata (`generateMetadata`)**
     - `generateMetadata({ params })`:
       - Derives `lang` from `language-country.split("-")[0]`.
       - Fetches product via `fetchProduct(partid)` **on the server** (shared cache with the main page).
       - If product is missing:
         - Returns a generic, safe metadata object with default title/description/keywords.
       - Builds **description**:
         - Priority order: `product.seo.description` → `product.fullDescription` → `product.description` → generic “Find <title>...” sentence.
         - Strips HTML using `STRIP_HTML_REGEX` to avoid HTML leaking into `<meta>` tags.
       - Builds **keywords**:
         - Combines product title, name, brand, category, partNumber, model + default keywords.
         - Filters falsy values and joins them with commas.
       - **Title**:
         - `product.seo.title` → `product.title` → `product.name` → `"Product Detail"`.
       - **Open Graph**:
         - `openGraph.images[0].url` uses:
           - `product.images[0].url` if available, else a fallback SVG logo from `NEXT_PUBLIC_FRONTEND_PROD_URL`.
         - Sets alt text from image label or product name/title.
         - URL built as:
           - `${FRONTEND_PROD_URL}/${languagecountry}/car-parts/${seoNameOrNameOrPart}/${partid}`.
         - `locale` is `en_US` for English, `${lang}_${lang.toUpperCase()}` for others.
       - **Twitter card**:
         - `summary_large_image` using the same image URL and title/description.
       - **Robots**:
         - Controlled by `NEXT_ALLOW_ROBOTS`:
           - If `true`: `index`/`follow` allowed; Googlebot extras with max previews and snippets.
           - If `false`: noindex/nofollow.
     - This pattern aligns with Next’s metadata API and uses `params` just like described in the official docs.

   - **JSON‑LD product schema**
     - `generateProductSchema(product, partid, languagecountry)`:
       - If `product.seo.schema` exists:
         - Attempts to `JSON.parse` it.
         - On parsing error logs and returns `false` (so we don’t output a broken `<script>`).
       - If no schema present, there is a fallback block (currently short‑circuited by the early return when schema exists/not) that constructs a full schema.org `Product` object:
         - Uses `baseUrl` from `NEXT_PUBLIC_FRONTEND_PROD_URL` or defaults to Ottogusto domain.
         - `@id` and `url` are the product detail URL with `languagecountry`, `seo.name`/`name`, and `partid`.
         - `description` -> sanitized from full/short description with HTML stripped.
         - Uses product price, availability, manufacturer, brand, etc. for `offers` and `manufacturer`.
       - In the page JSX:
         - `const productSchema = generateProductSchema(product, partid, languagecountry);`
         - If `productSchema` is truthy:
           - Renders `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />`.
         - Previously it also checked `hasImages`, but now the JSON‑LD is rendered as long as a valid schema is present.
       - This ensures:
         - **Rich results** eligibility (Product rich snippets).
         - No extra client bundle cost (plain `<script>` in HTML output).

   - **Product content & CDN images**
     - The actual product layout is handled by `Products` (from `screens/productdetails/productdetails.tsx`):
       - This component:
         - Runs client‑side hooks to:
           - Track GTM view event via `trackViewItem` + `convertProductToGTMItem`.
           - Add product to `useRecentlyViewedProductStore` with SEO metadata included when not in cart.
         - Renders descriptive text with `Typography` and `Box`.
         - Uses `Productcardesc` for image and core product details (inside which actual product image loading from CDN occurs).
           - Images are accessed from `product.images` array; URLs themselves are coming from backend and are typically CDN URLs.
       - For recently viewed:
         - `Productfrequentlybought` is rendered when `recentlyViewedProduct.length > 0` and provides a horizontally scrollable or 4‑column grid of cards via `OGRecentCard`.
     - From a performance perspective:
       - Product details page defers heavy UI parts (car compatibility, etc.) via `dynamic(..., { ssr: false })` and `Suspense`:
         - `ProductMatchingCarsLazy` is lazy‑loaded client side.
         - `SearchContainerWrapper` is wrapped in `Suspense` with `fallback={null}`.
       - This makes the **initial HTML** relatively light but still SEO‑rich (metadata + JSON‑LD + main content on server).

   - **Where client‑side data fetching lives**
     - **Client components** do **not** call backend APIs directly from pages; instead:
       - They use typed hooks under `hooks/*` (React Query) for all client‑side data fetching.
       - These hooks wrap the underlying `services/*` functions so both server and client reuse the same TypeScript‑typed domain layer.
     - This pattern (server via `config/newApiClient.ts` + `services/*`, client via `hooks/*` + React Query) ensures:
       - Consistent TypeScript types end‑to‑end.
       - A single source of truth for API URLs and response shapes.
       - Predictable caching and revalidation on the client without polluting SEO‑critical server routes.

5. **Recently viewed products – `Productfrequentlybought`**
   - **Purpose & data source**
     - Not actually “frequently bought together”, but **recently viewed** products driven by:
       - `useRecentlyViewedProductStore` in `Products` (productdetails).
       - It filters out the current product, then passes the remainder as `products` prop.
     - Component is a **pure client UI** that:
       - Takes `CartItem[]` (including SEO info) and renders cards via `OGRecentCard`.

   - **UI behavior**
     - Heading:
       - Uses `getLabel("recently_viewed")` and `getLabel("recently_viewed_subtitle")` for localized title and subtitle.
     - Mobile/tablet (base/gtsm):
       - Shows a horizontal scrollable strip with snap behavior:
         - `snap-x snap-mandatory`, hidden scrollbar, `snap-start` for each card.
         - Each card is a bordered, rounded container to host `OGRecentCard`.
     - Desktop (`gtlg`):
       - Renders up to 4 static cards in a 4‑column grid.
     - No extra data fetching; it entirely depends on the pre‑populated store.

   - **SEO & performance considerations**
     - Because data is sourced from an in‑memory store and rendered client side, it does not change server HTML significantly.
     - It is guarded by a length check, so it only appears when there are previous views, avoiding empty or duplicate content that could dilute relevance for crawlers.

6. **`OGLanguageSelectionModel` (locale handling & redirects)**
   - **High‑level behavior**
     - Client‑side modal that appears when `ShowLanguageSelector` is true in `useLandingPageDataStore`.
     - Reads/writes `localStorage.locale` and keeps it in sync with:
       - Path locale (`/en-BE/...`).
       - IP‑based preferred locale from `https://ipapi.co/json/`.
     - Allows user to select:
       - Country (from `CONFIG.countries`).
       - Language (from `CONFIG.languages`).

   - **Redirect logic & SEO impact**
     - After saving (`handleSaveCountryLang`):
       - `changeLocale(language)` and `localStorage.setItem("locale", "lang-COUNTRY")`.
       - Calls `closeLanguageSelector` with the new locale.
       - Builds the new URL:
         - Strips old locale prefix from the path (via `getLocaleRemovedPath`).
         - For paths that are **only** locale (e.g. `/en` or `/en?x=y`):
           - Does **not** append the old path behind the new locale (avoids `/en-nl/en`).
         - Otherwise preprends `/${localeString}` to the remaining path/query.
       - Appends the new path to `useRouteStore.navigationHistory`.
       - Clears MME cache via `clearMmeApiCache` to force fresh search data.
       - Navigates with `router.navigate(newPath)` (client‑side navigation).
     - This centralizes locale behavior so all SEO‑significant routes can keep their `language-country` prefix in sync with the user’s actual choice.
     - The modal also controls logo variant (OttoGusto vs Qverde) based on domain/store ID, which matters for brand consistency but not directly for Lighthouse.

7. **Sitemaps and robots.txt (SEO infrastructure)**
   - **`app/sitemap.xml/route.ts`**
     - Implements a **sitemap index** that aggregates:
       - A static pages sitemap at:
         - `${NEXT_PUBLIC_FRONTEND_PROD_URL}/sitemap-pages.xml`.
       - A series of **CDN‑hosted language sitemaps**:
         - Uses `getStoreFromDomain` and `STORE_IDS` to detect store (`ottogusto`, `qverde`, etc.).
         - Constructs `cdn = https://static.<STORE_NAME>.com`.
         - Adds:
           - `sitemap-nl-BE.xml`, `sitemap-fr-BE.xml`, `sitemap-en-BE.xml`.
           - `sitemap-nl-NL.xml`, `sitemap-en-NL.xml`, `sitemap-fr-FR.xml`.
           - (Some extra product index entries are commented out until provided by CDN).
       - Output is `<sitemapindex>` with `<sitemap><loc>...` and `<lastmod>` set to current ISO timestamp.
     - Response headers:
       - `Content-Type: application/xml; charset=UTF-8`.
       - `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
     - For Next.js, this is a **Route Handler** under `sitemap.xml/route.ts` (not the new `generateSitemaps` helper from `https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps`), but the effect is equivalent:
       - We expose one sitemap index at `/sitemap.xml` which search engines use as entry point.

   - **`app/robots.txt/route.ts`**
     - Builds robots content as plain text:
       - `User-agent: *`.
       - Adds `Sitemap: <base>/sitemap.xml`:
         - Uses `NEXT_PUBLIC_FRONTEND_PROD_URL` in production.
         - Uses `NEXT_PUBLIC_FRONTEND_DEV_URL` in non‑prod.
       - For each combination of `LANG_COUNTRY_COMBINATIONS` and `ROBOTS_DISALLOW`:
         - Adds `Disallow: /<locale><url>`.
       - If `NEXT_ALLOW_ROBOTS` is **not** `"true"`:
         - Adds `Disallow: /` to block all crawling in non‑prod.
     - Returns `NextResponse` with `Content-Type: text/plain`.
     - This ensures:
       - Clear environment‑aware crawling rules.
       - Search engines always know where to find `/sitemap.xml`.

// ----- FIXES NOW IN L1 CATEGORY PAGE (CONTEXT FOR L2 AND L3) ------
// Below we document the fixes applied to the L1 category page so they act as context when building similar SEO for L2 and L3.

1. **Search component redirect fix for L1 category page**
   - **Page detection**: `detectPage(pathname)` in `utils/detectPage.ts` returns `"category-l1"` when the path matches `/{locale}/{parts-segment}/category/{l1-slug}` (e.g. `/en-BE/car-parts/category/engine`). The parts segment is one of `car-parts`, `auto-onderdelen`, `pieces-auto`.
   - **Unified “category page” flag**: In `SearchContainer.tsx` and `MMEBaseSearch.tsx`, L1 is treated like the category catalog for search UI: `isCategoryCatalogPage = currentPageType === "category-catalog" || currentPageType === "category-l1"`. So the same search strip (base search vs saved-car dropdown), styling (positive/green when on catalog), and URL behaviour apply on L1.
   - **Redirect on Enter/Select (no leave L1)**:
     - **Category catalog** (`/en-BE/car-parts`): On save/select car, redirect goes to `Routes.categorySelection` + `?makeModelTypeId=...` (catalog root).
     - **L1 category page** (`/en-BE/car-parts/category/engine`): Redirect must **stay on the same L1 page** and only add or update `makeModelTypeId` in the URL. So we do **not** redirect to catalog root; we keep `pathname` and only change the query.
   - **Implementation**: In `MMEBaseSearch.tsx`, “category page” handling (partial and complete MME) uses `pathname` + `searchParams` to build the new URL and `router.push(newUrl)`. Because `pathname` on L1 is already `/en-BE/car-parts/category/engine`, updating only the query keeps the user on the L1 page. The same logic applies when the user saves a car (onSuccess): for `isCategoryCatalogPage` we must distinguish “catalog root” vs “L1 page”—when on L1 we should push `pathname + ?makeModelTypeId=...` instead of `Routes.categorySelection + ?makeModelTypeId=...`. So in code:
     - **On L1**: use current `pathname` and set/update `makeModelTypeId` in query (same as product-details page pattern).
     - **On catalog root only**: use `getRouteLocaleString(Routes.categorySelection, params)` and push there with `makeModelTypeId`.
   - **Reference**: `MMEBaseSearch.tsx` (e.g. `isCategoryCatalogPage`, partial/complete MME blocks that do `currentParams.set("makeModelTypeId", ...); router.push(\`${pathname}?${currentParams}\`)`), and `detectPage.ts`for`category-l1`.

2. **Breadcrumb: passing links and persisting makeModelTypeId on “Car parts”**
   - **Component**: Reusable `OGBreadcrumb` in `components/og-components/OGBreadcrumb.tsx`. It accepts `links: BreadcrumbLink[]` (each `{ label, href }`) and `active: string` (the current page label, no link). It renders a `<nav>` with `Link`s and outputs JSON-LD `BreadcrumbList` schema using `NEXT_PUBLIC_FRONTEND_PROD_URL` as base for `item` URLs.
   - **L1 usage**: In `CategoryL1ClientShell.tsx`, breadcrumb is built as:
     - `links`: `[ { label: "Home", href: \`/${languageCountry}\` }, { label: partsLabel, href: partsHref or partsHref + ?makeModelTypeId } ]`.
     - `active`: `l1Title` (the L1 category title).

- **Car parts link and makeModelTypeId**: The second link is the “Car parts” (or “Pièces Auto” / “Auto Onderdelen”) entry. Its `href` must **persist makeModelTypeId** when the user has selected a car: `href: makeModelTypeId ? \`${partsHref}?makeModelTypeId=${makeModelTypeId}\` : partsHref`. So from an L1 page with a car selected, “Car parts” in the breadcrumb goes to the category catalog with the same car context (e.g. `/en-BE/car-parts?makeModelTypeId=...`).
- **Data source**: `partsHref` comes from the server in `CategoryL1Page` via `Routes.parts(languageCountry)` (e.g. `/en-BE/car-parts/`); `makeModelTypeId` comes from `useSearchParams()?.get("makeModelTypeId")` in the client shell.
- **L2/L3**: When adding L2/L3 pages, pass the same pattern: each breadcrumb link that points to catalog or L1 (or L2) should include `makeModelTypeId` in the URL when present, so the chain stays consistent.

3. **Category header MME: update on Enter/select and keep URL and heading in sync**
   - **Heading**: In `CategoryL1ClientShell`, the main heading is `displayHeading = lastMakeModel ? \`${l1Title} for ${lastMakeModel}\` : l1Title`. So when a car is selected it shows e.g. “Engine for Volvo V60”; otherwise just “Engine”.
   - **When URL updates**: When the user clicks Enter or selects a car in the search container, `MMEBaseSearch` (and save-car mutation) updates the URL with `makeModelTypeId`. The client shell reacts to URL and store:
     - **Hydrate store from URL**: `useEffect` with `searchParams` calls `generateMmeSearchData(makeModelTypeId)` so the MME store reflects the URL on load and when the URL changes (e.g. back/forward).
     - **Sync heading from URL**: A `useEffect` watches `searchParams`; when `makeModelTypeId` changes it sets `lastMakeModel` from `searchData` (only if `getMMEId(searchData) === makeModelTypeId`), or clears it if there is no `makeModelTypeId`.
     - **Sync heading from store**: Another `useEffect` watches `searchData.make/model/engine`; when the store resolves (e.g. after `generateMmeSearchData`), it updates `lastMakeModel` so the heading matches the current URL’s car.
   - **When user selects/enters in search**: The shell passes `onEnterClick` and `onSelectCar` to `SearchContainer`. These callbacks set `lastMakeModel` from the current `searchData` so the heading updates immediately when the user commits a selection. The actual URL update is done inside `MMEBaseSearch` (query param `makeModelTypeId`). So “heading” and “URL” are linked: URL is the source of truth after navigation; heading is derived from URL + MME store and from the Enter/Select callbacks for instant feedback.
   - **Summary**: Enter/select in search → URL gets `makeModelTypeId` (in `MMEBaseSearch`) and optionally save-car API → client shell’s callbacks update heading; when URL changes (e.g. back), store is hydrated from URL and heading is updated from store. Apply the same pattern for L2/L3: one source of truth (URL), heading derived from URL + MME store, and callbacks to refresh heading on Enter/select.

4. **OGFeatureMakes on L1 (and later L2/L3): category id and redirect to products with Make slug + makeModelTypeId + category**
   - **Purpose**: On L1 (and in future L2/L3) we show “Top Car Brands” and let the user pick a make. That should go to the **products (search results) page** with: (1) the Make’s slug in the path (MME slug), (2) `makeModelTypeId` in the query, and (3) the **current category context** (L1 id now; L2 id when we add L2, etc.).
   - **Component**: `OGFeatureMakes` in `components/og-components/OGFeatureMakes/index.tsx` accepts an optional `categoryId`. When `categoryId` is set (e.g. on L1 page we pass the L1 category id), the grid’s links are built for “category + make” flow.
   - **Link building**: Handled in `OGCardGrid` and in `OGFeatureMakes.handleBrandClick`:
     - **When categoryId is present** (L1/L2/L3 page): Use `Routes.viewMMECategory(lang, brandSlug)` and append `makeModelTypeId=${item.id}&categoryIds=${categoryId}&take=12&order=priority`. So the URL is the locale + MME slug (e.g. `/en-BE/volvo`) with query `makeModelTypeId=...&categoryIds=<L1 id>&take=12&order=priority`. That lands on the products page (`screens/products/products.tsx`) with the make’s [search-data] slug, its makeModelTypeId, and the L1 category filter.
     - **When categoryId is absent** (e.g. landing/catalog): Use `Routes.categorySelection` + `?makeModelTypeId=${item.id}&from=brand` (catalog with that car selected).
   - **L1 usage**: `CategoryL1BrandsSection` receives `l1CategoryId={l1.id}` and passes `categoryId={l1CategoryId}` to `OGFeatureMakes`. So on L1 we pass the L1 category id; when we add L2 we will pass the L2 category id (and optionally L1 for breadcrumb/context), and the same redirect will include the selected Make and the L2 category.
   - **Products page**: The products page (`screens/products/products.tsx`) reads `searchdata` (slug) and filters (e.g. `makeModelTypeId`, `categoryIds`) from the URL and renders the listing. So the “Make + L1 category” (or later “Make + L2 category”) combination is fully driven by URL and works with existing product listing and SEO.

// ----- WHAT TO IMPLEMENT NEXT ------
// WILL WORK ON THIS PART LATER

- **Implement Category Pages L1/L2/L3 with Next.js SEO**
  - **Scope of this phase**: Focus only on **L1 category pages and their SEO**. L2 and L3 pages will follow the same pattern once L1 is stable.
  - **Routing (App Router, SEO‑friendly slugs)**:
    - L1 is **slug‑based** (per locale) for SEO, not id‑based.
    - Pages to implement:
      - `/[language-country]/car-parts/category/[l1]`
      - `/[language-country]/pieces-auto/category/[l1]`
      - `/[language-country]/auto-onderdelen/category/[l1]`
    - Slugs come from the `slugs` object in category API response, per locale:
      - Example:
        - `slugs.nl = "filters"`
        - `slugs.en = "filters"`
        - `slugs.fr = "filtres"`.
  - **Data sources & architecture**:
    - **Server‑side API client**: use `config/newApiClient.ts` with `createApiClient({ isServer: true })`.
    - **Domain API layer**: actual HTTP calls live under `services/*` (e.g. `CategoryService`).
    - **Client‑side data**: any client component fetching should go via React Query hooks in `hooks/*` that wrap those `services/*` functions.
    - **TypeScript**: define proper types for:
      - L1 categories.
      - L2 categories and their L3 `children`.
      - FAQ items.
  - **Category API contracts**:
    - **L1 list**: `GET /api/Category` with `parentId=root` (or equivalent) returns all L1 categories:
      - Shape (simplified):
        - `id`, `parentId`, `name`, `displayOrder`,
        - `titles: { nl, en, fr }`,
        - `descriptions: { nl, en, fr }`,
        - `slugs: { nl, en, fr }`.
    - **L2 + L3 tree** for a given L1 (`001` in example):
      - `GET /api/Category?parentId=001`.
      - Each L2 node contains:
        - `id`, `parentId`, `name`, `displayOrder`,
        - `titles`, `descriptions`, `slugs`,
        - `children: L3[]` (each L3 has its own `titles`, `slugs`, optional `faq`).
  - **Single‑load caching strategy (VERY IMPORTANT)**:
    - On first server request (per locale), we:
      1. Call L1 API (`/api/Category` for root).
      2. For each L1, call `GET /Category?parentId=<L1.id>` once. The response lists L2 nodes **each already including L3** in `children` — **do not** add extra `GET /Category?parentId=<L2.id>` calls for normal data.
      3. Build a **complete in‑memory tree** for that locale: L1 array, each with L2 children, each with L3 children (+ FAQ).
      4. Store this structure in a **server cache** (React `cache`, or a dedicated in‑process cache layer).
    - Subsequent requests:
      - Resolve L1/L2/L3 by slug from this cached tree (no extra API calls).
      - Enables:
        - Normal forward flow: L1 slug → L1 node → its L2 and L3.
        - **Reverse flow**: given an L3 (e.g. from URL, search result or 404), find its parent L2 and L1.
        - Faster **NOT FOUND** detection when no slug match exists in the tree.
    - Cache **must be locale‑aware**:
      - Each locale (`en-BE`, `fr-BE`, `nl-BE`, etc.) has its own cached category tree, keyed by locale.
  - **Locale‑correct routing & lookup (VERY VERY IMPORTANT)**:
    - For every request, infer locale from `params["language-country"]`:
      - Examples:
        - `EN`: `/en-BE/car-parts/category/{l1-en-slug}`.
        - `FR`: `/fr-BE/pieces-auto/category/{l1-fr-slug}`.
        - `NL`: `/nl-BE/auto-onderdelen/category/{l1-nl-slug}`.
    - When resolving a slug:
      - Use the locale key (`en`, `fr`, `nl`) to compare against `category.slugs[locale]`.
      - Never mix languages: an `en` slug must match `slugs.en`, `fr` slug must match `slugs.fr`, etc.
    - If no match is found for the L1 slug in the correct locale:
      - Return the **NOT FOUND** page and do not hit the network again.
  - **SEO metadata & `generateMetadata`**:
    - Use `generateMetadata` with the loaded category data as per Next docs (`https://nextjs.org/docs/app/api-reference/functions/generate-metadata`):
      - Find the matching L1 node for the locale + slug.
      - Build:
        - `title` (from localized `titles[locale]`).
        - `description` (localized `descriptions[locale]`, or fallback).
        - Keywords list from:
          - L1 title.
          - L2 and L3 titles (subset).
          - Generic category keywords.
        - Canonical URL using the **current locale + slug**.
        - `alternates.languages` with all supported `language-country` equivalents for the same logical category:
          - Mapping: same `id` but different `slugs[locale]`.
    - Optionally generate JSON‑LD Category schema if needed, otherwise rely on rich HTML + internal linking.
  - **Page layout sections (for L1 pages)**:
    - **Section 1** – Search (client):
      - Reuse the existing search container from the category catalog page:
        - Same MME base search + `SavedCarDropdownComponent` behavior.
        - When MME changes and user hits Enter/select, URL should update (`makeModelTypeId`), just like `/en-BE/car-parts?makeModelTypeId=...`.
    - **Section 2** – Breadcrumb (client, reusable):
      - New reusable breadcrumb component:
        - Accepts an array of `links` (label + href) and an `active` label (no href).
        - Must be generic enough to reuse on:
          - Category pages (L1/L2/L3).
          - Product detail, etc.
    - **Section 3** – Heading for MME data (client):
      - Same MME heading logic as the existing category catalog page.
      - No change in behavior, only plug in correct L1 category name where relevant.
    - **Section 4** – L1 image + description (server):
      - Flex row of:
        - L1 category image (CDN) using `next/image` with `sizes` set for proper image optimization.
        - Localized L1 description.
      - Layout should be mobile‑first and low‑CLS:
        - Fixed aspect ratio / known dimensions.
        - Proper `sizes` and responsive classnames.
      - For data, use L1 node from the cached category tree.
    - **Section 5** – L2 cards + L2 tabs/L3 list (client):
      - Use **L2 children of current L1** from cached tree.
      - UI logic mirrors landing `BrowseByCategory2`:
        - L2 cards (like current L1 cards) for quick access.
        - Below: L2 tabs with inline L3 grid.
        - “View all” link per L2:
          - Navigates to the search result page with `categoryIds=<L2.id>` + `makeModelTypeId` (if present), same as existing catalog behavior.
        - When a higher level card/tab is clicked, its tab should be visibly active and scrolled into view (same smooth scroll + active state logic).
      - Implementation should **reuse** as much logic as possible from:
        - `BrowseByCategory2`.
        - `CategoryL1Card`/`CategoryL2Tab`/`CategoryL2Modal` patterns.
    - **Section 6** – Top car brands & makes (client):
      - Heading uses current L1 category name from API.
      - Reuse the same UI and logic as `OGFeatureMakes`:
        - Brands grid with saved cars and brand images.
        - Navigation to category selection with `makeModelTypeId`.
      - Important: do **not** re‑implement styling or behavior; factor out reusable pieces if necessary.
    - **Section 7** – FAQ (client):
      - For L1 page, initial requirement is “returns just a text”.
      - In future, we can:
        - Pull FAQ from L2/L3 `faq` arrays when user clicks into them.
        - Or aggregate FAQs of children for L1.
    - **Section 8** – Recently viewed products (client):
      - Reuse existing `Productfrequentlybought` component from product details:
        - Uses `useRecentlyViewedProductStore`.
        - Shows recently viewed items in mobile carousel + desktop grid.
      - Category L1 page should just mount this component; no new logic needed.

  - **Documentation**
    - All design/implementation decisions, API contracts, URL patterns, and SEO rules for category pages (L1/L2/L3) will be documented in a dedicated markdown file:
      - `category-seo.md` (this doc will serve as the high‑level design + reference for future iterations).

- **FullResponse**

=> Category "L1" API data response:
[
{
"id": "001",
"parentId": "root",
"name": "ENGINE",
"displayOrder": 0,
"titles": {
"nl": "MOTOR",
"en": "ENGINE",
"fr": "MOTEUR"
},
"descriptions": {
"nl": "Filters, ontsteking, koeling, brandstofsysteem, inlaat, riemaandrijving, cilinderkop en blok, elektrische systemen, timing, smering...",
"en": "Filters, ignition, cooling, fuel system, intake, belt drive, cylinder head & block, electrics, timing, lubrication...",
"fr": "Filtres, allumage, refroidissement, système de carburant, admission, transmission par courroie, culasse et bloc, électricité, distribution, lubrification..."
},
"slugs": {
"nl": "motor",
"en": "engine",
"fr": "moteur"
}
},
{
"id": "002",
"parentId": "root",
"name": "TRANSMISSION",
"displayOrder": 0,
"titles": {
"nl": "TRANSMISSIE",
"en": "TRANSMISSION",
"fr": "TRANSMISSION"
},
"descriptions": {
"en": "Clutch system, manual & automatic gearboxes, transfer case, drive shafts, CV joints, propshaft, bearings, sensors...",
"nl": "Koppelingssysteem, handgeschakelde en automatische versnellingsbakken, tussenbak, aandrijfassen, homokinetische koppelingen, aandrijfas, lagers, sensoren...",
"fr": "Système d'embrayage, boîtes de vitesses manuelles et automatiques, boîte de transfert, arbres de transmission, joints homocinétiques, arbre de transmission, roulements, capteurs..."
},
"slugs": {
"nl": "transmissie",
"en": "transmission",
"fr": "transmission"
}
},
]

=> Category L2 API call and Its also has children (L3 category)

Focusing on one L2 category 001 parent:

https://api-dev.ottogusto.com/api/Category?parentId=001

[
{
"id": "001001",
"parentId": "001",
"name": "FILTERS",
"displayOrder": 0,
"titles": {
"nl": "FILTERS",
"en": "FILTERS",
"fr": "FILTRES"
},
"descriptions": {},
"slugs": {
"nl": "filters",
"en": "filters",
"fr": "filtres"
},
"children": [
{
"id": "001001001",
"parentId": "001001",
"name": "OIL FILTER",
"displayOrder": 0,
"titles": {
"nl": "OLIEFILTER",
"en": "OIL FILTER",
"fr": "FILTRE À HUILE"
},
"descriptions": {},
"slugs": {
"nl": "oliefilter",
"en": "oil-filter",
"fr": "filtre-huile"
},
"faq": [
{
"id": "mmd6mvt1iid4fq",
"order": 0,
"lang": "nl",
"question": "Wat is een olie filter",
"answer": "Een oliefilter filtert olie"
},
{
"id": "mmd6rnoolj5kx0",
"order": 0,
"lang": "en",
"question": "What is an oil filter",
"answer": "An oil filter filters oil"
}
]
},
{
"id": "001001002",
"parentId": "001001",
"name": "AIR FILTER",
"displayOrder": 0,
"titles": {
"nl": "LUCHTFILTER",
"en": "AIR FILTER",
"fr": "FILTRE À AIR"
},
"descriptions": {},
"slugs": {
"nl": "luchtfilter",
"en": "air-filter",
"fr": "filtre--air"
}
},
{
"id": "001001003",
"parentId": "001001",
"name": "FUEL FILTER",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOF FILTER",
"en": "FUEL FILTER",
"fr": "FILTRE À CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstof-filter",
"en": "fuel-filter",
"fr": "filtre--carburant"
}
},
{
"id": "001001004",
"parentId": "001001",
"name": "CABIN FILTER",
"displayOrder": 0,
"titles": {
"nl": "INTERIEURFILTER",
"en": "CABIN FILTER",
"fr": "FILTRE D'HABITACLE"
},
"descriptions": {},
"slugs": {
"nl": "interieurfilter",
"en": "cabin-filter",
"fr": "filtre-dhabitacle"
}
}
]
},
{
"id": "001002",
"parentId": "001",
"name": "IGNITION",
"displayOrder": 0,
"titles": {
"nl": "ONTSTEKING",
"en": "IGNITION",
"fr": "ALLUMAGE"
},
"descriptions": {},
"slugs": {
"nl": "ontsteking",
"en": "ignition",
"fr": "allumage"
},
"children": [
{
"id": "001002001",
"parentId": "001002",
"name": "SPARK PLUG/GLOW PLUG ",
"displayOrder": 0,
"titles": {
"nl": "BOUGIE/GLOEIBOUGIE",
"en": "SPARK PLUG/GLOW PLUG",
"fr": "BOUGIE D'ALLUMAGE/BOUGIE DE PRÉCHAUFFAGE"
},
"descriptions": {},
"slugs": {
"nl": "bougiegloeibougie",
"en": "spark-plugglow-plug",
"fr": "bougie-dallumagebougie-de-prchauffage"
}
},
{
"id": "001002002",
"parentId": "001002",
"name": "IGNITION COIL/RELAY",
"displayOrder": 0,
"titles": {
"nl": "ONTSTEKINGSPOEL/RELAIS",
"en": "IGNITION COIL/RELAY",
"fr": "BOBINE D'ALLUMAGE/RELAIS"
},
"descriptions": {},
"slugs": {
"nl": "ontstekingspoelrelais",
"en": "ignition-coilrelay",
"fr": "bobine-dallumagerelais"
}
},
{
"id": "001002003",
"parentId": "001002",
"name": "CONNECTORS",
"displayOrder": 0,
"titles": {
"nl": "CONNECTOREN",
"en": "CONNECTORS",
"fr": "CONNECTEURS"
},
"descriptions": {},
"slugs": {
"nl": "connectoren",
"en": "connectors",
"fr": "connecteurs"
}
},
{
"id": "001002004",
"parentId": "001002",
"name": "DISTRIBUTOR PARTS",
"displayOrder": 0,
"titles": {
"nl": "ONTSTEKINGSVERDELER ONDERDELEN",
"en": "DISTRIBUTOR PARTS",
"fr": "PIÈCES DE DISTRIBUTEUR"
},
"descriptions": {},
"slugs": {
"nl": "ontstekingsverdeler-onderdelen",
"en": "distributor-parts",
"fr": "pices-de-distributeur"
}
}
]
},
{
"id": "001003",
"parentId": "001",
"name": "COOLING",
"displayOrder": 0,
"titles": {
"nl": "KOELING",
"en": "COOLING",
"fr": "REFROIDISSEMENT"
},
"descriptions": {},
"slugs": {
"nl": "koeling",
"en": "cooling",
"fr": "refroidissement"
},
"children": [
{
"id": "001003001",
"parentId": "001003",
"name": "WATER PUMP",
"displayOrder": 0,
"titles": {
"nl": "WATERPOMP",
"en": "WATER PUMP",
"fr": "POMPE À EAU"
},
"descriptions": {},
"slugs": {
"nl": "waterpomp",
"en": "water-pump",
"fr": "pompe--eau"
}
},
{
"id": "001003002",
"parentId": "001003",
"name": "RADIATOR",
"displayOrder": 0,
"titles": {
"nl": "RADIATOR",
"en": "RADIATOR",
"fr": "RADIATEUR"
},
"descriptions": {},
"slugs": {
"nl": "radiator",
"en": "radiator",
"fr": "radiateur"
}
},
{
"id": "001003003",
"parentId": "001003",
"name": "COOLANT LEVEL SENSOR",
"displayOrder": 0,
"titles": {
"nl": "KOELVLOEISTOFNIVEAUSENSOR",
"en": "COOLANT LEVEL SENSOR",
"fr": "SONDE DE NIVEAU DE LIQUIDE DE REFROIDISSEMENT"
},
"descriptions": {},
"slugs": {
"nl": "koelvloeistofniveausensor",
"en": "coolant-level-sensor",
"fr": "sonde-de-niveau-de-liquide-de-refroidissement"
}
},
{
"id": "001003004",
"parentId": "001003",
"name": "EXPANSION TANK/CAP",
"displayOrder": 0,
"titles": {
"nl": "EXPANSIETANK/DOP",
"en": "EXPANSION TANK/CAP",
"fr": "VASE D'EXPANSION/BOUCHON"
},
"descriptions": {},
"slugs": {
"nl": "expansietankdop",
"en": "expansion-tankcap",
"fr": "vase-dexpansionbouchon"
}
},
{
"id": "001003005",
"parentId": "001003",
"name": "PIPE AND HOSES",
"displayOrder": 0,
"titles": {
"nl": "LEIDINGEN EN SLANGEN",
"en": "PIPE AND HOSES",
"fr": "TUYAUX ET DURITES"
},
"descriptions": {},
"slugs": {
"nl": "leidingen-en-slangen",
"en": "pipe-and-hoses",
"fr": "tuyaux-et-durites"
}
},
{
"id": "001003006",
"parentId": "001003",
"name": "COOLANT GASKETS",
"displayOrder": 0,
"titles": {
"nl": "KOELVLOEISTOF PAKKINGEN",
"en": "COOLANT GASKETS",
"fr": "JOINTS DE LIQUIDE DE REFROIDISSEMENT"
},
"descriptions": {},
"slugs": {
"nl": "koelvloeistof-pakkingen",
"en": "coolant-gaskets",
"fr": "joints-de-liquide-de-refroidissement"
}
},
{
"id": "001003007",
"parentId": "001003",
"name": "THERMOSTAT",
"displayOrder": 0,
"titles": {
"nl": "THERMOSTAAT",
"en": "THERMOSTAT",
"fr": "THERMOSTAT"
},
"descriptions": {},
"slugs": {
"nl": "thermostaat",
"en": "thermostat",
"fr": "thermostat"
}
},
{
"id": "001003008",
"parentId": "001003",
"name": "COOLANT TEMPERATURE SENSOR",
"displayOrder": 0,
"titles": {
"nl": "KOELVLOEISTOF TEMPERATUURSENSOR",
"en": "COOLANT TEMPERATURE SENSOR",
"fr": "SONDE DE TEMPÉRATURE DE LIQUIDE DE REFROIDISSEMENT"
},
"descriptions": {},
"slugs": {
"nl": "koelvloeistof-temperatuursensor",
"en": "coolant-temperature-sensor",
"fr": "sonde-de-temprature-de-liquide-de-refroidissement"
}
},
{
"id": "001003009",
"parentId": "001003",
"name": "RADIATOR FAN",
"displayOrder": 0,
"titles": {
"nl": "RADIATOR VENTILATOR",
"en": "RADIATOR FAN",
"fr": "VENTILATEUR DE RADIATEUR"
},
"descriptions": {},
"slugs": {
"nl": "radiator-ventilator",
"en": "radiator-fan",
"fr": "ventilateur-de-radiateur"
}
},
{
"id": "00100300a",
"parentId": "001003",
"name": "RADIATOR FAN SWITCH",
"displayOrder": 0,
"titles": {
"nl": "RADIATOR VENTILATOR SCHAKELAAR",
"en": "RADIATOR FAN SWITCH",
"fr": "INTERRUPTEUR DE VENTILATEUR DE RADIATEUR"
},
"descriptions": {},
"slugs": {
"nl": "radiator-ventilator-schakelaar",
"en": "radiator-fan-switch",
"fr": "interrupteur-de-ventilateur-de-radiateur"
}
},
{
"id": "00100300b",
"parentId": "001003",
"name": "COWLING RADIATOR FAN",
"displayOrder": 0,
"titles": {
"nl": "VENTILATOROMKAPPING RADIATOR",
"en": "COWLING RADIATOR FAN",
"fr": "CACHE-VENTILATEUR DE RADIATEUR"
},
"descriptions": {},
"slugs": {
"nl": "ventilatoromkapping-radiator",
"en": "cowling-radiator-fan",
"fr": "cacheventilateur-de-radiateur"
}
},
{
"id": "00100300c",
"parentId": "001003",
"name": "COOLANT FLANGE",
"displayOrder": 0,
"titles": {
"nl": "KOELVLOEISTOF FLENS",
"en": "COOLANT FLANGE",
"fr": "FLASQUE DE LIQUIDE DE REFROIDISSEMENT"
},
"descriptions": {},
"slugs": {
"nl": "koelvloeistof-flens",
"en": "coolant-flange",
"fr": "flasque-de-liquide-de-refroidissement"
}
},
{
"id": "00100300d",
"parentId": "001003",
"name": "RADIATOR MOUNTING PARTS",
"displayOrder": 0,
"titles": {
"nl": "RADIATOR MONTAGE-ONDERDELEN",
"en": "RADIATOR MOUNTING PARTS",
"fr": "PIÈCES DE MONTAGE DE RADIATEUR"
},
"descriptions": {},
"slugs": {
"nl": "radiator-montageonderdelen",
"en": "radiator-mounting-parts",
"fr": "pices-de-montage-de-radiateur"
}
},
{
"id": "00100300e",
"parentId": "001003",
"name": "COOLANT VALVES",
"displayOrder": 0,
"titles": {
"nl": "KOELVLOEISTOF KLEPPEN",
"en": "COOLANT VALVES",
"fr": "VALVES DE LIQUIDE DE REFROIDISSEMENT"
},
"descriptions": {},
"slugs": {
"nl": "koelvloeistof-kleppen",
"en": "coolant-valves",
"fr": "valves-de-liquide-de-refroidissement"
}
},
{
"id": "00100300f",
"parentId": "001003",
"name": "RADIATOR SHUTTER / ACTUATOR",
"displayOrder": 0,
"titles": {
"nl": "RADIATOR SLUITER / ACTUATOR",
"en": "RADIATOR SHUTTER / ACTUATOR",
"fr": "VOLET DE RADIATEUR / ACTIONNEUR"
},
"descriptions": {},
"slugs": {
"nl": "radiator-sluiter--actuator",
"en": "radiator-shutter--actuator",
"fr": "volet-de-radiateur--actionneur"
}
},
{
"id": "001003zzz",
"parentId": "001003",
"name": "OtHER COOLING",
"displayOrder": 0,
"titles": {
"nl": "OVERIGE KOELING",
"en": "OtHER COOLING",
"fr": "AUTRES PIÈCES DE REFROIDISSEMENT"
},
"descriptions": {},
"slugs": {
"nl": "overige-koeling",
"en": "other-cooling",
"fr": "autres-pices-de-refroidissement"
}
}
]
},
{
"id": "001004",
"parentId": "001",
"name": "FUEL SYSTEM",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOF SYSTEEM",
"en": "FUEL SYSTEM",
"fr": "SYSTÈME DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstof-systeem",
"en": "fuel-system",
"fr": "systme-de-carburant"
},
"children": [
{
"id": "001004001",
"parentId": "001004",
"name": "INJECTORS",
"displayOrder": 0,
"titles": {
"nl": "INJECTOREN",
"en": "INJECTORS",
"fr": "INJECTEURS"
},
"descriptions": {},
"slugs": {
"nl": "injectoren",
"en": "injectors",
"fr": "injecteurs"
}
},
{
"id": "001004002",
"parentId": "001004",
"name": "FUEL PUMP",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOFPOMP",
"en": "FUEL PUMP",
"fr": "POMPE À CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstofpomp",
"en": "fuel-pump",
"fr": "pompe--carburant"
}
},
{
"id": "001004003",
"parentId": "001004",
"name": "FUEL PUMP RELAY",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOFPOMP RELAIS",
"en": "FUEL PUMP RELAY",
"fr": "RELAIS DE POMPE À CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstofpomp-relais",
"en": "fuel-pump-relay",
"fr": "relais-de-pompe--carburant"
}
},
{
"id": "001004004",
"parentId": "001004",
"name": "FUEL RAIL",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOFRAIL",
"en": "FUEL RAIL",
"fr": "RAMPE DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstofrail",
"en": "fuel-rail",
"fr": "rampe-de-carburant"
}
},
{
"id": "001004005",
"parentId": "001004",
"name": "IDLE CONTROL VALVE",
"displayOrder": 0,
"titles": {
"nl": "STATIONAIRE REGELKLEP",
"en": "IDLE CONTROL VALVE",
"fr": "SOUPAPE DE COMMANDE DE RALENTI"
},
"descriptions": {},
"slugs": {
"nl": "stationaire-regelklep",
"en": "idle-control-valve",
"fr": "soupape-de-commande-de-ralenti"
}
},
{
"id": "001004006",
"parentId": "001004",
"name": "FUEL TEMPERATURE SENSOR",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOF TEMPERATUURSENSOR",
"en": "FUEL TEMPERATURE SENSOR",
"fr": "SONDE DE TEMPÉRATURE DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstof-temperatuursensor",
"en": "fuel-temperature-sensor",
"fr": "sonde-de-temprature-de-carburant"
}
},
{
"id": "001004007",
"parentId": "001004",
"name": "FUEL PRESSURE SENSOR",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOF DRUKSENSOR",
"en": "FUEL PRESSURE SENSOR",
"fr": "CAPTEUR DE PRESSION DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstof-druksensor",
"en": "fuel-pressure-sensor",
"fr": "capteur-de-pression-de-carburant"
}
},
{
"id": "001004008",
"parentId": "001004",
"name": "FUEL PRESSURE REGULATOR",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOF DRUKREGELAAR",
"en": "FUEL PRESSURE REGULATOR",
"fr": "RÉGULATEUR DE PRESSION DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstof-drukregelaar",
"en": "fuel-pressure-regulator",
"fr": "rgulateur-de-pression-de-carburant"
}
},
{
"id": "001004009",
"parentId": "001004",
"name": "FUEL TANK",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOFTANK",
"en": "FUEL TANK",
"fr": "RÉSERVOIR DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstoftank",
"en": "fuel-tank",
"fr": "rservoir-de-carburant"
}
},
{
"id": "00100400a",
"parentId": "001004",
"name": "FUEL LINES",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOFLEIDINGEN",
"en": "FUEL LINES",
"fr": "CONDUITES DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstofleidingen",
"en": "fuel-lines",
"fr": "conduites-de-carburant"
}
},
{
"id": "00100400b",
"parentId": "001004",
"name": "FUEL FILLER",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOFVULLER",
"en": "FUEL FILLER",
"fr": "GOULOTTE DE REMPLISSAGE"
},
"descriptions": {},
"slugs": {
"nl": "brandstofvuller",
"en": "fuel-filler",
"fr": "goulotte-de-remplissage"
}
},
{
"id": "00100400c",
"parentId": "001004",
"name": "THROTTLE",
"displayOrder": 0,
"titles": {
"nl": "GASKLEP",
"en": "THROTTLE",
"fr": "PAPILLON DES GAZ"
},
"descriptions": {},
"slugs": {
"nl": "gasklep",
"en": "throttle",
"fr": "papillon-des-gaz"
}
},
{
"id": "00100400d",
"parentId": "001004",
"name": "FUEL LEVEL SENSOR",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOFNIVEAUSENSOR",
"en": "FUEL LEVEL SENSOR",
"fr": "SONDE DE NIVEAU DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstofniveausensor",
"en": "fuel-level-sensor",
"fr": "sonde-de-niveau-de-carburant"
}
},
{
"id": "00100400e",
"parentId": "001004",
"name": "ACCELERATOR PEDAL",
"displayOrder": 0,
"titles": {
"nl": "GASPEDAAL",
"en": "ACCELERATOR PEDAL",
"fr": "PÉDALE D'ACCÉLÉRATEUR"
},
"descriptions": {},
"slugs": {
"nl": "gaspedaal",
"en": "accelerator-pedal",
"fr": "pdale-dacclrateur"
}
},
{
"id": "00100400f",
"parentId": "001004",
"name": "CARBURETTOR",
"displayOrder": 0,
"titles": {
"nl": "CARBURATEUR",
"en": "CARBURETTOR",
"fr": "CARBURATEUR"
},
"descriptions": {},
"slugs": {
"nl": "carburateur",
"en": "carburettor",
"fr": "carburateur"
}
},
{
"id": "00100400g",
"parentId": "001004",
"name": "FUEL SYSTEM MOUNTING PARTS",
"displayOrder": 0,
"titles": {
"nl": "MONTAGE-ONDERDELEN BRANDSTOF SYSTEEM",
"en": "FUEL SYSTEM MOUNTING PARTS",
"fr": "PIÈCES DE MONTAGE DE SYSTÈME DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "montageonderdelen-brandstof-systeem",
"en": "fuel-system-mounting-parts",
"fr": "pices-de-montage-de-systme-de-carburant"
}
},
{
"id": "00100400h",
"parentId": "001004",
"name": "FUEL COOLING/VENT",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOF KOELING/VENTILATIE",
"en": "FUEL COOLING/VENT",
"fr": "REFROIDISSEMENT/ÉVENT DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "brandstof-koelingventilatie",
"en": "fuel-coolingvent",
"fr": "refroidissementvent-de-carburant"
}
},
{
"id": "00100400i",
"parentId": "001004",
"name": "FUEL CAP",
"displayOrder": 0,
"titles": {
"nl": "BRANDSTOFDOP",
"en": "FUEL CAP",
"fr": "BOUCHON DE RÉSERVOIR"
},
"descriptions": {},
"slugs": {
"nl": "brandstofdop",
"en": "fuel-cap",
"fr": "bouchon-de-rservoir"
}
},
{
"id": "001004zzz",
"parentId": "001004",
"name": "OTHER FUEL SYSTEM PARTS",
"displayOrder": 0,
"titles": {
"nl": "OVERIGE BRANDSTOF SYSTEEMDELEN",
"en": "OTHER FUEL SYSTEM PARTS",
"fr": "AUTRES PIÈCES DE SYSTÈME DE CARBURANT"
},
"descriptions": {},
"slugs": {
"nl": "overige-brandstof-systeemdelen",
"en": "other-fuel-system-parts",
"fr": "autres-pices-de-systme-de-carburant"
}
}
]
},
{
"id": "001005",
"parentId": "001",
"name": "INTAKE SYSTEM",
"displayOrder": 0,
"titles": {
"nl": "INLAATSYSTEEM",
"en": "INTAKE SYSTEM",
"fr": "SYSTÈME D'ADMISSION"
},
"descriptions": {},
"slugs": {
"nl": "inlaatsysteem",
"en": "intake-system",
"fr": "systme-dadmission"
},
"children": [
{
"id": "001005001",
"parentId": "001005",
"name": "INTAKE HOSES",
"displayOrder": 0,
"titles": {
"nl": "INLAATSLANGEN",
"en": "INTAKE HOSES",
"fr": "DURITES D'ADMISSION"
},
"descriptions": {},
"slugs": {
"nl": "inlaatslangen",
"en": "intake-hoses",
"fr": "durites-dadmission"
}
},
{
"id": "001005002",
"parentId": "001005",
"name": "AIR CLEANER",
"displayOrder": 0,
"titles": {
"nl": "LUCHTFILTERHUIS",
"en": "AIR CLEANER",
"fr": "BOÎTE DE FILTRE À AIR"
},
"descriptions": {},
"slugs": {
"nl": "luchtfilterhuis",
"en": "air-cleaner",
"fr": "bote-de-filtre--air"
}
},
{
"id": "001005003",
"parentId": "001005",
"name": "AIR CLEANER BRACKETS/BOLTS (and other parts)",
"displayOrder": 0,
"titles": {
"nl": "LUCHTFILTERHUIS STEUNEN/BOUTEN (en andere delen)",
"en": "AIR CLEANER BRACKETS/BOLTS (and other parts)",
"fr": "SUPPORTS/BOULONS DE BOÎTIER DE FILTRE À AIR (et autres pièces)"
},
"descriptions": {},
"slugs": {
"nl": "luchtfilterhuis-steunenbouten-en-andere-delen",
"en": "air-cleaner-bracketsbolts-and-other-parts",
"fr": "supportsboulons-de-botier-de-filtre--air-et-autres-pices"
}
},
{
"id": "001005004",
"parentId": "001005",
"name": "AIR MASS SENSOR",
"displayOrder": 0,
"titles": {
"nl": "LUCHTMASSAMETER",
"en": "AIR MASS SENSOR",
"fr": "DÉBITMÈTRE D'AIR"
},
"descriptions": {},
"slugs": {
"nl": "luchtmassameter",
"en": "air-mass-sensor",
"fr": "dbitmtre-dair"
}
},
{
"id": "001005005",
"parentId": "001005",
"name": "THROTTLE VAVLVE",
"displayOrder": 0,
"titles": {
"nl": "GASKLEP",
"en": "THROTTLE VALVE",
"fr": "SOUPAPE DE PAPILLON DES GAZ"
},
"descriptions": {},
"slugs": {
"nl": "gasklep",
"en": "throttle-valve",
"fr": "soupape-de-papillon-des-gaz"
}
},
{
"id": "001005006",
"parentId": "001005",
"name": "INTAKE MANIFOLD",
"displayOrder": 0,
"titles": {
"nl": "INLAATSPRUITSTUK",
"en": "INTAKE MANIFOLD",
"fr": "COLLECTEUR D'ADMISSION"
},
"descriptions": {},
"slugs": {
"nl": "inlaatspruitstuk",
"en": "intake-manifold",
"fr": "collecteur-dadmission"
}
},
{
"id": "001005007",
"parentId": "001005",
"name": "INTAKE MANIFOLD GASKET",
"displayOrder": 0,
"titles": {
"nl": "INLAATSPRUITSTUK PAKKING",
"en": "INTAKE MANIFOLD GASKET",
"fr": "JOINT DE COLLECTEUR D'ADMISSION"
},
"descriptions": {},
"slugs": {
"nl": "inlaatspruitstuk-pakking",
"en": "intake-manifold-gasket",
"fr": "joint-de-collecteur-dadmission"
}
},
{
"id": "001005zzz",
"parentId": "001005",
"name": "OTHER AIR INTAKE PARTS",
"displayOrder": 0,
"titles": {
"nl": "OVERIGE LUCHTINLAATDELEN",
"en": "OTHER AIR INTAKE PARTS",
"fr": "AUTRES PIÈCES D'ADMISSION D'AIR"
},
"descriptions": {},
"slugs": {
"nl": "overige-luchtinlaatdelen",
"en": "other-air-intake-parts",
"fr": "autres-pices-dadmission-dair"
}
}
]
},
{
"id": "001006",
"parentId": "001",
"name": "BELT DRIVE",
"displayOrder": 0,
"titles": {
"nl": "RIEMAANDRIJVING",
"en": "BELT DRIVE",
"fr": "TRANSMISSION PAR COURROIE"
},
"descriptions": {},
"slugs": {
"nl": "riemaandrijving",
"en": "belt-drive",
"fr": "transmission-par-courroie"
},
"children": [
{
"id": "001006001",
"parentId": "001006",
"name": "V-BELT",
"displayOrder": 0,
"titles": {
"nl": "V-RIEM",
"en": "V-BELT",
"fr": "COURROIE TRAPÉZOÏDALE"
},
"descriptions": {},
"slugs": {
"nl": "vriem",
"en": "vbelt",
"fr": "courroie-trapzodale"
}
},
{
"id": "001006002",
"parentId": "001006",
"name": "V-BELT KIT",
"displayOrder": 0,
"titles": {
"nl": "V-RIEM KIT",
"en": "V-BELT KIT",
"fr": "KIT DE COURROIE TRAPÉZOÏDALE"
},
"descriptions": {},
"slugs": {
"nl": "vriem-kit",
"en": "vbelt-kit",
"fr": "kit-de-courroie-trapzodale"
}
},
{
"id": "001006003",
"parentId": "001006",
"name": "IDLE PULLEY/TENSIONER",
"displayOrder": 0,
"titles": {
"nl": "SPANROL/SPANNER",
"en": "IDLE PULLEY/TENSIONER",
"fr": "POULIE DE RENVOI/TENDEUR"
},
"descriptions": {},
"slugs": {
"nl": "spanrolspanner",
"en": "idle-pulleytensioner",
"fr": "poulie-de-renvoitendeur"
}
},
{
"id": "001006004",
"parentId": "001006",
"name": "PULLEY CRANKSHAFT",
"displayOrder": 0,
"titles": {
"nl": "KRUKASPOULIE",
"en": "CRANKSHAFT PULLEY",
"fr": "POULIE DE VILEBREQUIN"
},
"descriptions": {},
"slugs": {
"nl": "krukaspoulie",
"en": "crankshaft-pulley",
"fr": "poulie-de-vilebrequin"
}
},
{
"id": "001006005",
"parentId": "001006",
"name": "VIBRATION DAMPER",
"displayOrder": 0,
"titles": {
"nl": "TRILLINGSADEMPER",
"en": "VIBRATION DAMPER",
"fr": "AMORTISSEUR DE VIBRATIONS"
},
"descriptions": {},
"slugs": {
"nl": "trillingsademper",
"en": "vibration-damper",
"fr": "amortisseur-de-vibrations"
}
},
{
"id": "001006006",
"parentId": "001006",
"name": "BOLTS AND MOUNTING PARTS",
"displayOrder": 0,
"titles": {
"nl": "BOUTEN EN MONTAGE-ONDERDELEN",
"en": "BOLTS AND MOUNTING PARTS",
"fr": "BOULONS ET PIÈCES DE MONTAGE"
},
"descriptions": {},
"slugs": {
"nl": "bouten-en-montageonderdelen",
"en": "bolts-and-mounting-parts",
"fr": "boulons-et-pices-de-montage"
}
}
]
},
{
"id": "001007",
"parentId": "001",
"name": "CYLINDER HEAD",
"displayOrder": 0,
"titles": {
"nl": "CILINDERKOP",
"en": "CYLINDER HEAD",
"fr": "CULASSE"
},
"descriptions": {},
"slugs": {
"nl": "cilinderkop",
"en": "cylinder-head",
"fr": "culasse"
},
"children": [
{
"id": "001007001",
"parentId": "001007",
"name": "CYLINDER HEAD ASSY",
"displayOrder": 0,
"titles": {
"nl": "CILINDERKOP ASSY",
"en": "CYLINDER HEAD ASSY",
"fr": "ENSEMBLE DE CULASSE"
},
"descriptions": {},
"slugs": {
"nl": "cilinderkop-assy",
"en": "cylinder-head-assy",
"fr": "ensemble-de-culasse"
}
},
{
"id": "001007002",
"parentId": "001007",
"name": "CYLINDER HEAD COVER",
"displayOrder": 0,
"titles": {
"nl": "CILINDERKOPDEKSEL",
"en": "CYLINDER HEAD COVER",
"fr": "CACHE DE CULASSE"
},
"descriptions": {},
"slugs": {
"nl": "cilinderkopdeksel",
"en": "cylinder-head-cover",
"fr": "cache-de-culasse"
}
},
{
"id": "001007003",
"parentId": "001007",
"name": "CYLINDER HEAD GASKET",
"displayOrder": 0,
"titles": {
"nl": "CILINDERKOPPAKKING",
"en": "CYLINDER HEAD GASKET",
"fr": "JOINT DE CULASSE"
},
"descriptions": {},
"slugs": {
"nl": "cilinderkoppakking",
"en": "cylinder-head-gasket",
"fr": "joint-de-culasse"
}
},
{
"id": "001007004",
"parentId": "001007",
"name": "CYLINDER HEAD BOLTS",
"displayOrder": 0,
"titles": {
"nl": "CILINDERKOPBOUTEN",
"en": "CYLINDER HEAD BOLTS",
"fr": "BOULONS DE CULASSE"
},
"descriptions": {},
"slugs": {
"nl": "cilinderkopbouten",
"en": "cylinder-head-bolts",
"fr": "boulons-de-culasse"
}
},
{
"id": "001007005",
"parentId": "001007",
"name": "VALVES",
"displayOrder": 0,
"titles": {
"nl": "KLEPPEN",
"en": "VALVES",
"fr": "SOUPAPES"
},
"descriptions": {},
"slugs": {
"nl": "kleppen",
"en": "valves",
"fr": "soupapes"
}
},
{
"id": "001007006",
"parentId": "001007",
"name": "VALVE SPRINGS",
"displayOrder": 0,
"titles": {
"nl": "KLEPVEREN",
"en": "VALVE SPRINGS",
"fr": "RESSORTS DE SOUPAPES"
},
"descriptions": {},
"slugs": {
"nl": "klepveren",
"en": "valve-springs",
"fr": "ressorts-de-soupapes"
}
},
{
"id": "001007007",
"parentId": "001007",
"name": "CAMSHAFTS",
"displayOrder": 0,
"titles": {
"nl": "NOKKENASSEN",
"en": "CAMSHAFTS",
"fr": "ARBRES À CAMES"
},
"descriptions": {},
"slugs": {
"nl": "nokkenassen",
"en": "camshafts",
"fr": "arbres--cames"
}
},
{
"id": "001007008",
"parentId": "001007",
"name": "OIL FILLER CAP",
"displayOrder": 0,
"titles": {
"nl": "OLIEDOP",
"en": "OIL FILLER CAP",
"fr": "BOUCHON DE REMPLISSAGE D'HUILE"
},
"slugs": {
"nl": "oliedop",
"en": "oil-filler-cap",
"fr": "bouchon-de-remplissage-dhuile"
}
},
{
"id": "001007009",
"parentId": "001007",
"name": "CYLINDER HEAD BRACKETS/BOLTS (and other parts)",
"displayOrder": 0,
"titles": {
"nl": "CILINDERKOP STEUNEN/BOUTEN (en andere delen)",
"en": "CYLINDER HEAD BRACKETS/BOLTS (and other parts)",
"fr": "SUPPORTS/BOULONS DE CULASSE (et autres pièces)"
},
"descriptions": {},
"slugs": {
"nl": "cilinderkop-steunenbouten-en-andere-delen",
"en": "cylinder-head-bracketsbolts-and-other-parts",
"fr": "supportsboulons-de-culasse-et-autres-pices"
}
},
{
"id": "00100700a",
"parentId": "001007",
"name": "VARIABLE TIMING",
"displayOrder": 0,
"titles": {
"nl": "VARIABELE KLEPTIMING",
"en": "VARIABLE TIMING",
"fr": "DISTRIBUTION VARIABLE"
},
"descriptions": {},
"slugs": {
"nl": "variabele-kleptiming",
"en": "variable-timing",
"fr": "distribution-variable"
}
},
{
"id": "00100700b",
"parentId": "001007",
"name": "ENGINE COVER",
"displayOrder": 0,
"titles": {
"nl": "MOTORDEKSEL",
"en": "ENGINE COVER",
"fr": "CACHE-MOTEUR"
},
"descriptions": {},
"slugs": {
"nl": "motordeksel",
"en": "engine-cover",
"fr": "cachemoteur"
}
},
{
"id": "00100700c",
"parentId": "001007",
"name": "ROCKER ARMS AND PUSHRODS",
"displayOrder": 0,
"titles": {
"nl": "TUIMELAARS EN STOTERS",
"en": "ROCKER ARMS AND PUSHRODS",
"fr": "CULBUTEURS ET TIGES DE POUSSÉE"
},
"descriptions": {},
"slugs": {
"nl": "tuimelaars-en-stoters",
"en": "rocker-arms-and-pushrods",
"fr": "culbuteurs-et-tiges-de-pousse"
}
},
{
"id": "001007zzz",
"parentId": "001007",
"name": "OTHER CYLINDER HEAD PARTS",
"displayOrder": 0,
"titles": {
"nl": "OVERIGE CILINDERKOPDELEN",
"en": "OTHER CYLINDER HEAD PARTS",
"fr": "AUTRES PIÈCES DE CULASSE"
},
"descriptions": {},
"slugs": {
"nl": "overige-cilinderkopdelen",
"en": "other-cylinder-head-parts",
"fr": "autres-pices-de-culasse"
}
}
]
},
{
"id": "001008",
"parentId": "001",
"name": "CYLINDER BLOCK",
"displayOrder": 0,
"titles": {
"nl": "CILINDERBLOK",
"en": "CYLINDER BLOCK",
"fr": "BLOC-CYLINDRES"
},
"descriptions": {},
"slugs": {
"nl": "cilinderblok",
"en": "cylinder-block",
"fr": "bloccylindres"
},
"children": [
{
"id": "001008001",
"parentId": "001008",
"name": "ENGINE BLOCK ASSY",
"displayOrder": 0,
"titles": {
"nl": "MOTORBLOK ASSY",
"en": "ENGINE BLOCK ASSY",
"fr": "ENSEMBLE DE BLOC-MOTEUR"
},
"descriptions": {},
"slugs": {
"nl": "motorblok-assy",
"en": "engine-block-assy",
"fr": "ensemble-de-blocmoteur"
}
},
{
"id": "001008002",
"parentId": "001008",
"name": "PISTONS/PISTON RINGS",
"displayOrder": 0,
"titles": {
"nl": "ZUIGERS/ZUIGERVEREN",
"en": "PISTONS/PISTON RINGS",
"fr": "PISTONS/SEGMENTS DE PISTON"
},
"descriptions": {},
"slugs": {
"nl": "zuigerszuigerveren",
"en": "pistonspiston-rings",
"fr": "pistonssegments-de-piston"
}
},
{
"id": "001008003",
"parentId": "001008",
"name": "CONNECTING ROD/CONROD",
"displayOrder": 0,
"titles": {
"nl": "DRIJFSTANG/VERBINDINGSSTANG",
"en": "CONNECTING ROD/CONROD",
"fr": "BIELLE/BIELLE DE LIAISON"
},
"descriptions": {},
"slugs": {
"nl": "drijfstangverbindingsstang",
"en": "connecting-rodconrod",
"fr": "biellebielle-de-liaison"
}
},
{
"id": "001008004",
"parentId": "001008",
"name": "CRANKSHAFT",
"displayOrder": 0,
"titles": {
"nl": "KRUKAS",
"en": "CRANKSHAFT",
"fr": "VILEBREQUIN"
},
"descriptions": {},
"slugs": {
"nl": "krukas",
"en": "crankshaft",
"fr": "vilebrequin"
}
},
{
"id": "001008005",
"parentId": "001008",
"name": "BEARINGS",
"displayOrder": 0,
"titles": {
"nl": "LAGERS",
"en": "BEARINGS",
"fr": "ROULEMENTS"
},
"descriptions": {},
"slugs": {
"nl": "lagers",
"en": "bearings",
"fr": "roulements"
}
},
{
"id": "001008006",
"parentId": "001008",
"name": "CYLINDER BLOCK PLUGS",
"displayOrder": 0,
"titles": {
"nl": "CILINDERBLOK STOPPEN",
"en": "CYLINDER BLOCK PLUGS",
"fr": "BOUCHONS DE BLOC-CYLINDRES"
},
"descriptions": {},
"slugs": {
"nl": "cilinderblok-stoppen",
"en": "cylinder-block-plugs",
"fr": "bouchons-de-bloccylindres"
}
},
{
"id": "001008007",
"parentId": "001008",
"name": "BALANCE",
"displayOrder": 0,
"titles": {
"nl": "BALANS",
"en": "BALANCE",
"fr": "ÉQUILIBRAGE"
},
"descriptions": {},
"slugs": {
"nl": "balans",
"en": "balance",
"fr": "quilibrage"
}
},
{
"id": "001008008",
"parentId": "001008",
"name": "ENGINE MOUNT",
"displayOrder": 0,
"titles": {
"nl": "MOTORSTEUN",
"en": "ENGINE MOUNT",
"fr": "SUPPORT MOTEUR"
},
"descriptions": {},
"slugs": {
"nl": "motorsteun",
"en": "engine-mount",
"fr": "support-moteur"
}
},
{
"id": "001008009",
"parentId": "001008",
"name": "ENGINE SOUNDPROOFING",
"displayOrder": 0,
"titles": {
"nl": "MOTOR GELUIDSISOLATIE",
"en": "ENGINE SOUNDPROOFING",
"fr": "ISOLATION PHONIQUE DU MOTEUR"
},
"descriptions": {},
"slugs": {
"nl": "motor-geluidsisolatie",
"en": "engine-soundproofing",
"fr": "isolation-phonique-du-moteur"
}
},
{
"id": "001008zzz",
"parentId": "001008",
"name": "OTHER ENGINE BLOCK PARTS",
"displayOrder": 0,
"titles": {
"nl": "OVERIGE MOTORBLOKDELEN",
"en": "OTHER ENGINE BLOCK PARTS",
"fr": "AUTRES PIÈCES DE BLOC-MOTEUR"
},
"descriptions": {},
"slugs": {
"nl": "overige-motorblokdelen",
"en": "other-engine-block-parts",
"fr": "autres-pices-de-blocmoteur"
}
}
]
},
{
"id": "001009",
"parentId": "001",
"name": "ENGINE ELECTRICS ",
"displayOrder": 0,
"titles": {
"nl": "MOTOR ELEKTRISCH",
"en": "ENGINE ELECTRICS",
"fr": "ÉLECTRICITÉ MOTEUR"
},
"descriptions": {},
"slugs": {
"nl": "motor-elektrisch",
"en": "engine-electrics",
"fr": "lectricit-moteur"
},
"children": [
{
"id": "001009001",
"parentId": "001009",
"name": "STARTER",
"displayOrder": 0,
"titles": {
"nl": "STARTER",
"en": "STARTER",
"fr": "DÉMARREUR"
},
"descriptions": {},
"slugs": {
"nl": "starter",
"en": "starter",
"fr": "dmarreur"
}
},
{
"id": "001009002",
"parentId": "001009",
"name": "ALTERNATOR",
"displayOrder": 0,
"titles": {
"nl": "DYNAMO",
"en": "ALTERNATOR",
"fr": "ALTERNATEUR"
},
"descriptions": {},
"slugs": {
"nl": "dynamo",
"en": "alternator",
"fr": "alternateur"
}
},
{
"id": "001009003",
"parentId": "001009",
"name": "WIRES",
"displayOrder": 0,
"titles": {
"nl": "DRADEN",
"en": "WIRES",
"fr": "FAISCEAU"
},
"descriptions": {},
"slugs": {
"nl": "draden",
"en": "wires",
"fr": "faisceau"
}
},
{
"id": "001009004",
"parentId": "001009",
"name": "STARTER BATTERY",
"displayOrder": 0,
"titles": {
"nl": "STARTACCU",
"en": "STARTER BATTERY",
"fr": "BATTERIE DE DÉMARRAGE"
},
"descriptions": {},
"slugs": {
"nl": "startaccu",
"en": "starter-battery",
"fr": "batterie-de-dmarrage"
}
},
{
"id": "001009005",
"parentId": "001009",
"name": "ENGINE ELECTRICS BRACKETS",
"displayOrder": 0,
"titles": {
"nl": "MOTOR ELEKTRISCH STEUNEN",
"en": "ENGINE ELECTRICS BRACKETS",
"fr": "SUPPORTS ÉLECTRIQUES MOTEUR"
},
"descriptions": {},
"slugs": {
"nl": "motor-elektrisch-steunen",
"en": "engine-electrics-brackets",
"fr": "supports-lectriques-moteur"
}
},
{
"id": "001009006",
"parentId": "001009",
"name": "MODULES",
"displayOrder": 0,
"titles": {
"nl": "MODULES",
"en": "MODULES",
"fr": "MODULES"
},
"descriptions": {},
"slugs": {
"nl": "modules",
"en": "modules",
"fr": "modules"
}
},
{
"id": "001009007",
"parentId": "001009",
"name": "ELECTRIC MOTOR",
"displayOrder": 0,
"titles": {
"nl": "ELEKTRISCHE MOTOR",
"en": "ELECTRIC MOTOR",
"fr": "MOTEUR ÉLECTRIQUE"
},
"descriptions": {},
"slugs": {
"nl": "elektrische-motor",
"en": "electric-motor",
"fr": "moteur-lectrique"
}
},
{
"id": "001009008",
"parentId": "001009",
"name": "ELECTRIC MOTOR MOUNTING",
"displayOrder": 0,
"titles": {
"nl": "ELEKTRISCHE MOTOR MONTAGE",
"en": "ELECTRIC MOTOR MOUNTING",
"fr": "MONTAGE DE MOTEUR ÉLECTRIQUE"
},
"descriptions": {},
"slugs": {
"nl": "elektrische-motor-montage",
"en": "electric-motor-mounting",
"fr": "montage-de-moteur-lectrique"
}
},
{
"id": "001009009",
"parentId": "001009",
"name": "INVENTER",
"displayOrder": 0,
"titles": {
"nl": "OMKEERDER",
"en": "INVENTER",
"fr": "ONDULEUR"
},
"descriptions": {},
"slugs": {
"nl": "omkeerder",
"en": "inventer",
"fr": "onduleur"
}
},
{
"id": "00100900a",
"parentId": "001009",
"name": "ELECTRIC MOTOR LIUBRICATION",
"displayOrder": 0,
"titles": {
"nl": "ELEKTRISCHE MOTOR SMERING",
"en": "ELECTRIC MOTOR LUBRICATION",
"fr": "LUBRIFICATION DU MOTEUR ÉLECTRIQUE"
},
"descriptions": {},
"slugs": {
"nl": "elektrische-motor-smering",
"en": "electric-motor-lubrication",
"fr": "lubrification-du-moteur-lectrique"
}
}
]
},
{
"id": "00100a",
"parentId": "001",
"name": "TIMING",
"displayOrder": 0,
"titles": {
"nl": "DISTRIBUTIE",
"en": "TIMING",
"fr": "DISTRIBUTION"
},
"descriptions": {},
"slugs": {
"nl": "distributie",
"en": "timing",
"fr": "distribution"
},
"children": [
{
"id": "00100a001",
"parentId": "00100a",
"name": "TIMING KIT",
"displayOrder": 0,
"titles": {
"nl": "DISTRIBUTIEKIT",
"en": "TIMING KIT",
"fr": "KIT DE DISTRIBUTION"
},
"descriptions": {},
"slugs": {
"nl": "distributiekit",
"en": "timing-kit",
"fr": "kit-de-distribution"
}
},
{
"id": "00100a002",
"parentId": "00100a",
"name": "TIMING CHAIN/BELT",
"displayOrder": 0,
"titles": {
"nl": "DISTRIBUTIEKETTING/RIEM",
"en": "TIMING CHAIN/BELT",
"fr": "CHAÎNE/COURROIE DE DISTRIBUTION"
},
"descriptions": {},
"slugs": {
"nl": "distributiekettingriem",
"en": "timing-chainbelt",
"fr": "chanecourroie-de-distribution"
}
},
{
"id": "00100a003",
"parentId": "00100a",
"name": "PULLEYS",
"displayOrder": 0,
"titles": {
"nl": "POULIES",
"en": "PULLEYS",
"fr": "POULIES"
},
"descriptions": {},
"slugs": {
"nl": "poulies",
"en": "pulleys",
"fr": "poulies"
}
},
{
"id": "00100a004",
"parentId": "00100a",
"name": "TIMING COVERS",
"displayOrder": 0,
"titles": {
"nl": "DISTRIBUTIEKAPPEN",
"en": "TIMING COVERS",
"fr": "CACHES DE DISTRIBUTION"
},
"descriptions": {},
"slugs": {
"nl": "distributiekappen",
"en": "timing-covers",
"fr": "caches-de-distribution"
}
},
{
"id": "00100a005",
"parentId": "00100a",
"name": "OTHER PARTS",
"displayOrder": 0,
"titles": {
"nl": "OVERIGE DELEN",
"en": "OTHER PARTS",
"fr": "AUTRES PIÈCES"
},
"descriptions": {},
"slugs": {
"nl": "overige-delen",
"en": "other-parts",
"fr": "autres-pices"
}
}
]
},
{
"id": "00100b",
"parentId": "001",
"name": "LUBRICATION SYSTEM",
"displayOrder": 0,
"titles": {
"nl": "SMERINGSSYSTEEM",
"en": "LUBRICATION SYSTEM",
"fr": "SYSTÈME DE LUBRIFICATION"
},
"descriptions": {},
"slugs": {
"nl": "smeringssysteem",
"en": "lubrication-system",
"fr": "systme-de-lubrification"
},
"children": [
{
"id": "00100b001",
"parentId": "00100b",
"name": "ENGINE OIL",
"displayOrder": 0,
"titles": {
"nl": "MOTOROLIE",
"en": "ENGINE OIL",
"fr": "HUILE MOTEUR"
},
"descriptions": {},
"slugs": {
"nl": "motorolie",
"en": "engine-oil",
"fr": "huile-moteur"
}
},
{
"id": "00100b002",
"parentId": "00100b",
"name": "OIL PUMP",
"displayOrder": 0,
"titles": {
"nl": "OLIEPOMP",
"en": "OIL PUMP",
"fr": "POMPE À HUILE"
},
"descriptions": {},
"slugs": {
"nl": "oliepomp",
"en": "oil-pump",
"fr": "pompe--huile"
}
},
{
"id": "00100b003",
"parentId": "00100b",
"name": "OIL COOLER",
"displayOrder": 0,
"titles": {
"nl": "OLIEKOELER",
"en": "OIL COOLER",
"fr": "REFROIDISSEUR D'HUILE"
},
"descriptions": {},
"slugs": {
"nl": "oliekoeler",
"en": "oil-cooler",
"fr": "refroidisseur-dhuile"
}
},
{
"id": "00100b004",
"parentId": "00100b",
"name": "OIL SUMP",
"displayOrder": 0,
"titles": {
"nl": "OLIEPAN",
"en": "OIL SUMP",
"fr": "CARTER D'HUILE"
},
"descriptions": {},
"slugs": {
"nl": "oliepan",
"en": "oil-sump",
"fr": "carter-dhuile"
}
},
{
"id": "00100b005",
"parentId": "00100b",
"name": "PIPES/BOLTS/VALVES/SEPERATORS",
"displayOrder": 0,
"titles": {
"nl": "LEIDINGEN/BOUTEN/KLEPPEN/AFLEIDERS",
"en": "PIPES/BOLTS/VALVES/SEPARATORS",
"fr": "TUYAUX/BOULONS/VALVES/SÉPARATEURS"
},
"descriptions": {},
"slugs": {
"nl": "leidingenboutenkleppenafleiders",
"en": "pipesboltsvalvesseparators",
"fr": "tuyauxboulonsvalvessparateurs"
}
},
{
"id": "00100b006",
"parentId": "00100b",
"name": "DIPSTICK",
"displayOrder": 0,
"titles": {
"nl": "PEILSTOK",
"en": "DIPSTICK",
"fr": "JAUGE"
},
"descriptions": {},
"slugs": {
"nl": "peilstok",
"en": "dipstick",
"fr": "jauge"
}
},
{
"id": "00100b007",
"parentId": "00100b",
"name": "OIL FILTER HOUSING",
"displayOrder": 0,
"titles": {
"nl": "OLIEFILTERHUIS",
"en": "OIL FILTER HOUSING",
"fr": "BOÎTIER DE FILTRE À HUILE"
},
"descriptions": {},
"slugs": {
"nl": "oliefilterhuis",
"en": "oil-filter-housing",
"fr": "botier-de-filtre--huile"
}
},
{
"id": "00100b008",
"parentId": "00100b",
"name": "OIL PRESSURE SWITCH/SENSOR",
"displayOrder": 0,
"titles": {
"nl": "OLIEDRUKSCHAKELAAR/SENSOR",
"en": "OIL PRESSURE SWITCH/SENSOR",
"fr": "PRESSOSTAT/CAPTEUR DE PRESSION D'HUILE"
},
"descriptions": {},
"slugs": {
"nl": "oliedrukschakelaarsensor",
"en": "oil-pressure-switchsensor",
"fr": "pressostatcapteur-de-pression-dhuile"
}
},
{
"id": "00100bzzz",
"parentId": "00100b",
"name": "OTHER LUBRIFICATION SYSTEM PARTS",
"displayOrder": 0,
"titles": {
"nl": "OVERIGE SMERINGSSYSTEEM DELEN",
"en": "OTHER LUBRICATION SYSTEM PARTS",
"fr": "AUTRES PIÈCES DE SYSTÈME DE LUBRIFICATION"
},
"descriptions": {},
"slugs": {
"nl": "overige-smeringssysteem-delen",
"en": "other-lubrication-system-parts",
"fr": "autres-pices-de-systme-de-lubrification"
}
}
]
}
]
