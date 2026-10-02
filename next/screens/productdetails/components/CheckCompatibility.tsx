"use client";
import { OGButton } from "@/components/og-components/OGButton";
import OGCardCollapsable from "@/components/og-components/OGCardCollapsable";
import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import { Routes } from "@/config/routes";
import { useBranding } from "@/contexts/BrandingContext";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import useRouter from "@unitools/router";
import Image from "next/image";
import { useParams } from "next/navigation";

type Props = {
  partId: String | null;
};

const CheckCompatibility = (props: Props) => {
  const { partId } = props;
  const router = useRouter();
  const params = useParams();
  const searchData = useSearchModalStore((s) => s.searchData);
  const { getLabel } = useBranding();
  // Will be updated once the API is available
  const getSign = () => {
    if (!searchData.make?.value) {
      return (
        <Image src={"/assets/icons/check-unread-01.svg"} width={24} height={24} alt="control" />
      );
    }
    if (!searchData.model?.value) {
      return <Image src={"/assets/icons/warning.svg"} width={24} height={24} alt="control" />;
    }
    // if(true){
    return <Image src={"/assets/icons/tick-01.svg"} width={24} height={24} alt="control" />;
    // }
  };
  const getCompatibilityCarTitle = () => {
    let responseArr = [
      searchData.make?.value ?? "",
      searchData.model?.value ?? "",
      searchData.year?.value ?? "",
      searchData.type?.value ?? "",
      searchData.cc ?? "",
      searchData.fuel ?? "",
      searchData.hp ?? "",
      searchData.cc ?? "",
      searchData.variant ?? "",
      searchData.body ?? "",
    ];
    if (responseArr.filter((a) => a != "").length === 0) {
      const title = `${getLabel("make")} - ${getLabel("model")} - ${getLabel("type")} - ${getLabel("year")} - ${getLabel("cc")} - ${getLabel("fuel")} - ${getLabel("hp")} - ${getLabel("variant")} - ${getLabel("doors")} - ${getLabel("Frame")}`;
      return title;
    }
    return responseArr.filter((a) => a != "").join(" - ");
    return <pre>{JSON.stringify(responseArr.join(" - "), null, 2)};</pre>;
    return `Volvo - V60 - D2 - 2018 - CC - Fuel - HP - Variant - Doors - Frame`;
  };
  return (
    <OGCardCollapsable
      cardTitle={getLabel("active_search")}
      collapsable={false}
      expanded={true}
      rightcomp={
        <OGButton
          size="medium"
          type="primary"
          onClick={() => {
            router.navigate(getRouteLocaleString(Routes.manualsearch, params));
          }}
        >
          {getLabel("confirm_car_compatibility")}
        </OGButton>
      }
    >
      <Box className={`flex flex-row items-center gap-2 body-regular-sm`}>
        {getSign()}
        <Box className="text-color-text-body">{getCompatibilityCarTitle()}</Box>
      </Box>
    </OGCardCollapsable>
  );
};

export default CheckCompatibility;
