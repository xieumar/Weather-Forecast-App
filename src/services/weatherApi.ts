import axios, { AxiosError } from 'axios';
import {
  OWM_API_KEY, OWM_BASE_URL, OWM_GEO_URL, UNITS,
} from '../constants/config';
import type {
  CurrentWeather, ForecastResponse, GeoResult, ErrorType,
} from '../types/weather';

const api = axios.create({ timeout: 10_000 });

const base = (extra: Record<string, unknown> = {}) => ({
  appid: OWM_API_KEY,
  units: UNITS,
  ...extra,
});

// ── Current weather ───────────────────────────────────────────────────────────
export async function fetchCurrentByCoords(lat: number, lon: number): Promise<CurrentWeather> {
  const { data } = await api.get<CurrentWeather>(`${OWM_BASE_URL}/weather`, {
    params: base({ lat, lon }),
  });
  return data;
}

export async function fetchCurrentByCity(city: string): Promise<CurrentWeather> {
  const { data } = await api.get<CurrentWeather>(`${OWM_BASE_URL}/weather`, {
    params: base({ q: city }),
  });
  return data;
}

// ── 5-day / 3-hour forecast ───────────────────────────────────────────────────
export async function fetchForecastByCoords(lat: number, lon: number): Promise<ForecastResponse> {
  const { data } = await api.get<ForecastResponse>(`${OWM_BASE_URL}/forecast`, {
    params: base({ lat, lon, cnt: 40 }),
  });
  return data;
}

export async function fetchForecastByCity(city: string): Promise<ForecastResponse> {
  const { data } = await api.get<ForecastResponse>(`${OWM_BASE_URL}/forecast`, {
    params: base({ q: city, cnt: 40 }),
  });
  return data;
}

// ── Geocode (autocomplete) ────────────────────────────────────────────────────
export async function geocodeCity(query: string): Promise<GeoResult[]> {
  const { data } = await api.get<GeoResult[]>(`${OWM_GEO_URL}/direct`, {
    params: { q: query, limit: 5, appid: OWM_API_KEY },
  });
  return data;
}

// ── Error classifier ──────────────────────────────────────────────────────────
export function classifyError(error: unknown): ErrorType {
  const e = error as AxiosError;
  if (!e.response) {
    return e.code === 'ECONNABORTED' ? 'timeout' : 'network';
  }
  switch (e.response.status) {
    case 401: return 'invalid_key';
    case 404: return 'not_found';
    case 429: return 'rate_limit';
    default:  return 'server';
  }
}

export const ERROR_MESSAGES: Record<ErrorType, string> = {
  timeout:     'Request timed out. Check your connection and try again.',
  network:     'No internet connection. Showing cached data.',
  invalid_key: 'Invalid API key. Please check your configuration.',
  not_found:   'City not found. Try a different name.',
  rate_limit:  'Too many requests. Please wait a moment and retry.',
  server:      'Weather service is temporarily unavailable.',
  location:    'Location access denied. Search for a city manually.',
  invalid:     'Please enter a valid city name.',
  unknown:     'Something went wrong. Please try again.',
};