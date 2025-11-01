# System Patterns: KeepWatching Client

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React SPA (Port 3000)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Firebase   │  │    Redux     │  │  Material-UI │      │
│  │     Auth     │  │   Toolkit    │  │   Components │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │  React Router   │                       │
│                   └────────┬────────┘                       │
│                            │                                │
│              ┌─────────────┴─────────────┐                  │
│              │                           │                  │
│     ┌────────▼────────┐        ┌────────▼────────┐         │
│     │  Axios Instance │        │  WebSocket      │         │
│     │  (REST API)     │        │  (Socket.io)    │         │
│     └────────┬────────┘        └────────┬────────┘         │
└──────────────┼──────────────────────────┼──────────────────┘
               │                          │
               │         Port 3033        │
               └──────────────┬───────────┘
                              │
                   ┌──────────▼──────────┐
                   │   Backend API       │
                   │  (Express Server)   │
                   └─────────────────────┘
```

### Component Hierarchy

```
App.tsx
├── ErrorBoundary
├── WebSocketProvider
├── ThemeProvider
└── BrowserRouter
    ├── DefaultLayout (public routes)
    │   ├── Navigation
    │   ├── Login
    │   ├── Register
    │   └── Default
    └── ProtectedLayout (authenticated routes)
        ├── Navigation
        ├── NotificationIconDropdown
        ├── Home
        ├── Shows
        ├── ShowDetails
        ├── Movies
        ├── MovieDetails
        ├── Discover
        ├── Search
        ├── PersonDetails
        ├── Notifications
        └── ManageAccount
```

## Key Technical Decisions

### State Management Strategy

**Redux Toolkit with Normalized Data**

- **Why**: Complex state with real-time updates across components
- **Pattern**: Feature-based slices with createAsyncThunk for API calls
- **Persistence**: activeProfileSlice and preferencesSlice persist to localStorage

**Slice Organization:**

```typescript
accountSlice; // User authentication and account data
profilesSlice; // All profiles for the account
activeProfileSlice; // Currently selected profile (PERSISTED)
activeShowSlice; // Currently viewing show details
activeMovieSlice; // Currently viewing movie details
personSearchSlice; // Person search and details
systemNotificationsSlice; // System notifications
activityNotificationSlice; // Activity toasts
preferencesSlice; // User preferences (PERSISTED)
```

### Authentication Architecture

**Firebase Authentication with Token Interceptor**

```typescript
// Pattern: Axios interceptor automatically adds Firebase ID token
axiosInstance.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Key Points:**

- Firebase handles all authentication logic
- ID tokens automatically refreshed
- Tokens added to all API requests
- Protected routes wrapped with ProtectedLayout

### WebSocket Real-Time Updates

**Global WebSocket Connection Pattern**

```typescript
// Initialized in WebSocketProvider component
// Automatically reconnects with exponential backoff
// Dispatches Redux actions on events:

socket.on('showsUpdate', () => dispatch(reloadActiveProfile()));
socket.on('moviesUpdate', () => dispatch(reloadActiveProfile()));
socket.on('updateShowFavorite', (data) => {
  dispatch(updateShowInState(data));
  dispatch(reloadEpisodes());
});
socket.on('newNotifications', (data) => dispatch(addNotifications(data)));
```

**Critical Pattern:** WebSocket updates trigger Redux actions, not direct state mutations

### API Communication Pattern

**Centralized Axios Instance with Retry Logic**

- Location: `src/app/api/axiosInstance.ts`
- Exponential backoff for failed requests
- Automatic Firebase token injection
- Standardized error handling with ApiErrorResponse type

```typescript
// Pattern for API calls in slices
export const fetchShows = createAsyncThunk<Show[], number, { rejectValue: ApiErrorResponse }>(
  'shows/fetchShows',
  async (profileId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/profiles/${profileId}/shows`);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);
```

### Routing Architecture

**React Router v7 with Two-Layout Pattern**

```typescript
// DefaultLayout: Public pages (no auth required)
// ProtectedLayout: Authenticated pages (Firebase auth check)

