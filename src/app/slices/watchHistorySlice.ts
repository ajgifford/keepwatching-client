import axiosInstance from '../api/axiosInstance';
import { RootState } from '../store';
import {
  KeepWatchingShow,
  ProfileMovie,
  ProfileShow,
  ProfileShowWithSeasons,
  UpdateWatchStatusResponse,
  WatchHistoryItem,
  WatchHistoryResponse,
} from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

// ---------------------------------------------------------------------------
// Return types (shared with activeProfileSlice extraReducers)
// ---------------------------------------------------------------------------

export interface RewatchShowResult {
  show: ProfileShow;
  showWithSeasons: ProfileShowWithSeasons;
  nextUnwatchedEpisodes: KeepWatchingShow[];
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface WatchHistoryState {
  items: WatchHistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: ApiErrorResponse | null;
  contentType: 'episode' | 'movie' | 'all';
  sortOrder: 'asc' | 'desc';
  dateFrom: string | null;
  dateTo: string | null;
  isPriorWatchOnly: boolean;
  searchQuery: string;
}

const initialState: WatchHistoryState = {
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
  contentType: 'all',
  sortOrder: 'desc',
  dateFrom: null,
  dateTo: null,
  isPriorWatchOnly: false,
  searchQuery: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toProfileShow(show: ProfileShowWithSeasons): ProfileShow {
  const {
    id, tmdbId, title, description, releaseDate, posterImage, backdropImage,
    userRating, contentRating, streamingServices, genres, seasonCount, episodeCount,
    status, type, inProduction, lastAirDate, network, profileId, watchStatus,
    lastEpisode, nextEpisode,
  } = show;
  return {
    id, tmdbId, title, description, releaseDate, posterImage, backdropImage,
    userRating, contentRating, streamingServices, genres, seasonCount, episodeCount,
    status, type, inProduction, lastAirDate, network, profileId, watchStatus,
    lastEpisode, nextEpisode,
  };
}

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchWatchHistory = createAsyncThunk<
  WatchHistoryResponse,
  {
    profileId: number;
    page?: number;
    pageSize?: number;
    contentType?: 'episode' | 'movie' | 'all';
    sortOrder?: 'asc' | 'desc';
    dateFrom?: string | null;
    dateTo?: string | null;
    isPriorWatchOnly?: boolean;
    searchQuery?: string;
  },
  { rejectValue: ApiErrorResponse }
>(
  'watchHistory/fetch',
  async (
    { profileId, page = 1, pageSize = 20, contentType = 'all', sortOrder = 'desc', dateFrom, dateTo, isPriorWatchOnly, searchQuery },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const params: Record<string, string | number | boolean> = { page, pageSize, contentType, sortOrder };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (isPriorWatchOnly) params.isPriorWatchOnly = true;
      if (searchQuery) params.searchQuery = searchQuery;

      const response: AxiosResponse<WatchHistoryResponse & { message: string }> = await axiosInstance.get(
        `/accounts/${accountId}/profiles/${profileId}/watchHistory`,
        { params },
      );

      const { items, totalCount } = response.data;
      return { items, totalCount, page, pageSize };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred fetching watch history' });
    }
  },
);

export const startShowRewatch = createAsyncThunk<
  RewatchShowResult,
  { profileId: number; showId: number },
  { rejectValue: ApiErrorResponse }
>(
  'watchHistory/startShowRewatch',
  async ({ profileId, showId }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<UpdateWatchStatusResponse> = await axiosInstance.post(
        `/accounts/${accountId}/profiles/${profileId}/shows/${showId}/rewatch`
      );

      const showWithSeasons = response.data.statusData.showWithSeasons;
      const show = toProfileShow(showWithSeasons);
      const nextUnwatchedEpisodes = response.data.statusData.nextUnwatchedEpisodes;
      return { show, showWithSeasons, nextUnwatchedEpisodes };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred starting show rewatch' });
    }
  }
);

export const startSeasonRewatch = createAsyncThunk<
  RewatchShowResult,
  { profileId: number; seasonId: number },
  { rejectValue: ApiErrorResponse }
