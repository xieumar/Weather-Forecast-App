# Weather Forecast App

A premium, highly animated weather forecasting application built with React Native and Expo. This app provides users with real-time weather information, detailed multi-day forecasts, and a seamless offline experience.

## App Features and Functionality

- **Current Weather Display**: View real-time temperature, comprehensive weather conditions (sunny, rainy, cloudy, etc.), humidity, wind speed, and high/low ranges alongside dynamically mapped weather icons.
- **Location-Based Weather**: Automatically fetches weather for your current physical location using device GPS.
- **Manual City Search**: Includes a robust autocomplete search interface allowing users to find weather for any city worldwide.
- **Forecast View**: Displays a comprehensive multi-day forecast (5 days) and an interactive horizontal hourly forecast.
- **Offline Caching**: Seamless offline support. If you open the app without an internet connection, it restores your last viewed data from a local SQLite database.
- **Robust Error Handling**: Handles location permission denials, network failures, API rate limits, and invalid queries with friendly, actionable error UI and retry mechanisms.
- **Loading States**: Keeps the user engaged with beautiful skeleton loaders and activity indicators during data fetching.

## APIs Used

- [OpenWeatherMap - Current Weather Data](https://openweathermap.org/current)
- [OpenWeatherMap - 5 Day / 3 Hour Forecast](https://openweathermap.org/forecast5)
- [OpenWeatherMap - Geocoding API](https://openweathermap.org/api/geocoding-api)

## Animation Highlights

Animations are a core part of this app, designed to create a responsive, professional, and delightful user experience:

- **Screen Transitions**: Smooth, native-feeling `fade` transitions between bottom tabs and fluid `slide_from_bottom` animations for the detailed forecast modal.
- **List/Grid Items**: Staggered, cascading entrance animations (`FadeInRight.delay`) for popular city chips and autocomplete search results.
- **UI Components**:
  - The hero temperature number bounces into place using physics-based `withSpring` animations.
  - Weather icons feature subtle pulsing/breathing loops.
  - Detailed weather stats and badges gracefully fade and slide down into view sequentially (`FadeInDown`).

## Architecture and Libraries

This app is built with modern, scalable mobile architecture principles:

- **Framework**: React Native & [Expo](https://expo.dev/)
- **Routing**: `expo-router` for file-based native navigation (Tabs & Stack).
- **Data Fetching & State**: `@tanstack/react-query` to manage server state, caching, and background refetching.
- **Offline Persistence**: Custom SQLite persister using `expo-sqlite` wired directly into `@tanstack/react-query-persist-client` to survive app restarts.
- **Animations**: `react-native-reanimated` for 60FPS UI thread animations.
- **Styling**: `StyleSheet` with dynamic `expo-linear-gradient` backgrounds that adapt to current weather conditions.
- **Device APIs**: `expo-location` and `@react-native-community/netinfo` for hardware context.

## Getting Started

1. **Clone the repository**
2. **Install dependencies**: 
   ```bash
   npm install
   ```
3. **Configure Environment**: 
   Create a `.env` file in the root of the project and add your OpenWeatherMap API key:
   ```env
   EXPO_PUBLIC_OWM_API_KEY=your_api_key_here
   ```
4. **Start the app**:
   ```bash
   npx expo start
   ```
