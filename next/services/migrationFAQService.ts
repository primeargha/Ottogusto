// import { getCurrentStore } from "@/utils/theme-utils";

// const languageMap: Record<string, string> = {
//   EN: "MigrationFAQ_EN.html",
//   NL: "MigrationFAQ_NL.html",
//   FR: "MigrationFAQ_FR.html",
// };

// const cdnbaseUrl =
//   process.env.NEXT_PUBLIC_CDN_BASE_URL || "https://cdn.ottogusto.group";

// export const fetchMigrationFAQHtml = async (languageCode: string) => {
//   const fileName = languageMap[languageCode] || languageMap.EN;
//   const currentStore = getCurrentStore();
//   const url =  `${cdnbaseUrl}/${currentStore}/${fileName}`;

//   const res = await fetch(url, {
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch Migration FAQ");
//   }

//   return res.text();
// };

import { apiClient, ApiError } from "@/config/api";
// import { ProfileUpdatePayload } from "@/types/profile";
// import { useAuthStore } from "@/stores/useAuthStore";

// //  will call for react query - query
const languageMap: Record<string, string> = {
  en: "MigrationFAQ_EN.html",
  nl: "MigrationFAQ_NL.html",
  fr: "MigrationFAQ_FR.html",
};
export const fetchMigrationFAQHtml = async (languageCode: string) => {
  const fileName = languageMap[languageCode] || "MigrationFAQ_EN.html";
  const res = await fetch(`/api/migration-faq?file=${fileName}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch return policy: ${res.statusText}`);
  }
  const data = await res.json();
  return data.content;
};
