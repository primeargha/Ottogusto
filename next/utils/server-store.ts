import { headers } from "next/headers";
import { getStoreFromDomain, StoreName } from "../config/client-theme-config";

// Get current store from server-side headers
export function getCurrentServerStore(): StoreName {
  const headersList = headers();
  const host = headersList.get("host") || "";
  return getStoreFromDomain(`https://${host}`);
}

// Server-side store detection for use in server components
export function useServerStore(): StoreName {
  return getCurrentServerStore();
}
