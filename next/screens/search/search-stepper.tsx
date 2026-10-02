import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Box } from "@/components/ui/box";
import StepperItem from "./stepper-item";

const SearchStepper = () => {
  const { searchData, setStep, isEB, ebMode } = useSearchModalStore();

  const getStepItems = () => {
    const items: { step: number; keyName: string; value: string }[] = [];
    if (searchData.make?.value) {
      items.push({ step: 1, keyName: "Make", value: searchData.make.value });
    }
    if (searchData.model?.value) {
      items.push({ step: 2, keyName: "Model", value: searchData.model.value });
    }
    if (searchData.year?.value) {
      items.push({ step: 3, keyName: "Year", value: searchData.year.value });
    }
    if (searchData.type?.value) {
      items.push({ step: 4, keyName: "Type", value: searchData.type.value });
    }
    return items;
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

  const handleEditStep = (step: number) => {
    setStep(step);
  };

  const stepItems = getStepItems();
  if (stepItems.length === 0) return null;

  return (
    <Box className="mb-4 min-h-fit rounded-[8px] bg-color-background-l1 p-4 shadow-[0px_2px_20px_10px_rgba(0,0,0,0.05)] gtsm:hidden">
      {stepItems?.map((item, index) => (
        <StepperItem
          key={`${item.step}-${item.keyName}-${item.value}`}
          keyName={item.keyName}
          value={item.value}
          step={item.step}
          onEditStep={handleEditStep}
          isLastItem={index === stepItems.length - 1}
          isEB={isEB}
          ebMode={ebMode}
          searchData={searchData}
        />
      ))}
    </Box>
  );
};

export default SearchStepper;
