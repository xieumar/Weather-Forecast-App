import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface Coords { lat: number; lon: number }

export function useLocation() {
  const [coords, setCoords]               = useState<Coords | null>(null);
  const [permissionStatus, setStatus]     = useState<string | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

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

  useEffect(() => { requestLocation(); }, []);

  return { coords, permissionStatus, loading, error, retry: requestLocation };
}