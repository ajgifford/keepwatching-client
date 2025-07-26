import axiosInstance from '../api/axiosInstance';
import { ApiErrorResponse } from '../model/errors';
import { RootState } from '../store';
import { logout } from './accountSlice';
import { AccountNotification, NotificationResponse } from '@ajgifford/keepwatching-types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

interface SystemNotificationsState {
  systemNotifications: AccountNotification[];
  loading: boolean;
  error: ApiErrorResponse | null;
}

const initialState: SystemNotificationsState = {
  systemNotifications: [],
  loading: false,
  error: null,
};

export const fetchSystemNotifications = createAsyncThunk<
  AccountNotification[],
  number,
  { rejectValue: ApiErrorResponse }
>('systemNotifications/fetchNotifications', async (accountId: number, { rejectWithValue }) => {
  try {
    const response: AxiosResponse<NotificationResponse> = await axiosInstance.get(
      `/accounts/${accountId}/notifications`
    );
    return response.data.notifications;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || error.message);
    }
    return rejectWithValue({ message: 'An unknown error occurred fetching system notifications' });
  }
});

export const markSystemNotificationRead = createAsyncThunk<
  AccountNotification[],
  { accountId: number; notificationId: number; hasBeenRead: boolean },
  { rejectValue: ApiErrorResponse }
>(
  'systemNotifications/markRead',
  async (
    { accountId, notificationId, hasBeenRead }: { accountId: number; notificationId: number; hasBeenRead: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response: AxiosResponse<NotificationResponse> = await axiosInstance.post(
        `/accounts/${accountId}/notifications/read/${notificationId}?hasBeenRead=${hasBeenRead}`
      );
      return response.data.notifications;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred marking a notification read/unread' });
    }
  }
);

export const markAllSystemNotificationsRead = createAsyncThunk<
  AccountNotification[],
  { accountId: number; hasBeenRead: boolean },
  { rejectValue: ApiErrorResponse }
>(
  'systemNotifications/markAllRead',
  async ({ accountId, hasBeenRead }: { accountId: number; hasBeenRead: boolean }, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<NotificationResponse> = await axiosInstance.post(
        `/accounts/${accountId}/notifications/read?hasBeenRead=${hasBeenRead}`
      );
      return response.data.notifications;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred marking all notifications read/unread' });
    }
  }
);

export const dismissSystemNotification = createAsyncThunk<
  AccountNotification[],
  { accountId: number; notificationId: number },
  { rejectValue: ApiErrorResponse }
>(
  'systemNotifications/dismiss',
  async ({ accountId, notificationId }: { accountId: number; notificationId: number }, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<NotificationResponse> = await axiosInstance.post(
        `/accounts/${accountId}/notifications/dismiss/${notificationId}`
      );
      return response.data.notifications;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred dismissing a notification' });
    }
  }
);

export const dismissAllSystemNotifications = createAsyncThunk<
  AccountNotification[],
  { accountId: number },
  { rejectValue: ApiErrorResponse }
>('systemNotifications/dismissAll', async ({ accountId }: { accountId: number }, { rejectWithValue }) => {
  try {
    const response: AxiosResponse<NotificationResponse> = await axiosInstance.post(
      `/accounts/${accountId}/notifications/dismiss`
    );
    return response.data.notifications;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || error.message);
    }
    return rejectWithValue({ message: 'An unknown error occurred dismissing all notifications' });
  }
});

export const updateNotifications = createAsyncThunk<
  AccountNotification[],
  AccountNotification[],
  { rejectValue: ApiErrorResponse }
>('systemNotifications/updateNotifications', async (notifications: AccountNotification[], { rejectWithValue }) => {
  if (notifications) {
    return notifications;
  }
  return rejectWithValue({ message: 'Error while updating notifications' });
});

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
        state.systemNotifications = [];
        state.error = action.payload || { message: 'Failed to fetch system notifications' };
      })
      .addCase(markSystemNotificationRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markSystemNotificationRead.fulfilled, (state, action) => {
        state.loading = false;
        state.systemNotifications = action.payload;
        state.error = null;
      })
      .addCase(markSystemNotificationRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to mark read/unread a system notification' };
      })
      .addCase(markAllSystemNotificationsRead.fulfilled, (state, action) => {
        state.systemNotifications = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(markAllSystemNotificationsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllSystemNotificationsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to mark read/unread all notifications' };
      })
      .addCase(dismissSystemNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(dismissSystemNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.systemNotifications = action.payload;
        state.error = null;
      })
      .addCase(dismissSystemNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to dismiss a system notification' };
      })
      .addCase(dismissAllSystemNotifications.fulfilled, (state, action) => {
        state.systemNotifications = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(dismissAllSystemNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(dismissAllSystemNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to dismiss all notifications' };
      })
      .addCase(updateNotifications.fulfilled, (state, action) => {
        state.systemNotifications = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to update notifications' };
      });
  },
});

export const selectSystemNotifications = (state: RootState) => state.systemNotification.systemNotifications;

export default systemNotificationSlice.reducer;
