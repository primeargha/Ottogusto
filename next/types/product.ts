export interface ProductDoc {
  order: number;
  name: string;
  url: string;
}

export interface Product {
  id: string | number;
  name: string;
  description: string;
  oeReference: string | null;
  priceInclVat: number;
  priceExclVat: number;
  fullDescription: string;
  images: string[];
  title: string;
  seo?: {
    name: string;
    title: string;
    description: string;
    keywords: string;
  };
  manufacturer: string;
  categories: string[];
  availability: string;
  shippingDelivery: boolean;
  shippingPickup: boolean;
  shippingWarehouse: boolean;
  docs?: ProductDoc[];
}

export type ViewMode = "grid" | "list";
