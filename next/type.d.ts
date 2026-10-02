/**
 * API contract types derived from the backend API doc (next/apitypes/types.md).
 * Keep in sync with the API documentation.
 */

import type { Address } from "@/types/profile";
import { GTMItem } from "./utils/gtm";

/** Request params for GET api/profile (no params in API doc). */
export interface GetProfileParams {}

/** Response body for GET Profile (the `data` payload). Aligned with PostProfileParams / AuthUserType usage. */
export interface ProfileInformation {
  id?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  initials?: string | null;
  phoneNumber?: string | null;
  picture?: string | null;
  lang?: string | null;
  hasLoggedIn?: boolean | null;
  vatNumber?: string | null;
  companyName?: string | null;
  addresses?: Address[];
}

/** API response shape for GET Profile. Matches apiClient return type ({ data }). */
export interface GetProfileResponse {
  data: ProfileInformation;
}

/** Response payload for GET /api/Customer/{id}. Path param: id (string). Same shape as profile; apiClient returns { data }. Not yet used in services/hooks. */
export interface GetCustomerResponse {
  data: ProfileInformation;
}

/** Response for GET /api/Customer/vat/{vatNumber}. Path param: vatNumber (string). Single address; apiClient returns { data }. */
export interface GetCustomerVatResponse {
  data: CustomerAddress;
}

/** Request body for POST /api/Customer (Save Customer). Match by email. Same shape as Update Profile; not yet used in services/hooks. */
export type PostCustomerPayload = UpdateProfilePayload;

/** Response for POST /api/Customer (Save Customer). 200 returns customer; apiClient returns { data }. Same shape as GET Customer. */
export type PostCustomerResponse = GetCustomerResponse;

/** Address item in POST /api/Profile request body (CustomerAddress). All fields optional for assignability with Address. */
export interface CustomerAddress {
  valid: any;
  id?: string | null;
  name?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  buildingNumber?: string | null;
  postalCode?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  vatNumber?: string | null;
  isCompany?: boolean;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
  hehDepartementId?: number | null;
  b2bRouterId?: string | null;
  b2BRouterIds?: string | null;
}

/** Request body for POST /api/Profile (Update Profile). */
export interface UpdateProfilePayload {
  email: string;
  id?: string | null;
  initials?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  lang?: string | null;
  picture?: string | null;
  phoneNumber?: string | null;
  hasLoggedIn?: boolean | null;
  vatNumber?: string | null;
  companyName?: string | null;
  businessAccount?: boolean | null;
  marketingConsent?: boolean;
  addresses?: CustomerAddress[] | null;
}

/** API response shape for POST /api/Profile. Reuses ProfileInformation for the returned profile. */
export interface UpdateProfileResponse {
  data: ProfileInformation;
}

/** Response shape for DELETE /api/Profile (empty body {} per API doc; 200/401/404). Matches apiClient return { data }. */
export interface DeleteProfileResponse {
  data?: Record<string, never>;
}

/** Query params for POST /api/Profile/address (save address). */
export interface SaveAddressQueryParams {
  /** Validate address; default false. */
  validate?: boolean;
}

/** Request body for POST /api/Profile/address (save address). Per API doc; all fields optional for assignability with Address. */
export interface SaveAddressPayload {
  id?: string | null;
  name?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  buildingNumber?: string | null;
  postalCode?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  vatNumber?: string | null;
  isCompany?: boolean;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
  hehDepartementId?: number;
  b2bRouterId?: number | null;
  b2BRouterIds?: Record<string, unknown> | null;
}

/** Response shape for POST /api/Profile/address. Returns array of addresses; apiClient returns { data }. */
export interface SaveAddressResponse {
  data: CustomerAddress[];
}

/** Response shape for DELETE /api/Profile/address/{id}. Resultant list of addresses; can be [], {} or null. apiClient returns { data }. */
export interface DeleteAddressResponse {
  data: CustomerAddress[] | Record<string, never> | null;
}

/** Order status enum for POST /api/Order/Calculate (request/response). */
export type OrderStatus =
  | "New"
  | "Checkout"
  | "Paid"
  | "Cancelled"
  | "PaidFailed"
  | "Processing"
  | "Backorder"
  | "WaitForPicking"
  | "Picking"
  | "Picked"
  | "WaitForDelivery"
  | "WaitForTransport"
  | "Delivering"
  | "Delivered"
  | "Invoiced"
  | "Returning"
  | "Returned"
  | "Refunded"
  | "PartiallyRefunded"
  | "Failed"
  | "Abandoned";

