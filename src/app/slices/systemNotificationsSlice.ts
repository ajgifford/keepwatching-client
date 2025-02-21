import axiosInstance from '../api/axiosInstance';
import { SystemNotification } from '../model/systemNotifications';
import { RootState } from '../store';
import { logout } from './accountSlice';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

interface SystemNotificationsState {
  systemNotifications: SystemNotification[];
  loading: boolean;
  error: string | null;
}

const initialState: SystemNotificationsState = {
  systemNotifications: [],
  loading: false,
  error: null,
};

export const fetchSystemNotifications = createAsyncThunk(
  'systemNotifications/fetchNotifications',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/notifications/${accountId}`);
      return response.data.results;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const dismissSystemNotification = createAsyncThunk(
  'systemNotifications/dismissNotification',
  async ({ accountId, notificationId }: { accountId: string; notificationId: number }, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`/notifications/${accountId}/dismiss/${notificationId}`);
      return notificationId;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

const systemNotificationSlice = createSlice({
  name: 'systemNotifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchSystemNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.systemNotifications = action.payload;
        state.error = null;
      })
      .addCase(fetchSystemNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch system notifications';
      })
      .addCase(dismissSystemNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(dismissSystemNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.systemNotifications = state.systemNotifications.filter((n) => n.notification_id !== action.payload);
      })
      .addCase(dismissSystemNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to dismiss a system notification';
      });
  },
});

export const selectSystemNotifications = (state: RootState) => state.systemNotification.systemNotifications;

export default systemNotificationSlice.reducer;
