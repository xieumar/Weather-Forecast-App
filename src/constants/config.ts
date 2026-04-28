export const OWM_API_KEY   = process.env.EXPO_PUBLIC_OWM_API_KEY as string;
export const OWM_BASE_URL  = 'https://api.openweathermap.org/data/2.5';
export const OWM_GEO_URL   = 'https://api.openweathermap.org/geo/1.0';
 
export const UNITS        = 'metric' as const;   
export const UNIT_SYMBOL  = UNITS === 'metric' ? '°C' : '°F';
export const WIND_UNIT    = UNITS === 'metric' ? 'km/h' : 'mph';
 
export const CACHE_EXPIRY_MS = 10 * 60 * 1000;  // 10 minutes
