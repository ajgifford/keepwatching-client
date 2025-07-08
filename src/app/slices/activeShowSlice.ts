import axiosInstance from '../api/axiosInstance';
import { ApiErrorResponse } from '../model/errors';
import { RootState } from '../store';
import { logout } from './accountSlice';
import { updateNextEpisodeWatchStatus, updateShowWatchStatus } from './activeProfileSlice';
import {
  KeepWatchingShow,
  ProfileSeason,
  ProfileShowWithSeasons,
  ShowCast,
  ShowDetailsResponse,
  SimilarOrRecommendedShow,
  SimilarOrRecommendedShowsResponse,
  UpdateWatchStatusResponse,
  UserWatchStatus,
  WatchStatus,
} from '@ajgifford/keepwatching-types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

interface ActiveShowState {
  showDetailsLoading: boolean;
  showWithSeasons: ProfileShowWithSeasons | null;
  showCast: ShowCast;
  watchedEpisodes: Record<number, boolean>;
  showDetailsError: ApiErrorResponse | null;
  recommendedShowsLoading: boolean;
  recommendedShows: SimilarOrRecommendedShow[];
  recommendedShowsError: ApiErrorResponse | null;
  similarShowsLoading: boolean;
  similarShows: SimilarOrRecommendedShow[];
  similarShowsError: ApiErrorResponse | null;
}

const initialState: ActiveShowState = {
  showWithSeasons: null,
  showCast: { activeCast: [], priorCast: [] },
  watchedEpisodes: {},
  similarShows: [],
  recommendedShows: [],
  showDetailsLoading: false,
  similarShowsLoading: false,
  recommendedShowsLoading: false,
  showDetailsError: null,
  similarShowsError: null,
  recommendedShowsError: null,
};

interface WatchStatusUpdate {
  showWithSeasons: ProfileShowWithSeasons;
  nextUnwatchedEpisodes: KeepWatchingShow[];
  watchedEpisodesMap: Record<number, boolean>;
}

export const fetchShowWithDetails = createAsyncThunk<
  { showWithSeasons: ProfileShowWithSeasons; showCast: ShowCast; watchedEpisodesMap: Record<number, boolean> },
  { profileId: number; showId: number },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/fetchShowWithDetails',
  async ({ profileId, showId }: { profileId: number; showId: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<ShowDetailsResponse> = await axiosInstance.get(
        `/accounts/${accountId}/profiles/${profileId}/shows/${showId}/details`
      );

      const showWithSeasons = response.data.showWithSeasons;
      const showCast = response.data.showCast;
      const watchedEpisodesMap: Record<number, boolean> = buildWatchedEpisodesMap(showWithSeasons);

      return { showWithSeasons, showCast, watchedEpisodesMap };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred fetching a show with its details' });
    }
  }
);

export const updateEpisodeWatchStatus = createAsyncThunk<
  WatchStatusUpdate,
  {
    profileId: number;
    episodeId: number;
    episodeStatus: UserWatchStatus;
  },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/updateEpisodeWatchState',
  async (
    { profileId, episodeId, episodeStatus }: { profileId: number; episodeId: number; episodeStatus: UserWatchStatus },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;
      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<UpdateWatchStatusResponse> = await axiosInstance.put(
        `/accounts/${accountId}/profiles/${profileId}/episodes/watchStatus`,
        {
          episodeId: episodeId,
          status: episodeStatus,
        }
      );

      const showWithSeasons = response.data.statusData.showWithSeasons;
      const nextUnwatchedEpisodes = response.data.statusData.nextUnwatchedEpisodes;
      const watchedEpisodesMap: Record<number, boolean> = buildWatchedEpisodesMap(showWithSeasons);

      return { showWithSeasons, nextUnwatchedEpisodes, watchedEpisodesMap };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      console.log('Error in updateEpisodeWatchStatus', error);
      return rejectWithValue({ message: 'An unknown error occurred updating an episode watch status' });
    }
  }
);

export const updateSeasonWatchStatus = createAsyncThunk<
  WatchStatusUpdate,
  {
    profileId: number;
    seasonId: number;
    seasonStatus: UserWatchStatus;
  },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/updateSeasonWatchState',
  async (
    { profileId, seasonId, seasonStatus }: { profileId: number; seasonId: number; seasonStatus: UserWatchStatus },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<UpdateWatchStatusResponse> = await axiosInstance.put(
        `/accounts/${accountId}/profiles/${profileId}/seasons/watchStatus`,
        {
          seasonId,
          status: seasonStatus,
        }
      );

      const showWithSeasons = response.data.statusData.showWithSeasons;
      const nextUnwatchedEpisodes = response.data.statusData.nextUnwatchedEpisodes;
      const watchedEpisodesMap: Record<number, boolean> = buildWatchedEpisodesMap(showWithSeasons);

      return { showWithSeasons, nextUnwatchedEpisodes, watchedEpisodesMap };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      console.log('Error in updateSeasonWatchStatus', error);
      return rejectWithValue({ message: 'An unknown error occurred while updating a season watch status' });
    }
  }
);

export const fetchRecommendedShows = createAsyncThunk<
  SimilarOrRecommendedShow[],
  { profileId: number; showId: number },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/fetchRecommendedShows',
  async ({ profileId, showId }: { profileId: number; showId: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }
      const response: AxiosResponse<SimilarOrRecommendedShowsResponse> = await axiosInstance.get(
        `/accounts/${accountId}/profiles/${profileId}/shows/${showId}/recommendations`
      );
      return response.data.shows;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred fetching recommended shows' });
    }
  }
);

