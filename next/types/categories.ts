export interface PartsCategoryInterface {
  descriptions?: Record<string, string>;
  id: string;
  parentId: string;
  name: string;
  displayOrder?: number;
  titles: {
    [languageCode: string]: string;
  };
  children?: PartsCategoryInterface[];
}

export interface CategoryFAQ {
  id: string;
  order: number;
  lang: string;
  question: string;
  answer: string;
}

export interface CategoryNode {
  id: string;
  parentId: string;
  fullDescriptions?: Record<string, string>;
  name: string;
  displayOrder: number;
  titles: Record<string, string>;
  descriptions?: Record<string, string>;
  slugs: Record<string, string>;
  children?: CategoryNode[];
  faq?: CategoryFAQ[];
}
