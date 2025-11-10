# Project Overview

This is **MyMotivFitX**, a cross-platform fitness and wellness mobile app built with React Native and Expo. The app provides comprehensive health and fitness tracking features including workout planning, activity tracking, nutrition management, sleep monitoring, and social features for motivation and accountability.

**Target Platform**: Native iOS & Android, exportable to web  
**Framework**: Expo Router + React Native  
**App Type**: Full-stack mobile application with real-time features

## Core Features

- **Fitness Tracking**: Workout plans, activity history, live workouts, heart rate monitoring
- **Health Metrics**: Body composition, measurements, sleep tracking, period tracking, hydration
- **Nutrition**: Calorie tracking, meal planning, nutrition analysis
- **Wellness**: Meditation, injury prevention, movement reminders
- **Social**: Groups, challenges, leaderboards, achievement sharing, gift sending
- **AI Integration**: AI coach for personalized guidance
- **Location**: Activity mapping with GPS tracking

# Tech Stack

## Frontend
- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (~54.0) - Development platform and tooling
- **Expo Router** (~6.0) - File-based routing with support for web, server functions
- **TypeScript** (~5.9) - Type safety
- **NativeWind** (^4.1) - Tailwind CSS for React Native
- **Lucide React Native** (^19.0) - Icon library

## Backend & Data
- **tRPC** (^11.7) - End-to-end typesafe APIs
- **Hono** (^4.10) - Web framework for backend
- **React Query** (^5.90) - Server state management
- **Zustand** (^5.0) - Client state management
- **Async Storage** (2.2.0) - Local persistence

## Native Features
- **Expo Camera** (~17.0) - Camera and photo capture
- **Expo Location** (~19.0) - GPS and location services (with background tracking)
- **Expo Notifications** (~0.32) - Push notifications
- **React Native Maps** (1.20.1) - Map integration

## Development Tools
- **ESLint** (9.31.0) with `eslint-config-expo` - Code linting
- **Bun** - Package manager and runtime
- **Rork** - Custom build and development tooling

# Coding Standards

## TypeScript
- **Strict mode enabled** - All code must pass TypeScript strict checks
- **Type all props and state explicitly** - No implicit `any` types
- **Use interfaces for object shapes** and types for unions/primitives
- **Path aliases**: Use `@/*` for imports (e.g., `import { Button } from '@/components/Button'`)

## React & React Native
- **Functional components only** - No class components
- **Hooks**: Prefer React hooks for state and side effects
- **Component naming**: PascalCase for components, camelCase for functions
- **File naming**: kebab-case for files (e.g., `activity-map.tsx`)
- **Expo Router conventions**: Use `_layout.tsx` for layouts, `+not-found.tsx` for 404s

## Code Organization
- **Screen components** go in `app/` directory (file-based routing)
- **Reusable components** in `components/` directory
- **Backend logic** in `backend/` directory (tRPC routers in `backend/trpc/`)
- **Type definitions** in `types/` directory
- **Business logic** in `lib/` directory
- **State management** in `contexts/` or use Zustand stores
- **Constants** in `constants/` directory

## Styling
- **Use NativeWind** (Tailwind CSS classes) for styling
- **Responsive design**: Consider different screen sizes (iOS/Android/Web)
- **Theme**: Support both light and dark modes (automatic user interface style)

## API & Data Fetching
- **Use tRPC** for all client-server communication
- **React Query** for data fetching, caching, and synchronization
- **Error handling**: Always handle loading and error states
- **Optimistic updates**: Use where appropriate for better UX

## Native Features
- **Permissions**: Always check and request permissions before accessing native features (camera, location, notifications)
- **Background tasks**: Use Expo's background task APIs properly
- **Platform-specific code**: Use `Platform.OS` checks or `.ios.tsx`/`.android.tsx` extensions when needed

# How to Run

