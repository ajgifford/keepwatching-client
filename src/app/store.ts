import { achievementListenerMiddleware } from './middleware/achievementListenerMiddleware';
import authReducer from './slices/accountSlice';
import activeMovieReducer from './slices/activeMovieSlice';
import activeProfileReducer from './slices/activeProfileSlice';
import activeShowReducer from './slices/activeShowSlice';
import activityNotificationReducer from './slices/activityNotificationSlice';
import badgeNotificationReducer from './slices/badgeNotificationSlice';
import calendarReducer from './slices/calendarSlice';
import communityRecommendationsReducer from './slices/communityRecommendationsSlice';
import personSearchReducer from './slices/personSearchSlice';
import preferencesReducer from './slices/preferencesSlice';
import profilesReducer from './slices/profilesSlice';
import ratingsReducer from './slices/ratingsSlice';
import systemNotificationsReducer from './slices/systemNotificationsSlice';
import watchHistoryReducer from './slices/watchHistorySlice';
import watchlistReducer from './slices/watchlistSlice';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  auth: authReducer,
  calendar: calendarReducer,
  profiles: profilesReducer,
  activeProfile: activeProfileReducer,
  activeShow: activeShowReducer,
  activeMovie: activeMovieReducer,
  activityNotification: activityNotificationReducer,
  badgeNotification: badgeNotificationReducer,
  systemNotification: systemNotificationsReducer,
  personSearch: personSearchReducer,
  preferences: preferencesReducer,
  watchHistory: watchHistoryReducer,
  watchlist: watchlistReducer,
  ratings: ratingsReducer,
  communityRecommendations: communityRecommendationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const defaultMiddlewareOptions = {
  serializableCheck: {
    ignoredActions: ['personSearch/searchPeople/fulfilled', 'personSearch/fetchPersonDetails/fulfilled'],
  },
};

// Unchanged from before the achievement listener middleware was introduced, so
// `createMockStore`/`renderWithProviders` in tests keep their existing (thunk-aware) dispatch
// typing. The real app's singleton store below builds its own middleware chain instead of
// extending this one, so the achievement listener's real-time effects never run in tests.
export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(defaultMiddlewareOptions),
    preloadedState,
  });
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(defaultMiddlewareOptions).prepend(achievementListenerMiddleware.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof setupStore>;

export default store;