>(
  'watchHistory/startSeasonRewatch',
  async ({ profileId, seasonId }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<UpdateWatchStatusResponse> = await axiosInstance.post(
        `/accounts/${accountId}/profiles/${profileId}/seasons/${seasonId}/rewatch`
      );

      const showWithSeasons = response.data.statusData.showWithSeasons;
      const show = toProfileShow(showWithSeasons);
      const nextUnwatchedEpisodes = response.data.statusData.nextUnwatchedEpisodes;
      return { show, showWithSeasons, nextUnwatchedEpisodes };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred starting season rewatch' });
    }
  }
);

export const startMovieRewatch = createAsyncThunk<
  ProfileMovie,
  { profileId: number; movieId: number },
  { rejectValue: ApiErrorResponse }
>(
  'watchHistory/startMovieRewatch',
  async ({ profileId, movieId }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<{ message: string; movie: ProfileMovie }> = await axiosInstance.post(
        `/accounts/${accountId}/profiles/${profileId}/movies/${movieId}/rewatch`
      );

      return response.data.movie;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred starting movie rewatch' });
    }
  }
);

export const recordEpisodeRewatch = createAsyncThunk<
  { episodeId: number; watchCount: number; watchedAt: string },
  { profileId: number; episodeId: number },
  { rejectValue: ApiErrorResponse }
>(
  'watchHistory/recordEpisodeRewatch',
  async ({ profileId, episodeId }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<{ message: string; episodeId: number; watchCount: number; watchedAt: string }> =
        await axiosInstance.post(`/accounts/${accountId}/profiles/${profileId}/episodes/${episodeId}/rewatch`);

      return { episodeId: response.data.episodeId, watchCount: response.data.watchCount, watchedAt: response.data.watchedAt };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred recording episode rewatch' });
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const watchHistorySlice = createSlice({
  name: 'watchHistory',
  initialState,
  reducers: {
    clearHistory(state) {
      state.items = [];
      state.totalCount = 0;
      state.page = 1;
      state.contentType = 'all';
      state.sortOrder = 'desc';
      state.dateFrom = null;
      state.dateTo = null;
      state.isPriorWatchOnly = false;
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchHistory.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.contentType = action.meta.arg.contentType ?? 'all';
        state.sortOrder = action.meta.arg.sortOrder ?? 'desc';
        state.dateFrom = action.meta.arg.dateFrom ?? null;
        state.dateTo = action.meta.arg.dateTo ?? null;
        state.isPriorWatchOnly = action.meta.arg.isPriorWatchOnly ?? false;
        state.searchQuery = action.meta.arg.searchQuery ?? '';
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchWatchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch watch history' };
      })
      .addCase(startShowRewatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startShowRewatch.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(startShowRewatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to start show rewatch' };
      })
      .addCase(startSeasonRewatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startSeasonRewatch.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(startSeasonRewatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to start season rewatch' };
      })
      .addCase(startMovieRewatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startMovieRewatch.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(startMovieRewatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to start movie rewatch' };
      })
      .addCase(recordEpisodeRewatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordEpisodeRewatch.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(recordEpisodeRewatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to record episode rewatch' };
      });
  },
});

export const { clearHistory } = watchHistorySlice.actions;

export const selectWatchHistoryItems = (state: RootState) => state.watchHistory.items;
export const selectWatchHistoryTotalCount = (state: RootState) => state.watchHistory.totalCount;
export const selectWatchHistoryPage = (state: RootState) => state.watchHistory.page;
export const selectWatchHistoryPageSize = (state: RootState) => state.watchHistory.pageSize;
export const selectWatchHistoryLoading = (state: RootState) => state.watchHistory.loading;
export const selectWatchHistoryError = (state: RootState) => state.watchHistory.error;
export const selectWatchHistoryContentType = (state: RootState) => state.watchHistory.contentType;
export const selectWatchHistorySortOrder = (state: RootState) => state.watchHistory.sortOrder;
export const selectWatchHistoryDateFrom = (state: RootState) => state.watchHistory.dateFrom;
export const selectWatchHistoryDateTo = (state: RootState) => state.watchHistory.dateTo;
export const selectWatchHistoryIsPriorWatchOnly = (state: RootState) => state.watchHistory.isPriorWatchOnly;
export const selectWatchHistorySearchQuery = (state: RootState) => state.watchHistory.searchQuery;

export default watchHistorySlice.reducer;
