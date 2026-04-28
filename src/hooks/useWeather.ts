import { useState, useCallback, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  fetchCurrentByCoords, fetchCurrentByCity,
  fetchForecastByCoords, fetchForecastByCity,
  classifyError, ERROR_MESSAGES,
} from '../services/weatherApi';
import {
  initDB, saveCache, loadCache, saveLastCity, pruneExpiredCache,
} from '../services/cacheService';
import { CACHE_EXPIRY_MS } from '../constants/config';
import {
  parseDailyForecast, parseHourlyForecast,
} from '../utils/weatherUtils';
import type {
  CurrentWeather, ForecastResponse,
  DailyForecastItem, HourlyForecastItem, AppError,
} from '../types/weather';

const CACHE = {
  current:  (suffix: string) => `current_weather${suffix}`,
  forecast: (suffix: string) => `forecast${suffix}`,
};

export function useWeather() {
  const [current, setCurrent]   = useState<CurrentWeather | null>(null);
  const [daily,   setDaily]     = useState<DailyForecastItem[]>([]);
  const [hourly,  setHourly]    = useState<HourlyForecastItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<AppError | null>(null);
  const [isOffline, setOffline] = useState(false);
  const [cityName,  setCity]    = useState('');

  // Initialise SQLite + prune stale rows once on mount
  useEffect(() => {
    initDB()
      .then(() => pruneExpiredCache())
      .catch((e: Error) => console.warn('[useWeather] DB init:', e.message));
  }, []);

  const _fetch = useCallback(async (
    fetchCurrent:  () => Promise<CurrentWeather>,
    fetchForecast: () => Promise<ForecastResponse>,
    suffix: string,
  ) => {
    setLoading(true);
    setError(null);

    const net = await NetInfo.fetch();
    const online = net.isConnected && net.isInternetReachable;

    const ck = CACHE.current(suffix);
    const fk = CACHE.forecast(suffix);

    if (!online) {
      const cc = await loadCache<CurrentWeather>(ck,  true);
      const cf = await loadCache<ForecastResponse>(fk, true);
      if (cc) { setCurrent(cc.data); setCity(cc.data.name); }
      if (cf) { setDaily(parseDailyForecast(cf.data.list)); setHourly(parseHourlyForecast(cf.data.list)); }
      setOffline(true);
      setError({ type: 'network', message: ERROR_MESSAGES.network });
      setLoading(false);
      return;
    }

    setOffline(false);

    try {
      const [cw, fc] = await Promise.all([fetchCurrent(), fetchForecast()]);
      setCurrent(cw);
      setCity(cw.name);
      setDaily(parseDailyForecast(fc.list));
      setHourly(parseHourlyForecast(fc.list));
      await saveCache(ck, cw);
      await saveCache(fk, fc);
    } catch (e) {
      const type    = classifyError(e);
      const message = ERROR_MESSAGES[type] ?? ERROR_MESSAGES.unknown;
      setError({ type, message });
      const cc = await loadCache<CurrentWeather>(ck,  true);
      const cf = await loadCache<ForecastResponse>(fk, true);
      if (cc) setCurrent(cc.data);
      if (cf) { setDaily(parseDailyForecast(cf.data.list)); setHourly(parseHourlyForecast(cf.data.list)); }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCoords = useCallback((lat: number, lon: number) =>
    _fetch(
      () => fetchCurrentByCoords(lat, lon),
      () => fetchForecastByCoords(lat, lon),
      `_${lat.toFixed(2)}_${lon.toFixed(2)}`,
    ), [_fetch]);

  const fetchByCity = useCallback(async (city: string) => {
    const t = city.trim();
    if (!t) { setError({ type: 'invalid', message: ERROR_MESSAGES.invalid }); return; }
    await _fetch(
      () => fetchCurrentByCity(t),
      () => fetchForecastByCity(t),
      `_${t.toLowerCase().replace(/\s+/g, '_')}`,
    );
    await saveLastCity(t);
  }, [_fetch]);

  return {
    current, daily, hourly, loading, error, isOffline, cityName,
    fetchByCoords, fetchByCity,
    clearError: () => setError(null),
  };
}