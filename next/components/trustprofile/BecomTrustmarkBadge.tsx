"use client";

import Image from "next/image";
import { TRUSTPROFILE_CONFIG } from "@/config/trustprofile";
import TrustprofileSidebarScript from "./TrustprofileSidebarScript";

const BADGE_WIDTH = 500;
const BADGE_HEIGHT = 123;

/**
 * Static Becom Trustmark badge for the footer (Trustprofile widget).
 */
export default function BecomTrustmarkBadge() {
  const { profileUrl, badgeImageUrl } = TRUSTPROFILE_CONFIG;

  return (
    <>
      <TrustprofileSidebarScript />
      <a
        href={profileUrl}
        className="trustprofilePopup inline-flex shrink-0"
        title="Webshop Trustmark and customer reviews"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={badgeImageUrl}
          width={BADGE_WIDTH}
          height={BADGE_HEIGHT}
          alt="Webshop Trustmark and customer reviews"
          className="h-[40px] w-auto max-w-full"
          style={{ height: 40, width: 163, maxWidth: "100%" }}
          unoptimized
        />
      </a>
    </>
  );
}
