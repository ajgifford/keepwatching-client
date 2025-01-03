import axiosInstance from '../api/axiosInstance';
import { Profile } from '../model/profile';
import { RootState } from '../store';
import { createAppAsyncThunk } from '../withTypes';
import { logout } from './authSlice';
import { fetchMoviesForProfile } from './moviesSlice';
import { NotificationType, showNotification } from './notificationSlice';
import { EntityState, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

const PROFILE_KEY = 'profiles';

const saveToLocalStorage = (profiles: Profile[]) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
};

const loadFromLocalStorage = () => {
  const data = localStorage.getItem(PROFILE_KEY);
  const profiles = (data ? JSON.parse(data) : []) as Profile[];
  return profiles;
};

interface ProfileStatus extends EntityState<Profile, string> {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

interface ProfileSubStatus {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const profilesAdapter = createEntityAdapter<Profile>({
  sortComparer: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
});

const calculateInitialState = (): ProfileSubStatus => {
  const profiles = loadFromLocalStorage();
  if (profiles.length > 0) {
    return { status: 'succeeded', error: null };
  }
  return { status: 'idle', error: null };
};

const initialState: ProfileStatus = profilesAdapter.getInitialState(calculateInitialState(), loadFromLocalStorage());

type ErrorResponse = {
  message: string;
};

export const fetchProfiles = createAppAsyncThunk(
  'profiles/fetchProfiles',
  async (accountId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/accounts/${accountId}/profiles`);
      const profiles: Profile[] = response.data.results;
      profiles.forEach((profile: any) => {
        dispatch(fetchMoviesForProfile(profile.id));
      });
      return profiles;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
  {
    condition(arg, thunkApi) {
      const state = thunkApi.getState() as RootState;
      const profileStatus = selectProfilesStatus(state);
      const profiles = selectAllProfiles(state);
      if (profileStatus !== 'idle' || profiles.length > 0) {
        return false;
      }
    },
  },
);

export const addProfile = createAsyncThunk(
  'profiles/addProfile',
  async (
    { accountId, newProfileName }: { accountId: string; newProfileName: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.post(`/api/accounts/${accountId}/profiles`, { name: newProfileName });
      dispatch(
        showNotification({
          message: `Added profile: ${newProfileName}`,
          type: NotificationType.Success,
        }),
      );
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteProfile = createAsyncThunk(
  'profiles/deleteProfile',
  async ({ accountId, profileId }: { accountId: string; profileId: string }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/accounts/${accountId}/profiles/${profileId}`);
      dispatch(
        showNotification({
          message: `Profile deleted successfully`,
          type: NotificationType.Success,
        }),
      );
      return profileId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const editProfile = createAsyncThunk(
  'profiles/editProfile',
  async ({ accountId, id, name }: { accountId: string; id: string; name: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/accounts/${accountId}/profiles/${id}`, { name });
      dispatch(
        showNotification({
          message: `Profile edited successfully`,
          type: NotificationType.Success,
        }),
      );
      return response.data.result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const profileSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        localStorage.removeItem(PROFILE_KEY);
        return profilesAdapter.getInitialState(calculateInitialState());
      })
      .addCase(addProfile.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(addProfile.fulfilled, (state, action) => {
        profilesAdapter.addOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.status = 'succeeded';
      })
      .addCase(addProfile.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Add Profile Failed';
        } else {
          state.error = action.error.message || 'Add Profile Failed';
        }
      })
      .addCase(deleteProfile.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        profilesAdapter.removeOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.status = 'succeeded';
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Delete Profile Failed';
        } else {
          state.error = action.error.message || 'Delete Profile Failed';
        }
      })
      .addCase(editProfile.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        profilesAdapter.upsertOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.status = 'succeeded';
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Edit Profile Failed';
        } else {
          state.error = action.error.message || 'Edit Profile Failed';
        }
      })
      .addCase(fetchProfiles.pending, (state, action) => {
        state.status = 'pending';
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        profilesAdapter.setAll(state, action.payload);
        saveToLocalStorage(action.payload);
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Get Profiles Failed';
        } else {
          state.error = action.error.message || 'Get Profiles Failed';
        }
      });
  },
});

export const {
  selectAll: selectAllProfiles,
  selectById: selectProfileById,
  selectIds: selectProfileIds,
} = profilesAdapter.getSelectors((state: any) => state.profiles);
export const selectProfilesStatus = (state: RootState) => state.profiles.status;
export const selectProfilesError = (state: RootState) => state.profiles.error;

export default profileSlice.reducer;
