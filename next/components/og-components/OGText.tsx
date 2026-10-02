import React, { ReactNode } from "react";
import { Box } from "../ui/box";

type Props = {
  children?: ReactNode | string;
  className?: string;
  v: "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";
  // size:
};

export const OGText = (props: Props) => {
  const { children } = props;
  let textClass = ``;

  return <Box className={``}>{children}</Box>;
};

// export default OGText
