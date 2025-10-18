import axiosInstance from '../api/axiosInstance';
import { ApiErrorResponse } from '../model/errors';
import { RootState } from '../store';
import { deleteAccount, logout } from './accountSlice';
import { ActivityNotificationType, showActivityNotification } from './activityNotificationSlice';
import {
  AccountPreferences,
  AccountPreferencesResponse,
  DEFAULT_PREFERENCES,
  DisplayPreferences,
  EmailPreferences,
  NotificationPreferences,
  PreferenceType,
  PrivacyPreferences,
} from '@ajgifford/keepwatching-types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

const PREFERENCES_KEY = 'preferences';

interface PreferencesState {
  preferences: AccountPreferences;
  loading: boolean;
  error: ApiErrorResponse | null;
}

const saveToLocalStorage = (prefs: AccountPreferences) => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save preferences to localStorage:', error);
  }
};

const loadFromLocalStorage = (): PreferencesState => {
  try {
    const data = localStorage.getItem(PREFERENCES_KEY);
    if (data) {
      return {
        preferences: data ? JSON.parse(data) : [],
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Failed to load preferences from localStorage:', error);
  }
  return initialState;
};

const initialState: PreferencesState = {
  preferences: {},
  loading: false,
  error: null,
};

export const fetchAccountPreferences = createAsyncThunk<AccountPreferences, number, { rejectValue: ApiErrorResponse }>(
  'preferences/fetchAccountPreferences',
  async (accountId: number, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<AccountPreferencesResponse> = await axiosInstance.get(
        `/accounts/${accountId}/preferences`
      );
      return response.data.preferences;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'Failed to load preferences' });
    }
  }
);

export const updatePreferences = createAsyncThunk<
  AccountPreferences,
  {
    accountId: number;
    preferenceType: PreferenceType;
    updates: Partial<EmailPreferences | DisplayPreferences | NotificationPreferences | PrivacyPreferences>;
  },
  { rejectValue: ApiErrorResponse }
>('preferences/updatePreferences', async ({ accountId, preferenceType, updates }, { dispatch, rejectWithValue }) => {
  try {
    const response: AxiosResponse<AccountPreferencesResponse> = await axiosInstance.put(
      `/accounts/${accountId}/preferences/${preferenceType}`,
      updates
    );

    dispatch(
      showActivityNotification({
        message: 'Preferences updated successfully',
        type: ActivityNotificationType.Success,
      })
    );

    return response.data.preferences;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorResponse = error.response?.data || { message: error.message };
      dispatch(
        showActivityNotification({
          message: errorResponse.message || 'Failed to update preferences',
          type: ActivityNotificationType.Error,
        })
      );
      return rejectWithValue(errorResponse);
    }
    return rejectWithValue({ message: 'Failed to update preferences' });
  }
});

export const updateMultiplePreferences = createAsyncThunk<
  AccountPreferences,
  {
    accountId: number;
    preferences: Partial<AccountPreferences>;
  },
  { rejectValue: ApiErrorResponse }
>('preferences/updateMultiplePreferences', async ({ accountId, preferences }, { dispatch, rejectWithValue }) => {
  try {
    const response: AxiosResponse<AccountPreferencesResponse> = await axiosInstance.put(
      `/accounts/${accountId}/preferences`,
      preferences
    );

    dispatch(
      showActivityNotification({
        message: 'Preferences updated successfully',
        type: ActivityNotificationType.Success,
      })
    );

    return response.data.preferences;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorResponse = error.response?.data || { message: error.message };
      dispatch(
        showActivityNotification({
          message: errorResponse.message || 'Failed to update preferences',
          type: ActivityNotificationType.Error,
        })
      );
      return rejectWithValue(errorResponse);
    }
    return rejectWithValue({ message: 'Failed to update preferences' });
  }
});

export const updateEmailPreferences = createAsyncThunk<
  AccountPreferences,
  { accountId: number; emailPreferences: Partial<EmailPreferences> },
  { rejectValue: ApiErrorResponse }
>('preferences/updateEmailPreferences', async ({ accountId, emailPreferences }, { dispatch }) => {
  return dispatch(
    updatePreferences({
      accountId,
      preferenceType: 'email',
      updates: emailPreferences,
    })
  ).unwrap();
});

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: loadFromLocalStorage(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        localStorage.removeItem(PREFERENCES_KEY);
        return initialState;
      })
      .addCase(deleteAccount.fulfilled, () => {
        localStorage.removeItem(PREFERENCES_KEY);
        return initialState;
      })
      .addCase(fetchAccountPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        state.error = null;
        saveToLocalStorage(state.preferences);
      })
      .addCase(fetchAccountPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch preferences' };
      })
      .addCase(updatePreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        state.error = null;
        saveToLocalStorage(state.preferences);
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to update preferences' };
      })
      .addCase(updateMultiplePreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMultiplePreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        state.error = null;
        saveToLocalStorage(state.preferences);
      })
      .addCase(updateMultiplePreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to update preferences' };
      })
      .addCase(updateEmailPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmailPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        state.error = null;
        saveToLocalStorage(state.preferences);
      })
      .addCase(updateEmailPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to update email preferences' };
      });
  },
});

export const selectPreferences = (state: RootState) => state.preferences.preferences;
export const selectEmailPreferences = (state: RootState) =>
  state.preferences.preferences.email || DEFAULT_PREFERENCES.email;
export const selectDisplayPreferences = (state: RootState) =>
  state.preferences.preferences.display || DEFAULT_PREFERENCES.display;
export const selectNotificationPreferences = (state: RootState) =>
  state.preferences.preferences.notification || DEFAULT_PREFERENCES.notification;
export const selectPrivacyPreferences = (state: RootState) =>
  state.preferences.preferences.privacy || DEFAULT_PREFERENCES.privacy;
export const selectPreferencesLoading = (state: RootState) => state.preferences.loading;
export const selectPreferencesError = (state: RootState) => state.preferences.error;

export default preferencesSlice.reducer;
