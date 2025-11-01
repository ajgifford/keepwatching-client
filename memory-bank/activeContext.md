# Active Context: KeepWatching Client

## Current Work Focus

### Memory Bank Initialization (In Progress)

**Status**: Creating comprehensive Memory Bank documentation for the first time

**What's Happening**: Establishing the foundational documentation that will guide all future development work on this
project. This is critical since my memory resets between sessions, and these documents serve as my only connection to
understanding the project.

**Files Created**:

- ✅ projectbrief.md - Core project requirements and scope
- ✅ productContext.md - User experience goals and product vision
- ✅ systemPatterns.md - Architecture and technical patterns
- ✅ techContext.md - Technology stack and development setup
- 🔄 activeContext.md - This file (current work and recent changes)
- ⏳ progress.md - Project status and what's left to build

## Recent Changes

### Initial Memory Bank Setup

**Date**: October 31, 2025

**Changes Made**:

1. Created memory-bank directory structure
2. Documented complete project architecture
3. Captured all key technical decisions
4. Established comprehensive technology context

**Rationale**: This is the first Memory Bank initialization for the keepwatching-client project. The documentation
captures the current state of a mature React application with:

- Multi-profile TV show and movie tracking
- Real-time WebSocket synchronization
- Firebase authentication
- Redux Toolkit state management
- Material-UI component library
- Comprehensive statistics and analytics

## Next Steps

### Immediate (This Session)

1. ✅ Complete activeContext.md (this file)
2. ⏳ Create progress.md with current project status
3. ⏳ Verify all Memory Bank files are complete and accurate

### Short-Term

- Monitor for any updates to the Memory Bank documentation
- Keep activeContext.md current with ongoing work
- Update progress.md as features are completed

### Areas Needing Attention

Based on the file structure and CLAUDE.md documentation:

**Potentially Complete Features**:

- Core authentication flow (Firebase)
- Profile management system
- Show/movie tracking functionality
- Episode-level watch status
- Real-time WebSocket updates
- Search and discovery features
- Statistics dashboards
- Notification system

**Areas to Verify**:

- Test coverage completeness
- Error handling comprehensiveness
- Performance optimization status
- Accessibility compliance
- Mobile responsiveness edge cases

## Active Decisions and Considerations

### Architecture Decisions

**1. Redux Toolkit Over Context API**

- **Decision**: Use Redux Toolkit for all global state
- **Why**: Complex state with real-time updates, need for time-travel debugging, clear separation of concerns
- **Trade-off**: More boilerplate than Context API, but better scalability and DevTools support

**2. LocalStorage Caching for Active Profile**

- **Decision**: Cache activeProfileSlice to localStorage
- **Why**: Faster app initialization, reduced API calls on page refresh
- **Trade-off**: Risk of stale data, but mitigated by WebSocket updates and periodic re-fetching

**3. WebSocket for Real-Time Updates**

- **Decision**: Use Socket.io for all real-time synchronization
- **Why**: Multi-device support requirement, instant state updates across devices
- **Trade-off**: Additional complexity, but critical for user experience

**4. Profile-Based Tracking Instead of Account-Based**

- **Decision**: All watch data tied to profiles, not accounts
- **Why**: Family sharing requirement, each user needs isolated data
- **Trade-off**: More complex queries, but enables core multi-profile feature

### Code Patterns to Maintain

**1. Consistent Async Thunk Error Handling**

