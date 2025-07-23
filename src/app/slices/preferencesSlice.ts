import axiosInstance from '../api/axiosInstance';
import { ApiErrorResponse } from '../model/errors';
import { RootState } from '../store';
import { ActivityNotificationType, showActivityNotification } from './activityNotificationSlice';
import {
  AccountPreferences,
  AccountPreferencesResponse,
  DEFAULT_PREFERENCES,
  EmailPreferences,
  PreferenceType,
  TypedPreferenceUpdate,
} from '@ajgifford/keepwatching-types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

interface PreferencesState {
  preferences: AccountPreferences;
  loading: boolean;
  error: ApiErrorResponse | null;
}

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
  { accountId: number; preferenceType: PreferenceType; updates: any },
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
  { accountId: number; updates: Partial<TypedPreferenceUpdate> },
  { rejectValue: ApiErrorResponse }
>('preferences/updateMultiplePreferences', async ({ accountId, updates }, { dispatch, rejectWithValue }) => {
  try {
    const response: AxiosResponse<AccountPreferencesResponse> = await axiosInstance.put(
      `/accounts/${accountId}/preferences`,
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
  initialState,
  reducers: {
    clearPreferencesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        state.error = null;
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
      })
      .addCase(updateMultiplePreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to update preferences' };
      });
  },
});

export const { clearPreferencesError } = preferencesSlice.actions;

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
