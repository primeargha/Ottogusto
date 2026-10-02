/**
 * TypeScript types for Ottogusto APIs based on OpenAPI specification.
 */

export enum ArticleType {
  Part = "Part",
  Deposit = "Deposit",
  Bundle = "Bundle",
}

export enum OrderStatus {
  New = "New",
  Checkout = "Checkout",
  Paid = "Paid",
  PaidFailed = "PaidFailed",
  Processing = "Processing",
  Backorder = "Backorder",
  WaitForPicking = "WaitForPicking",
  Picking = "Picking",
  Picked = "Picked",
  WaitForDelivery = "WaitForDelivery",
  WaitForTransport = "WaitForTransport",
  Delivering = "Delivering",
  Delivered = "Delivered",
  Invoiced = "Invoiced",
  Returning = "Returning",
  Returned = "Returned",
  Refunded = "Refunded",
  PartiallyRefunded = "PartiallyRefunded",
  Failed = "Failed",
  Abandoned = "Abandoned",
}

export enum OrderItemStatus {
  Processing = "Processing",
  Picked = "Picked",
  Backorder = "Backorder",
  NotAvailable = "NotAvailable",
  Error = "Error",
  Delivered = "Delivered",
  Returning = "Returning",
  Returned = "Returned",
  Refunded = "Refunded",
}

export enum TrackingState {
  Announced = "Announced",
  Delivered = "Delivered",
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

export interface CategoryModel {
  id: string;
  parentId: string;
  name?: string | null;
  displayOrder: number;
  titles?: Record<string, string> | null;
  descriptions?: Record<string, string> | null;
  children?: CategoryModel[] | null;
}

export interface CategoryModel2 {
  id: string;
  parentId: string;
  name?: string | null;
  displayOrder: number;
  titles?: Record<string, string> | null;
  descriptions?: Record<string, string> | null;
  children?: CategoryModel[] | null;
}

export interface StoreConfigModel {
  countries?: Record<string, string> | null;
  languages?: Record<string, string> | null;
  defaults?: Record<string, string> | null;
  supportCategories?: string[] | null;
  returnReasons?: string[] | null;
  vats?: Record<string, number> | null;
  numberOfFaq: number;
}

export interface CustomerAddress {
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
  isCompany: boolean;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
  hehDepartementId: number;
  b2bRouterId?: number | null;
  b2BRouterIds?: Record<string, number> | null;
}

export interface CustomerAddress2 {
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
  isCompany: boolean;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
  hehDepartementId: number;
  b2bRouterId?: number | null;
  b2BRouterIds?: Record<string, number> | null;
}

export interface CustomerModel {
  id?: string | null;
  email: string;
  initials?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  marketingConsent: boolean;
  lang?: string | null;
  picture?: string | null;
  phoneNumber?: string | null;
  hasLoggedIn?: boolean | null;
  vatNumber?: string | null;
  companyName?: string | null;
  businessAccount?: boolean | null;
  addresses?: CustomerAddress[] | null;
}

export interface CustomerModel2 {
  id?: string | null;
  email: string;
  initials?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  marketingConsent: boolean;
  lang?: string | null;
  picture?: string | null;
  phoneNumber?: string | null;
  hasLoggedIn?: boolean | null;
  vatNumber?: string | null;
  companyName?: string | null;
  businessAccount?: boolean | null;
  addresses?: CustomerAddress[] | null;
}

export interface OrderItem {
  id: string;
  type?: ArticleType;
  quantity: number;
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
  status?: OrderItemStatus;
  totalPriceExVat?: number | null;
  totalPriceIncVat?: number | null;
}

export interface OrderPayment {
  ipAddress?: string | null;
  orderId?: string | null;
  paymentId?: string | null;
  price?: number | null;
  currency: string;
  paymentMethod?: string | null;
  paymentInfo?: string | null;
  paymentMethodId?: number | null;
  status?: string | null;
  isSuccess: boolean;
  paymentDate?: string | null;
}

export interface TrackingInfo {
  trackingId: string;
  method?: string | null;
  trackUrl?: string | null;
  state?: TrackingState;
  deliveryDate?: string | null;
  info?: string | null;
  length?: number | null;
  height?: number | null;
  width?: number | null;
  weight?: number | null;
  cost?: number | null;
  costByCustomer: boolean;
}

export interface OrderError {
  origin?: string | null;
  itemId?: string | null;
  errorCode?: string | null;
  errorArgs?: string | null;
  message?: string | null;
}

export interface OrderModel {
  id?: string | null;
  customer?: CustomerModel2 | null;
  shipping?: CustomerAddress | null;
  billing?: CustomerAddress | null;
  shippingFee?: number | null;
  shippingMethod?: string | null;
  vinNumber?: string | null;
  items?: OrderItem[] | null;
  payments?: OrderPayment[] | null;
  tracking?: TrackingInfo[] | null;
  totalPriceIncVat?: number | null;
  totalPriceExVat?: number | null;
  totalPaid?: number | null;
  errors?: OrderError[] | null;
  createDate: string;
  status?: OrderStatus;
  metaData?: Record<string, string> | null;
}
