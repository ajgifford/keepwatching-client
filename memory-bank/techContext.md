# Technical Context: KeepWatching Client

## Technologies Used

### Core Framework & Language

**React 19.2.0**

- Latest React version with improved performance
- Functional components with hooks
- Concurrent rendering features
- Automatic batching for state updates

**TypeScript 4.4.2**

- Strict type checking enabled
- Enhanced IDE support and autocomplete
- Compile-time error detection
- Shared types from @ajgifford/keepwatching-types package

### UI Framework & Styling

**Material-UI (MUI) v6.2.0**

- Comprehensive component library
- Built-in theming system
- Dark mode support
- Responsive design utilities
- Emotion for CSS-in-JS styling

**@emotion/react & @emotion/styled**

- Runtime CSS-in-JS
- Theme-aware styling
- Performance optimized
- Component-scoped styles

### State Management

**Redux Toolkit 2.9.1**

- Modern Redux with less boilerplate
- createSlice for reducer logic
- createAsyncThunk for async operations
- Built-in Immer for immutable updates
- Redux DevTools integration

**react-redux 9.2.0**

- React bindings for Redux
- useSelector and useDispatch hooks
- TypeScript support with typed hooks

### Routing

**React Router 7.9.4**

- Client-side routing
- Nested routes and layouts
- URL parameter handling
- Protected route patterns
- Code splitting per route

### Backend Communication

**Axios 1.12.2**

- HTTP client for API calls
- Request/response interceptors
- Automatic retry logic with exponential backoff
- TypeScript-friendly
- Centralized configuration in axiosInstance.ts

**Socket.io Client 4.8.1**

- WebSocket communication
- Real-time bidirectional updates
- Automatic reconnection
- Event-based messaging
- Fallback to long-polling

### Authentication

**Firebase 11.2.0**

- Firebase Authentication module
- Email/password authentication
- Google OAuth provider
- Automatic token refresh
- ID token generation for API calls

### Data Visualization

**Recharts 2.15.1**

- React-based charting library
- Responsive charts
- Pie charts for genre distribution
- Bar charts for statistics
- Line charts for activity timelines
- Custom tooltips and legends

### Development Tools

**ESLint 8.57.0**

- TypeScript parser (@typescript-eslint/parser 7.2.0)
- TypeScript plugin (@typescript-eslint/eslint-plugin 7.2.0)
- React hooks linting
- Import ordering
- Prettier integration

**Prettier 3.5.3**

- Code formatting
- Import sorting (@trivago/prettier-plugin-sort-imports 5.2.2)
- Consistent style across codebase
- Pre-commit formatting

**Create React App 5.0.1**

- Build tooling and webpack configuration
- Development server with hot reload
- Production build optimization
- Jest testing setup

### Testing

**Jest 29.7.0**

- Unit testing framework
- Snapshot testing
- Coverage reporting
- Mocking utilities

**React Testing Library**

- @testing-library/react 14.2.1
- @testing-library/jest-dom 5.17.0
- @testing-library/user-event 14.5.2
- Component testing utilities
- Accessibility-focused testing

### Utilities

**email-validator 2.0.4**

- Email address validation
- Used in registration and login forms

## Development Setup

### Environment Requirements

**Node.js**: Version 16 or higher **Package Manager**: Yarn 1.22.22 **IDE**: Visual Studio Code (recommended)
**Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Environment Variables

Required in `.env` file:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=

# API Configuration
REACT_APP_API_URL=http://localhost:3033/api/v1
REACT_APP_SOCKET_URL=ws://localhost:3033/
REACT_APP_STATIC_CONTENT_URL=http://localhost:3033
```

Separate files for environments:

- `.env.development` - Development configuration
- `.env.production` - Production configuration

### Development Commands

```bash
# Install dependencies
yarn install

# Start development server (http://localhost:3000)
yarn start

# Build for production
yarn build

# Run tests
yarn test

# Run tests with coverage
yarn test -- --coverage

