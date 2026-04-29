import React, { createContext, useContext } from 'react';
import { useWeather } from '../hooks/useWeather';
import type {
  CurrentWeather, DailyForecastItem, HourlyForecastItem, AppError,
} from '../types/weather';

interface WeatherContextValue {
  current:      CurrentWeather | null;
  daily:        DailyForecastItem[];
  hourly:       HourlyForecastItem[];
  loading:      boolean;
  error:        AppError | null;
  isOffline:    boolean;
  cityName:     string;
  fetchByCoords: (lat: number, lon: number) => void;
  fetchByCity:   (city: string) => void;
  clearError:    () => void;
  refetch:       () => Promise<any>;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const weather = useWeather();
  return (
    <WeatherContext.Provider value={weather}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeatherContext(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeatherContext must be used inside <WeatherProvider>');
  return ctx;
}