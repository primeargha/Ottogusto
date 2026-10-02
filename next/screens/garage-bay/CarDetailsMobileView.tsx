import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  useAddUpdateMyCarsToEB,
  useDeleteCarFromEB,
  useGetCarByIdQuery,
  useGetMySavedCarsQuery,
} from "@/hooks/garage";
import Image from "next/image";
import FinalStepCar from "@/assets/search/final-step-car.png";
import CarImage from "@/assets/eb-panel/eb-panel-bg-image.png";
import { Box } from "@/components/ui/box";
import { Input } from "@/components/ui/input";
import EditPencilIcon from "@/assets/eb-panel/pencil-car-name-edit-icon.svg";
import { Pressable } from "@/components/ui/pressable";
import { garageBayIcons, loggedInUserOGSearchIcons } from "@/constants";
import { useParams, useRouter } from "next/navigation";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import { useBranding } from "@/contexts/BrandingContext";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import DeleteCarIcon from "@/assets/eb-panel/delete-car-icon.svg";
import FavoriteCarIcon from "@/assets/eb-panel/fav-car-icon.svg";
import FavoriteStarIcon from "@/assets/eb-panel/fav-star-icon.svg";
import ChangeNameIcon from "@/assets/eb-panel/change-name-icon.svg";
import AdvancedSearchIcon from "@/assets/search/ad-search.svg";
import CancelSquare from "@/assets/search/cancel-square.svg";
import { useImageUpload } from "@/utils/useImageUpload";
import Modal from "@/components/Modal";
import { useModalStore } from "@/stores/useModalStore";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useMmeStore } from "@/stores/useMmeStore";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useMedia } from "@/hooks/useMedia";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import type { GarageItem } from "@/type";
import PreviousSearchContainer from "../landing/previous-search-container";

const MenuItem = ({
  id,
  item,
  onClose,
  handleEditAddress,
  handleDeleteAddress,
  setNameMode,
  openDeleteModal,
  carNameInpRef,
}: {
  id: string;
  item: GarageItem;
  onClose: () => void;
  handleEditAddress?: () => void;
  handleDeleteAddress?: () => void;
  setNameMode: (mode: string) => void;
  openDeleteModal: () => void;
  carNameInpRef?: React.RefObject<HTMLInputElement | null>;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getLabel } = useBranding();
  const { setSelectedCar } = useSelectedCarStore();
  const { mutate: updateMyCarsToEB, isPending: isUpdatingMyCarsToEB } = useAddUpdateMyCarsToEB({
    onSuccess: (data: any) => {
      onClose();
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
      setSelectedCar(data?.data?.[0] ?? null);
    },
    onError: (error: any) => {
      console.error("Error adding car to EB: ", error);
    },
  });

  const handleFavouriteCar = () => {
    const isFavorite = item?.isFavorite;
    if (!isFavorite) {
      updateMyCarsToEB({
        id: id,
        isFavorite: true,
      });
    } else {
      updateMyCarsToEB({
        id: id,
        isFavorite: false,
      });
    }
  };

  return (
    <Box className={`absolute left-0 top-12 z-[200] rounded-[4px] bg-[--Text-White] shadow-md`}>
      <Pressable
        onPress={handleFavouriteCar}
        className="flex w-[220px] flex-col justify-start gap-1 rounded-none hover:bg-[--hover-green-color]"
      >
        <Box className="flex flex-row items-center gap-2 px-[15px] py-[14px]">
          <Image src={FavoriteCarIcon} height={20} width={20} alt="modify address" />
          <Box className="text-[14px] font-normal leading-[18px] text-color-primary-main md:text-[16px] lg:text-[16px] xl:text-[16px]">
            {item?.isFavorite ? getLabel("remove_favorite_btn") : getLabel("select_favorite_btn")}
          </Box>
        </Box>
      </Pressable>
      <Pressable
        onPress={() => {
          setNameMode("edit");
          onClose();
          // Give time for the browser to apply the enabled state
          setTimeout(() => {
            carNameInpRef?.current?.focus();
            // carNameInpRef.current.setSelectionRange(0, 0); // Move cursor to start
          }, 0);
        }}
        className="flex w-[220px] flex-col justify-start gap-1 rounded-none hover:bg-[--hover-green-color]"
      >
        <Box className="flex flex-row items-center gap-2 px-[15px] py-[14px]">
          <Image src={ChangeNameIcon} height={20} width={20} alt="change name" />
          <Box className="text-[14px] font-normal leading-[18px] text-color-primary-main md:text-[16px] lg:text-[16px] xl:text-[16px]">
            {getLabel("change_name_of_car_btn")}
          </Box>
        </Box>
      </Pressable>
      <Pressable
        onPress={() => {
          onClose();
          openDeleteModal();
        }}
        className="flex w-[220px] flex-col justify-start gap-2 rounded-none hover:bg-[--hover-green-color]"
      >
        <Box className="flex flex-row items-center gap-2 px-[15px] py-[14px]">
          <Image src={DeleteCarIcon} height={20} width={20} alt="delete" />
          <Box className="text-[14px] font-normal leading-[18px] text-color-primary-main md:text-[16px] lg:text-[16px] xl:text-[16px]">
            {getLabel("delete_car_btn")}
          </Box>
        </Box>
      </Pressable>
    </Box>
  );
};

