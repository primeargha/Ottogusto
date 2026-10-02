import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import EditIcon from "@/assets/search/pencil-edit.svg";
import GreenTickIcon from "@/assets/search/green-tick.svg";
import GrayTickIcon from "@/assets/search/gray-tick.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function SearchStepperTablet() {
  const { searchData, setStep, currentStep, isOgSearch, isEB, ebMode } = useSearchModalStore();

  const getStepItems = () => {
    const items = [
      { step: 1, keyName: "Make", value: searchData.make?.value || "" },
      { step: 2, keyName: "Model", value: searchData.model?.value || "" },
      { step: 3, keyName: "Year", value: searchData.year?.value || "" },
      { step: 4, keyName: "Type", value: searchData.type?.value || "" },
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
  if (stepItems.length === 0) return null;

  return (
    <Box className="mx-auto mb-6 flex min-h-[168px] w-[98%] flex-row justify-center rounded-[4px] bg-[--Brand-Pure-White] p-2 base:hidden gtsm:block">
      <Box className="mb-2 text-center font-Overpass text-[20px] font-[700] leading-[22px] text-color-text-body">
        Details
      </Box>
      <Box className="flex flex-row items-start justify-center">
        {isEB && ebMode === "edit" ? (
          <>
            {stepItems?.map((item, index) => (
              <Box
                key={`${item.step}-${item.keyName}-${item.value}`}
                className="flex flex-row items-start"
              >
                <Box className="flex flex-col items-center gap-2">
                  {/* Tick Icon */}
                  {item.value ||
                  (item.keyName === "Make" && searchData.make?.value) ||
                  (item.keyName === "Model" && searchData.model?.value) ||
                  (item.keyName === "Year" && searchData.year?.value) ||
                  (item.keyName === "Type" && searchData.type?.value) ? (
                    <Image src={GreenTickIcon} alt="Tick" width={24} height={24} />
                  ) : (
                    <Image src={GrayTickIcon} alt="Tick" width={24} height={24} />
                  )}

                  {/* Step Name and Value */}
                  <Box className="flex items-center gap-1">
                    <Text className="font-Overpass text-[20px] font-[700] leading-[22px] text-color-text-body">
                      {item.keyName} -
                    </Text>
                    <Text className="font-Overpass text-[20px] font-[700] leading-[22px] text-[--brand-traffic-light-green]">
                      {item.value}
                    </Text>
                  </Box>

                  {/* Edit Icon - based on requirements */}
                  {((searchData.type?.value && item.step <= 4) ||
                    (searchData.year?.value && !searchData.type?.value && item.step <= 3) ||
                    (searchData.model?.value &&
                      !searchData.year?.value &&
                      !searchData.type?.value &&
                      item.step <= 2) ||
                    (searchData.make?.value && !searchData.model?.value && item.step < 2)) && (
                    <Button
                      className="bg-transparent focus:bg-transparent active:bg-transparent"
                      onPress={() => handleEditStep(item.step)}
                    >
                      <Image src={EditIcon} alt="Edit" width={24} height={24} />
                    </Button>
                  )}
                </Box>

                {/* Dots between steps */}
                {index < stepItems.length - 1 && (
                  <Box className="mx-4 flex flex-row items-center gap-2 pt-2">
                    <Box
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
                    <Box
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
                    <Box
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
                  </Box>
                )}
              </Box>
            ))}
          </>
        ) : (
          <>
            {stepItems?.map((item, index) => (
              <Box
                key={`${item.step}-${item.keyName}-${item.value}`}
                className="flex flex-row items-start"
              >
                <Box className="flex flex-col items-center gap-2">
                  {/* Tick Icon */}
                  {isGreenTickBasedOnKeyName(item.keyName) && item.step < currentStep ? (
                    <Image src={GreenTickIcon} alt="Tick" width={24} height={24} />
                  ) : (
                    <Image src={GrayTickIcon} alt="Tick" width={24} height={24} />
                  )}
                  {/* Step Name and Value */}
                  <Box className="flex items-center gap-1">
                    <Text className="font-Overpass text-[20px] font-[700] leading-[22px] text-color-text-body">
                      {item.keyName} -
                    </Text>
                    <Text className="font-Overpass text-[20px] font-[700] leading-[22px] text-[--brand-traffic-light-green]">
                      {item.value}
                    </Text>
                  </Box>

                  {/* Edit Icon */}
                  {!isOgSearch && currentStep > item.step && (
                    <Button
                      className="bg-transparent focus:bg-transparent active:bg-transparent"
                      onPress={() => handleEditStep(item.step)}
                    >
                      <Image src={EditIcon} alt="Edit" width={24} height={24} />
                    </Button>
                  )}
                </Box>

                {/* Dots between steps */}
                {index < stepItems.length - 1 && (
                  <Box className="mx-4 flex flex-row items-center gap-2 pt-2">
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
        )}
      </Box>
    </Box>
  );
}
