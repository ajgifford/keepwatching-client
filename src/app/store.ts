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
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