# Lint code
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
yarn format
```

### Build Configuration

**tsconfig.json**

- Target: ES5
- Module: ESNext
- Strict mode enabled
- JSX: react-jsx
- Path aliases supported

**Package resolutions** (security fixes):

- nth-check: 2.1.1
- postcss: 8.4.49
- serialize-javascript: 6.0.2

**Proxy configuration**: Development proxy to http://localhost:3033

## Technical Constraints

### Browser Compatibility

**Supported Browsers:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not Supported:**

- Internet Explorer
- Opera Mini

### Performance Requirements

- Initial load time: < 3 seconds
- API response handling: < 500ms
- WebSocket message latency: < 100ms
- React render time: < 16ms for 60fps

### Type Safety

**Shared Types Package**: @ajgifford/keepwatching-types v0.6.1

All data models imported from shared package:

- Show, Season, Episode types
- Movie types
- Profile, Account types
- Notification types
- Statistics types

**Local Types** (src/app/model/):

- errors.ts - ApiErrorResponse, error handling types
- personSearchTypes.ts - Person search specific types

### API Integration

**Backend Requirements:**

- REST API on port 3033
- WebSocket server on same port
- CORS enabled for localhost:3000
- Firebase token validation
- JSON request/response format

**API Endpoints Pattern:**

```
/api/v1/accounts/*
/api/v1/profiles/*
/api/v1/shows/*
/api/v1/movies/*
/api/v1/episodes/*
/api/v1/search/*
/api/v1/notifications/*
```

### WebSocket Events

**Client Listens For:**

- `showsUpdate` - Reload active profile shows
- `moviesUpdate` - Reload active profile movies
- `updateShowFavorite` - Update show favorite status
- `newNotifications` - Add new notifications
- `updateNotifications` - Update existing notifications

**Client Emits:**

- `authenticate` - Provide Firebase token on connection
- `join` - Join profile-specific rooms

## Tool Usage Patterns

### Redux Toolkit Patterns

**Creating Slices:**

```typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchData = createAsyncThunk<ReturnType, ArgType, { rejectValue: ApiErrorResponse }>(
  'slice/fetchData',
  async (arg, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/endpoint');
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const slice = createSlice({
  name: 'sliceName',
  initialState,
  reducers: {
    // Synchronous actions
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});
```

### Material-UI Theme Usage

```typescript
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

const Component = () => {
  const theme = useTheme();

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Typography variant="h5" color="primary">
        Content
      </Typography>
    </Box>
  );
};
```

### Axios Instance Configuration

```typescript
// src/app/api/axiosInstance.ts
import { auth } from '../firebaseConfig';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// Request interceptor: Add Firebase token
axiosInstance.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Retry logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Exponential backoff retry logic
  }
);
```

### WebSocket Connection

```typescript
// src/app/useWebSocket.ts
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});

// Authenticate on connection
socket.on('connect', async () => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    socket.emit('authenticate', { token });
  }
});
```

### LocalStorage Persistence

```typescript
// Middleware in Redux store
import { configureStore } from '@reduxjs/toolkit';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('activeProfile');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    return undefined;
  }
};

const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state.activeProfile);
    localStorage.setItem('activeProfile', serializedState);
  } catch (err) {
    // Handle errors
  }
};

// Subscribe to store changes
store.subscribe(() => {
  saveState(store.getState());
});
```

## Dependencies Overview

### Production Dependencies (19 packages)

- **Framework**: react, react-dom, react-router-dom
- **State**: @reduxjs/toolkit, react-redux
- **UI**: @mui/material, @mui/icons-material, @emotion/react, @emotion/styled
- **Communication**: axios, socket.io-client, firebase
- **Visualization**: recharts
- **Types**: @ajgifford/keepwatching-types, @types/\*
- **Utilities**: email-validator
- **Build**: react-scripts, typescript

### Development Dependencies (18 packages)

- **Linting**: eslint, @typescript-eslint/_, eslint-plugin-_
- **Formatting**: prettier, @trivago/prettier-plugin-sort-imports
- **Testing**: jest, @testing-library/\*
- **Build**: @babel/\*, rimraf

## Integration Points

### Firebase Integration

- Authentication only (no Firestore, Storage, etc.)
- Google OAuth and email/password providers
- Token refresh handled automatically
- Used solely for user identity, not data storage

### TMDB API Integration

- Indirect integration through backend
- Backend fetches and caches TMDB data
- Client uses TMDB image URL patterns
- Responsive image sizing based on device

### Backend API Dependencies

Client depends on backend for:

- User account management
- Profile CRUD operations
- Show/movie tracking
- Episode watch status
- Search functionality
- Notifications
- Statistics calculation

### Type Sharing

@ajgifford/keepwatching-types provides:

- Consistent types across all repositories
- Single source of truth for data models
- Compile-time contract enforcement
- Reduced type duplication
