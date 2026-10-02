// import { Blank } from "@/screens/blank";
import React from "react";

import { Metadata } from "next";
import { Box } from "@/components/ui/box";
import ProfileNavbar from "@/screens/profile/ProfileNavbar";

export const metadata: Metadata = {
  title: "Profile | Ottogusto",
  keywords: "",
  description: "Profile Page",
};

const ProfilePage = () => {
  // DONOT REMOVE THIS. /profile => is used by only mobile.
  return (
    <Box className="h-full w-full bg-color-background-default">
      <ProfileNavbar />
    </Box>
  );
};

export default ProfilePage;
