import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import EditIcon from "@/assets/search/pencil-edit.svg";
import GreenTickIcon from "@/assets/search/green-tick.svg";
import GrayTickIcon from "@/assets/search/gray-tick.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function SearchStepperDesktop() {
  const { searchData, setStep, currentStep, isOgSearch, carByVinResults, isEB, ebMode } =
    useSearchModalStore();

  const getStepItems = () => {
    const items = [
      { step: 1, keyName: "Make", value: searchData.make?.value || "" },
      { step: 2, keyName: "Model", value: searchData.model?.value || "" },
      { step: 3, keyName: "Year", value: searchData.year?.value || "" },
      { step: 4, keyName: "Type", value: searchData.type?.value || "" },
    ];
    return items;
  };
  const getVINStepItems = () => {
    const items = [
      { step: 1, keyName: "Make", value: carByVinResults[0]?.brand || "" },
      { step: 2, keyName: "Model", value: carByVinResults[0]?.model || "" },
      {
        step: 3,
        keyName: "Year",
        value: carByVinResults[0]?.year || carByVinResults[0]?.yearFrom || "",
      },
      { step: 4, keyName: "Type", value: carByVinResults[0]?.type || "" },
    ];
    return items;
  };

  const handleEditStep = (step: number) => {
    setStep(step);
  };

  const isGreenTickBasedOnKeyName = (keyName: string) => {
    switch (keyName) {
      case "Make":
        return !!searchData.make?.value;
      case "Model":
        return !!searchData.model?.value && !!searchData.make?.value;
      case "Year":
        return !!searchData.year?.value && !!searchData.make?.value && !!searchData.model?.value;
      case "Type":
        return (
          !!searchData.type?.value &&
          !!searchData.make?.value &&
          !!searchData.model?.value &&
          !!searchData.year?.value
        );
      default:
        return false;
    }
  };

  const stepItems = getStepItems();
  const vinStepItems = getVINStepItems();

  if (stepItems.length === 0 && vinStepItems.length === 0) return null;

  return (
    <Box className="mx-auto mb-6 flex min-h-[168px] w-[98%] flex-col rounded-[4px] p-2 base:hidden gtsm:block">
      <Box className="mb-4 font-Overpass text-[20px] font-[700] leading-[22px] text-color-text-body">
        Details
      </Box>
      <Box className="flex flex-col gap-16">
        {/* if any one step values are present then it is NOT a VIN Search */}
        {isEB && ebMode === "edit" ? (
          <>
            {stepItems?.map((item, index) => (
              <Box
                key={`${item.step}-${item.keyName}-${item.value}`}
                className="relative flex flex-row items-center gap-3"
              >
                {/* Tick Icon - Adjusted to left align */}
                <Box className="absolute left-0 h-6 w-6">
                  {item.value ||
                  (item.keyName === "Make" && searchData.make?.value) ||
                  (item.keyName === "Model" && searchData.model?.value) ||
                  (item.keyName === "Year" && searchData.year?.value) ||
                  (item.keyName === "Type" && searchData.type?.value) ? (
                    <Image src={GreenTickIcon} alt="Tick" width={32} height={32} />
                  ) : (
                    <Image src={GrayTickIcon} alt="Tick" width={32} height={32} />
                  )}
                </Box>

                {/* Step Name and Value - Added left padding to accommodate tick */}
                <Box className="flex flex-1 flex-row items-center gap-1 pl-9">
                  <Text className="font-Overpass text-[16px] font-[600] leading-[22px] text-color-text-body">
                    {item.keyName}
                  </Text>
                  {item.value && (
                    <>
                      <Text className="font-Overpass text-[16px] font-[600] leading-[22px] text-color-text-body">
                        -
                      </Text>
                      <Text className="font-Overpass text-[16px] font-[600] leading-[22px] text-[--brand-traffic-light-green]">
                        {item.value}
                      </Text>
                    </>
                  )}

                  {/* Edit Icon - Simplified condition for visibility */}
                  {((searchData.type?.value && item.step <= 4) ||
                    (searchData.year?.value && !searchData.type?.value && item.step <= 3) ||
                    (searchData.model?.value && !searchData.year?.value && item.step <= 2) ||
                    (searchData.make?.value && !searchData.model?.value && item.step < 2)) && (
                    <Button
                      className="h-6 w-6 bg-transparent p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent"
                      onPress={() => handleEditStep(item.step)}
                    >
                      <Image src={EditIcon} alt="Edit" width={20} height={20} />
                    </Button>
                  )}
                </Box>

                {/* Vertical line between steps - Adjusted position */}
                {index < stepItems.length - 1 && (
                  <Box className="absolute left-[0.6rem] top-[0.2rem] flex translate-y-[28px] flex-col items-center gap-[0.1rem]">
                    {[...Array(9)]?.map((_, i) => (
                      <Box
                        key={i}
                        className={`h-1 w-1 rounded-full ${
                          item.value ||
                          (item.keyName === "Make" && searchData.make?.value) ||
                          (item.keyName === "Model" && searchData.model?.value) ||
                          (item.keyName === "Year" && searchData.year?.value) ||
                          (item.keyName === "Type" && searchData.type?.value)
                            ? "bg-[--brand-traffic-light-green]"
                            : "bg-black/10"
                        }`}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </>
        ) : (
          <>
            {(searchData.make?.value ||
              searchData.model?.value ||
              searchData.type?.value ||
              searchData.year?.value) &&
            carByVinResults.length <= 0 ? (
              <>
                {stepItems?.map((item, index) => (
                  <Box
                    key={`${item.step}-${item.keyName}-${item.value}`}
                    className="relative flex flex-row items-center gap-3"
                  >
                    {/* Tick Icon - Adjusted to left align */}
                    <Box className="absolute left-0 h-6 w-6">
                      {isGreenTickBasedOnKeyName(item.keyName) && item.step < currentStep ? (
                        <Image src={GreenTickIcon} alt="Tick" width={32} height={32} />
                      ) : (
                        <Image src={GrayTickIcon} alt="Tick" width={32} height={32} />
                      )}
                    </Box>

                    {/* Step Name and Value - Added left padding to accommodate tick */}
                    <Box className="flex flex-1 flex-row items-center gap-1 pl-9">
                      <Text className="font-Overpass text-[16px] font-[600] leading-[22px] text-color-text-body">
                        {item.keyName}
                      </Text>
                      {item.value && (
                        <>
                          <Text className="font-Overpass text-[16px] font-[600] leading-[22px] text-color-text-body">
                            -
                          </Text>
                          <Text className="font-Overpass text-[16px] font-[600] leading-[22px] text-[--brand-traffic-light-green]">
                            {item.value}
                          </Text>
                        </>
                      )}
                      {/* Edit Icon */}
                      {!isOgSearch && currentStep > item.step && (
                        <Button
                          className="h-6 w-6 bg-transparent p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent"
                          onPress={() => handleEditStep(item.step)}
                        >
                          <Image src={EditIcon} alt="Edit" width={20} height={20} />
                        </Button>
                      )}
                    </Box>

                    {/* Vertical line between steps - Adjusted position */}
                    {index < stepItems.length - 1 && (
                      <Box className="absolute left-[0.6rem] top-[0.2rem] flex translate-y-[28px] flex-col items-center gap-[0.1rem]">
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            isGreenTickBasedOnKeyName(item.keyName) && currentStep >= item.step + 1
                              ? "bg-[--brand-traffic-light-green]"
                              : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            isGreenTickBasedOnKeyName(item.keyName) && currentStep >= item.step + 1
                              ? "bg-[--brand-traffic-light-green]"
                              : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            isGreenTickBasedOnKeyName(item.keyName) && currentStep >= item.step + 1
                              ? "bg-[--brand-traffic-light-green]"
                              : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            isGreenTickBasedOnKeyName(item.keyName) && currentStep >= item.step + 1
                              ? "bg-[--brand-traffic-light-green]"
                              : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            isGreenTickBasedOnKeyName(item.keyName) && currentStep >= item.step + 1
                              ? "bg-[--brand-traffic-light-green]"
                              : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            isGreenTickBasedOnKeyName(item.keyName) && currentStep >= item.step + 1
                              ? "bg-[--brand-traffic-light-green]"
                              : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            isGreenTickBasedOnKeyName(item.keyName) && currentStep >= item.step + 1
                              ? "bg-[--brand-traffic-light-green]"
                              : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            isGreenTickBasedOnKeyName(item.keyName) && currentStep >= item.step + 1
                              ? "bg-[--brand-traffic-light-green]"
                              : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            isGreenTickBasedOnKeyName(item.keyName) && currentStep >= item.step + 1
                              ? "bg-[--brand-traffic-light-green]"
                              : "bg-black/10"
                          }`}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </>
            ) : (
              <>
                {vinStepItems?.map((item, index) => (
                  <Box
                    key={`${item.step}-${item.keyName}-${item.value}`}
                    className="relative flex flex-row items-center gap-3"
                  >
                    {/* Tick Icon - Adjusted to left align */}
                    <Box className="absolute left-0 h-6 w-6">
                      {item.value ? (
                        <Image src={GreenTickIcon} alt="Tick" width={32} height={32} />
                      ) : (
                        <Image src={GrayTickIcon} alt="Tick" width={32} height={32} />
                      )}
                    </Box>

                    {/* Step Name and Value - Added left padding to accommodate tick */}
                    <Box className="flex flex-1 flex-row items-center gap-1 pl-9">
                      <Text className="font-Overpass text-[16px] font-[600] leading-[22px] text-color-text-body">
                        {item.keyName}
                      </Text>
                      {item.value && (
                        <>
                          <Text className="font-Overpass text-[16px] font-[600] leading-[22px] text-color-text-body">
                            -
                          </Text>
                          <Text className="font-Overpass text-[16px] font-[600] leading-[22px] text-[--brand-traffic-light-green]">
                            {item.value}
                          </Text>
                        </>
                      )}
                      {/* Edit Icon */}
                      {(!carByVinResults.length || carByVinResults.length <= 0) &&
                        currentStep > item.step && (
                          <Button
                            className="h-6 w-6 bg-transparent p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent"
                            onPress={() => handleEditStep(item.step)}
                          >
                            <Image src={EditIcon} alt="Edit" width={20} height={20} />
                          </Button>
                        )}
                    </Box>

                    {/* Vertical line between steps - Adjusted position */}
                    {index < stepItems.length - 1 && (
                      <Box className="absolute left-[0.6rem] top-[0.2rem] flex translate-y-[28px] flex-col items-center gap-[0.1rem]">
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            item.value ? "bg-[--brand-traffic-light-green]" : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            item.value ? "bg-[--brand-traffic-light-green]" : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            item.value ? "bg-[--brand-traffic-light-green]" : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            item.value ? "bg-[--brand-traffic-light-green]" : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            item.value ? "bg-[--brand-traffic-light-green]" : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            item.value ? "bg-[--brand-traffic-light-green]" : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            item.value ? "bg-[--brand-traffic-light-green]" : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            item.value ? "bg-[--brand-traffic-light-green]" : "bg-black/10"
                          }`}
                        />
                        <Box
                          className={`h-1 w-1 rounded-full ${
                            item.value ? "bg-[--brand-traffic-light-green]" : "bg-black/10"
                          }`}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
