# Project Brief: KeepWatching Client

## Project Overview

KeepWatching Client is a modern React-based web application for tracking TV shows and movies. It enables users to never
lose track of what they're watching or which episode they're on, with multi-profile support for families.

## Core Purpose

Provide a comprehensive, user-friendly platform for managing and tracking personal viewing habits across TV shows and
movies, with real-time synchronization and detailed analytics.

## Key Requirements

### User Management

- Firebase Authentication (email/password and Google OAuth)
- Multi-profile support per account
- Profile-specific watch history and preferences
- Secure token-based API communication

### Content Tracking

- TV show episode-level tracking (Show → Season → Episode hierarchy)
- Movie watchlist management
- Watch status states: "Not Watched", "Watching", "Up to Date", "Watched"
- Favorite/unfavorite functionality
- Bulk operations for marking seasons/shows as watched

### Discovery & Search

- Multi-criteria search with filters (year, genre, streaming service)
- Trending content discovery
- Service-specific content filtering
- Similar content recommendations
- TMDB API integration for comprehensive metadata

### Real-Time Updates

- WebSocket connection for live synchronization
- Multi-device support with instant state updates
- Activity notifications and system alerts

### Analytics & Statistics

- Profile-specific viewing statistics
- Account-wide analytics
- Genre and streaming service distribution
- Watch progress visualization
- Interactive charts and dashboards

### User Experience

- Responsive design (mobile and desktop)
- Dark mode and theme switching
- Keep watching quick access
- Upcoming episodes tracking
- Recent releases monitoring

## Technical Constraints

- Must integrate with existing backend API on port 3033
- Firebase authentication required
- Uses shared type definitions from @ajgifford/keepwatching-types package
- Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Success Criteria

- Seamless multi-device synchronization
- Sub-second response times for common operations
- Zero data loss during profile switches
- Accurate watch progress tracking
- Intuitive UI requiring minimal user training

## Project Boundaries

**In Scope:**

- Client-side application only (React SPA)
- User authentication and profile management
- Content tracking and discovery
- Statistics and analytics visualization
- Real-time updates via WebSocket

**Out of Scope:**

- Backend API development (separate repository)
- Content scraping or metadata generation
- Video streaming or playback
- Social features (sharing, comments, etc.)
- Content recommendations algorithm (provided by backend)

## Related Projects

This client works within an ecosystem:

- `keepwatching-api-server` - REST API backend
- `keepwatching-common-server` - Shared server utilities
- `keepwatching-types` - Shared TypeScript type definitions
- `keepwatching-admin-dashboard` - Admin interface
- `keepwatching-admin-server` - Admin backend
