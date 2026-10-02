import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { OGStepperDots } from "@/components/og-components/OGStepperDots";
import { OGStepperItem } from "@/components/og-components/OGStepperItem";
import { useMedia } from "@/hooks/useMedia";
import { useBranding } from "@/contexts/BrandingContext";

const VerticalSeparator = () => (
  <Box className="absolute -right-2 top-[-50px] flex h-full flex-col items-center justify-center gap-[0.1rem]">
    {[...Array(9)]?.map((_, i) => (
      <Box key={i} className="h-1 w-1 rounded-full bg-[--primary-colors-disabled]" />
    ))}
  </Box>
);

export default function OGStepper() {
  const isTablet = useMedia("(min-width: 640px) and (max-width: 1023px)");
  const { searchData, setStep, currentStep, isOgSearch, carByVinResults, isEB, ebMode } =
    useSearchModalStore();
  const { getLabel } = useBranding();
  const getStepItems = () => {
    const items = [
      { step: 1, keyName: getLabel("make"), value: searchData.make?.value || "" },
      { step: 2, keyName: getLabel("model"), value: searchData.model?.value || "" },
      { step: 3, keyName: getLabel("year"), value: searchData.year?.value || "" },
      { step: 4, keyName: getLabel("type"), value: searchData.type?.value || "" },
    ];
    return items;
  };

  const getVINStepItems = () => {
    const items = [
      { step: 1, keyName: getLabel("make"), value: carByVinResults[0]?.brand || "" },
      { step: 2, keyName: getLabel("model"), value: carByVinResults[0]?.model || "" },
      {
        step: 3,
        keyName: getLabel("year"),
        value: carByVinResults[0]?.year || carByVinResults[0]?.yearFrom || "",
      },
      { step: 4, keyName: getLabel("type"), value: carByVinResults[0]?.type || "" },
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
    <Box className="mx-auto flex h-auto w-[98%] flex-col rounded-[4px] base:hidden gtsm:mb-[40px] gtsm:block gtlg:mb-[40px] gtlg:p-2">
      {!isTablet && (
        <Box className="mb-4 font-Overpass text-[20px] font-[700] leading-[22px] text-color-text-body">
          {getLabel("details")}
        </Box>
      )}
      <Box className={`flex flex-col ${isTablet ? "gap-0" : "gap-0"}`}>
        {isEB && ebMode === "edit" ? (
          <>
            <Box className={`grid ${isTablet ? "grid-cols-4 gap-4" : "grid-cols-1 gap-16"}`}>
              {stepItems?.map((item, index) => (
                <Box
                  key={`${item.step}-${item.keyName}-${item.value}`}
                  className={`relative flex ${
                    isTablet ? "flex-col items-center" : "flex-row items-center"
                  } gap-3`}
                >
                  <OGStepperDots
                    step={item.step}
                    currentStep={currentStep}
                    isLastStep={index === stepItems.length - 1}
                    hasValue={isGreenTickBasedOnKeyName(item.keyName)}
                    isTablet={isTablet}
                  />
                  <Box className={`flex-1 ${isTablet ? "pt-2" : "pl-[20px]"}`}>
                    <OGStepperItem
                      keyName={item.keyName}
                      value={item.value}
                      showEdit={
                        (searchData.type?.value && item.step <= 4) ||
                        (searchData.year?.value && !searchData.type?.value && item.step <= 3) ||
                        (searchData.model?.value && !searchData.year?.value && item.step <= 2) ||
                        ((searchData.make?.value &&
                          !searchData.model?.value &&
                          item.step < 2) as any)
                      }
                      onEdit={() => handleEditStep(item.step)}
                      isTablet={isTablet}
                    />
                  </Box>
                  {isTablet && index < stepItems.length - 1 && <VerticalSeparator />}
                </Box>
              ))}
            </Box>
          </>
        ) : (
          <>
            {(searchData.make?.value ||
              searchData.model?.value ||
              searchData.type?.value ||
              searchData.year?.value) &&
            carByVinResults.length <= 0 ? (
              <>
                <Box className={`grid ${isTablet ? "grid-cols-4 gap-4" : "grid-cols-1 gap-16"}`}>
                  {stepItems?.map((item, index) => (
                    <Box
                      key={`${item.step}-${item.keyName}-${item.value}`}
                      className={`relative flex ${
                        isTablet ? "flex-col items-center" : "flex-row items-center"
                      } gap-3`}
                    >
                      <OGStepperDots
                        step={item.step}
                        currentStep={currentStep}
                        isLastStep={index === stepItems.length - 1}
                        hasValue={isGreenTickBasedOnKeyName(item.keyName)}
                        // isVinStep={true}
                        isTablet={isTablet}
                      />
                      <Box className={`flex-1 ${isTablet ? "pt-2" : "pl-[20px]"}`}>
                        <OGStepperItem
                          keyName={item.keyName}
                          value={item.value}
                          showEdit={!isOgSearch && currentStep > item.step}
                          onEdit={() => handleEditStep(item.step)}
                          isTablet={isTablet}
                        />
                      </Box>
                      {isTablet && index < stepItems.length - 1 && <VerticalSeparator />}
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <>
                <Box className={`grid ${isTablet ? "grid-cols-4 gap-4" : "grid-cols-1 gap-16"}`}>
                  {vinStepItems?.map((item, index) => (
                    <Box
                      key={`${item.step}-${item.keyName}-${item.value}`}
                      className={`relative flex ${
                        isTablet ? "flex-col items-center" : "flex-row items-center"
                      } gap-3`}
                    >
                      <OGStepperDots
                        step={item.step}
                        currentStep={currentStep}
                        isLastStep={index === vinStepItems.length - 1}
                        hasValue={!!item.value}
                        isVinStep={true}
                        isTablet={isTablet}
                      />
                      <Box className={`flex-1 ${isTablet ? "pt-2" : "pl-[20px]"}`}>
                        <OGStepperItem
                          keyName={item.keyName}
                          value={item.value as any}
                          showEdit={
                            (!carByVinResults.length || carByVinResults.length <= 0) &&
                            currentStep > item.step
                          }
                          onEdit={() => handleEditStep(item.step)}
                          isTablet={isTablet}
                        />
                      </Box>
                      {isTablet && index < vinStepItems.length - 1 && <VerticalSeparator />}
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
