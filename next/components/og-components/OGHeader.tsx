"use client";

import React from "react";
import Image from "next/image";
// import leftarrow from "../../public/assets/icons/arrow-left-02.svg";
import leftarrow from "@/assets/icons/arrow-left-02.svg";
import { useRouter } from "next/navigation";
import { Box } from "../ui/box";
import Typography from "./Typography";

type HeaderProps = {
  backarrow?: boolean;
  headertitle?: string;
  backlink?: string;
};

const OGHeader: React.FC<HeaderProps> = ({ backarrow, headertitle, backlink }) => {
  const router = useRouter();
  const handleBack = () => {
    if (backlink) {
      router.push(backlink);
    } else {
      router.back();
    }
  };

  return (
    <Box className="flex w-full flex-row items-center base:gap-3 gtsm:gap-3 gtsm:px-3 gtlg:gap-6 gtlg:px-0">
      {backarrow && (
        <Image
          src={leftarrow}
          alt="arrow"
          className="h-8 w-8 cursor-pointer"
          onClick={handleBack}
        />
      )}

      <Typography type="h1" className="text-color-text-body typography-heading-01">
        {headertitle}
      </Typography>
    </Box>
  );
};

export default OGHeader;