// Car Detail Component
export default function CarDetailsMobileView({
  car,
  handleEdit,
}: {
  car: GarageItem | null;
  handleEdit: (car: GarageItem) => void;
}) {
  const router = useRouter();
  const params = useParams();
  const isMobile = useMedia("(max-width: 639px)");
  const carNameInpRef = useRef<HTMLInputElement | null>(null);
  const [openMenu, setOpenMenu] = useState(false);

  // Check if engine_trim feature flag is enabled
  const isEngineTrimEnabled = getClientFeatureFlag("engine_trim_feature_flag");
  const { selectedCar, setSelectedCar } = useSelectedCarStore();
  const { generateMmeSearchData } = useMmeStore();
  const { isOpen, openModal, closeModal } = useModalStore();
  const {
    setSearchData,
    setSearchMode,
    setCurrentStep,
    searchData,
    setOgSearchModalContent,
    setIsOgSearch,
    openOgSearchModal,
  } = useSearchModalStore();
  const { data: carData, isPending } = useGetCarByIdQuery(car?.id ?? "");
  const { getLabel } = useBranding();
  const queryClient = useQueryClient();
  const { isUploading, triggerImageUpload } = useImageUpload();
  const [nameMode, setNameMode] = useState("view");
  const [name, setName] = useState(carData?.data?.name || "");
  const { openAdvSearch } = useAdvancedSearchStore();
  const newSearchModalStore = useNewSearchModalStore();
  const clearSelectedCategories = useCategorySearchStore((s) => s.clearSelectedCategories);

  // Sets searchData if Advanced Search is clicked
  const [isAdvancedSearchClicked, setIsAdvancedSearchClicked] = useState(false);
  const { mutate: updateMyCarsToEB, isPending: isUpdatingMyCarsToEB } = useAddUpdateMyCarsToEB({
    onSuccess: (data: any) => {
      // TODO: show success message
      // closeModal();
      // resetSearch();
      setNameMode("view");
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
      setSelectedCar(data?.data?.[0] ?? null);
    },
    onError: (error: any) => {
      console.error("Error adding car to EB: ", error);
    },
  });

  // First useEffect to fetch and set localSearchData when advanced search is triggered
  useEffect(() => {
    if (!isAdvancedSearchClicked) return;

    (async () => {
      try {
        // populate searchData using carData?.data?.makeModelTypeId
        if (carData?.data?.makeModelTypeId) {
          try {
            // Generate MME search data from the makeModelTypeId
            await generateMmeSearchData(carData.data.makeModelTypeId);
          } catch (error) {
            console.error("❌ Error populating MME search data:", error);
          }
        }
      } catch (error) {
        console.error("Error formatting car data:", error);
      } finally {
        setIsAdvancedSearchClicked(false); // Reset the flag after execution
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvancedSearchClicked]);

  useEffect(() => {
    // Refetch car data when the car ID changes
    if (selectedCar?.id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.carById(selectedCar.id) });
    }
    // if (carData?.data?.id) {
    //   queryClient.invalidateQueries({ queryKey: ["get-car-by-id", carData?.data?.id] });
    // }
  }, [selectedCar, queryClient, searchData]);

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  const handleNameEdit = (car: any, name: string) => {
    updateMyCarsToEB({
      // id: car?.id,
      // name: name,
      // isFavorite: car?.isFavorite,
      id: car?.id,
      isFavorite: car?.isFavorite,
      makeModelTypeId: car?.makeModelTypeId,
      name: name ? name : null,
      year: car?.year,
    });
  };

  const { refetch: savedCarsRefetch } = useGetMySavedCarsQuery();
  // Add delete car mutation
  const { mutate: deleteCar, isPending: isDeletingCar } = useDeleteCarFromEB({
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
      savedCarsRefetch();
      // Navigate back or reset selected car
      const redirectRoute = getRouteLocaleString(Routes.mySavedCars, params);
      router.push(redirectRoute);
      setSelectedCar(null);
    },
    onError: (error: any) => {
      console.error("Error deleting car:", error);
      // setIsDeletingCar(false);
    },
  });

  const handleDeleteCar = () => {
    const id = carData?.data?.id;
    if (id) deleteCar(id);
  };

  const advancedSearch = async (id: string | number, item: GarageItem) => {
    // Cleanup old filters
    clearSelectedCategories();

    // setCarByVinResults([item]);
    setIsAdvancedSearchClicked(true); // This will trigger the first useEffect

    if (isMobile) {
      setOgSearchModalContent("category");
      openOgSearchModal();
      setIsOgSearch(true);
    } else {
      router.push(getRouteLocaleString(Routes.categoriessearch, params));
      // openAdvSearch("engine-bay-saved-cars");
    }
  };

  useEffect(() => {
    setName(
      carData?.data?.name ||
        `${carData?.data.brandName ?? ""} ${carData?.data.modelName ?? ""} ${carData?.data.typeName ?? ""} ${carData?.data.year ?? ""}`,
    );
  }, [carData]);
  if (isPending) return <div>{getLabel("loading")}...</div>;
  return (
    <Box className="flex h-full w-full flex-col gap-[12px] bg-color-background-l2 px-[18px] pb-[12px] pt-[100px]">
      {/* Header with Name and Menu Icon */}
      <Box className="flex w-full flex-row items-center justify-between">
        <Box className="flex w-full flex-row items-center gap-2">
          {/* Menu Icon */}
          <Box className="relative flex min-w-[46px] flex-row justify-center">
            <Pressable
              onPress={toggleMenu}
              className="h-[40px] w-[40px] flex-row items-center justify-center rounded border border-[--brand-piston-green] p-2 hover:bg-[--hover-green-color] md:h-[44px] md:w-[44px]"
            >
              <Image
                src={loggedInUserOGSearchIcons.moreInfo}
                height={24}
                width={24}
                alt="more info"
              />
            </Pressable>
            {openMenu && carData?.data && (
              <MenuItem
                id={carData.data.id ?? ""}
                item={carData.data}
                onClose={() => setOpenMenu(false)}
                handleEditAddress={() => {}}
                handleDeleteAddress={() => {}}
                setNameMode={setNameMode}
                openDeleteModal={openModal}
                carNameInpRef={carNameInpRef}
              />
            )}
          </Box>
          {/* Input */}

          <Box className="flex flex-1 flex-row">
            <input
              type="text"
              ref={carNameInpRef}
              value={
                nameMode === "view" ? (name.length > 20 ? `${name.slice(0, 20)}...` : name) : name
              }
              onChange={(e) => setName(e.target.value)}
              placeholder={getLabel("eb_name_edit_placeholder_text")}
              className={`h-auto w-[215px] bg-transparent pl-2 font-Overpass text-[18px] font-[700] leading-[20px] [caret-color:--brand-traffic-light-green] [font-feature-settings:'liga'_off,'clig'_off] placeholder:opacity-40 focus:outline-none focus:ring-0 ${
                nameMode === "view"
                  ? "text-color-primary-main placeholder:text-[--Text-Disabled]"
                  : "border-l-2 border-l-color-primary-main text-color-primary-main placeholder:text-color-primary-main"
              }`}
              onBlur={() => handleNameEdit(carData?.data, name)}
              disabled={nameMode === "view"}
            />
            {/* Edit pencil icon */}
            {/* {carData?.data?.isFavorite && (
              <Box className="flex min-h-[34px] min-w-[34px] flex-row items-center justify-center rounded-[4px] bg-[--Background-Favourite-Star]">
                <Image src={FavoriteStarIcon} height={14} width={14} alt="favorite" />
              </Box>
            )} */}
            {/* <Button
              onPress={() => setNameMode("edit")}
              className="border-none bg-transparent outline-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
            >
              <Image src={EditPencilIcon} height={24} width={24} alt="edit" />
            </Button> */}
          </Box>
        </Box>

        <Button
          onPress={() => {
            router.back();
          }}
          className="ml-2 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
        >
          <Image src={CancelSquare} alt="Cancel" height={28} width={28} />
        </Button>
      </Box>

      <Box className="h-[1px] w-full bg-color-neutral-main"></Box>
      {/* Body with Image and Details */}
      <Box className="flex flex-1 flex-col gap-6 overflow-y-auto gtsm:flex-row gtlg:flex-col xl:flex-row">
        {/* Main container with fixed grid layout */}

        {/* Car Image section - takes 2 columns on tablets and larger */}
        <Box className="relative min-h-[275px] w-full flex-1 overflow-hidden shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          {/* Add absolute upload button here */}
          <Box
            onClick={() => {
              if (isUploading) return;
              const id = carData?.data?.id;
              if (id) triggerImageUpload(id);
            }}
            className={`absolute bottom-[12px] left-[12px] z-10 inline-flex h-11 cursor-pointer items-center justify-center gap-2.5 self-stretch rounded p-2.5 ${
              isUploading ? "bg-emerald-900/50" : "bg-emerald-900"
            }`}
          >
            <Image src={garageBayIcons.upload} height={20} width={20} alt="Upload" className="" />
          </Box>
          <Image
            src={carData?.data?.picture || CarImage}
            alt={`${carData?.data?.name}`}
            fill
            className="object-cover object-center"
          />
        </Box>

        {/* Car Info */}
        <Box className="flex min-h-[450px] w-full flex-1 flex-col justify-between space-y-4">
          <Box className="flex flex-col gap-[40px]">
            <Box className="">
              <Box className="flex flex-row items-center gap-[12px] border-l-2 border-l-color-text-body py-2 pl-3">
                <Text className="text-color-text-body body-bold-md">{getLabel("make")}</Text>
                <Text className="text-color-text-body body-regular-sm">
                  {carData?.data?.brandName || ""}
                </Text>
              </Box>
              <Box className="flex flex-row items-center gap-[12px] border-l-2 border-t-2 border-l-color-text-body border-t-color-neutral-main py-2 pl-3">
                <Text className="text-color-text-body body-bold-md">{getLabel("model")}</Text>
                <Text className="text-color-text-body body-regular-sm">
                  {`${carData?.data?.modelName || ""} ${carData?.data?.typeName || ""}`}
                </Text>
              </Box>
              <Box className="flex flex-row items-center gap-[12px] border-l-2 border-t border-l-color-text-body border-t-color-neutral-main py-2 pl-3">
                <Text className="text-color-text-body body-bold-md">{getLabel("engine")}</Text>
                <Text className="text-color-text-body body-regular-sm">
                  {`${carData?.data?.engineName || ""}`}
                </Text>
              </Box>
            </Box>
            {getClientFeatureFlag("vin_feature_flag") && (
              <Box>
                <Box className="flex flex-row items-center gap-[12px] border-l-2 border-l-color-text-body py-2 pl-3">
                  <Text className="text-color-text-body body-bold-md">{getLabel("vin")}</Text>
                  <Text className="text-color-text-body body-regular-sm">
                    {carData?.data?.vin || ""}
                  </Text>
                </Box>
              </Box>
            )}
            {/* Only show Engine details if engine_trim feature flag is enabled */}
            {isEngineTrimEnabled && (
              <Box>
                <Box className="flex flex-row items-center gap-5 border-l-2 border-l-color-text-body py-2 pl-3">
                  <Text className="w-[80px] text-color-text-body body-bold-md">
                    {getLabel("hp")}
                  </Text>
                  <Text className="text-color-text-body body-regular-sm">
                    {carData?.data?.hp || carData?.data?.powerHp || ""}
                  </Text>
                </Box>
                <Box className="flex flex-row items-center gap-5 border-l-2 border-l-color-text-body py-2 pl-3">
                  <Text className="w-[80px] text-color-text-body body-bold-md">
                    {getLabel("fuel")}
                  </Text>
                  <Text className="text-color-text-body body-regular-sm">
                    {carData?.data?.fuel || ""}
                  </Text>
                </Box>
                <Box className="flex flex-row items-center gap-5 border-l-2 border-l-color-text-body py-2 pl-3">
                  <Text className="w-[80px] text-color-text-body body-bold-md">
                    {getLabel("cc")}
                  </Text>
                  <Text className="text-color-text-body body-regular-sm">
                    {carData?.data?.cc || carData?.data?.engineSize || ""}
                  </Text>
                </Box>
              </Box>
            )}
            {/* Only show Trim details if engine_trim feature flag is enabled */}
            {isEngineTrimEnabled && (
              <Box>
                <Box className="flex flex-row items-center gap-5 border-l-2 border-l-color-text-body py-2 pl-3">
                  <Text className="w-[80px] text-color-text-body body-bold-md">
                    {getLabel("Body")}
                  </Text>
                  <Text className="text-color-text-body body-regular-sm">
                    {carData?.data?.frame || carData?.data?.body || ""}
                  </Text>
                </Box>
                <Box className="flex flex-row items-center gap-5 border-l-2 border-l-color-text-body py-2 pl-3">
                  <Text className="w-[80px] text-color-text-body body-bold-md">
                    {getLabel("doors")}
                  </Text>
                  <Text className="text-color-text-body body-regular-sm">
                    {carData?.data?.doors || ""}
                  </Text>
                </Box>
                <Box className="flex flex-row items-center gap-5 border-l-2 border-l-color-text-body py-2 pl-3">
                  <Text className="w-[80px] text-color-text-body body-bold-md">
                    {getLabel("variant")}
                  </Text>
                  <Text className="text-color-text-body body-regular-sm">
                    {carData?.data?.variant || ""}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>

          <Box className="flex w-full flex-col justify-center gap-[12px]">
            {/* <h2 className="text-2xl font-bold">{carData?.data?.name}</h2> */}
            <Button
              className="flex flex-1 flex-row items-center justify-center gap-2 border border-color-primary-main bg-color-background-l2 p-[12px] text-color-primary-main"
              onPress={() => carData?.data && handleEdit(carData.data)}
            >
              <Image src={EditPencilIcon} height={20} width={20} alt="edit" />
              <Text className="text-color-primary-main body-regular-sm">{getLabel("edit")}</Text>
            </Button>
            <Button
              className="flex flex-1 flex-row items-center justify-center gap-2 border border-color-primary-main bg-color-primary-main p-[12px] text-[--Brand-Pure-White]"
              onPress={() => carData?.data && advancedSearch(carData.data.id ?? "", carData.data)}
            >
              <Image src={AdvancedSearchIcon} alt="Advanced Search" width={20} height={20} />
              <Text className="text-[--Brand-Pure-White] body-regular-sm">
                {getLabel("find_car_parts")}
              </Text>
            </Button>
          </Box>
        </Box>
        <Box className="w-full">
          <PreviousSearchContainer isMobile={true} isEBPanel={true} />
        </Box>
      </Box>
      <Modal
        width="max-w-md"
        containerClassName="z-[1000]"
        modalClassName="rounded-[8px] bg-color-background-l2 w-full gtsm:min-w-[600px] h-[288px]"
        backdropClass="bg-black bg-opacity-50"
        showCloseButton={false}
        contentClassName="px-[82px] py-8"
        footerClassName="bg-color-background-l2 pb-4 gtsm:pb-0"
        footerComponent={
          <Box className="flex w-full flex-row justify-center gap-4 px-[26px] py-[16px]">
            <Button
              className="flex h-[42px] w-[74px] flex-row items-center rounded-[4px] border border-[--brand-piston-green] bg-transparent p-[10px] text-color-primary-main hover:bg-transparent focus:bg-transparent active:bg-transparent"
              onPress={closeModal}
              isDisabled={isDeletingCar}
            >
              <Text className="font-Overpass text-[18px] font-semibold leading-[22px] text-color-primary-main">
                {getLabel("cancel")}
              </Text>
            </Button>
            <Button
              className="flex h-[42px] w-[74px] flex-row items-center rounded-[4px] bg-[--System-Colors-Error-Main] p-[10px] hover:bg-[--System-Colors-Error-Main] focus:bg-[--System-Colors-Error-Main] active:bg-[--System-Colors-Error-Main]"
              isDisabled={isDeletingCar}
              onPress={handleDeleteCar}
            >
              <Text className="font-Overpass text-[18px] font-semibold leading-[22px] text-[--Text-White]">
                {getLabel("delete")}
              </Text>
            </Button>
          </Box>
        }
      >
        <Box className="flex flex-col items-center justify-center gap-4">
          <Box className="flex flex-row items-center justify-center rounded-[8px] bg-[--System-Colors-Error-Extra-Light] p-[12px]">
            <Image
              src={`/assets/eb-panel/alert-triangle.svg`}
              height={62}
              width={62}
              alt="delete"
            />
          </Box>

          <Text className="text-center font-Overpass text-[18px] font-bold leading-[22px] text-color-text-body">
            {getLabel("delete_car_confirmation")}
          </Text>

          <Text className="text-center font-Overpass text-[14px] font-normal leading-[18px] text-color-text-body">
            {getLabel("action_undone")}
          </Text>
        </Box>
      </Modal>
    </Box>
  );
}
