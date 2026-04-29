import { useState, useCallback, useEffect } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import {
  fetchCurrentByCoords, fetchCurrentByCity,
  fetchForecastByCoords, fetchForecastByCity,
  classifyError, ERROR_MESSAGES,
} from '../services/weatherApi';
import { saveLastCity } from '../services/cacheService';
import { parseDailyForecast, parseHourlyForecast } from '../utils/weatherUtils';
import type { AppError } from '../types/weather';

type SearchParam = 
  | { type: 'coords'; lat: number; lon: number }
  | { type: 'city'; name: string }
  | null;

export function useWeather() {
  const netInfo = useNetInfo();
  const [searchParam, setSearchParam] = useState<SearchParam>(null);
  const [manualError, setManualError] = useState<AppError | null>(null);

  const isOffline = netInfo.isConnected === false && netInfo.isInternetReachable === false;

  const queryKey = searchParam ? ['weather', searchParam] : ['weather', 'none'];

  const { data, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!searchParam) throw new Error('No search param');
      const isCoords = searchParam.type === 'coords';
      
      const [cw, fc] = await Promise.all([
        isCoords 
          ? fetchCurrentByCoords(searchParam.lat, searchParam.lon) 
          : fetchCurrentByCity(searchParam.name),
        isCoords 
          ? fetchForecastByCoords(searchParam.lat, searchParam.lon) 
          : fetchForecastByCity(searchParam.name),
      ]);
      
      return {
        current: cw,
        daily: parseDailyForecast(fc.list),
        hourly: parseHourlyForecast(fc.list),
      };
    },
    enabled: !!searchParam,
  });

  const fetchByCoords = useCallback((lat: number, lon: number) => {
    setManualError(null);
    setSearchParam({ type: 'coords', lat, lon });
  }, []);

  const fetchByCity = useCallback(async (city: string) => {
    const t = city.trim();
    if (!t) {
      setManualError({ type: 'invalid', message: ERROR_MESSAGES.invalid });
      return;
    }
    setManualError(null);
    setSearchParam({ type: 'city', name: t });
    saveLastCity(t).catch(() => {});
  }, []);

  let appError: AppError | null = manualError;
  if (!appError && error) {
    const type = classifyError(error);
    appError = { type, message: ERROR_MESSAGES[type] ?? ERROR_MESSAGES.unknown };
  }
  // If we are offline and have no data, show network error
  if (isOffline && !data && !appError && searchParam) {
    appError = { type: 'network', message: ERROR_MESSAGES.network };
  }

  return {
    current: data?.current ?? null,
    daily: data?.daily ?? [],
    hourly: data?.hourly ?? [],
    loading: isFetching,
    error: appError,
    isOffline,
    cityName: data?.current?.name ?? (searchParam?.type === 'city' ? searchParam.name : ''),
    fetchByCoords,
    fetchByCity,
    clearError: () => setManualError(null),
    refetch,
  };
}