import { Box } from "@/components/ui/box";
import { Link } from "@/components/ui/link";
import Image from "next/image";
import React from "react";

import { safeNextLinkHref } from "@/utils/translationDisplayMode";
import FbICO from "./assets/fb-icon.svg";
import InstaICO from "./assets/insta-icon.svg";
import TwitterICO from "./assets/x-twitter-icon.svg";

type Props = {
  getLabel: (key: string) => string | null | undefined | false;
};

const SocialLinks = (props: Props) => {
  const { getLabel } = props;
  return (
    <Box className="flex flex-row items-center justify-end gap-6 pr-0">
      <Link href={safeNextLinkHref(getLabel("facebook_link") || "")}>
        <Image src={FbICO} alt="Facebook" title="Facebook" className="h-24px w-[24px]" />
      </Link>
      {/* <Link href={getLabel("twitter_link")}>
        <Image src={TwitterICO} alt="Facebook" className="h-24px w-[24px]" />
      </Link> */}
      <Link href={safeNextLinkHref(getLabel("instagram_link") || "")}>
        <Image src={InstaICO} alt="Instagram" title="Instagram" className="h-24px w-[24px]" />
      </Link>
    </Box>
  );
};

export default SocialLinks;
