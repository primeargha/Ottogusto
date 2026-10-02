"use client";

import { createContext, useContext, ReactNode } from "react";
import { StoreName } from "@/config/client-theme-config";

interface StoreContextType {
  currentStore: StoreName;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
  currentStore: StoreName;
}

export function StoreProvider({ children, currentStore }: StoreProviderProps) {
  return <StoreContext.Provider value={{ currentStore }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