/** OrderError item (errors array in order payload/response). */
export interface OrderError {
  origin?: string | null;
  itemId?: string | null;
  errorCode?: string | null;
  errorArgs?: unknown;
  message?: string | null;
}

/** OrderItem (items array in order payload/response). */
export interface OrderItem {
  id?: string;
  type?: string;
  quantity?: number;
  partnerId?: string | null;
  name?: string | null;
  description?: string | null;
  image?: string | null;
  serialNumber?: string | null;
  unitPrice?: number | null;
  unitPriceIncVat?: number | null;
  vatPercentage?: number | null;
  discount?: number | null;
  discountPercentage?: number | null;
  remark?: string | null;
  isMatch?: string | null;
  status?: string;
  totalPriceExVat?: number | null;
  totalPriceIncVat?: number | null;
}

/** OrderPayment (payments array in order payload/response). */
export interface OrderPayment {
  ipAddress?: string | null;
  orderId?: string | null;
  paymentId?: string | null;
  price?: number | null;
  currency?: string;
  paymentMethod?: string | null;
  paymentInfo?: string | null;
  paymentMethodId?: string | null;
  status?: string | null;
  isSuccess?: boolean;
  paymentDate?: string | null;
}

/** Tracking item (tracking array in order response). */
export interface OrderTrackingItem {
  trackingId?: string;
  method?: string | null;
  trackUrl?: string | null;
  state?: string;
  deliveryDate?: string | null;
  info?: string | null;
  length?: number | null;
  height?: number | null;
  width?: number | null;
  weight?: number | null;
  cost?: number | null;
  costByCustomer?: boolean;
}

/** Request body for POST /api/Order/Calculate. CustomerAddress3/CustomerModel2 aligned with CustomerAddress/ProfileInformation. */
export interface OrderCalculatePayload {
  billing: CustomerAddress;
  createDate: string;
  customer: ProfileInformation;
  errors?: OrderError[] | null;
  id?: string | null;
  items: OrderItem[];
  metaData?: Record<string, unknown> | null;
  payments?: OrderPayment[];
  shipping: CustomerAddress;
  shippingFee?: number | null;
  shippingMethod?: string | null;
  status: OrderStatus;
  totalPaid?: number | null;
  totalPriceExVat?: number | null;
  totalPriceIncVat?: number | null;
  tracking?: OrderTrackingItem[] | null;
  vinNumber?: string | null;
}

/** Response body for POST /api/Order/Calculate. apiClient returns { data: OrderCalculateResponse }. */
export interface OrderCalculateResponse {
  totalpaid: number | undefined;
  coupon: string | undefined;
  shippingfee: any;
  tax(
    arg0: string,
    gtmItems: GTMItem[],
    arg2: string,
    arg3: any,
    tax: any,
    arg5: any,
    coupon: any,
    arg7: string,
  ): unknown;
  id?: string | null;
  customer?: ProfileInformation;
  shipping?: CustomerAddress;
  billing?: CustomerAddress;
  shippingFee?: number | null;
  shippingMethod?: string | null;
  vinNumber?: string | null;
  items?: OrderItem[];
  payments?: OrderPayment[];
  tracking?: OrderTrackingItem[];
  totalPriceIncVat?: number | null;
  totalPriceExVat?: number | null;
  totalPaid?: number | null;
  errors?: OrderError[] | null;
  createDate?: string;
  status?: OrderStatus;
  metaData?: Record<string, unknown> | null;
}

/** Request for POST /api/Order/VinCheck. */
export type OrderVinCheckPayload = OrderCalculatePayload & {
  vinNumber: string;
};

/** Response for POST /api/Order/VinCheck. */
export type OrderVinCheckResponse = OrderCalculateResponse;

/** Request for POST /api/Vin (part-level PDP check). */
export interface PartVinCheckPayload {
  vinNumber: string;
  partIds: string[];
}

/** Response for POST /api/Vin. */
export interface PartVinCheckResponse {
  vinNumber: string;
  parts: Record<string, "Yes" | "No" | "Maybe">;
}

/** One vehicle from GET /api/Vin/{vinNumber} (VIN → cars search). */
export interface VinCarsSearchCar {
  id: string;
  make?: string;
  model?: string;
  variant?: string;
  body?: string;
  engine?: string;
  engineCode?: string;
  gearBox?: string;
  gearBoxCode?: string;
}

