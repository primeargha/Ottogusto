"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { Toaster } from "sonner";

// 👇 LocalStorage persister
const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

// 24h - must be >= persist maxAge so rehydrated cache is not evicted before next persist
const CACHE_24H_MS = 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 mins before considered stale
      gcTime: CACHE_24H_MS,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      structuralSharing: true,
    },
  },
});

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: CACHE_24H_MS,
      }}
    >
      {children}
      <Toaster />
    </PersistQueryClientProvider>
  );
};

export default Provider;
