import authReducer from './slices/accountSlice';
import calendarReducer from './slices/calendarSlice';
import communityRecommendationsReducer from './slices/communityRecommendationsSlice';
import ratingsReducer from './slices/ratingsSlice';
import activeMovieReducer from './slices/activeMovieSlice';
import activeProfileReducer from './slices/activeProfileSlice';
import activeShowReducer from './slices/activeShowSlice';
import activityNotificationReducer from './slices/activityNotificationSlice';
import personSearchReducer from './slices/personSearchSlice';
import preferencesReducer from './slices/preferencesSlice';
import profilesReducer from './slices/profilesSlice';
import systemNotificationsReducer from './slices/systemNotificationsSlice';
import watchHistoryReducer from './slices/watchHistorySlice';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  auth: authReducer,
  calendar: calendarReducer,
  profiles: profilesReducer,
  activeProfile: activeProfileReducer,
  activeShow: activeShowReducer,
  activeMovie: activeMovieReducer,
  activityNotification: activityNotificationReducer,
  systemNotification: systemNotificationsReducer,
  personSearch: personSearchReducer,
  preferences: preferencesReducer,
  watchHistory: watchHistoryReducer,
  ratings: ratingsReducer,
  communityRecommendations: communityRecommendationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['personSearch/searchPeople/fulfilled', 'personSearch/fetchPersonDetails/fulfilled'],
        },
      }),
    preloadedState,
  });
};

const store = setupStore();

export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof setupStore>;

export default store;
