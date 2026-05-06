# Weather Forecast App: Cross-Platform Edition

A professional, high-performance weather forecasting application built with a unified codebase targeting **iOS, Android, Web, and Desktop (Windows/macOS)**. Featuring real-time weather updates, interactive 5-day forecasts, and full offline support.

---

## Live Deployments

| Platform | Link |
| :--- | :--- |
| **Web** | <a href="https://weather-forecast-app14.vercel.app/">Live Deployment (Vercel)</a> |
| **Desktop** | <a href="https://drive.google.com/file/d/1XWHRlIAoMopfrkcnsL8k8vKpHa995vkg/view?usp=sharing">Windows Executable (.exe)</a> |
| **Mobile** | *Available via Expo Go or local build* |

---

## Key Features

- **Multi-Platform Support**: Seamlessly runs on Mobile (Native), Web (SPA), and Desktop (Electron).
- **Real-Time Data**: Instant weather updates including temperature, humidity, wind speed, and conditions.
- **Location-Aware**: Automatically detects user location for localized weather reporting.
- **Global Search**: Search and save weather data for any city worldwide with autocomplete.
- **Advanced Forecasts**: 5-day comprehensive outlook and interactive hourly weather tracking.
- **Offline First**: Full persistence using SQLite; view weather data even without an active connection.
- **Premium UI/UX**: Smooth 60FPS animations, staggered list entrances, and fluid transitions.

---

## Tech Stack

### Frontend & Mobile
- **React Native / Expo**: Core framework for cross-platform development.
- **Expo Router**: Type-safe, file-based navigation for native and web.
- **React Native Reanimated**: High-performance animations and interactions.
- **Lucide React Native**: Beautiful, consistent iconography.

### Data & Infrastructure
- **TanStack Query (React Query)**: Powerful server state management and caching.
- **Axios**: Robust HTTP client for API communication.
- **Expo SQLite**: Native database for reliable offline storage.
- **Vercel**: Optimized hosting for the web platform.

### Desktop & Tooling
- **Electron**: Desktop environment wrapper.
- **Vite**: Ultra-fast build tool for the web frontend.
- **Electron Builder**: Production-grade desktop packaging.

---

## Project Structure

```text
├── app/                  # Expo Router pages and navigation
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks (location, weather, etc.)
│   ├── services/         # API and Database services
│   ├── constants/        # Theme, Config, and Style constants
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Helper functions
├── electron/             # Electron main process and configuration
├── assets/               # Images, fonts, and static assets
├── vercel.json           # Vercel deployment configuration
└── package.json          # Project dependencies and scripts
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app (for mobile testing)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/xieumar/Weather-Forecast-App.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup
Create a `.env` file in the root directory and add your OpenWeatherMap API key:
```env
EXPO_PUBLIC_OWM_API_KEY=your_api_key_here
```

### Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run web` | Start the web development server |
| `npx expo start` | Start the Expo development server (Mobile) |
| `npm run electron:start` | Start the app in Electron (Desktop Dev) |
| `npm run electron:dist` | Build and package the Desktop application |

---

## Cross-Platform Implementation Details

### Desktop (Electron)
The desktop version utilizes a custom local server within the Electron main process to serve Vite-built assets. It includes robust path resolution to handle packaged ASAR environments and ensures that local SQLite storage remains consistent with the mobile version.

### Web (Vercel)
The web version is optimized for SEO and performance. It uses a `vercel.json` configuration to handle client-side routing, ensuring that deep links work correctly within the Expo Router ecosystem.

---


*Built with professional-grade standards for a unified weather experience.*
