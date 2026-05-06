# Weather Forecast App: Cross-Platform Edition

A premium, highly animated weather forecasting application built with a unified codebase for Mobile, Web, and Desktop. This app provides real-time weather data, detailed multi-day forecasts, and a seamless offline experience across all platforms.

---

## Live Deployments

| Platform | Deployment Link |
| :--- | :--- |
| Web (Vercel) | <a href="https://weather-forecast-app14.vercel.app/">View Live Web App</a> |
| Desktop (Windows) | <a href="https://drive.google.com/file/d/1XWHRlIAoMopfrkcnsL8k8vKpHa995vkg/view?usp=sharing">Download .exe from Google Drive</a> |
| Mobile | *Build available via Expo/EAS* |

---

## One Codebase, Everywhere
This project demonstrates the power of a unified JavaScript/TypeScript stack to target multiple platforms with high performance:

- **Mobile (iOS/Android):** Built with React Native & Expo for a fully native feel.
- **Web:** Exported via Vite and optimized for hosting on Vercel with custom SPA routing.
- **Desktop:** Packaged with Electron, featuring robust path resolution and ASAR unpacking to serve high-performance web assets locally.

## Key Features

- **Dynamic Cross-Platform Logic**: Shared data fetching, state management, and business logic across all three environments.
- **Current Weather Display**: Real-time temperature, humidity, wind speed, and high/low ranges with dynamic iconography.
- **Location & Search**: GPS-based weather fetching + worldwide manual city search with autocomplete.
- **Interactive Forecasts**: 5-day comprehensive outlook and horizontal hourly tracking.
- **Offline Resilience**: Integrated SQLite caching via TanStack Query to ensure data persists even without an internet connection.
- **Rich Animations**: Powered by react-native-reanimated, featuring staggered entrances, pulsing icons, and spring-based UI transitions.

## Technology Stack

- **Core Framework**: React Native / Expo
- **Routing**: expo-router (File-based navigation)
- **Data Fetching**: @tanstack/react-query
- **Database**: expo-sqlite (for offline persistence)
- **Desktop Wrapper**: Electron + electron-builder
- **Web Bundler**: Vite
- **Animations**: Reanimated 3

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a .env file in the root and add your OpenWeatherMap API key:
```env
EXPO_PUBLIC_OWM_API_KEY=your_api_key_here
```

### 3. Running the App
- **Web**: npm run web
- **Desktop (Dev)**: npm run electron:start
- **Desktop (Build)**: npm run electron:dist
- **Mobile**: npx expo start

---
*Built for a seamless weather experience on any device.*