```typescript
// Always use this pattern for API calls
export const thunk = createAsyncThunk<ReturnType, ArgType, { rejectValue: ApiErrorResponse }>(
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

**2. Component Organization**

- Pages in `src/components/pages/` - container components
- Common components in `src/components/common/[feature]/` - presentational components
- Clear separation of concerns between pages and reusable components

**3. Material-UI Theming**

- All styling should use theme tokens
- No hardcoded colors or spacing values
- Support both light and dark modes

**4. Type Safety**

- Import shared types from @ajgifford/keepwatching-types
- Define local types only for app-specific concerns
- Strict TypeScript enabled - no `any` types

## Important Patterns and Preferences

### State Management

- **Normalized state structure** for efficient lookups
- **Optimistic UI updates** with rollback on error
- **Selective re-renders** using createSelector for derived state
- **Persistent slices** for activeProfile and preferences

### API Communication

- **Centralized axios instance** with automatic token injection
- **Exponential backoff retry** for failed requests
- **Consistent error handling** with ApiErrorResponse type
- **WebSocket events trigger Redux actions**, not direct state mutations

### Component Design

- **Functional components only** with hooks
- **Composition over inheritance**
- **Props interfaces** defined for all components
- **Loading and error states** handled in all async components

### Testing Strategy

- Unit tests for Redux slices and utilities
- Component tests using React Testing Library
- Focus on user behavior, not implementation details
- Accessibility-first testing approach

## Learnings and Project Insights

### What Works Well

**1. Redux Toolkit State Management**

- Clean slice organization by feature
- Easy async handling with createAsyncThunk
- Built-in Immer makes state updates simple
- DevTools integration invaluable for debugging

**2. WebSocket Real-Time Updates**

- Provides excellent multi-device experience
- Event-based updates keep all clients in sync
- Automatic reconnection handles network issues
- Integration with Redux actions is seamless

**3. Material-UI Component Library**

- Comprehensive component set reduces custom development
- Built-in theming system works great for dark mode
- Responsive utilities simplify mobile support
- Consistent design language across app

**4. Type Safety with Shared Package**

- @ajgifford/keepwatching-types ensures consistency
- Compile-time contract enforcement prevents bugs
- Single source of truth for data models
- Easy to update types across all projects

### Challenges and Solutions

**1. Challenge: Managing Complex Episode Hierarchy**

- **Problem**: Show → Season → Episode hierarchy complex to manage
- **Solution**: Bulk operations with cascading updates, status calculated dynamically from children

**2. Challenge: LocalStorage Cache Staleness**

- **Problem**: Cached profile data can become stale
- **Solution**: WebSocket updates trigger re-fetch, cache used only for initial load

**3. Challenge: Profile Switching Performance**

- **Problem**: Loading new profile data can be slow
- **Solution**: Optimistic UI updates, background data fetching, cache previous profiles

**4. Challenge: Real-Time Sync Conflicts**

- **Problem**: Multiple devices updating same data simultaneously
- **Solution**: Backend handles conflict resolution, always trust server state

### Best Practices Established

1. **Always re-fetch after mutations** - Never trust local state after updates
2. **WebSocket events trigger actions** - Maintain unidirectional data flow
3. **Normalize state by ID** - Efficient lookups and updates
4. **Component composition** - Build complex UIs from simple, reusable parts
5. **Error boundaries** - Graceful degradation for component failures
6. **Loading states** - Never show stale data, always indicate loading
7. **Type everything** - No `any` types, leverage TypeScript fully
8. **Responsive by default** - Use Material-UI breakpoints consistently

## Current Project State

### What's Functioning

Based on the codebase structure and documentation:

- ✅ Firebase authentication (email/password, Google OAuth)
- ✅ Profile management system
- ✅ TV show tracking with episode-level granularity
- ✅ Movie tracking and watchlist
- ✅ Real-time WebSocket synchronization
- ✅ Search functionality (shows, movies, people)
- ✅ Content discovery by streaming service
- ✅ Statistics dashboards (profile and account-wide)
- ✅ Notification system
- ✅ Dark mode support
- ✅ Responsive design

### Known Patterns

- Redux slices are feature-organized
- Components follow container/presenter pattern
- API calls use centralized axios instance
- WebSocket connection managed globally
- LocalStorage used for active profile and preferences
- Error handling standardized across slices
- Material-UI theming consistently applied

### Integration Status

- ✅ Firebase Authentication working
- ✅ Backend API integration (port 3033)
- ✅ WebSocket connection established
- ✅ TMDB data integration (through backend)
- ✅ Shared types package (@ajgifford/keepwatching-types)

## Notes for Future Sessions

### When Resuming Work

1. **ALWAYS read ALL Memory Bank files first** - This is non-negotiable
2. Review activeContext.md for current focus area
3. Check progress.md for project status
4. Understand the architecture from systemPatterns.md
5. Verify technical context in techContext.md

### When Making Changes

1. Update activeContext.md with current work
2. Document decisions and rationale
3. Update progress.md when features complete
4. Maintain established patterns and practices
5. Add learnings and insights to this file

### Critical Reminders

- **Type safety**: Use shared types from @ajgifford/keepwatching-types
- **State management**: Redux Toolkit with feature-based slices
- **Real-time updates**: WebSocket events trigger Redux actions
- **Profile-based**: All tracking tied to profiles, not accounts
- **Authentication**: Firebase tokens auto-injected via axios interceptor
- **Error handling**: Consistent ApiErrorResponse pattern across slices
