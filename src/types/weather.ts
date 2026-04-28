
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  name: string;
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
    feels_like: number;
  };
  weather: WeatherCondition[];
  wind: { speed: number; deg: number };
  clouds: { all: number };
  visibility: number;
  sys: { country: string; sunrise: number; sunset: number };
  coord: { lat: number; lon: number };
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
    feels_like: number;
  };
  weather: WeatherCondition[];
  wind: { speed: number };
  pop: number; // probability of precipitation 0–1
  clouds: { all: number };
}

export interface ForecastResponse {
  list: ForecastItem[];
  city: { name: string; country: string };
}

export interface GeoResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface DailyForecastItem {
  dt: number;
  tempMax: number;
  tempMin: number;
  icon: string;
  description: string;
  humidity?: number;
  wind?: number;
}

export interface HourlyForecastItem {
  dt: number;
  temp: number;
  icon: string;
  pop: number;
  description: string;
}

export type ErrorType =
  | 'network'
  | 'timeout'
  | 'invalid_key'
  | 'not_found'
  | 'rate_limit'
  | 'server'
  | 'location'
  | 'invalid'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
}

export interface CacheEntry<T> {
  data: T;
  age: number;
  isExpired: boolean;
}