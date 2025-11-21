import authReducer from './slices/accountSlice';
import activeMovieReducer from './slices/activeMovieSlice';
import activeProfileReducer from './slices/activeProfileSlice';
import activeShowReducer from './slices/activeShowSlice';
import activityNotificationReducer from './slices/activityNotificationSlice';
import personSearchReducer from './slices/personSearchSlice';
import preferencesReducer from './slices/preferencesSlice';
import profilesReducer from './slices/profilesSlice';
import systemNotificationsReducer from './slices/systemNotificationsSlice';
import { PreloadedState, configureStore } from '@reduxjs/toolkit';

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      profiles: profilesReducer,
      activeProfile: activeProfileReducer,
      activeShow: activeShowReducer,
      activeMovie: activeMovieReducer,
      activityNotification: activityNotificationReducer,
      systemNotification: systemNotificationsReducer,
      personSearch: personSearchReducer,
      preferences: preferencesReducer,
    },
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof setupStore>;

export default store;
