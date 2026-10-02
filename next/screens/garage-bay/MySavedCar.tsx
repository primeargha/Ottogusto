"use client";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import type { GarageItem } from "@/type";
import { useGetCarByIdQuery } from "@/hooks/garage";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import CarDetailView from "./CarDetailView";
import CarDetailsMobileView from "./CarDetailsMobileView";
import { useBranding } from "@/contexts/BrandingContext";
// import formatEditSearchData from "@/utils/formatEditSearchData";
// import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import useRouter from "@unitools/router";
import { useParams } from "next/navigation";
import { useMmeStore } from "@/stores/useMmeStore";
import MMESearchModal from "@/components/MMESearchModal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export default function MySavedCar({ cardId }: { cardId: string }) {
  const { setSelectedCar, selectedCar } = useSelectedCarStore();
  const { data: carData, isPending } = useGetCarByIdQuery(cardId);
  const { getLabel } = useBranding();
  const params = useParams();
  const router = useRouter();
  const {
    setSearchMode,
    openMmeModal,
    setMmeModalStep,
    setIsEB,
    setEbMode,
    generateMmeSearchData,
  } = useMmeStore();
  const queryClient = useQueryClient();

  const handleEdit = async (car: GarageItem) => {
    // new start here ---------------------

    setSelectedCar(car);

    // 1. pre populate searchData in useMmeStore using makeModelTypeId

    // 2. Open the MME modal at step 1, searchMode = "manually"
    setSearchMode("manually");
    openMmeModal(1);

    // 3. Set isEB to true
    setIsEB(true);

    // 4. set isEBMode to "edit"
    setEbMode("edit");

    if (car.makeModelTypeId) {
      await generateMmeSearchData(car?.makeModelTypeId);
    }

    // end here -------------------

    // const { getRouteLocaleString } = await import("@/helpers/UtilityHelper");
    // const { Routes } = await import("@/config/routes");
    // const sData = await formatEditSearchData(car);

    // setSearchData(sData);
    // debugger;
    // setNewSearchData({
    //   ...sData,
    //   id: car?.id,
    //   cc: searchData?.cc || "",
    //   fuel: searchData?.fuel || "",
    //   hp: searchData?.hp || "",
    //   body: car?.body || "",
    //   doors: car?.doors || "",
    //   variant: car?.variant || "",
    // });

    // router.push(`${getRouteLocaleString(Routes.search, params)}manually/?step=1&carId=${car?.id}`);
    // setIsEB(true);
    // setEbMode("edit");

    // openModal();
  };

  const refreshSavedCars = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
  };

  if (isPending) {
    return <div className="">{getLabel("loading")}...</div>;
  }
  return (
    <Box className="max-h-[calc(100vh-20px)] w-full overflow-hidden">
      {carData?.data ? (
        <CarDetailsMobileView car={carData?.data} handleEdit={handleEdit} />
      ) : (
        <Box className="flex h-64 items-center justify-center rounded-lg bg-gray-50 p-6">
          <p className="text-gray-500">{getLabel("select_car")}</p>
        </Box>
      )}
      <MMESearchModal refetch={refreshSavedCars} />
    </Box>
  );
}
