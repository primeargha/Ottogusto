export interface Address {
  id?: string | undefined;
  name?: string | undefined;
  street: string | undefined;
  city: string | undefined;
  postalCode: string | undefined;
  state: string | undefined;
  country: string | undefined;
  phoneNumber?: string | undefined;
  isDefaultBilling: boolean | undefined;
  isDefaultShipping: boolean | undefined;
  houseNumber?: string | undefined;
  buildingNumber?: string | undefined;
  isCompany?: boolean | undefined;
  companyName?: string | undefined;
  vatNumber?: string | undefined;
  email?: string | undefined;
  valid?: boolean | undefined;
  shippingMethod?: string | undefined;
}

export type ProfileUpdatePayload = import("@/type").UpdateProfilePayload;
