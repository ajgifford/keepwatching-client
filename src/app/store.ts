import authReducer from './slices/accountSlice';
import activeProfileReducer from './slices/activeProfileSlice';
import activeShowReducer from './slices/activeShowSlice';
import activityNotificationReducer from './slices/activityNotificationSlice';
import profilesReducer from './slices/profilesSlice';
import systemNotificationsReducer from './slices/systemNotificationsSlice';
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profiles: profilesReducer,
    activeProfile: activeProfileReducer,
    activeShow: activeShowReducer,
    activityNotification: activityNotificationReducer,
    systemNotification: systemNotificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
