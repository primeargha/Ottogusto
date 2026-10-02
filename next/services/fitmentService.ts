import { apiClient, ApiError } from "@/config/api";

const languageMap: Record<string, string> = {
  EN: "FitmentDetails_EN.html",
  NL: "FitmentDetails_NL.html",
  FR: "FitmentDetails_FR.html",
  DE: "FitmentDetails_DE.html",
};

export const fetchFitmentDetailsHtml = async (languageCode: string) => {
  const fileName = languageMap[languageCode] || "FitmentDetails_EN.html";
  const res = await fetch(`/api/fitment-details?file=${fileName}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch fitment details: ${res.statusText}`);
  }
  return await res.text();
};
