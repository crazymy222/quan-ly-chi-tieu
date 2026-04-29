"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const DEFAULT_STALE_TIME = 1000 * 60 * 1; // 1 minute
const DEFAULT_GC_TIME = 1000 * 60 * 5; // 5 minutes

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations:{
      retry: 0
    }
  }
});

export default function QueryClientContextProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}