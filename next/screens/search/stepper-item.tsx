import { Box } from "@/components/ui/box";
import EditIcon from "@/assets/search/pencil-edit.svg";
import Image from "next/image";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { Button } from "@/components/ui/button";

interface StepperItemProps {
  keyName: string;
  value: string;
  step: number;
  onEditStep: (step: number) => void;
  isLastItem: boolean;
  isEB?: boolean;
  ebMode?: "add" | "edit";
  searchData?: any;
}

const StepperItem = ({
  keyName,
  value,
  step,
  onEditStep,
  isLastItem,
  isEB,
  ebMode,
  searchData,
}: StepperItemProps) => {
  const { currentStep, isOgSearch } = useSearchModalStore();

  const shouldShowEditButton = () => {
    if (isEB && ebMode === "edit") {
      if (searchData.type?.value && step <= 4) return true;
      if (searchData.year?.value && !searchData.type?.value && step <= 3) return true;
      if (
        searchData.model?.value &&
        !searchData.year?.value &&
        !searchData.type?.value &&
        step <= 2
      )
        return true;
      if (searchData.make?.value && !searchData.model?.value && step < 2) return true;
      return false;
    }

    // Existing logic for non-EB mode
    return !isOgSearch && currentStep > step;
  };

  return (
    <Box className="overflow-hidden">
      <Box className="flex flex-row items-center justify-between py-4">
        <Box className="flex flex-row items-center gap-1">
          <span className="font-Overpass text-[20px] font-[500] leading-[22px] text-color-primary-main">
            {keyName}
          </span>
          <span className="text-color-primary-main">-</span>
          <span className="font-Overpass text-[20px] font-[500] capitalize leading-[22px] text-[--brand-traffic-light-green]">
            {value}
          </span>
        </Box>
        <Box className="flex flex-row items-center gap-4">
          <span className="font-Overpass text-[20px] leading-[22px] text-black opacity-20">|</span>
          {!isOgSearch && currentStep !== step && !isEB && (
            <Button
              className="bg-transparent focus:bg-transparent active:bg-transparent"
              onPress={() => onEditStep(step)}
            >
              <Image src={EditIcon} alt="Edit" width={24} height={24} />
            </Button>
          )}

          {/* On edit EB -> all data are there so all should have edit  */}
          {isEB && ebMode === "edit" && (
            <Button
              className="bg-transparent focus:bg-transparent active:bg-transparent"
              onPress={() => onEditStep(step)}
            >
              <Image src={EditIcon} alt="Edit" width={24} height={24} />
            </Button>
          )}
        </Box>
      </Box>
      {!isLastItem && (
        <Box className="border-b border-dashed border-[--primary-colors-primary-dark] opacity-50" />
      )}
    </Box>
  );
};

export default StepperItem;