export const fetchSimilarShows = createAsyncThunk<
  SimilarOrRecommendedShow[],
  { profileId: number; showId: number },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/fetchSimilarShows',
  async ({ profileId, showId }: { profileId: number; showId: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response: AxiosResponse<SimilarOrRecommendedShowsResponse> = await axiosInstance.get(
        `/accounts/${accountId}/profiles/${profileId}/shows/${showId}/similar`
      );
      return response.data.shows;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred fetching similar shows' });
    }
  }
);

const activeShowSlice = createSlice({
  name: 'activeShow',
  initialState,
  reducers: {
    clearActiveShow: () => {
      return initialState;
    },
    toggleSeasonWatched: (state, action) => {
      const season = action.payload as ProfileSeason;
      const isFullyWatched = season.episodes.every((episode) => state.watchedEpisodes[episode.id]);

      season.episodes.forEach((episode) => {
        state.watchedEpisodes[episode.id] = !isFullyWatched;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchShowWithDetails.pending, (state) => {
        state.showDetailsLoading = true;
        state.showDetailsError = null;
      })
      .addCase(fetchShowWithDetails.fulfilled, (state, action) => {
        state.showWithSeasons = action.payload.showWithSeasons;
        state.watchedEpisodes = action.payload.watchedEpisodesMap;
        state.showCast = action.payload.showCast;
        state.showDetailsLoading = false;
      })
      .addCase(fetchShowWithDetails.rejected, (state, action) => {
        state.showDetailsLoading = false;
        state.showDetailsError = action.payload || { message: 'Failed to load show details' };
      })
      .addCase(updateEpisodeWatchStatus.pending, (state) => {
        state.showDetailsError = null;
      })
      .addCase(updateEpisodeWatchStatus.fulfilled, (state, action) => {
        state.showWithSeasons = action.payload.showWithSeasons;
        state.watchedEpisodes = action.payload.watchedEpisodesMap;
      })
      .addCase(updateEpisodeWatchStatus.rejected, (state, action) => {
        state.showDetailsError = action.payload || { message: 'Failed to update episode watch status' };
      })
      .addCase(updateSeasonWatchStatus.pending, (state) => {
        state.showDetailsError = null;
      })
      .addCase(updateSeasonWatchStatus.fulfilled, (state, action) => {
        state.showWithSeasons = action.payload.showWithSeasons;
        state.watchedEpisodes = action.payload.watchedEpisodesMap;
      })
      .addCase(updateSeasonWatchStatus.rejected, (state, action) => {
        state.showDetailsError = action.payload || { message: 'Failed to update season watch status' };
      })
      .addCase(updateShowWatchStatus.fulfilled, (state, action) => {
        const { showWithSeasons } = action.payload;
        const show = state.showWithSeasons;
        if (show && show.id === showWithSeasons.id) {
          state.showWithSeasons = showWithSeasons;
        }
        state.watchedEpisodes = buildWatchedEpisodesMap(showWithSeasons);
      })
      .addCase(updateNextEpisodeWatchStatus.fulfilled, (state, action) => {
        const { showWithSeasons } = action.payload;
        const show = state.showWithSeasons;
        if (show && show.id === showWithSeasons.id) {
          state.showWithSeasons = showWithSeasons;
        }
      })
      .addCase(fetchSimilarShows.pending, (state) => {
        state.similarShowsError = null;
        state.similarShowsLoading = true;
      })
      .addCase(fetchSimilarShows.fulfilled, (state, action) => {
        state.similarShowsError = null;
        state.similarShows = action.payload;
        state.similarShowsLoading = false;
      })
      .addCase(fetchSimilarShows.rejected, (state, action) => {
        state.similarShowsError = action.payload || { message: 'Failed to fetch similar shows' };
        state.similarShowsLoading = false;
      })
      .addCase(fetchRecommendedShows.pending, (state) => {
        state.recommendedShowsError = null;
        state.recommendedShowsLoading = true;
      })
      .addCase(fetchRecommendedShows.fulfilled, (state, action) => {
        state.recommendedShowsError = null;
        state.recommendedShows = action.payload;
        state.recommendedShowsLoading = false;
      })
      .addCase(fetchRecommendedShows.rejected, (state, action) => {
        state.recommendedShowsError = action.payload || { message: 'Failed to fetch recommended shows' };
        state.recommendedShowsLoading = false;
      });
  },
});

function buildWatchedEpisodesMap(show: ProfileShowWithSeasons) {
  const watchedEpisodes: Record<number, boolean> = {};
  if (show.seasons) {
    show.seasons.forEach((season) => {
      season.episodes.forEach((episode) => {
        watchedEpisodes[episode.id] = episode.watchStatus === WatchStatus.WATCHED;
      });
    });
  }
  return watchedEpisodes;
}

export const { clearActiveShow, toggleSeasonWatched } = activeShowSlice.actions;

export const selectShow = (state: RootState) => state.activeShow.showWithSeasons;
export const selectSeasons = (state: RootState) => state.activeShow.showWithSeasons?.seasons;
export const selectShowCast = (state: RootState) => state.activeShow.showCast;
export const selectWatchedEpisodes = (state: RootState) => state.activeShow.watchedEpisodes;
export const selectShowLoading = (state: RootState) => state.activeShow.showDetailsLoading;
export const selectShowError = (state: RootState) => state.activeShow.showDetailsError;
export const selectSimilarShows = (state: RootState) => state.activeShow.similarShows;
export const selectSimilarShowsLoading = (state: RootState) => state.activeShow.similarShowsLoading;
export const selectSimilarShowsError = (state: RootState) => state.activeShow.similarShowsError;
export const selectRecommendedShows = (state: RootState) => state.activeShow.recommendedShows;
export const selectRecommendedShowsLoading = (state: RootState) => state.activeShow.recommendedShowsLoading;
export const selectRecommendedShowsError = (state: RootState) => state.activeShow.recommendedShowsError;

export default activeShowSlice.reducer;
