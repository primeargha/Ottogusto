"use client";

import Typography from "@/components/og-components/Typography";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuthStore } from "@/stores/useAuthStore"; // Assuming you have an auth hook
import { useParams, useRouter } from "next/navigation";

// Test array of saved cars with the requested fields
export const testSavedCars = [
  {
    id: "car1",
    make: "Tesla",
    model: "Model S",
    type: "Electric Sedan",
    year: 2023,
    vin: "5YJ3E1EA1PF123456",
    image: "https://example.com/tesla-model-s.jpg",
  },
  {
    id: "car2",
    make: "BMW",
    model: "i4",
    type: "Electric Sedan",
    year: 2022,
    vin: "WBA53BP08NCJ12345",
    image: "https://example.com/bmw-i4.jpg",
  },
  {
    id: "car3",
    make: "Ford",
    model: "Mustang Mach-E",
    type: "Electric SUV",
    year: 2023,
    vin: "3FMTK1RM3NMA12345",
    image: "https://example.com/mustang-mach-e.jpg",
  },
  {
    id: "car4",
    make: "Rivian",
    model: "R1T",
    type: "Electric Pickup",
    year: 2022,
    vin: "7FTTW0E13N8A12345",
    image: "https://example.com/rivian-r1t.jpg",
  },
  {
    id: "car5",
    make: "Hyundai",
    model: "IONIQ 5",
    type: "Electric Crossover",
    year: 2023,
    vin: "KMHLB3AB1PA12345",
    image: "https://example.com/ioniq-5.jpg",
  },
];

export default function SavedCarEBPanel() {
  const router = useRouter();
  const params = useParams();
  const { getLabel } = useBranding();
  // In a real app, you would get this from your auth context
  // const { user } = useAuth();
  // const savedCars = user?.savedCars || [];

  // Using our test data instead
  const savedCars = testSavedCars;

  const handleViewSavedCars = () => {
    if (params && typeof params["language-country"] === "string") {
      router.push(`${Routes.mySavedCars(params["language-country"])}`);
    }
    // router.push("/garage-bay/my-saved-cars");
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg md:p-8">
      <Typography type="h2" className="mb-4 text-2xl font-bold">
        {getLabel("your_garage")}
      </Typography>

      <div className="mb-6">
        <p className="mb-2 text-gray-600">
          {getLabel("you_have")} {savedCars.length} {getLabel("saved")}{" "}
          {savedCars.length === 1 ? "car" : "cars"} {getLabel("in_your_garage")}.
        </p>
      </div>

      {/* Preview of saved cars */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {savedCars.slice(0, 3)?.map((car) => (
          <div
            key={car.id}
            className="cursor-pointer rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            onClick={handleViewSavedCars}
          >
            {/* Car image if available */}
            {car.image && (
              <div className="mb-3 h-32 overflow-hidden rounded-md bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={car.image}
                  alt={`${car.make} ${car.model}`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <Typography type="h3" className="text-lg font-semibold">
              {car.make} {car.model}
            </Typography>
            <div className="mt-2 space-y-1 text-gray-600">
              <p>
                {car.year} • {car.type}
              </p>
              <p className="text-sm">
                {getLabel("Vin")}: {car.vin.slice(-6)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* View all saved cars button */}
      <button
        onClick={handleViewSavedCars}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 md:w-auto"
      >
        {getLabel("view_all_saved_cars")}
      </button>
    </div>
  );
}