/** Response body for GET /api/Vin/{vinNumber}. */
export interface VinCarsSearchResponse {
  vinNumber: string;
  cars: VinCarsSearchCar[];
}

/** Query params for POST /api/Order/Pay. */
export interface OrderPayQueryParams {
  paymentMethod?: string | null;
  returnUrl?: string | null;
}

/** Request payload for POST /api/Order/Pay. Order body plus optional query fields (returnUrl, paymentMethod). */
export type OrderPayPayload = OrderCalculatePayload & OrderPayQueryParams;

/** Response for POST /api/Order/Pay (checkout URL). apiClient returns { data: OrderPayResponse }. */
export interface OrderPayResponse {
  url: string;
}

/** Path params for GET /api/Order/{orderId}/{email}. */
export interface GetOrderByEmailPathParams {
  orderId: string;
  email: string;
}

/** Query params for GET /api/Order/{orderId} and GET /api/Order/{orderId}/{email}. */
export interface GetOrderQueryParams {
  customerId?: string | null;
  checkStatus?: boolean;
}

/** Response for GET /api/Order/{orderId} and GET /api/Order/{orderId}/{email} (order details). apiClient returns { data: GetOrderResponse }; service returns unwrapped data. */
export type GetOrderResponse = OrderCalculateResponse;

/** Query params for GET /api/Order (order list). */
export interface GetOrdersQueryParams {
  CustomerId?: string | null;
  Email?: string | null;
  ExcludeStatus?: OrderStatus[] | null;
  IncludeStatus?: OrderStatus[] | null;
  StoreId?: string | null;
  Search?: string | null;
  Take?: number | null;
  ContinuationToken?: string | null;
}

/** One order in GET /api/Order list response (data array item). */
export interface GetOrderListItem {
  id?: string | null;
  orderId?: string | null;
  partitionKey?: string | null;
  storeId?: string | null;
  customerId?: string | null;
  isGuestOrder?: boolean | null;
  partnerId?: string | null;
  createDate?: string | null;
  status?: OrderStatus | null;
  customer?: Record<string, unknown> | null;
  lang?: string | null;
  vinNumber?: string | null;
  shippingFee?: number | null;
  shippingFeeExlTax?: number | null;
  shippingMethod?: string | null;
  shippingMethodId?: string | null;
  trackingIds?: unknown;
  tracking?: OrderTrackingItem[] | null;
  invoiceNr?: string | null;
  invoiceDate?: string | null;
  billing?: CustomerAddress | null;
  shipping?: CustomerAddress | null;
  items?: OrderItem[] | null;
  payments?: OrderPayment[] | null;
  mailLogs?: unknown[] | null;
  bcOrderId?: string | null;
  bcSalesId?: string | null;
  heHOrderId?: string | null;
  scOrderId?: string | null;
  b2bInvoiceId?: string | null;
  errors?: OrderError[] | null;
  totalPriceExVat?: number | null;
  totalPriceIncVat?: number | null;
  totalDiscount?: number | null;
  totalPaid?: number | null;
  returnReason?: string | null;
  returnDate?: string | null;
  refund?: OrderPayment | null;
  bcCreditId?: string | null;
}

/** Response for GET /api/Order (order list). apiClient returns { data: GetOrdersResponse }. */
export interface GetOrdersResponse {
  totalCount?: number | null;
  continuationToken?: string | null;
  data: GetOrderListItem[];
}

/** Response for GET /api/Order/{orderId}/invoice. apiClient returns { data: GetOrderInvoiceResponse }; service returns unwrapped data. Shape TBD if API returns URL or blob. */
export type GetOrderInvoiceResponse = unknown;

/** Response for GET /api/Translations/{lang}. Translation key-value map. apiClient returns { data: GetTranslationsResponse }. */
export type GetTranslationsResponse = Record<string, string>;

/** Support message category for POST /api/Support. */
export type SupportCategory =
  | "Billing"
  | "PartQuery"
  | "GuaranteedVinCheck"
  | "OrderIssue"
  | "Account"
  | "Shipping"
  | "Return"
  | "ReturnQuery"
  | "Complaints"
  | "Other";

/** File item in POST /api/Support (files array). */
export interface SupportFileData {
  name: string;
  data: string;
  mimeType: string;
}

/** Request body for POST /api/Support (send support message). */
export interface PostSupportPayload {
  category: SupportCategory;
  email: string;
  files: SupportFileData[] | null;
  firstName: string;
  invoiceNumber: string | null;
  lastName: string;
  message: string | null;
  orderId: string | null;
  vin: string | null;
  source?: string | null;
}

