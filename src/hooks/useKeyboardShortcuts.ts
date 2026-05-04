import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Home: Cmd/Ctrl + H
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        router.replace('/');
      }
      
      // Search: Cmd/Ctrl + F or Cmd/Ctrl + S
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 's')) {
        e.preventDefault();
        router.push('/search');
      }

      // Back: Escape
      if (e.key === 'Escape') {
        if (router.canGoBack()) {
          router.back();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);
}