<Routes>
  <Route element={<DefaultLayout />}>
    <Route path="/" element={<Default />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>

  <Route element={<ProtectedLayout />}>
    <Route path="/home" element={<Home />} />
    <Route path="/shows" element={<Shows />} />
    <Route path="/shows/:showId/:profileId" element={<ShowDetails />} />
    {/* ... other protected routes */}
  </Route>
</Routes>
```

## Design Patterns in Use

### Component Organization Patterns

**1. Container/Presenter Pattern**

- Pages (`src/components/pages/`) are containers
- Common components (`src/components/common/`) are presenters
- Pages handle Redux connections, common components receive props

**2. Feature-Based Organization**

```
components/common/
├── account/     // Account-specific components
├── media/       // Shared media components (cards, favorites)
├── movies/      // Movie-specific components
├── shows/       // Show-specific components
├── search/      // Search functionality
├── person/      // Cast/person components
├── statistics/  // Analytics dashboards
└── controls/    // Custom UI controls
```

**3. Composition Over Inheritance**

- Heavy use of component composition
- Reusable presentational components
- Minimal component inheritance

### Data Flow Patterns

**1. Unidirectional Data Flow**

```
User Action → Dispatch Thunk → API Call → Redux State Update → Component Re-render
```

**2. Optimistic UI Updates**

```typescript
// Pattern: Update UI immediately, rollback on error
dispatch(updateEpisodeOptimistic(episodeId));
try {
  await api.markWatched(episodeId);
} catch (error) {
  dispatch(rollbackEpisode(episodeId));
}
```

**3. Normalized State Structure**

```typescript
// Shows stored by ID for efficient lookups
state.activeProfile.shows = {
  byId: { '123': {...}, '456': {...} },
  allIds: ['123', '456']
}
```

### Error Handling Patterns

**1. Async Thunk Error Handling**

```typescript
// Standard pattern across all slices
const thunk = createAsyncThunk<ReturnType, ArgType, { rejectValue: ApiErrorResponse }>(
  'slice/action',
  async (arg, { rejectWithValue }) => {
    try {
      return await api.call();
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);
```

**2. Component-Level Error Boundaries**

- Global ErrorBoundary wraps entire app
- Graceful degradation for component failures
- Error logging and user-friendly messages

**3. Form Validation Pattern**

- Client-side validation before API calls
- Server validation as source of truth
- Clear error messages displayed inline

## Critical Implementation Paths

### Profile-Based Tracking

**Core Concept:** All watch data tied to profiles, not accounts

```typescript
// Pattern: Profile ID required for all tracking operations
POST / api / profiles / { profileId } / shows / { showId };
PUT / api / profiles / { profileId } / episodes / { episodeId } / watched;
GET / api / profiles / { profileId } / statistics;
```

**Why:** Enables multiple users per account with isolated data

### Watch Status Hierarchy

**Three-Level Hierarchy:**

```
Show Level
├── Season Level
│   ├── Episode Level
│   ├── Episode Level
│   └── Episode Level
├── Season Level
│   └── ...
```

**Patterns:**

- Bulk operations cascade down (mark season → marks all episodes)
- Individual operations bubble up (mark all episodes → season auto-completes)
- Status calculated dynamically based on children

### Real-Time Sync Pattern

**Event Flow:**

```
Device A: User marks episode watched
    ↓
API: Validates and updates database
    ↓
WebSocket: Broadcasts 'showsUpdate' event
    ↓
Device B: Receives event → Dispatches reloadActiveProfile()
    ↓
Redux: Fetches fresh data from API
    ↓
UI: Re-renders with updated state
```

**Key Pattern:** Never trust local state after mutations, always re-fetch

### LocalStorage Caching

**Two-Tier Caching Strategy:**

```typescript
// activeProfileSlice: Cache entire profile data
localStorage.setItem('activeProfile', JSON.stringify(state));

// preferencesSlice: Cache user preferences
localStorage.setItem('preferences', JSON.stringify(state));
```

**Why:** Faster initial load, reduced API calls on app start

### Lazy Loading & Code Splitting

**Route-Based Splitting:**

```typescript
// React Router automatically splits by route
const Home = lazy(() => import('./components/pages/home'));
const Shows = lazy(() => import('./components/pages/shows'));
```

**Component-Based Splitting:**

```typescript
// Statistics dashboard loaded on-demand
const StatisticsDashboard = lazy(() => import('./components/common/statistics/accountStatisticsDashboard'));
```

## Component Relationships

### Key Dependency Chains

**1. Show Details Flow:**

```
ShowDetails (page)
  → useAppDispatch(fetchShowDetails)
  → activeShowSlice updates
  → EpisodeSection (shows episodes by season)
    → EpisodeCard (individual episode)
      → Click → dispatch(markEpisodeWatched)
      → WebSocket event → reloadActiveProfile
```

**2. Search Flow:**

```
Search (page)
  → ContentSearchTab | PersonSearchTab
    → dispatch(searchContent)
    → SearchResults
      → SearchResultItem
        → Click → navigate to details page
```

**3. Statistics Flow:**

```
ManageAccount (page)
  → ProfileCard
    → Click statistics → ProfileStatisticsDialog
      → ProfileStatisticsDashboard
        → useStatisticsData hook
        → Multiple chart components (Recharts)
```

### Shared Component Usage

**MediaCard** - Used across shows, movies, discover, search **FavoriteButton** - Used in show/movie details
**ScrollableMediaRow** - Used in home, discover **StatisticsUtils** - Shared calculation logic for all statistics

## Technology Integration Points

### TMDB API Integration

- Backend handles all TMDB API calls
- Client receives processed/cached data
- Image URLs constructed client-side using TMDB patterns
- Responsive image URLs for different screen sizes

### Material-UI Theming

```typescript
// Custom theme in src/theme/theme.ts
// ThemeProvider wraps app
// Dark mode toggle via preferencesSlice
// Consistent design tokens across all components
```

### Recharts for Analytics

- All charts in `src/components/common/statistics/`
- Shared color schemes and formatting
- Responsive sizing with Material-UI breakpoints
- Custom tooltips and legends