/** Response for POST /api/Support. apiClient returns { data: PostSupportResponse }. */
export interface PostSupportResponse {
  firstName: string;
  lastName: string;
  email: string;
  category: SupportCategory;
  vin: string | null;
  message: string | null;
  files: SupportFileData[];
  orderId: string | null;
  invoiceNumber: string | null;
}

/** Path params for GET /api/Return/{id}/{email}. */
export interface GetReturnByEmailPathParams {
  id: string;
  email: string;
}

/** Query params for GET /api/Return/{id} and GET /api/Return/{id}/{email}. */
export interface GetReturnQueryParams {
  createNew?: boolean;
}

/** Item in GET /api/Return/{id} response (items array). */
export interface GetReturnResponseItem {
  id?: string | null;
  partId?: string | null;
  name?: string | null;
  description?: string | null;
  image?: string | null;
  price?: number | null;
  reason?: string | null;
  comment?: string | null;
  files?: SupportFileData[] | null;
}

/** Response for GET /api/Return/{id} and GET /api/Return/{id}/{email}. apiClient returns { data: GetReturnResponse }; service returns full response. */
export interface GetReturnResponse {
  createDate?: string | null;
  status?: string | null;
  id?: string | null;
  orderId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  message?: string | null;
  customerId?: string | null;
  accountName?: string | null;
  iban?: string | null;
  totalPrice?: number | null;
  items?: GetReturnResponseItem[] | null;
}

/** Request body for POST /api/Return (commit return). Items use same shape as GetReturnResponseItem. */
export interface PostReturnPayload {
  accountName?: string | null;
  customerId?: string | null;
  email?: string | null;
  firstName?: string | null;
  iban?: string | null;
  id?: string | null;
  items?: GetReturnResponseItem[] | null;
  lastName?: string | null;
  message?: string | null;
  orderId?: string | null;
  totalPrice?: number | null;
}

/** Response for GET /api/Stock/{id}. apiClient returns { data: GetStockByIdResponse }; service returns full response. */
export interface GetStockByIdResponse {
  id?: string | null;
  stock?: number;
  availability?: string | null;
  deliveryTime?: string | null;
}

/** SEO block for GET /api/Parts/{id} response. */
export interface PartSeo {
  name?: string | null;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  schema?: string | null;
}

/** Linked item in GET /api/Parts/{id} response (linkedItems array). */
export interface PartLinkedItem {
  id?: string | null;
  name?: string | null;
  type?: string;
  quantity?: number;
  priceExclVat?: number | null;
  priceInclVat?: number | null;
  pricesInclVat?: unknown;
  title?: Record<string, string>;
}

/** Response for GET /api/Parts/{id}. apiClient returns { data: GetPartByIdResponse }. */
export interface GetPartByIdResponse {
  id?: string | null;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  fullDescription?: string | null;
  manufacturerId?: string | null;
  manufacturer?: string | null;
  oeReference?: string | null;
  eanCode?: string | null;
  seo?: PartSeo | null;
  images?: unknown;
  priceExclVat?: number;
  priceInclVat?: number;
  recommendedPriceExlVat?: number | null;
  recommendedPriceInclVat?: number | null;
  linkedItems?: PartLinkedItem[] | null;
  categories?: string[] | null;
  availability?: string | null;
  shippingDelivery?: boolean;
  shippingPickup?: boolean;
  shippingWarehouse?: boolean;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  weight?: number | null;
  priority?: number | null;
}

/** Request body for POST /api/Parts (search/filter parts). */
export interface PostPartsSearchPayload {
  availability?: string[] | null;
  /** New-MME Cars API id(s) — real Parts filter field (see `hooks/products.ts`). */
  carIds?: string[] | null;
  categoryId?: string | null;
  continuationToken?: string | null;
  country?: string | null;
  language?: number | null;
  makeModelTypeId?: string | null;
  manufacturerIds?: string[] | null;
  maxPrice?: number | null;
  minPrice?: number | null;
  name?: string | null;
  oeReference?: string | null;
  order?: string | null;
  search?: string | null;
  take?: number | null;
  type?: string | null;
  vendorId?: string | null;
}

/** Response for POST /api/Parts (search). apiClient returns { data: PostPartsSearchResponse }. */
export interface PostPartsSearchResponse {
  parts: GetPartByIdResponse[];
  minPrice?: number | null;
  maxPrice?: number | null;
  totalCount: number;
  continuationToken?: string | null;
}

