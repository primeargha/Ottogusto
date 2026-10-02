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
// import FinalStepCar from "@/assets/search/final-step-car.png";
import CarImage from "@/assets/eb-panel/eb-panel-bg-image.png";
import { Box } from "@/components/ui/box";
// import { Input } from "@/components/ui/input";
import EditPencilIcon from "@/assets/eb-panel/pencil-car-name-edit-icon.svg";
import EditPencilIconB from "@/assets/eb-panel/pencil-car-model-edit.svg";
import { Pressable } from "@/components/ui/pressable";
import { garageBayIcons, loggedInUserOGSearchIcons } from "@/constants";
import { useParams, useRouter } from "next/navigation";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useSelectedCarStore } from "@/stores/useSelectedCar";
import { useBranding } from "@/contexts/BrandingContext";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import formatEditSearchData from "@/utils/formatEditSearchData";
import DeleteCarIcon from "@/assets/eb-panel/delete-car-icon.svg";
import FavoriteCarIcon from "@/assets/eb-panel/fav-car-icon.svg";
import FavoriteStarIcon from "@/assets/eb-panel/fav-star-icon.svg";
import { useAdvancedSearchStore } from "@/stores/useAdvancedSearchStore";
import { useImageUpload } from "@/utils/useImageUpload";
import Modal from "@/components/Modal";
import { useModalStore } from "@/stores/useModalStore";
import { getRouteLocaleString, mmtExtractFromMMTY_ID } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useMedia } from "@/hooks/useMedia";
import { OGButton } from "@/components/og-components/OGButton";
import { prefillSearchDataFromUrl } from "@/utils/prefillSearchDataFromUrl";
import { useNewSearchModalStore } from "@/stores/useNewSearchModalStore";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import type { GarageItem } from "@/type";
// import PreviousSearchClientContainer from "../landing/previous-search-client-container";
import PreviousSearchContainer from "../landing/previous-search-container";
import SkeletonCarDetailview from "./SkeletonCarDetailview";

