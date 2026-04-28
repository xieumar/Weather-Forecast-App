import type { Persister } from '@tanstack/react-query-persist-client';
import { saveCache, loadCache, clearCache } from './cacheService';

export const sqlitePersister: Persister = {
  persistClient: async (client) => {
    await saveCache('react-query-cache', client);
  },
  restoreClient: async () => {
    const cached = await loadCache<any>('react-query-cache', true);
    return cached?.data;
  },
  removeClient: async () => {
    await clearCache('react-query-cache');
  },
};
