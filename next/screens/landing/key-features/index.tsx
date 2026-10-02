"use client";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import F_1_ico from "./assets/feature_1_ico.svg";
import { Link, LinkText } from "@/components/ui/link";
import { useCheckForLandingPage } from "@/hooks/appHooks";
import { Pressable } from "@/components/ui/pressable";
import useRouter from "@unitools/router";
import useIpadDetection from "@/hooks/useIpadDetection";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useParams } from "next/navigation";
import { usePolicyDocuments } from "@/hooks/usePolicyDocuments";
import { getClientFeatureFlag } from "@/utils/theme-utils";
import Typography from "@/components/og-components/Typography";

type Props = {
  forceVisible?: boolean;
  noLeftNavSpace?: boolean;
};

const FeaturesTile = ({
  name,
  description,
  icon,
  link,
  link_txt,
  handleOnPress,
  index,
}: FeatureInterface) => {
  const { getLabel } = useBranding();
  return (
    <Box className="mb-[24px] flex flex-row gap-[18px] rounded-[4px] bg-white p-6 last:odd:mr-0 hover:bg-[--brand-secondary-hover] md:odd:mr-[24px] md:last:odd:col-span-2">
      <Box className="max-h-[76px] min-w-[84px] max-w-[84px] basis-3/12">
        <Box className="relative h-full w-full items-center justify-center bg-color-primary-main clip-top-left-bottom-right-key-features">
          <Image src={icon} alt={name} height={24} width={24} />
        </Box>
      </Box>

      <Box className="basis-9/12">
        <Box className="relative justify-center text-color-primary-main body-bold-lg">
          {getLabel(name)}
        </Box>
        <Box className="relative mt-[18px] justify-start self-stretch text-[--brand-tarmac-black] body-regular-sm">
          {getLabel(description)}
        </Box>
        <Link className="">
          {/* <Link>{link_txt}</Link> */}
          {link && link_txt && (
            <LinkText className="relative mt-[18px] items-end justify-start self-stretch text-color-primary-main no-underline body-bold-sm hover:underline">
              {getLabel(`${link_txt}`)}
            </LinkText>
          )}

          {Number(index) !== 1 && handleOnPress && (
            <Pressable onPress={handleOnPress}>
              <LinkText className="relative mt-[18px] items-end justify-start self-stretch text-color-primary-main no-underline body-bold-sm hover:underline">
                {getLabel(`${link_txt}`)}
              </LinkText>
            </Pressable>
          )}
          {!getClientFeatureFlag("saved_car_feature_flag") && Number(index) === 1 && (
            <LinkText className="relative mt-[18px] cursor-default items-end justify-start self-stretch text-color-primary-main no-underline body-bold-sm">
              {getLabel(`${link_txt}`)}
            </LinkText>
          )}
          {getClientFeatureFlag("saved_car_feature_flag") &&
            Number(index) === 1 &&
            handleOnPress && (
              <Pressable onPress={handleOnPress}>
                <LinkText className="relative mt-[18px] cursor-pointer items-end justify-start self-stretch text-color-primary-main no-underline body-bold-sm hover:underline">
                  {getLabel(`${link_txt}`)}
                </LinkText>
              </Pressable>
            )}
        </Link>
      </Box>
    </Box>
  );
};

interface FeatureInterface {
  icon: string;
  name: string;
  description: string;
  link?: string | undefined;
  link_txt?: string | undefined;
  handleOnPress?: ((params?: object | undefined) => void) | undefined;
  index?: number;
}

const ITEMS_COUNT = 5;
const useKeyFeatures = () => {
  const { navigate } = useRouter();
  const { viewPolicy } = usePolicyDocuments();
  const params = useParams();
  let FeaturesList: FeatureInterface[] = [];
  for (let index = 1; index <= ITEMS_COUNT; index++) {
    FeaturesList.push({
      icon: `/assets/key-features/feature_${index}_ico.svg`,
      name: `feature_${index}_name`,
      description: `feature_${index}_desc`,
      handleOnPress: (props) => {
        switch (index) {
          case 1: // Unmatched
            navigate(getRouteLocaleString(Routes.allbrands, params));
            break;
          case 2: // Unmatched
            navigate(getRouteLocaleString(Routes.garageBay, params));

            break;
          case 3: // Unmatched
            if (typeof window !== "undefined") {
              window.scrollTo({
                top: 100,
                behavior: "smooth",
              });
            }
            break;
          case 4: // Unmatched
            navigate(getRouteLocaleString(Routes.driveAssist, params));

            break;
          case 5: // Unmatched
            viewPolicy("shipping");
            break;

          default:
            break;
        }
      },
      link_txt: `feature_${index}_link_txt`,
    });
  }
  return FeaturesList;
};

const KeyFeaturesSection = ({ forceVisible = false, noLeftNavSpace = false }: Props) => {
  const { getLabel } = useBranding();
  const isIpad = useIpadDetection();
  const keyFeatures = useKeyFeatures();
  const [Features, setFeatures] = useState<FeatureInterface[]>(keyFeatures);
  const ifLandingPage = useCheckForLandingPage();

  if (!ifLandingPage && !forceVisible) {
    return null;
  }

  if (!getClientFeatureFlag("pride_job_well_done_flag")) {
    return null;
  }

  return (
    <Box className="mt-0 overflow-x-hidden bg-color-background-l2 pt-[60px] md:py-[37px]">
      <Box
        className={`${isIpad || noLeftNavSpace ? "" : `${getClientFeatureFlag("show_left_nav_flag") ? "lg:ml-[200px]" : "lg:ml-[36px]"}`} flex items-center base:px-3 xs:pl-0 md:mx-[38px] lg:pl-0`}
      >
        <Typography type="h2" className="relative text-center text-color-text-body">
          {getLabel("feature_title")}
        </Typography>
        <Box className="relative text-center text-color-text-body body-regular-md">
          {getLabel("feature_desc")}
        </Box>

        <Box className="mt-8 grid grid-cols-1 justify-stretch md:grid-cols-2">
          {/* <pre>{JSON.stringify(Features, null, 2)}</pre> */}
          {Features?.map((feature: FeatureInterface, indx: number) => {
            if (Number(indx) === 0 && !getClientFeatureFlag("featured_makes_feature_flag")) {
              return null;
            }
            if (Number(indx) === 1 && !getClientFeatureFlag("saved_car_feature_flag")) {
              return null;
            }
            return (
              <FeaturesTile
                name={feature.name}
                description={feature.description}
                icon={feature.icon}
                link={feature.link}
                handleOnPress={feature.handleOnPress}
                link_txt={feature.link_txt}
                index={indx}
                key={indx}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default KeyFeaturesSection;
