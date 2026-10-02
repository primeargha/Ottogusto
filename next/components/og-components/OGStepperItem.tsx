import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import EditIcon from "@/assets/search/ai-editing.svg";

interface StepperItemProps {
  keyName: string;
  value: string;
  showEdit: boolean;
  onEdit: () => void;
  isTablet?: boolean;
}

export const OGStepperItem = ({ keyName, value, showEdit, onEdit, isTablet }: StepperItemProps) => {
  return (
    <Box
      className={`flex flex-1 flex-row items-center ${isTablet ? "flex-col text-center" : "justify-between"}`}
    >
      <Box className={`flex ${isTablet ? "flex-col items-center" : "flex-row"} gap-[12px]`}>
        {!isTablet ? (
          <Text className="font-Overpass text-[20px] font-bold leading-[22px] text-color-text-body">
            {keyName}
          </Text>
        ) : (
          <Box className="flex flex-row items-center gap-[12px]">
            <Text className="font-Overpass text-[20px] font-bold leading-[22px] text-color-text-body">
              {keyName}
            </Text>
            {showEdit && (
              <Button
                className="bg-transparent p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent"
                onPress={onEdit}
              >
                <Image src={EditIcon} alt="Edit" width={24} height={24} />
              </Button>
            )}
          </Box>
        )}
        {value && (
          <>
            {!isTablet && (
              <Text className="font-Overpass text-[20px] font-bold leading-[22px] text-color-text-body">
                -
              </Text>
            )}
            <Text
              className={`font-Overpass ${isTablet ? "mt-[-10px] text-[18px]" : "text-[20px]"} font-bold leading-[22px] text-[--brand-traffic-light-green]`}
            >
              {value}
            </Text>
          </>
        )}
      </Box>
      {showEdit && !isTablet && (
        <Button
          className="bg-transparent p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent"
          onPress={onEdit}
        >
          <Image src={EditIcon} alt="Edit" width={24} height={24} />
        </Button>
      )}
    </Box>
  );
};
