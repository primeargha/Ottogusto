interface CarInterface {
  make: { key: string; value: string } | null;
  model: { key: string; value: string } | null;
  year: { key: string; value: string | number } | null;
  type: { key: string; value: string } | null;
  VIN?: string;
  isFavorite?: boolean;
}

interface SavedCarInterface {
  brandId?: string;
  brandName?: string;
  fuel?: string;
  id: string;
  isFavorite?: boolean;
  isNew?: boolean;
  makeModelTypeId?: string;
  modelId?: string;
  modelName?: string;
  powerHp?: string;
  typeId?: string;
  typeName?: string;
  year?: string;
}

interface LocaleInterface {
  country_code: string;
  language: string;
  locale: string;
}
export const Paymentstatusoptions = [
  "New",
  "Checkout",
  "Paid",
  "Processing",
  "WaitForPicking",
  "Failed",
];
export const allpaymentStatus = {
  New: "Processing",
  Checkout: "Processing",
  Paid: "Processing",
  Processing: "Processing",
  Backorder: "Backorder",
  WaitForPicking: "Processing",
  Picking: "Processing",
  Picked: "Processing",
  WaitForDelivery: "In Transit",
  Delivering: "In Transit",
  Delivered: "Delivered",
  "Return Created": "Created",
  "Return Approved(Shpping Cost paid by Customer)": "Approved",
  "Return Approved(Shpping Cost paid by CP2 )": "Approved",
  "Return Initiated": "Approved",
  "Return Rejected": "Rejected",
  "Refund Approved": "Delivered",
  "Refund Initiated": "Delivered",
  "Refund Completed": "Refund Processed",
  "Refund Rejected": "Rejected",
  Returning: "Returning",
  Returned: "Returned",
  Refunded: "Refunded",
  PartiallyRefunded: "Partially Refunded",
  Failed: "Processing",
  Abandoned: "Abandoned",
};
export type PlaceholderMap = {
  [placeholder: string]: React.ReactNode;
};
export type { CarInterface, LocaleInterface, SavedCarInterface };
