import { create } from "zustand";

interface Car {
  id: string;
  name?: string;
  info?: string;
  picture?: string;
  makeModelTypeId?: string;
  isNew: boolean;
  make?: string;
  model?: string;
  type?: string;
  year: number;
  vin: string;
  isFavorite: boolean;
}

interface SavedCarsState {
  savedCarsData: Car[];
  toggleFavorite: (vin: string) => void;
}

export const useSavedCarsStore = create<SavedCarsState>((set) => ({
  savedCarsData: [
    {
      id: "00g00000000000",
      name: "Renault",
      info: "A Renault SEDAN",
      year: 2024,
      picture: "",
      makeModelTypeId: "Renault",
      vin: "1HGCM82633A123456",
      isFavorite: true,
      isNew: false,
      make: "Renault",
      model: "SEDAN",
      type: "2.0L",
    },
    {
      id: "01300000000000",
      name: "AUDI A4",
      info: "2.0L TDI Quattra/Diesel/CGLC",
      year: 2022,
      picture: "",
      makeModelTypeId: "audi-a4",
      vin: "1HGCM82633A123456",
      isFavorite: false,
      isNew: false,
      make: "AUDI A4",
      model: "SEDAN",
      type: "2.0L",
    },
    {
      id: "00e00000000000",
      name: "BMW 2.0L",
      info: "2.0L Car",
      year: 2023,
      vin: "1HGCM82633A123478",
      isFavorite: false,
      isNew: true,
      make: "BMW",
      model: "2.0L Car",
      type: "2.0L",
    },
    {
      id: "00g00000000000",
      name: "Renault",
      info: "A Renault SEDAN",
      year: 2024,
      picture: "",
      makeModelTypeId: "Renault",
      vin: "1HGCM82633A123456",
      isFavorite: false,
      isNew: false,
      make: "Renault",
      model: "SEDAN",
      type: "2.0L",
    },
    {
      id: "01300000000000",
      name: "AUDI A4",
      info: "2.0L TDI Quattra/Diesel/CGLC",
      year: 2022,
      picture: "",
      makeModelTypeId: "audi-a4",
      vin: "1HGCM82633A123456",
      isFavorite: false,
      isNew: false,
      make: "AUDI A4",
      model: "Quattra/Diesel/CGLC",
      type: "2.0L",
    },
  ],

  toggleFavorite: (vin: string) =>
    set((state) => ({
      savedCarsData: state.savedCarsData?.map((car) => ({
        ...car,
        isFavorite: car.vin === vin, // Set clicked car as true, all others false
      })),
    })),
}));
