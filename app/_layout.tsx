import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WeatherProvider } from '@/src/context/WeatherContext';
import { QueryProvider } from '@/src/context/QueryProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0B1426' }}>
      <QueryProvider>
        <WeatherProvider>
          <StatusBar style="light" backgroundColor="transparent" translucent />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0B1426' },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="forecast"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </WeatherProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}