const MenuItem = ({
  id,
  item,
  onClose,
  handleEditAddress,
  handleDeleteAddress,
  openDeleteModal,
}: {
  id: string;
  item: GarageItem;
  onClose: () => void;
  handleEditAddress?: () => void;
  handleDeleteAddress?: () => void;
  openDeleteModal: () => void;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getLabel } = useBranding();
  const { setSelectedCar } = useSelectedCarStore();
  const { mutate: updateMyCarsToEB, isPending: isUpdatingMyCarsToEB } = useAddUpdateMyCarsToEB({
    onSuccess: (data: any, variables: any) => {
      const x: any = queryClient.getQueriesData({ queryKey: ["get-my-saved-cars"] })?.[0]?.[1];
      if (x?.data?.find((node: any) => node.id !== variables?.id)) {
        x.data.find((node: any) => node.id !== variables?.id).isFavorite = false; // Only allow Single Favorite
      }
      if (x?.data?.find((node: any) => node.id === variables?.id)) {
        x.data.find((node: any) => node.id === variables?.id).isFavorite = variables?.isFavorite;
      }

      onClose();
      // OD-490 - needed for reordering do not remove
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
      setSelectedCar(data?.data?.[0] ?? null);
    },
    onError: (error: any) => {
      console.error("Error adding car to EB: ", error);
    },
  });

  const handleFavouriteCar = () => {
    const isFavorite = item?.isFavorite;
    updateMyCarsToEB({
      id: id,
      isFavorite: !isFavorite,
    });
  };

  return (
    <Box className={`absolute right-0 top-12 z-[200] rounded-[4px] bg-[--Text-White] shadow-md`}>
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
export default function CarDetailView({
  car,
  handleEdit,
}: {
  car: GarageItem | null;
  handleEdit: (car: GarageItem) => void;
}) {
  const router = useRouter();
  const params = useParams();
  const isMobile = useMedia("(max-width: 639px)");
  const [openMenu, setOpenMenu] = useState(false);

  // Check if engine_trim feature flag is enabled
  const isEngineTrimEnabled = getClientFeatureFlag("engine_trim_feature_flag");
  const { selectedCar, setSelectedCar } = useSelectedCarStore();
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
  const newSearchModalStore = useNewSearchModalStore();
  const { data: carData, isPending } = useGetCarByIdQuery(car?.id ?? "");
  const { getLabel } = useBranding();
  const queryClient = useQueryClient();
  const { data: allCarsData } = useGetMySavedCarsQuery();
  const { isUploading, triggerImageUpload } = useImageUpload();
  const [nameMode, setNameMode] = useState("view");
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(carData?.data?.name || "");
  const { openAdvSearch } = useAdvancedSearchStore();
  const [localSearchData, setLocalSearchData] = useState<any>({
    make: null,
    model: null,
    year: null,
    type: null,
  });
  const clearSelectedCategories = useCategorySearchStore((s) => s.clearSelectedCategories);
  const menuRef = useRef<HTMLDivElement>(null);
  const isTablet = useMedia("(min-width: 640px) and (max-width: 1023px)");
  useClickOutside(menuRef, () => {
    setOpenMenu(false);
  });
  const { mutate: updateMyCarsToEB, isPending: isUpdatingMyCarsToEB } = useAddUpdateMyCarsToEB({
    onSuccess: (data: any, variables: any) => {
      setNameMode("view");
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
      setSelectedCar(data?.data?.[0] ?? null);
    },
    onError: (error: any) => {
      console.error("Error adding car to EB: ", error);
    },
  });

  const { refetch: savedCarsRefetch } = useGetMySavedCarsQuery();
  // Add delete car mutation
  const { mutate: deleteCar, isPending: isDeletingCar } = useDeleteCarFromEB({
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.savedCars() });
      savedCarsRefetch();
      // Navigate back or reset selected car
      // router.back();
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

  // Sets searchData if Advanced Search is clicked
  const [isAdvancedSearchClicked, setIsAdvancedSearchClicked] = useState(false);
  // First useEffect to fetch and set localSearchData when advanced search is triggered
  useEffect(() => {
    if (!isAdvancedSearchClicked) return;

    (async () => {
      try {
        const formattedSearchData = await formatEditSearchData(carData?.data as any);
        const sData = {
          makeModelTypeId: carData?.data?.makeModelTypeId,
          ...formattedSearchData,
        };
        setSearchData(sData as any);
        setLocalSearchData(sData);
      } catch (error) {
        console.error("Error formatting car data:", error);
        setLocalSearchData({
          make: null,
          model: null,
          year: null,
          type: null,
        });
      } finally {
        setIsAdvancedSearchClicked(false); // Reset the flag after execution
      }
    })();
    // debugger;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdvancedSearchClicked]);

  useEffect(() => {
    if (nameMode === "edit" && inputRef.current) {
      const input = inputRef.current;
      input.focus();
      input.setSelectionRange(0, 0);
      input.scrollLeft = 0;
    }
  }, [nameMode]);

  const handleFavouriteCar = () => {
    const isFavorite = carData?.data?.isFavorite;
    if (!isFavorite) {
      updateMyCarsToEB({
        id: carData?.data?.id ?? "",
        isFavorite: true,
      });
    } else {
      updateMyCarsToEB({
        id: carData?.data?.id,
        isFavorite: false,
      });
    }
  };

  useEffect(() => {
    // Refetch car data when the car ID changes
    if (selectedCar?.id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.garage.carById(selectedCar.id) });
      setNameMode("view");
    }
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

  useEffect(() => {
    // setName(carData?.data?.name || "");
    setName(
      carData?.data?.name ||
        `${carData?.data.brandName ?? ""} ${carData?.data.modelName ?? ""} ${carData?.data.typeName ?? ""} ${carData?.data.year ?? ""}`,
    );
    (async () => {
      try {
        const formattedSearchData = await formatEditSearchData(carData?.data as any);
        if (!carData?.data?.typeName) {
          formattedSearchData.type = {
            key: carData?.data?.typeId ?? "",
            value: carData?.data?.typeName ?? "",
          };
        }
        if (!formattedSearchData.year) {
          formattedSearchData.year = {
            key: "",
            value: carData?.data?.year ?? "",
          };
        }

        // Set the formatted search data to the state
        // setSearchData(formattedSearchData);
        setLocalSearchData(formattedSearchData);
      } catch (error) {
        console.error("Error formatting car data:", error);
        setLocalSearchData({
          make: null,
          model: null,
          year: null,
          type: null,
        });
        // setSearchData({
        //   make: null,
        //   model: null,
        //   year: null,
        //   type: null,
        // });
      }
    })();
  }, [carData]);

  if (isPending) return <SkeletonCarDetailview />;

  const advancedSearch = async (id: number, item: any) => {
    // Cleanup old filters
    clearSelectedCategories();

    const mmytSearchData = await prefillSearchDataFromUrl(item.makeModelTypeId);
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

  return (
    <Box className="flex h-full w-full flex-col gap-3 bg-[--Brand-Pure-White]">
      {/* Header with Name and Menu Icon */}
      <Box className="flex w-full flex-row items-center justify-between border border-b px-6 py-3">
        <Box className="flex w-full flex-row items-center gap-2">
          {/* Input */}

          <Box className="flex flex-1 flex-row items-center gap-6 overflow-hidden">
            {nameMode === "view" ? (
              <>
                <Box className="justify-center overflow-hidden overflow-x-auto font-Overpass text-2xl font-bold leading-[26px] text-emerald-900">
                  {(() => {
                    const maxLength = isTablet ? 40 : 65; // shorter length for tablet
                    return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
                  })()}
                </Box>
              </>
            ) : (
              <>
                <input
                  type="text"
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={getLabel("eb_name_edit_placeholder_text")}
                  className={`h-auto bg-transparent pl-2 font-Overpass text-[24px] font-[400] leading-[38px] [caret-color:--brand-traffic-light-green] [font-feature-settings:'liga'_off,'clig'_off] placeholder:opacity-40 focus:outline-none focus:ring-0 ${
                    nameMode === "view"
                      ? "font-weight:700 w-[260px] text-[--Primary-Colors-Main]"
                      : "w-[870px] border-l-2 border-l-[--brand-traffic-light-green] pr-5 text-[--Primary-Colors-Main] placeholder:text-[--Primary-Colors-Main]"
                  }`}
                  onBlur={() => handleNameEdit(carData?.data, name)}
                  disabled={nameMode === "view"}
                  // add Input ref here
                />
              </>
            )}
            {/* Edit pencil icon */}
            {/* OD-667 fix */}
            {carData?.data?.isFavorite && (
              <Box
                onClick={handleFavouriteCar}
                className="flex max-h-[36px] min-h-[34px] min-w-[34px] max-w-[36px] cursor-pointer flex-row items-center justify-center rounded-[4px] bg-[--Background-Favourite-Star]"
              >
                <Image
                  src={FavoriteStarIcon}
                  height={14}
                  width={14}
                  alt="favorite"
                  className="h-[14px] w-[14px]"
                />
              </Box>
            )}
            <Button
              onPress={() => setNameMode("edit")}
              className="border-none bg-transparent px-0 outline-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
            >
              <Image src={EditPencilIcon} height={24} width={24} alt="edit" />
            </Button>
          </Box>

          {/* Menu Icon */}
          <Box className="relative flex min-w-[46px] flex-row justify-center" ref={menuRef as any}>
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
            {openMenu && (
              <MenuItem
                id={selectedCar?.id ?? ""}
                item={selectedCar as any}
                onClose={() => setOpenMenu(false)}
                handleEditAddress={() => {}}
                handleDeleteAddress={() => {}}
                openDeleteModal={openModal}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* <Box className="h-[1px] w-full bg-[--neutral-chrome-800]"></Box> */}
      {/* Body with Image and Details */}
      <Box className="h-full overflow-hidden px-6 pb-6">
        <Box className="flex h-full w-full flex-col gap-4 overflow-x-hidden scrollbar-hide">
          <Box className="flex h-full w-full gap-6 gtsm:min-h-[550px] gtsm:flex-row md:min-h-[550px] lg:min-h-[422px] gtlg:min-h-[740px] gtlg:flex-col xl:min-h-[522px] xl:flex-row">
            {/* Main container with fixed grid layout */}

            {/* Car Image section - takes 2 columns on tablets and larger */}
            <Box className="relative mx-[2px] min-h-64 w-full flex-1 overflow-hidden shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              {/* Add absolute upload button here */}
              <Box
                onClick={() => {
                  if (isUploading) return;
                  triggerImageUpload(carData?.data?.id ?? "");
                }}
                className={`absolute bottom-[12px] left-[12px] z-10 inline-flex h-11 cursor-pointer items-center justify-center gap-2.5 self-stretch rounded p-2.5 ${
                  isUploading ? "bg-emerald-900/50" : "bg-emerald-900"
                }`}
              >
                <Image
                  src={garageBayIcons.upload}
                  height={20}
                  width={20}
                  alt="Upload"
                  className=""
                />
              </Box>

              <Image
                src={carData?.data?.picture || CarImage}
                alt={`${carData?.data?.name}`}
                fill
                className="object-cover object-center"
              />
            </Box>

            {/* Car Info */}
            <Box className="space-y- flex w-full flex-1 flex-col justify-between">
              <Box className="flex flex-col base:gap-[20px]">
                <Box className="">
                  <Box className="flex flex-row items-center gap-3 border-l-2 border-l-[--primary-colors-primary-dark] py-2 pl-3">
                    <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                      {getLabel("make")}
                    </Text>

                    <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                      {localSearchData?.make?.value || ""}
                    </Text>
                  </Box>
                  <Box className="flex flex-row items-center gap-3 border-l-2 border-t border-l-[--primary-colors-primary-dark] border-t-[--neutral-chrome-801] py-2 pl-3">
                    <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                      {getLabel("model")}
                    </Text>
                    <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                      {localSearchData?.model?.value || ""}
                    </Text>
                  </Box>
                  <Box className="flex flex-row items-center gap-3 border-l-2 border-t border-l-[--primary-colors-primary-dark] border-t-[--neutral-chrome-801] py-2 pl-3">
                    <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                      {getLabel("year")}
                    </Text>
                    <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                      {localSearchData?.year?.value || ""}
                    </Text>
                  </Box>
                  <Box className="flex flex-row items-center gap-3 border-l-2 border-t border-l-[--primary-colors-primary-dark] border-t-[--neutral-chrome-801] py-2 pl-3">
                    <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                      {getLabel("type")}
                    </Text>
                    <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                      {localSearchData?.type?.value || ""}
                    </Text>
                  </Box>
                </Box>
                {getClientFeatureFlag("vin_feature_flag") && (
                  <Box className="base:gap-[20px]">
                    <Box className="flex flex-row items-center gap-5 border-l-2 border-l-[--primary-colors-primary-dark] py-2 pl-3">
                      <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                        {getLabel("vin")}
                      </Text>
                      <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                        {carData?.data?.vin || ""}
                      </Text>
                    </Box>
                  </Box>
                )}
                {/* Only show Engine details if engine_trim feature flag is enabled */}
                {isEngineTrimEnabled && (
                  <Box>
                    <Box className="flex flex-row items-center gap-5 border-l-2 border-l-[--primary-colors-primary-dark] py-2 pl-3">
                      <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                        {getLabel("hp")}
                      </Text>
                      <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                        {carData?.data?.hp || carData?.data?.powerHp || ""}
                      </Text>
                    </Box>
                    <Box className="flex flex-row items-center gap-5 border-l-2 border-l-[--primary-colors-primary-dark] py-2 pl-3">
                      <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                        {getLabel("fuel")}
                      </Text>
                      <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                        {carData?.data?.fuel || ""}
                      </Text>
                    </Box>
                    <Box className="flex flex-row items-center gap-5 border-l-2 border-l-[--primary-colors-primary-dark] py-2 pl-3">
                      <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                        {getLabel("cc")}
                      </Text>
                      <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                        {carData?.data?.cc || carData?.data?.engineSize || ""}
                      </Text>
                    </Box>
                  </Box>
                )}
                {/* Only show Trim details if engine_trim feature flag is enabled */}
                {isEngineTrimEnabled && (
                  <Box>
                    <Box className="flex flex-row items-center gap-5 border-l-2 border-l-[--primary-colors-primary-dark] py-2 pl-3">
                      <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                        {getLabel("Body")}
                      </Text>
                      <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                        {carData?.data?.frame || carData?.data?.body || ""}
                      </Text>
                    </Box>
                    <Box className="flex flex-row items-center gap-5 border-l-2 border-l-[--primary-colors-primary-dark] py-2 pl-3">
                      <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                        {getLabel("doors")}
                      </Text>
                      <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                        {carData?.data?.doors || ""}
                      </Text>
                    </Box>
                    <Box className="flex flex-row items-center gap-5 border-l-2 border-l-[--primary-colors-primary-dark] py-2 pl-3">
                      <Text className="w-[60px] font-Overpass text-[18px] font-bold leading-[20px] text-color-text-body">
                        {getLabel("variant")}
                      </Text>
                      <Text className="font-Overpass text-[16px] font-normal leading-[18px] text-color-text-body">
                        {carData?.data?.variant || ""}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box className="flex flex-row items-center justify-around gap-[24px]">
                {/* <h2 className="text-2xl font-bold">{carData?.data?.name}</h2> */}
                <OGButton
                  type="outlined"
                  size="medium"
                  className="flex-1"
                  leftcomp={<Image src={EditPencilIconB} height={20} alt="edit" />}
                  onClick={() => handleEdit(carData?.data as GarageItem)}
                >
                  {getLabel("edit")}
                </OGButton>
                <OGButton
                  type="primary"
                  size="medium"
                  className="flex-1"
                  leftcomp={
                    <Image
                      src={garageBayIcons.advance}
                      height={20}
                      width={20}
                      alt="advance search"
                    />
                  }
                  onClick={() => advancedSearch(carData?.data?.id as any, carData?.data)}
                >
                  {getLabel("advanced_search")}
                </OGButton>
              </Box>
            </Box>
          </Box>

          <PreviousSearchContainer />
        </Box>
      </Box>
      <Modal
        width="max-w-md"
        containerClassName="z-[1000]"
        modalClassName="rounded-[8px] bg-[--neutral-beige-400] w-full gtsm:min-w-[600px] h-[288px]"
        backdropClass="bg-black bg-opacity-50"
        showCloseButton={false}
        contentClassName="px-[82px] py-8"
        footerClassName="bg-[--neutral-beige-400] pb-4 gtsm:pb-0"
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
