import Typography from "@/components/og-components/Typography";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { useBranding } from "@/contexts/BrandingContext";
import { getTitleOfCategory, formatTitle } from "@/helpers/UtilityHelper";
import { PartsCategoryInterface } from "@/stores/useAdvancedSearchStore";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import Image from "next/image";

type Props = {
  data: PartsCategoryInterface;
  className?: string;
  isActive: boolean;
  onClick: (data: PartsCategoryInterface) => void;
};

const CategoryL1Card = (props: Props) => {
  const { data, className, isActive, onClick } = props;
  const { getLocale } = useBranding();
  const categoryImageUrl = getCategoryImageUrl(data.id, { height: 140, quality: 80 });
  const handleL1Press = () => {
    // debugger;
    if (onClick) {
      onClick(data);
    }
  };

  return (
    <Pressable
      className={`flex h-full min-h-[125px] w-full flex-col justify-between rounded-[6px] border border-color-border-emphasis bg-color-background-emphasis hover:bg-color-background-default base:px-2 gtsm:px-4 ${isActive ? "border-2 border-color-border-focus" : ""} hover:border-color-border-focus ${className}`}
      onPress={handleL1Press}
    >
      <Image
        height={144}
        width={144}
        alt={formatTitle(getTitleOfCategory(data, getLocale()), getLocale() as any)}
        title={formatTitle(getTitleOfCategory(data, getLocale()), getLocale() as any)}
        className={`w-full self-center mix-blend-darken base:pt-2 gtsm:pt-4`}
        src={categoryImageUrl}
        priority
        unoptimized
      />
      {/*  */}
      <Box className="flex min-h-[64px] items-center justify-center border-t border-color-border-emphasis py-4">
        <Typography className="line-clamp-2 break-words text-center leading-[20px] text-color-text-default typography-button-01">
          {formatTitle(getTitleOfCategory(data, getLocale()), getLocale() as any)}
        </Typography>
      </Box>
    </Pressable>
  );
};

export default CategoryL1Card;
