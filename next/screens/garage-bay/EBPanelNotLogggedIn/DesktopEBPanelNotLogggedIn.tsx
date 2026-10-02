import React from "react";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { VStack } from "@/components/ui/vstack";
import { useBranding } from "@/contexts/BrandingContext";
import { ArrowRightIcon } from "@/components/ui/icon";
import { useAuthStore } from "@/stores/useAuthStore";
import { OGButton } from "@/components/og-components/OGButton";
import { get } from "http";
import Typography from "@/components/og-components/Typography";

const LIST_LENGTH = 3;
export const ListFeatues = (props: { isMobileImport: boolean } = { isMobileImport: false }) => {
  const { isMobileImport } = props;
  const { getLabel } = useBranding();
  let list: Array<{ title: string; description: string }> = [];

  for (let i = 1; i <= LIST_LENGTH; i++) {
    list.push({
      title: getLabel(`eb_not_logged_in_list_${i}_head`) ?? "",
      description: getLabel(`eb_not_logged_in_list_${i}_subhead`) ?? "",
    });
  }
  return (
    <ul className="list-none">
      {list?.map((item, index) => (
        <li
          key={index}
          className="relative pl-6 before:absolute before:left-0 before:top-1 before:content-['✔']"
        >
          <Text className="text-color-text-body body-bold-sm">
            {isMobileImport ? (
              <>{item?.title}</>
            ) : (
              <>
                {item.title}:{" "}
                <Text className="text-color-text-body body-regular-sm">{item.description}</Text>
              </>
            )}
          </Text>
        </li>
      ))}
    </ul>
  );

  // for react native
  return (
    <VStack>
      {list?.map((item, index) => (
        <Box
          key={index}
          className="justify-start font-Overpass text-[16px] font-bold text-color-text-body"
        >
          <Text className="text font-Overpass text-[16px] font-bold text-color-text-body">
            ✔ {"  "}
            {item.title}{" "}
            <Text className="text font-Overpass text-[16px] font-normal text-color-text-body">
              {item.description}
            </Text>
          </Text>
        </Box>
      ))}
    </VStack>
  );
};

export default function DesktopEBPanelNotLogggedIn() {
  const { openModal, resetSearch, setIsOgSearch, setIsEB, setEbMode } = useSearchModalStore();
  const { getLabel } = useBranding();
  const { openLoginModal } = useAuthStore();
  const LIST_LENGTH = 3;

  return (
    <Box className="hidden items-center gtlg:flex gtlg:flex-row">
      {/* left section - now spans 2/3 */}
      <Box className="h-full w-8/12">
        <Box className="flex flex-col gap-2">
          <Box className="inline-flex flex-col items-start justify-start gap-6 self-stretch">
            <Box className="flex flex-col items-start justify-start gap-6 self-stretch">
              <Box className="justify-start text-color-text-body body-bold-md">
                {getLabel("eb_not_logged_in_subtitle")}
              </Box>
              <Typography type="h1" className="justify-start self-stretch text-color-text-body">
                {getLabel("eb_not_logged_in_title")}
              </Typography>
              <Box>
                <ListFeatues isMobileImport={false} />
              </Box>
            </Box>

            <OGButton
              type="primary"
              size="large"
              onClick={() => {
                openLoginModal("/profile");
              }}
              rightcomp={
                <Image
                  src={"/assets/icons/arrow-right-02.svg"}
                  width={24}
                  height={24}
                  alt="arrow-right"
                />
              }
              // className="flex w-fit flex-row items-center gap-2 rounded-[4px] p-[16px] text-[--Text-White]"
            >
              {getLabel("eb_not_logged_in_btn_text")}
            </OGButton>
          </Box>
        </Box>
      </Box>
      {/* right section - now spans 1/3 */}
      <Box className="relative h-[90vh] w-4/12 min-w-[397px] pt-[150px] md:pt-[140px]">
        <Image
          src="/assets/eb-panel/eb-panel-right-frame.png"
          alt="eb-panel-hero-image"
          fill
          className="mt-[45px] object-contain"
          // className="mt-[-100px] object-contain gtlg:object-contain 2xl:object-cover"
        />
      </Box>
    </Box>
  );
}
