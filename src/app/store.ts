import { axiosMiddleware } from './api/axiosMiddleware';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import profilesReducer from './slices/profilesSlice';
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profiles: profilesReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(axiosMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