/** One item from GET /api/Parts/oeref/{input} response (array element). */
export interface GetPartsByOeRefResponseItem {
  id: string;
  oeRef?: string;
  brand?: string;
  text?: string;
  name: string;
  title?: Record<string, string>;
}

/** Response for GET /api/Parts/oeref/{input}. apiClient returns { data: GetPartsByOeRefResponse }. */
export type GetPartsByOeRefResponse = GetPartsByOeRefResponseItem[];

/** One item from GET /api/MakeModelType/brands (and models/engines; engines may have fuel). */
export interface MakeModelTypeBrandItem {
  id: string;
  brand: string | null;
  model: string | null;
  type: string | null;
  engine: string | null;
  yearFrom: string | null;
  yearTo: string | null;
  image: string | null;
  children: (MakeModelTypeBrandItem | null)[];
  sortIdx: number;
  /** Present on engine items for grouping. */
  fuel?: string | null;
}

/** API response shape for GET /api/MakeModelType/brands. Matches apiClient return type ({ data }). */
export interface BrandData {
  id: string;
  name: string;
  type: "AMS" | "OEM" | "OES"; // based on your data
  image?: string; // optional
}

export interface GetBranddataByManufacturerResponse {
  data: BrandData;
}

/** API response shape for GET /api/MakeModelType/models/{mmtId}. Same item shape as brands. */
export interface GetModelsResponse {
  data: MakeModelTypeBrandItem[];
}

/** API response shape for GET /api/MakeModelType/engines/{mmtId}. Same item shape as brands. */
export interface GetEnginesResponse {
  data: MakeModelTypeBrandItem[];
}

/** One item from GET /api/MakeModelType/types/{mmtId}. Same item shape as brands. */
export interface GetBrandsResponse {
  data: MakeModelTypeBrandItem[];
}

/** One item from GET /api/Garage (saved car in garage). */
export interface GarageItem {
  brandId: string | null;
  brandName: string | null;
  modelId: string | null;
  modelName: string | null;
  typeId: string | null;
  typeName: string | null;
  engineId: string | null;
  engineName: string | null;
  fuel: string | null;
  engineSize: string | null;
  powerHp: string | null;
  doors: string | null;
  seats: string | null;
  body: string | null;
  variant: string | null;
  id: string | null;
  name: string | null;
  year: string | null;
  picture: string | null;
  vin: string | null;
  /** Cars API id (new MME — same role as session car id for guests). */
  carId: string | null;
  makeModelTypeId: string | null;
  gearBox: string | null;
  isFavorite: boolean;
  isNew: boolean;
  lastUsed: string | null;
  /** Optional UI/legacy aliases (e.g. powerHp → hp, engineSize → cc, body → frame). */
  hp?: string | null;
  cc?: string | null;
  frame?: string | null;
}

/** API response shape for GET /api/Garage. Matches apiClient return type ({ data }). */
export interface GetGarageResponse {
  data: GarageItem[];
}

/** API response shape for GET /api/Garage/{id}. Single garage car. */
export interface GetGarageCarResponse {
  data: GarageItem;
}

/** Response type for DELETE /api/Garage/{id}. Path param: id (string). Typically 204 No Content. */
export type DeleteGarageCarResponse = void;

/** Request body for POST /api/Garage (add/update car). Query param allowDuplicate?: boolean. */
export interface PostGaragePayload {
  id?: string | null;
  /** Cars API id — required for new MME add/update. */
  carId?: string | null;
  isFavorite?: boolean;
  isNew?: boolean;
  lastUsed?: string | null;
  makeModelTypeId?: string | null;
  name?: string | null;
  picture?: string | null;
  vin?: string | null;
  year?: number | null;
}

/**
 * Category model based on CategoryModel / CategoryModel2
 * from next/apitypes/types.md.
 */
export interface Category {
  id?: string;
  parentId?: string;
  name?: string | null;
  displayOrder?: number;
  titles?: { [key: string]: string } | null;
  descriptions?: { [key: string]: string } | null;
  children?: Category[] | null;
}

/** Response payload for GET /api/Config. apiClient returns { data: GetConfigResponse }. */
export interface GetConfigResponse {
  countries: Record<string, unknown> | null;
  languages: Record<string, unknown> | null;
  defaults: unknown | null;
  supportCategories: string[];
  returnReasons: string[];
  vats: unknown | null;
  numberOfFaq: number;
}
