"use client";
import { Box } from "@/components/ui/box";
import { Link } from "@/components/ui/link";
import { Routes } from "@/config/routes";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";
import LeftArroICO from "@/assets/about-us/arrow-left-02.svg";
import useRouter from "@unitools/router";
import { useBranding } from "@/contexts/BrandingContext";
import Typography from "@/components/og-components/Typography";

type Props = {};

const TitleBar = (props: Props) => {
  const router = useRouter();
  const params = useParams();
  const { getLabel } = useBranding();
  return (
    <Box className="flex flex-row items-center pb-5 gap-header-to-title base:px-3 md:px-[38px]">
      <Typography type="h1" className="text-color-text-body typography-heading-01" hasBack>
        {getLabel("aboutus_title")}
      </Typography>
    </Box>
  );
};

export default TitleBar;
