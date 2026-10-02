import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import { currencyFormat, getRouteLocaleString } from "@/helpers/UtilityHelper";
import exclamicon from "@/assets/productdetailsexclamation-icon.svg";
import Image from "next/image";
import { CustomTooltip } from "@/components/og-components/OGtooltip";
// import { useTheme } from "@/hooks/useThemeConfig";
// import { useMedia } from "@/hooks/useMedia";
// import { useVatString } from "@/hooks/useVatString";
import Productfulldescription from "./productfulldescription";
// import { useParams } from "next/navigation";
// import Productprice from "./productprice";

const OGDescription = ({
  data,
  language,
  defaultQty = 1,
  className = "",
}: {
  data: any;
  language: string;
  defaultQty?: number;
  className?: string;
}) => {
  const { getLocale, getLabel } = useBranding();
  const localeCODE = getLocale();
  const Depositfound = data?.linkedItems?.find((item: any) => item.type === "Deposit");
  return (
    <Box className={`flex flex-col items-start base:w-full gtsm:w-full gtlg:w-full ${className}`}>
      <Box
        className={`flex w-full flex-row items-start base:flex-col gtlg:flex-row ${data?.fullDescription ? "base:h-auto gtsm:h-auto gtlg:h-auto" : "base:h-auto gtsm:h-auto gtlg:h-auto"}`}
      >
        <Productfulldescription data={data} className="base:order-2 gtsm:order-2 gtlg:order-1" />
      </Box>

      <Box className="flex w-full flex-col gap-[8px]">
        {Depositfound && (
          <Box
            className={`flex w-fit flex-row items-center gap-3 bg-color-system-info-extra-light px-[9px] py-[6px]`}
          >
            <CustomTooltip content={getLabel("deposit_hover_text")}>
              <Image src={exclamicon} alt="icon" className="cursor-pointer" />
            </CustomTooltip>

            <Box className="flex flex-nowrap items-start base:flex-col base:gap-1 gtsm:flex-col gtsm:gap-1 gtlg:flex-row gtlg:gap-0">
              {" "}
              <span className={`flex-nowrap whitespace-nowrap text-color-text-body body-bold-xs`}>
                {getLabel("deposit_required")}
              </span>
              <span className={`font-normal text-color-text-body body-regular-xs`}>
                &nbsp;{getLabel("deposit_of")}{" "}
                {`${currencyFormat(Depositfound.priceInclVat, localeCODE)}`}{" "}
                {getLabel("deposit_rest")}.
              </span>
            </Box>
          </Box>
        )}
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </Box>
    </Box>
  );
};

export default OGDescription;
