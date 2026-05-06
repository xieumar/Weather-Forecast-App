import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface Coords { lat: number; lon: number }

export function useLocation() {
  const [coords, setCoords]           = useState<Coords | null>(null);
  const [permissionStatus, setStatus] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setStatus(status);
      if (status !== 'granted') { setError('location'); return; }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
    } catch {
      setError('location');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // On Web/Desktop (Electron): use IP-based location injected by main process
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const win = window as any;

      // If Electron already injected location before this hook ran
      if (win.__ELECTRON_LOCATION__) {
        setCoords(win.__ELECTRON_LOCATION__);
        setStatus('granted');
        setLoading(false);
        return;
      }

      // Listen for IP location event fired by Electron main process
      const handler = (e: Event) => {
        const { lat, lon } = (e as CustomEvent).detail;
        setCoords({ lat, lon });
        setStatus('granted');
        setLoading(false);
      };
      window.addEventListener('electron-location', handler);

      // Also try native geolocation as parallel attempt
      requestLocation();

      return () => window.removeEventListener('electron-location', handler);
    }

    // On Mobile: use expo-location
    requestLocation();
  }, []);

  return { coords, permissionStatus, loading, error, retry: requestLocation };
}