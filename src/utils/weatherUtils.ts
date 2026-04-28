import { format, fromUnixTime, isToday, isTomorrow } from 'date-fns';
import type { ForecastItem, DailyForecastItem, HourlyForecastItem } from '../types/weather';

// ── Icon mapping ──────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, { name: string; color: string }> = {
  '01d': { name: 'sunny',        color: '#FFD166' },
  '01n': { name: 'moon',         color: '#A8C0D6' },
  '02d': { name: 'partly-sunny', color: '#FFD166' },
  '02n': { name: 'cloudy-night', color: '#A8C0D6' },
  '03d': { name: 'cloud',        color: '#A8C0D6' },
  '03n': { name: 'cloud',        color: '#A8C0D6' },
  '04d': { name: 'cloudy',       color: '#8E9BAE' },
  '04n': { name: 'cloudy',       color: '#8E9BAE' },
  '09d': { name: 'rainy',        color: '#74B9FF' },
  '09n': { name: 'rainy',        color: '#74B9FF' },
  '10d': { name: 'rainy',        color: '#74B9FF' },
  '10n': { name: 'rainy',        color: '#74B9FF' },
  '11d': { name: 'thunderstorm', color: '#FFA500' },
  '11n': { name: 'thunderstorm', color: '#FFA500' },
  '13d': { name: 'snow',         color: '#DFE6E9' },
  '13n': { name: 'snow',         color: '#DFE6E9' },
  '50d': { name: 'water',        color: '#74B9FF' },
  '50n': { name: 'water',        color: '#74B9FF' },
};

export function getWeatherIcon(iconCode: string) {
  return ICON_MAP[iconCode] ?? { name: 'partly-sunny', color: '#FFD166' };
}

// ── Gradient per condition ────────────────────────────────────────────────────
export function getGradientForCondition(iconCode?: string): readonly [string, string] {
  if (!iconCode) return ['#1A2E50', '#0B1426'];
  const id = iconCode.replace('n', 'd');
  if (id === '01d')                      return ['#1A6B94', '#0B1426'];
  if (['02d', '03d', '04d'].includes(id)) return ['#1A3A5C', '#0B1426'];
  if (['09d', '10d'].includes(id))        return ['#1A2E4A', '#0D1B2A'];
  if (id === '11d')                       return ['#1A1F3C', '#0B1020'];
  if (id === '13d')                       return ['#1E3A5F', '#0D2137'];
  return ['#1A2E50', '#0B1426'];
}

// ── Formatters ────────────────────────────────────────────────────────────────
export const formatWind  = (speedMs: number) => `${Math.round(speedMs * 3.6)} km/h`;
export const formatHumidity   = (h: number) => `${h}%`;
export const formatPressure   = (p: number) => `${p} hPa`;
export const formatVisibility = (m: number) =>
  m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;

// ── Date/time labels ──────────────────────────────────────────────────────────
export function dayLabel(unixTs: number): string {
  const d = fromUnixTime(unixTs);
  if (isToday(d))    return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEE');
}
export const shortTime = (unixTs: number) => format(fromUnixTime(unixTs), 'h a');
export const fullDate  = (unixTs: number) => format(fromUnixTime(unixTs), 'EEEE, MMMM d');

// ── Data transforms ───────────────────────────────────────────────────────────
function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export function parseDailyForecast(list: ForecastItem[]): DailyForecastItem[] {
  const days: Record<string, {
    dt: number; temps: number[]; icons: string[];
    descriptions: string[]; humidity: number[]; wind: number[];
  }> = {};

  list.forEach((item) => {
    const date = format(fromUnixTime(item.dt), 'yyyy-MM-dd');
    if (!days[date]) {
      days[date] = { dt: item.dt, temps: [], icons: [], descriptions: [], humidity: [], wind: [] };
    }
    days[date].temps.push(item.main.temp);
    days[date].icons.push(item.weather[0].icon);
    days[date].descriptions.push(item.weather[0].description);
    days[date].humidity.push(item.main.humidity);
    days[date].wind.push(item.wind.speed);
  });

  return Object.values(days).map((day) => {
    const mid = Math.floor(day.icons.length / 2);
    return {
      dt:          day.dt,
      tempMax:     Math.round(Math.max(...day.temps)),
      tempMin:     Math.round(Math.min(...day.temps)),
      icon:        day.icons[mid] ?? day.icons[0],
      description: capitalize(day.descriptions[mid] ?? ''),
      humidity:    Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      wind:        Math.round(day.wind.reduce((a, b) => a + b, 0) / day.wind.length),
    };
  });
}

export function parseHourlyForecast(list: ForecastItem[]): HourlyForecastItem[] {
  return list.slice(0, 8).map((item) => ({
    dt:          item.dt,
    temp:        Math.round(item.main.temp),
    icon:        item.weather[0].icon,
    pop:         item.pop,
    description: capitalize(item.weather[0].description),
  }));
}