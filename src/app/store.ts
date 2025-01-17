import authReducer from './slices/accountSlice';
import activeProfileReducer from './slices/activeProfileSlice';
import activeShowReducer from './slices/activeShowSlice';
import notificationReducer from './slices/notificationSlice';
import profilesReducer from './slices/profilesSlice';
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profiles: profilesReducer,
    activeProfile: activeProfileReducer,
    activeShow: activeShowReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
