export interface CarMake {
  id: string;
  name: string;
  models: {
    id: string;
    name: string;
    years: {
      [year: number]: {
        types: string[];
      };
    };
  }[];
}

export const carMakes: CarMake[] = [
  {
    id: "101100",
    name: "Alfa Romeo",
    models: [
      {
        id: "giulia",
        name: "Giulia",
        years: {
          2020: {
            types: ["GT", "Super", "Veloce"],
          },
          2021: {
            types: ["GT", "Super", "Spider", "Veloce"],
          },
          2022: {
            types: ["GT", "Super", "Spider", "Quadrifoglio"],
          },
          2023: {
            types: ["GT", "Super", "Spider", "Quadrifoglio", "Competizione"],
          },
        },
      },
      {
        id: "100000",
        name: "Stelvio",
        years: {
          2021: {
            types: ["Sport", "Ti"],
          },
          2022: {
            types: ["Sport", "Ti", "Quadrifoglio"],
          },
          2023: {
            types: ["Sport", "Ti", "Veloce", "Quadrifoglio"],
          },
        },
      },
    ],
  },
  {
    id: "bmw",
    name: "BMW",
    models: [
      {
        id: "3-series",
        name: "3 Series",
        years: {
          2021: {
            types: ["330i", "M340i", "M3"],
          },
          2022: {
            types: ["330i", "M340i", "M3", "M3 Competition"],
          },
          2023: {
            types: ["330i", "M340i", "M3", "M3 Competition", "M3 CS"],
          },
        },
      },
      {
        id: "5-series",
        name: "5 Series",
        years: {
          2021: {
            types: ["530i", "540i", "M5"],
          },
          2022: {
            types: ["530i", "540i", "M5", "M5 Competition"],
          },
          2023: {
            types: ["530i", "540i", "M5", "M5 Competition", "M5 CS"],
          },
        },
      },
    ],
  },
];

// Updated utility functions
export const getModelsByMake = (makeName: string): any[] => {
  const make = carMakes.find((make) => make.name.toLowerCase() === makeName.toLowerCase());

  if (!make) return [];

  return make.models?.map((model) => model.name);
};

export const getYearsByModel = (makeName: string, modelName: string): any[] => {
  const make = carMakes.find((make) => make.name.toLowerCase() === makeName.toLowerCase());

  if (!make) return [];

  const model = make.models.find((model) => model.name.toLowerCase() === modelName.toLowerCase());

  return model ? Object.keys(model.years)?.map(Number) : [];
};

export const getTypesByModelYear = (makeName: string, modelName: string, year: number): any[] => {
  const make = carMakes.find((make) => make.name.toLowerCase() === makeName.toLowerCase());

  if (!make) return [];

  const model = make.models.find((model) => model.name.toLowerCase() === modelName.toLowerCase());

  if (!model || !model.years[year]) return [];

  return model.years[year].types;
};
