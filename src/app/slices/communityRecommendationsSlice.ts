import axiosInstance from '../api/axiosInstance';
import { RootState } from '../store';
import { deleteAccount, logout } from './accountSlice';
import {
  CommunityRecommendation,
  CommunityRecommendationsResponse,
  ProfileRecommendation,
  ProfileRecommendationResponse,
  ProfileRecommendationsResponse,
  RatingContentType,
} from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

interface CommunityRecommendationsState {
  communityRecommendations: CommunityRecommendation[];
  communityLoading: boolean;
  communityError: ApiErrorResponse | null;
  contentTypeFilter: RatingContentType | null;

  profileRecommendations: ProfileRecommendation[];
  profileRecsLoading: boolean;

  sendLoading: boolean;
}

const initialState: CommunityRecommendationsState = {
  communityRecommendations: [],
  communityLoading: false,
  communityError: null,
  contentTypeFilter: null,
  profileRecommendations: [],
  profileRecsLoading: false,
  sendLoading: false,
};

export const fetchCommunityRecommendations = createAsyncThunk<
  CommunityRecommendation[],
  { contentType?: RatingContentType },
  { rejectValue: ApiErrorResponse }
>('communityRecommendations/fetchCommunity', async ({ contentType }, { rejectWithValue }) => {
  try {
    const params = contentType ? `?contentType=${contentType}` : '';
    const response: AxiosResponse<CommunityRecommendationsResponse> = await axiosInstance.get(
      `/community/recommendations${params}`,
    );
    return response.data.recommendations;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
    return rejectWithValue({ message: 'An unknown error occurred fetching community recommendations' });
  }
});

export const fetchProfileRecommendations = createAsyncThunk<
  ProfileRecommendation[],
  { profileId: number },
  { rejectValue: ApiErrorResponse }
>('communityRecommendations/fetchProfile', async ({ profileId }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const accountId = state.auth.account?.id;
    if (!accountId) {
      return rejectWithValue({ message: 'No account found' });
    }
    const response: AxiosResponse<ProfileRecommendationsResponse> = await axiosInstance.get(
      `/accounts/${accountId}/profiles/${profileId}/recommendations`,
    );
    return response.data.recommendations;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
    return rejectWithValue({ message: 'An unknown error occurred fetching profile recommendations' });
  }
});

export const addRecommendation = createAsyncThunk<
  ProfileRecommendation,
  {
    profileId: number;
    contentType: RatingContentType;
    contentId: number;
    rating?: number | null;
    message?: string | null;
  },
  { rejectValue: ApiErrorResponse }
>(
  'communityRecommendations/add',
  async ({ profileId, contentType, contentId, rating, message }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;
      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }
      const response: AxiosResponse<ProfileRecommendationResponse> = await axiosInstance.post(
        `/accounts/${accountId}/profiles/${profileId}/recommendations`,
        { contentType, contentId, rating, message },
      );
      return response.data.recommendation;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred adding recommendation' });
    }
  },
);

export const removeRecommendation = createAsyncThunk<
  { contentType: RatingContentType; contentId: number },
  { profileId: number; contentType: RatingContentType; contentId: number },
  { rejectValue: ApiErrorResponse }
>(
  'communityRecommendations/remove',
  async ({ profileId, contentType, contentId }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;
      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }
      await axiosInstance.delete(`/accounts/${accountId}/profiles/${profileId}/recommendations`, {
        data: { contentType, contentId },
      });
      return { contentType, contentId };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred removing recommendation' });
    }
  },
);

const communityRecommendationsSlice = createSlice({
  name: 'communityRecommendations',
  initialState,
  reducers: {
    setContentTypeFilter(state, action: PayloadAction<RatingContentType | null>) {
      state.contentTypeFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(deleteAccount.fulfilled, () => initialState)

      // Community feed
      .addCase(fetchCommunityRecommendations.pending, (state) => {
        state.communityLoading = true;
        state.communityError = null;
      })
      .addCase(fetchCommunityRecommendations.fulfilled, (state, action) => {
        state.communityLoading = false;
        state.communityRecommendations = action.payload;
        state.communityError = null;
      })
      .addCase(fetchCommunityRecommendations.rejected, (state, action) => {
        state.communityLoading = false;
        state.communityError = action.payload || { message: 'Failed to fetch community recommendations' };
      })

      // Profile recommendations
      .addCase(fetchProfileRecommendations.pending, (state) => {
        state.profileRecsLoading = true;
      })
      .addCase(fetchProfileRecommendations.fulfilled, (state, action) => {
        state.profileRecsLoading = false;
        state.profileRecommendations = action.payload;
      })
      .addCase(fetchProfileRecommendations.rejected, (state) => {
        state.profileRecsLoading = false;
      })

      // Add recommendation
      .addCase(addRecommendation.pending, (state) => {
        state.sendLoading = true;
      })
      .addCase(addRecommendation.fulfilled, (state, action) => {
        state.sendLoading = false;
        state.profileRecommendations.push(action.payload);
      })
      .addCase(addRecommendation.rejected, (state) => {
        state.sendLoading = false;
      })

      // Remove recommendation
      .addCase(removeRecommendation.pending, (state) => {
        state.sendLoading = true;
      })
      .addCase(removeRecommendation.fulfilled, (state, action) => {
        state.sendLoading = false;
        state.profileRecommendations = state.profileRecommendations.filter(
          (r) => !(r.contentType === action.payload.contentType && r.contentId === action.payload.contentId),
        );
      })
      .addCase(removeRecommendation.rejected, (state) => {
        state.sendLoading = false;
      });
  },
});

export const { setContentTypeFilter } = communityRecommendationsSlice.actions;

export const selectCommunityRecommendations = (state: RootState) =>
  state.communityRecommendations.communityRecommendations;
export const selectCommunityLoading = (state: RootState) => state.communityRecommendations.communityLoading;
export const selectContentTypeFilter = (state: RootState) => state.communityRecommendations.contentTypeFilter;
export const selectProfileRecommendations = (state: RootState) =>
  state.communityRecommendations.profileRecommendations;
export const selectSendLoading = (state: RootState) => state.communityRecommendations.sendLoading;

export const selectHasRecommended = (contentType: RatingContentType, contentId: number) =>
  createSelector(selectProfileRecommendations, (recs) =>
    recs.some((r) => r.contentType === contentType && r.contentId === contentId),
  );

export default communityRecommendationsSlice.reducer;
