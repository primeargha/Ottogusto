import { Box } from "@/components/ui/box";
import Image from "next/image";
import GrayCircle from "@/assets/search/gray-circle.svg";
import LightGreenCircle from "@/assets/search/light-green-circle.svg";
import DarkGreenCircle from "@/assets/search/dark-green-circle.svg";
import WhiteTick from "../icons/WhiteTick";

interface StepperDotsProps {
  step: number;
  currentStep: number;
  isLastStep: boolean;
  hasValue: boolean;
  isVinStep?: boolean;
  isTablet?: boolean;
}

export const OGStepperDots = ({
  step,
  currentStep,
  isLastStep,
  hasValue,
  isVinStep,
  isTablet,
}: StepperDotsProps) => {
  const getStepIcon = () => {
    // For VIN steps, only show dark green or gray
    if (isVinStep) {
      return hasValue ? (
        <Box className="relative h-[32px] w-[32px]">
          <Image src={DarkGreenCircle} alt="Dark Green Circle" className="absolute" fill />
          <Box className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <WhiteTick />
          </Box>
        </Box>
      ) : (
        <Box className="relative h-[32px] w-[32px]">
          <Image src={GrayCircle} alt="Gray Circle" className="absolute" fill />
          <Box className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <WhiteTick />
          </Box>
        </Box>
      );
    }

    // For non-VIN steps
    // Show dark green for completed steps
    if (hasValue && step < currentStep) {
      return (
        <Box className="relative h-[32px] w-[32px]">
          <Image src={DarkGreenCircle} alt="Dark Green Circle" className="absolute" fill />
          <Box className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <WhiteTick />
          </Box>
        </Box>
      );
    }

    // Show light green for current step
    if (step === currentStep) {
      return (
        <Box className="relative h-[32px] w-[32px]">
          <Image src={LightGreenCircle} alt="Light Green Circle" className="absolute" fill />
          <Box className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <WhiteTick />
          </Box>
        </Box>
      );
    }

    // Show gray for future steps or incomplete steps
    return (
      <Box className="relative h-[32px] w-[32px]">
        <Image src={GrayCircle} alt="Gray Circle" className="absolute" fill />
        <Box className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <WhiteTick />
        </Box>
      </Box>
    );
  };

  return (
    <Box className="relative">
      {getStepIcon()}

      {!isLastStep && !isTablet && (
        <Box className="absolute left-[0.9rem] top-[0.6rem] flex translate-y-[28px] flex-col items-center gap-[0.1rem]">
          {[...Array(9)]?.map((_, i) => (
            <Box key={i} className="h-1 w-1 rounded-full bg-[--primary-colors-disabled]" />
          ))}
        </Box>
      )}
    </Box>
  );
};