## Prerequisites
- **Node.js** - Install via [nvm](https://github.com/nvm-sh/nvm)
- **Bun** - Install from [bun.sh](https://bun.sh/docs/installation)
- **RORK_AUTH_TOKEN** environment variable for private registry access

## Installation
```bash
bun install
```

## Development

### Web Preview (Recommended for quick testing)
```bash
bun run start-web
# or with debug logs
bun run start-web-dev
```

### iOS/Android
```bash
bun run start
# Then press 'i' for iOS Simulator or 'a' for Android Emulator
# Or scan QR code with Expo Go app on physical device
```

## Linting
```bash
npm run lint
```

## Testing
Currently no automated test suite configured. When adding tests:
- Use Jest for unit tests
- Use React Native Testing Library for component tests
- Place tests next to components (e.g., `Button.test.tsx`)

# Architecture Notes

## File-Based Routing
- Uses **Expo Router** with file-based routing in `app/` directory
- `(tabs)/` directory contains tab navigation screens
- `_layout.tsx` files define nested layouts
- Route params and navigation via Expo Router hooks

## Backend Structure
- **tRPC routers** in `backend/trpc/` for type-safe API endpoints
- **Hono server** in `backend/hono.ts` serves the tRPC endpoints
- Client-side tRPC client configured with React Query

## State Management
- **Local state**: React hooks (`useState`, `useReducer`)
- **Global state**: Zustand stores or React Context (in `contexts/`)
- **Server state**: React Query (via tRPC)
- **Persistent storage**: Async Storage for local data

## Native Integrations
- **Camera**: Expo Camera with permission handling
- **Location**: Background location tracking enabled (iOS & Android)
- **Maps**: React Native Maps with Google Maps API
- **Notifications**: Expo Notifications (requires custom dev build for advanced features)

## Authentication & Permissions
- Location permissions required for activity tracking
- Camera/microphone permissions for media features
- Notification permissions for reminders and alerts

# Important Notes

## Dependencies
- Uses custom **Rork registry** (`registry.rork.com`) for `@rork/toolkit-sdk`
- Requires `RORK_AUTH_TOKEN` environment variable set correctly
- Some packages are platform-specific - check `app.json` for native configurations

## Build & Deployment
- **Web**: Use `eas build --platform web` or deploy to Vercel/Netlify
- **iOS/Android**: Use EAS Build (`eas build --platform ios/android`)
- **App Store/Play Store**: Use `eas submit`

## Custom Development Builds
For native features (Face ID, in-app purchases, advanced push notifications), create custom development builds:
```bash
eas build --profile development --platform ios
```

## Git & Version Control
- Follow conventional commits
- Keep commits focused and atomic
- Test changes before committing

# Common Tasks

## Adding a New Screen
1. Create file in `app/` (e.g., `app/new-feature.tsx`)
2. Export default React component
3. Add navigation link in appropriate tab or layout
4. Update TypeScript typed routes if needed

## Adding a New API Endpoint
1. Create or update tRPC router in `backend/trpc/`
2. Define input/output schemas with Zod
3. Implement resolver function
4. Use in frontend with tRPC hooks (e.g., `trpc.myEndpoint.useQuery()`)

## Adding Native Features
1. Check if feature needs custom dev build or works in Expo Go
2. Install required Expo SDK packages
3. Add necessary permissions to `app.json`
4. Implement with permission checks
5. Test on physical device for location/camera features

## Troubleshooting
- **Build issues**: Try `bunx expo start --clear` to clear cache
- **Module not found**: Delete `node_modules` and run `bun install`
- **Native features not working**: May need custom dev build instead of Expo Go
- **Connection issues**: Use tunnel mode `bun start -- --tunnel`

# Code Review Guidelines

When reviewing code:
- Ensure TypeScript types are explicit and correct
- Check proper error handling and loading states
- Verify native permissions are requested appropriately
- Confirm responsive design works on different screen sizes
- Test on both iOS and Android when making UI changes
- Ensure changes don't break existing functionality
