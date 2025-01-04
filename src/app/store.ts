import authReducer from './slices/authSlice';
import moviesReducer from './slices/moviesSlice';
import notificationReducer from './slices/notificationSlice';
import profilesReducer from './slices/profilesSlice';
import showsReducer from './slices/showsSlice';
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profiles: profilesReducer,
    movies: moviesReducer,
    shows: showsReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
