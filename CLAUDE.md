# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `yarn start` - Start development server (runs on http://localhost:3000)
- `yarn build` - Create production build
- `yarn test` - Run test suite in watch mode
- `yarn test -- --coverage` - Run tests with coverage report

### Code Quality
- `yarn lint` - Check code for linting errors
- `yarn lint:fix` - Automatically fix linting issues
- `yarn format` - Format all code with Prettier

## Architecture Overview

### Backend Integration
The client connects to a backend API running on port 3033 (configurable via environment variables):
- **REST API**: All API calls go through `src/app/api/axiosInstance.ts` which handles Firebase authentication tokens and automatic retry logic with exponential backoff
- **WebSocket**: Real-time updates managed by `src/app/useWebSocket.ts` using Socket.io for live data synchronization (shows, movies, favorites, notifications)

### State Management (Redux Toolkit)
All global state lives in Redux slices under `src/app/slices/`:
- `accountSlice` - User authentication and account data
- `profilesSlice` - All profiles for the account
- `activeProfileSlice` - Currently selected profile with shows/movies (persisted to localStorage)
- `activeShowSlice` - Currently viewing show details
- `activeMovieSlice` - Currently viewing movie details
- `activityNotificationSlice` - Activity notifications/toasts
- `systemNotificationsSlice` - System notifications
- `personSearchSlice` - Person search and details
- `preferencesSlice` - User preferences (persisted to localStorage)

**Important patterns:**
- Use `createAsyncThunk` for all async operations
- Handle errors with `rejectValue: ApiErrorResponse`
- Use `createSelector` from Redux Toolkit for derived/computed state
- Some slices persist to localStorage (activeProfileSlice, preferencesSlice)

### Authentication
Firebase Authentication is used for user management:
- Configuration in `src/app/firebaseConfig.ts`
- Supports email/password and Google OAuth
- Firebase ID tokens are automatically added to all axios requests via interceptor
- Protected routes wrapped with `ProtectedLayout` component

### Routing
React Router v7 with two layout types:
- `DefaultLayout` - Public pages (login, register, default)
- `ProtectedLayout` - Authenticated pages (home, shows, movies, discover, search, notifications, manage account, person details)

Main routes:
- `/home` - Dashboard with keep watching, profiles, and recent activity
- `/shows` - TV shows list
- `/shows/:showId/:profileId` - Show details with seasons/episodes
- `/movies` - Movies list
- `/movies/:movieId/:profileId` - Movie details
- `/discover` - Content discovery by streaming service
- `/search` - Search shows, movies, and people
- `/person/:personId` - Person details and filmography
- `/notifications` - System notifications
- `/manageAccount` - Account and profile management

### Component Organization
- `src/components/pages/` - Top-level page components
- `src/components/navigation/` - Navigation and layout components
- `src/components/common/` - Reusable components organized by feature:
  - `account/` - Account management
  - `media/` - Media cards, favorite button, scrollable rows
  - `movies/` - Movie-specific components
  - `shows/` - TV show components (episodes, seasons, keep watching)
  - `statistics/` - Analytics dashboards and charts (uses Recharts)
  - `search/` - Search functionality
  - `person/` - Person/cast related components
  - `controls/` - Custom UI controls
  - `profile/` - Profile-specific components
  - `tabs/` - Tab panel components
- `src/components/notification/` - Notification components
- `src/components/utility/` - Helper utilities and utility components

### Type System
- Uses shared types from `@ajgifford/keepwatching-types` package for data models
- Local types in `src/app/model/` for app-specific interfaces
- Strict TypeScript enabled in tsconfig.json

### WebSocket Architecture
The WebSocket connection is managed globally:
- Initialized in `WebSocketProvider` component (rendered in App.tsx)
- Automatically reconnects with exponential backoff
- Dispatches Redux actions on receiving events:
  - `showsUpdate` / `moviesUpdate` - Reload active profile
  - `updateShowFavorite` - Update show in state and reload episodes
  - `newNotifications` / `updateNotifications` - Update notification state

### Material-UI Theming
- Uses MUI v6 with Emotion for styling
- Dark mode and theme switching supported via preferences
- Custom components follow MUI design patterns

### Environment Variables
Required in `.env` file:
- `REACT_APP_FIREBASE_*` - Firebase configuration
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3033/api/v1)
- `REACT_APP_SOCKET_URL` - WebSocket URL (default: ws://localhost:3033/)
- `REACT_APP_STATIC_CONTENT_URL` - Static content URL (default: http://localhost:3033)

### Key Patterns
- **Profile-based tracking**: Shows and movies are tracked per profile, not per account
- **Watch status hierarchy**: Show → Season → Episode (bulk operations supported)
- **Real-time sync**: UI updates immediately via WebSocket when changes occur on any device
- **localStorage caching**: Active profile and preferences cached for faster load times
- **Responsive design**: All components designed for mobile and desktop
- **Error handling**: Consistent error handling with ApiErrorResponse type throughout
