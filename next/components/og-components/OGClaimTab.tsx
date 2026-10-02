import React from "react";
import { Box } from "../ui/box";
import { Text } from "../ui/text";
import { useMedia } from "@/hooks/useMedia";
import { useBranding } from "@/contexts/BrandingContext";
import { SupportAgentIcon } from "./tabsIcons/SupportAgentIcon";
import { WorkspaceIcon } from "./tabsIcons/Workspaceicon";
import { SecurityIcon } from "./tabsIcons/SecurityIcon";
import { ReturnIcon } from "./tabsIcons/ReturnIcon";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface OGClaimtabProps {
  device?: "desktop" | "mobile";
  itemsCount?: 1 | 2 | 3 | 4;
  state?: "enabled" | "hover";
  isLink?: boolean;
  icon?: React.ReactNode;
  label?: string;
}

type SingleTabProps = {
  label: string;
  isLink?: boolean;
  link?: string;
  tabIcon?: React.ReactNode;
};

export function SingleTab({ label, link, isLink, tabIcon }: SingleTabProps) {
  const content = (
    <>
      {tabIcon}
      <Text
        className={`typography-body-strong-02 ${isLink && link ? "hover:text-color-text-link" : ""} `}
      >
        {label}
      </Text>
    </>
  );

  if (!isLink || !link) {
    return <Box className="flex h-full w-auto flex-row items-center gap-3">{content}</Box>;
  }

  return (
    <Link className="flex h-full w-auto cursor-pointer flex-row items-center gap-3" href={link}>
      {content}
    </Link>
  );
}

export default function OGClaimtab({
  device = "desktop",
  itemsCount = 4,
  state = "enabled",
  isLink = false,
  icon = null,
  label = "",
}: OGClaimtabProps) {
  const isMobile = useMedia("(max-width: 719px)");
  const { getLabel } = useBranding();
  const params = useParams();
  let tabContainerclassLarge = `
  flex items-center
  ${isMobile ? "flex-col" : "flex-row"}
  ${
    itemsCount === 1
      ? "w-full justify-center"
      : itemsCount === 2
        ? "w-full justify-around"
        : "w-full justify-between"
  }
  rounded-[4px] bg-transparent layout-width-footer py-6 gtsm:px-8 gtlg:px-20 base:px-9
`;

  return (
    <Box className={tabContainerclassLarge}>
      {/* OPTION 1 */}
      {itemsCount >= 1 && (
        <SingleTab
          label={getLabel("OE_PART")}
          tabIcon={<WorkspaceIcon className="h-8 w-8 text-color-icon-default" />}
          isLink={false}
        />
      )}

      {!isMobile ? (
        <>{itemsCount >= 2 && <Box className="h-full w-[1px] bg-color-border-emphasis" />}</>
      ) : (
        <Box className="my-[18px] h-[1px] w-full bg-color-border-emphasis" />
      )}

      {itemsCount >= 2 && (
        <>
          <SingleTab
            label={getLabel("expert_support")}
            tabIcon={<SupportAgentIcon className="h-8 w-8 text-color-icon-default" />}
            isLink
            link={`${getRouteLocaleString(Routes.support, params)}`}
          />
        </>
      )}
      {!isMobile ? (
        <>{itemsCount >= 2 && <Box className="h-full w-[1px] bg-color-border-emphasis" />}</>
      ) : (
        <Box className="my-[18px] h-[1px] w-full bg-color-border-emphasis" />
      )}

      {itemsCount >= 3 && (
        <>
          <SingleTab
            label={getLabel("secure_payment")}
            tabIcon={<SecurityIcon className="h-8 w-8 text-color-icon-default" />}
          />
        </>
      )}

      {itemsCount >= 4 && (
        <>
          {!isMobile ? (
            <>{itemsCount >= 2 && <Box className="h-full w-[1px] bg-color-border-emphasis" />}</>
          ) : (
            <Box className="my-[18px] h-[1px] w-full bg-color-border-emphasis" />
          )}

          <SingleTab
            label={getLabel("days_return14")}
            tabIcon={<ReturnIcon className="h-8 w-8 text-color-icon-default" />}
            isLink
            link={getRouteLocaleString(Routes.returnPolicy, params)}
          />
        </>
      )}
    </Box>
  );
}
