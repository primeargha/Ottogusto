import React from "react";
import { Box } from "../ui/box";
import Image from "next/image";
import partImg from "../../public/assets/bg1.png";

const OGImageCarousal = () => {
  return (
    <Box className="relative h-[240px] w-full overflow-hidden bg-gray-400 gtsm:h-[320px] gtlg:h-80 gtlg:w-3/12">
      <Image
        src={partImg}
        alt=""
        fill
        sizes="(max-width: 1023px) 100vw, 25vw"
        className="object-cover"
        unoptimized
      />
    </Box>
  );
};

export default OGImageCarousal;
