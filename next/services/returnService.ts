import { apiClient, ApiError } from "@/config/api";
// import { ProfileUpdatePayload } from "@/types/profile";
// import { useAuthStore } from "@/stores/useAuthStore";

// //  will call for react query - query
const languageMap: Record<string, string> = {
  EN: "ReturnPolicy_EN.html",
  NL: "ReturnPolicy_NL.html",
  FR: "ReturnPolicy_FR.html",
  DE: "ReturnPolicy_DE.html",
};

export const fetchReturnPolicyHtml = async (languageCode: string) => {
  const fileName = languageMap[languageCode] || "ReturnPolicy_EN.html";
  const res = await fetch(`/api/return-policy?file=${fileName}&type=policy`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch return policy: ${res.statusText}`);
  }
  const data = await res.json();
  return data.content;
};
