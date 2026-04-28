import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { sqlitePersister } from '../services/sqlitePersister';
import { CACHE_EXPIRY_MS } from '../constants/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: CACHE_EXPIRY_MS, // 10 minutes (from config)
      retry: 2,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ 
        persister: sqlitePersister,
        maxAge: 1000 * 60 * 60 * 24, // Keep offline cache for 24 hours
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
