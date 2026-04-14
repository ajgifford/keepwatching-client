import axiosInstance from '../api/axiosInstance';
import { RootState } from '../store';
import { deleteAccount, logout } from './accountSlice';
import { ContentRating, RatingContentType, RatingsResponse, RatingResponse } from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

interface RatingsState {
  ratings: ContentRating[];
  loading: boolean;
  error: ApiErrorResponse | null;
}

const initialState: RatingsState = {
  ratings: [],
  loading: false,
  error: null,
};

export const fetchRatings = createAsyncThunk<ContentRating[], { profileId: number }, { rejectValue: ApiErrorResponse }>(
  'ratings/fetchRatings',
  async ({ profileId }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;
      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }
      const response: AxiosResponse<RatingsResponse> = await axiosInstance.get(
        `/accounts/${accountId}/profiles/${profileId}/ratings`,
      );
      return response.data.ratings;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred fetching ratings' });
    }
  },
);

export const upsertRating = createAsyncThunk<
  ContentRating,
  {
    profileId: number;
    contentType: RatingContentType;
    contentId: number;
    rating: number;
    note?: string | null;
    contentTitle: string;
    posterImage: string;
  },
  { rejectValue: ApiErrorResponse }
>(
  'ratings/upsertRating',
  async ({ profileId, contentType, contentId, rating, note, contentTitle, posterImage }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;
      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }
      const response: AxiosResponse<RatingResponse> = await axiosInstance.post(
        `/accounts/${accountId}/profiles/${profileId}/ratings`,
        { contentType, contentId, rating, note, contentTitle, posterImage },
      );
      return response.data.rating;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred saving rating' });
    }
  },
);

export const deleteRating = createAsyncThunk<
  number,
  { profileId: number; ratingId: number },
  { rejectValue: ApiErrorResponse }
>(
  'ratings/deleteRating',
  async ({ profileId, ratingId }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;
      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }
      await axiosInstance.delete(`/accounts/${accountId}/profiles/${profileId}/ratings/${ratingId}`);
      return ratingId;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred deleting rating' });
    }
  },
);

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(deleteAccount.fulfilled, () => initialState)
      .addCase(fetchRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings = action.payload;
        state.error = null;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.loading = false;
        state.ratings = [];
        state.error = action.payload || { message: 'Failed to fetch ratings' };
      })
      .addCase(upsertRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upsertRating.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const idx = state.ratings.findIndex(
          (r) => r.contentType === action.payload.contentType && r.contentId === action.payload.contentId,
        );
        if (idx >= 0) {
          state.ratings[idx] = action.payload;
        } else {
          state.ratings.push(action.payload);
        }
      })
      .addCase(upsertRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to save rating' };
      })
      .addCase(deleteRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.ratings = state.ratings.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to delete rating' };
      });
  },
});

export const selectRatings = (state: RootState) => state.ratings.ratings;
export const selectRatingsLoading = (state: RootState) => state.ratings.loading;

export const selectRatingForContent = (contentType: RatingContentType, contentId: number) =>
  createSelector(selectRatings, (ratings) =>
    ratings.find((r) => r.contentType === contentType && r.contentId === contentId),
  );

export default ratingsSlice.reducer;
