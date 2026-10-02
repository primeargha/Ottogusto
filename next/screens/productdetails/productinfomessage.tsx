import Typography from "@/components/og-components/Typography";
import { Box } from "@/components/ui/box";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import Link from "next/link";
import { useParams } from "next/navigation";
import FitmentCar from "./FitmentCar";

const Productinfomessage = () => {
  const params = useParams();
  const { getLabel } = useBranding();
  return (
    <Link
      href={getRouteLocaleString(Routes.fitmentDetails, params)}
      className="gtsm:w-full gtlg:w-auto"
    >
      <Box className="flex min-h-[52px] w-full cursor-pointer flex-row items-center justify-start gap-space-md rounded-radius-medium border border-color-border-info bg-color-background-info-muted card-padding-default">
        <FitmentCar className="max-h-9 min-h-9 min-w-9 max-w-9 text-color-icon-info" />
        <Typography className="text-color-text-info typography-body-02">
          {getLabel("pdp_info")}
        </Typography>
      </Box>
    </Link>
  );
};

export default Productinfomessage;
