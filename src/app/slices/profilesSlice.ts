import axiosInstance from '../api/axiosInstance';
import { RootState } from '../store';
import { deleteAccount, logout } from './accountSlice';
import { ActivityNotificationType, showActivityNotification } from './activityNotificationSlice';
import { Profile, ProfileResponse, ProfilesResponse } from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';
import { EntityState, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

const PROFILE_KEY = 'profiles';

const saveToLocalStorage = (profiles: Profile[]) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
};

const loadFromLocalStorage = () => {
  const data = localStorage.getItem(PROFILE_KEY);
  const profiles = (data ? JSON.parse(data) : []) as Profile[];
  return profiles;
};

interface ProfileStatus extends EntityState<Profile, number> {
  loading: boolean;
  error: ApiErrorResponse | null;
}

interface ProfileSubStatus {
  loading: boolean;
  error: ApiErrorResponse | null;
}

const profilesAdapter = createEntityAdapter<Profile>({
  sortComparer: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
});

const calculateInitialState = (): ProfileSubStatus => {
  const profiles = loadFromLocalStorage();
  if (profiles.length > 0) {
    return { loading: false, error: null };
  }
  return { loading: false, error: null };
};

const initialState: ProfileStatus = profilesAdapter.getInitialState(calculateInitialState(), loadFromLocalStorage());

export const fetchProfiles = createAsyncThunk<Profile[], number, { rejectValue: ApiErrorResponse }>(
  'profiles/fetchProfiles',
  async (accountId: number, { rejectWithValue }) => {
    try {
      const response: AxiosResponse<ProfilesResponse> = await axiosInstance.get(`/accounts/${accountId}/profiles`);
      const profiles: Profile[] = response.data.profiles;
      return profiles;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  },
  {
    condition(_arg, thunkApi) {
      const state = thunkApi.getState() as RootState;
      const loading = selectProfilesLoading(state);
      const profiles = selectAllProfiles(state);
      if (loading || profiles.length > 0) {
        return false;
      }
    },
  }
);

export const addProfile = createAsyncThunk<
  Profile,
  { accountId: number; newProfileName: string },
  { rejectValue: ApiErrorResponse }
>(
  'profiles/addProfile',
  async (
    { accountId, newProfileName }: { accountId: number; newProfileName: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response: AxiosResponse<ProfileResponse> = await axiosInstance.post(`/accounts/${accountId}/profiles`, {
        name: newProfileName,
      });
      dispatch(
        showActivityNotification({
          message: `Added profile: ${newProfileName}`,
          type: ActivityNotificationType.Success,
        })
      );
      return response.data.profile;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  }
);

export const deleteProfile = createAsyncThunk<
  number,
  { accountId: number; profileId: number },
  { rejectValue: ApiErrorResponse }
>(
  'profiles/deleteProfile',
  async ({ accountId, profileId }: { accountId: number; profileId: number }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/accounts/${accountId}/profiles/${profileId}`);
      dispatch(
        showActivityNotification({
          message: `Profile deleted successfully`,
          type: ActivityNotificationType.Success,
        })
      );
      return profileId;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  }
);

export const editProfile = createAsyncThunk<
  Profile,
  { accountId: number; profileId: number; name: string },
  { rejectValue: ApiErrorResponse }
>(
  'profiles/editProfile',
  async (
    { accountId, profileId, name }: { accountId: number; profileId: number; name: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response: AxiosResponse<ProfileResponse> = await axiosInstance.put(
        `/accounts/${accountId}/profiles/${profileId}`,
        { name }
      );
      dispatch(
        showActivityNotification({
          message: `Profile edited successfully`,
          type: ActivityNotificationType.Success,
        })
      );
      return response.data.profile;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred' });
    }
  }
);

export const updateProfileImage = createAsyncThunk<
  Profile,
  { accountId: number; profileId: number; file: File },
  { rejectValue: ApiErrorResponse }
>(
  'profiles/updateImage',
  async (
    { accountId, profileId, file }: { accountId: number; profileId: number; file: File },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData: FormData = new FormData();
      formData.append('file', file);
      const response: AxiosResponse<ProfileResponse> = await axiosInstance.post(
        `/upload/accounts/${accountId}/profiles/${profileId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      dispatch(
        showActivityNotification({
          message: `Profile image updated successfully`,
          type: ActivityNotificationType.Success,
        })
      );
      return response.data.profile;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          })
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred',
          type: ActivityNotificationType.Error,
        })
      );
      return rejectWithValue({ message: 'An unknown error occurred updating a profile image' });
    }
  }
);

export const removeProfileImage = createAsyncThunk<
  Profile,
  { accountId: number; profileId: number },
  { rejectValue: ApiErrorResponse }
>(
  'profiles/removeImage',
  async ({ accountId, profileId }: { accountId: number; profileId: number }, { dispatch, rejectWithValue }) => {
    try {
      const response: AxiosResponse<ProfileResponse> = await axiosInstance.delete(
        `/upload/accounts/${accountId}/profiles/${profileId}/image`
      );

      dispatch(
        showActivityNotification({
          message: `Profile image removed successfully`,
          type: ActivityNotificationType.Success,
        })
      );
      return response.data.profile;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          })
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred removing the profile image',
          type: ActivityNotificationType.Error,
        })
      );
      return rejectWithValue({ message: 'An unknown error occurred removing a profile image' });
    }
  }
);

const profileSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        localStorage.removeItem(PROFILE_KEY);
        return profilesAdapter.getInitialState(calculateInitialState());
      })
      .addCase(deleteAccount.fulfilled, () => {
        localStorage.removeItem(PROFILE_KEY);
        return profilesAdapter.getInitialState(calculateInitialState());
      })
      .addCase(addProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProfile.fulfilled, (state, action) => {
        profilesAdapter.addOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.loading = false;
        state.error = null;
      })
      .addCase(addProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Add Profile Failed' };
      })
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        profilesAdapter.removeOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Delete Profile Failed' };
      })
      .addCase(editProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        profilesAdapter.upsertOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.loading = false;
        state.error = null;
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Edit Profile Failed' };
      })
      .addCase(fetchProfiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        profilesAdapter.setAll(state, action.payload);
        saveToLocalStorage(action.payload);
        state.error = null;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Get Profiles Failed' };
      })
      .addCase(updateProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        profilesAdapter.upsertOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Profile Image Update Failed' };
      })
      .addCase(removeProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProfileImage.fulfilled, (state, action) => {
        profilesAdapter.upsertOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.loading = false;
        state.error = null;
      })
      .addCase(removeProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Profile Image Removal Failed' };
      });
  },
});

export const {
  selectAll: selectAllProfiles,
  selectById: selectProfileById,
  selectIds: selectProfileIds,
} = profilesAdapter.getSelectors((state: RootState) => state.profiles);

export const selectProfilesLoading = (state: RootState) => state.profiles.loading;
export const selectProfilesError = (state: RootState) => state.profiles.error;

export default profileSlice.reducer;
