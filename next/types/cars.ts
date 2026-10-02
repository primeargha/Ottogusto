interface TecDocInfo {
  manuId: number;
  modelId?: number;
  autoCreate: boolean;
}

interface CarItem {
  id: string;
  partitionKey: string;
  normalizedName: string;
  brandNr: number;
  brandId: string;
  brandName: string;
  modelNr: number;
  modelId: string;
  modelName: string;
  typeNr: number;
  typeId: string;
  typeName: string;
  engineName?: string;
  year: number;
  level: number;
  partsCount: number;
  powerHp: number;
  powerKw: number;
  cylinders: number;
  cylinderCapacity: number;
  engine: string;
  tecDoc: TecDocInfo;
  popularityIndex: number;
  makemodelType?: string;
  yearmerged?: boolean;
  yearStart?: number;
  yearEnd?: number;
  isMatching?: boolean;
  versionName?: string;
  image?: string;
  /** Pre-formatted row label for Cars API PDP compatibility rows. */
  displayLine?: string;
  body?: string;
  variant?: string;
  engineCode?: string;
  gearBox?: string;
  gearBoxCode?: string;
}

interface CarBrand {
  brandId: string;
  brandName: string;
  items: CarItem[];
  makemodelType?: string;
  year?: number;
  isSaved?: boolean;
}

export type { CarBrand, CarItem, TecDocInfo };
