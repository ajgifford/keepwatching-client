import axiosInstance from '../api/axiosInstance';
import { ApiErrorResponse } from '../model/errors';
import { RootState } from '../store';
import { logout } from './accountSlice';
import {
  BinaryWatchStatusType,
  FullWatchStatusType,
  KeepWatchingShow,
  ProfileEpisode,
  ProfileSeason,
  ProfileShowWithSeasons,
  ShowDetailsResponse,
  SimilarOrRecommendedShow,
  SimilarOrRecommendedShowsResponse,
  UpdateWatchStatusResponse,
  WatchStatus,
} from '@ajgifford/keepwatching-types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

interface ActiveShowState {
  showDetailsLoading: boolean;
  show: ProfileShowWithSeasons | null;
  watchedEpisodes: Record<number, boolean>;
  showDetailsError: ApiErrorResponse | null;
  recommendedShowsLoading: boolean;
  recommendedShows: SimilarOrRecommendedShow[];
  recommendedShowsError: ApiErrorResponse | null;
  similarShowsLoading: boolean;
  similarShows: SimilarOrRecommendedShow[];
  similarShowsError: ApiErrorResponse | null;
}

interface UpdateEpisodeWatchStatusResponse {
  profileId: number;
  episodeId: number;
  episodeStatus: BinaryWatchStatusType;
  seasonId: number;
  seasonStatus: FullWatchStatusType;
  showId: number;
  showStatus: FullWatchStatusType;
  nextUnwatchedEpisodes?: any; // Replace with actual type if available
}

interface UpdateSeasonWatchStatusResponse {
  profileId: number;
  seasonId: number;
  seasonStatus: FullWatchStatusType;
  showId: number;
  showStatus: FullWatchStatusType;
  nextUnwatchedEpisodes: KeepWatchingShow[];
}

const initialState: ActiveShowState = {
  show: null,
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

export const fetchShowWithDetails = createAsyncThunk<
  { show: ProfileShowWithSeasons; watchedEpisodesMap: Record<number, boolean> },
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
      const show = response.data.show;

      const watchedEpisodes: Record<number, boolean> = {};
      if (show.seasons) {
        show.seasons.forEach((season) => {
          season.episodes.forEach((episode) => {
            watchedEpisodes[episode.id] = episode.watchStatus === WatchStatus.WATCHED;
          });
        });

        show.seasons = show.seasons.map((season) => {
          const updatedStatus = determineSeasonWatchStatus(season, watchedEpisodes, show);
          return {
            ...season,
            watch_status: updatedStatus,
          };
        });

        show.watchStatus = determineShowWatchStatus(show, show.seasons);
      }

      return { show, watchedEpisodesMap: watchedEpisodes };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred fetching a show with its details' });
    }
  }
);

const determineSeasonWatchStatus = (
  season: ProfileSeason,
  watchEpisodes: Record<number, boolean>,
  show: ProfileShowWithSeasons
): FullWatchStatusType => {
  const now = new Date();
  const isLatestSeason = season.seasonNumber === Math.max(...(show.seasons || []).map((s) => s.seasonNumber));
  const isShowInProduction = show.status === 'Returning Series' || show.status === 'In Production';

  const allAiredEpisodesWatched = season.episodes.every((episode) => {
    if (!episode.airDate || new Date(episode.airDate) > now) {
      return true;
    }
    return watchEpisodes[episode.id];
  });

  const anyAiredEpisodeWatched = season.episodes.some((episode) => {
    if (!episode.airDate || new Date(episode.airDate) > now) {
      return false;
    }
    return watchEpisodes[episode.id];
  });

  const hasFutureEpisodes = season.episodes.some((episode) => episode.airDate && new Date(episode.airDate) > now);

  if (isLatestSeason && isShowInProduction) {
    if (allAiredEpisodesWatched && hasFutureEpisodes) {
      return WatchStatus.UP_TO_DATE;
    }
    if (allAiredEpisodesWatched && !hasFutureEpisodes) {
      return WatchStatus.WATCHED;
    }
    if (anyAiredEpisodeWatched) {
      return WatchStatus.WATCHING;
    }
    return WatchStatus.NOT_WATCHED;
  } else {
    if (season.episodes.every((episode) => watchEpisodes[episode.id])) {
      return WatchStatus.WATCHED;
    }
    if (season.episodes.some((episode) => watchEpisodes[episode.id])) {
      return WatchStatus.WATCHING;
    }
    return WatchStatus.NOT_WATCHED;
  }
};

const determineShowWatchStatus = (show: ProfileShowWithSeasons, seasons: ProfileSeason[]): FullWatchStatusType => {
  const isInProduction = show.status === 'Returning Series' || show.status === 'In Production';
  const allSeasonsWatchedOrUpToDate = seasons.every(
    (season) => season.watchStatus === WatchStatus.WATCHED || season.watchStatus === WatchStatus.UP_TO_DATE
  );
  const anySeasonsWatching = seasons.some((season) => season.watchStatus === WatchStatus.WATCHING);
  const allSeasonsNotWatched = seasons.every((season) => season.watchStatus === WatchStatus.NOT_WATCHED);

  if (allSeasonsWatchedOrUpToDate) {
    return isInProduction ? WatchStatus.UP_TO_DATE : WatchStatus.WATCHED;
  }

  if (anySeasonsWatching) {
    return WatchStatus.WATCHING;
  }

  if (allSeasonsNotWatched) {
    return WatchStatus.NOT_WATCHED;
  }

  return WatchStatus.WATCHING;
};

export const updateEpisodeWatchStatus = createAsyncThunk<
  UpdateEpisodeWatchStatusResponse,
  {
    profileId: number;
    season: ProfileSeason;
    episode: ProfileEpisode;
    episodeStatus: BinaryWatchStatusType;
  },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/updateEpisodeWatchState',
  async (
    {
      profileId,
      season,
      episode,
      episodeStatus,
    }: { profileId: number; season: ProfileSeason; episode: ProfileEpisode; episodeStatus: BinaryWatchStatusType },
    { getState, rejectWithValue }
  ) => {
    try {
      const episode_id = episode.id;
      const state = getState() as RootState;
      const localWatchedEpisodes = { ...state.activeShow.watchedEpisodes };
      localWatchedEpisodes[episode_id] = episodeStatus === WatchStatus.WATCHED;

      const accountId = state.auth.account?.id;
      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response = await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/episodes/watchStatus`, {
        episodeId: episode_id,
        status: episodeStatus,
      });

      const nextUnwatchedEpisodes = response.data.nextUnwatchedEpisodes;

      const show = state.activeShow.show!;
      const season_id = season.id;

      const newSeasonStatus = determineSeasonWatchStatus(season, localWatchedEpisodes, show);

      if (season.watchStatus !== newSeasonStatus) {
        await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/seasons/watchStatus`, {
          seasonId: season_id,
          status: newSeasonStatus,
          recursive: false,
        });
      }

      const showId = show.id;

      const updatedSeasons: ProfileSeason[] = JSON.parse(JSON.stringify(show.seasons));
      const seasonIndex = updatedSeasons.findIndex((s) => s.id === season_id);
      if (seasonIndex >= 0) {
        updatedSeasons[seasonIndex].watchStatus = newSeasonStatus;
      }
      const newShowStatus = determineShowWatchStatus(show, updatedSeasons);

      if (show.watchStatus !== newShowStatus) {
        await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/shows/watchStatus`, {
          showId: showId,
          status: newShowStatus,
          recursive: false,
        });
      }

      return {
        profileId,
        episodeId: episode_id,
        episodeStatus,
        seasonId: season_id,
        seasonStatus: newSeasonStatus,
        showId,
        showStatus: newShowStatus,
        nextUnwatchedEpisodes,
      };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred updating an episode watch status' });
    }
  }
);

export const updateSeasonWatchStatus = createAsyncThunk<
  UpdateSeasonWatchStatusResponse,
  {
    profileId: number;
    seasonId: number;
    seasonStatus: FullWatchStatusType;
  },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/updateSeasonWatchState',
  async (
    { profileId, seasonId, seasonStatus }: { profileId: number; seasonId: number; seasonStatus: FullWatchStatusType },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const show = state.activeShow.show!;
      const seasons: ProfileSeason[] = JSON.parse(JSON.stringify(show.seasons));
      const updateSeason = seasons.find((findSeason) => findSeason.id === seasonId)!;
      updateSeason.watchStatus = seasonStatus;
      const showStatus = determineShowWatchStatus(show, seasons);

      await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/seasons/watchStatus`, {
        seasonId,
        status: seasonStatus,
        recursive: true,
      });

      const showId = show.id;
      const response: AxiosResponse<UpdateWatchStatusResponse> = await axiosInstance.put(
        `/accounts/${accountId}/profiles/${profileId}/shows/watchStatus`,
        {
          showId: showId,
          status: showStatus,
          recursive: false,
        }
      );

      return {
        profileId,
        seasonId,
        seasonStatus,
        showId,
        showStatus,
        nextUnwatchedEpisodes: response.data.nextUnwatchedEpisodes,
      };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
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
        state.show = action.payload.show;
        state.watchedEpisodes = action.payload.watchedEpisodesMap;
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
        const seasonId = action.payload.seasonId;
        const seasonStatus = action.payload.seasonStatus;
        const episodeId = action.payload.episodeId;
        const episodeStatus = action.payload.episodeStatus;
        const showStatus = action.payload.showStatus;

        const show = state.show!;
        show.watchStatus = showStatus;
        const season = state.show?.seasons?.find((season) => season.id === seasonId);
        if (season) {
          season.watchStatus = seasonStatus;
          const episode = season.episodes.find((episode) => episode.id === episodeId)!;
          episode.watchStatus = episodeStatus;
          state.watchedEpisodes[action.payload.episodeId] = episodeStatus === WatchStatus.WATCHED;
        }
      })
      .addCase(updateEpisodeWatchStatus.rejected, (state, action) => {
        state.showDetailsError = action.payload || { message: 'Failed to update episode watch status' };
      })
      .addCase(updateSeasonWatchStatus.pending, (state) => {
        state.showDetailsError = null;
      })
      .addCase(updateSeasonWatchStatus.fulfilled, (state, action) => {
        const seasonId = action.payload.seasonId;
        const seasonStatus = action.payload.seasonStatus;
        const showStatus = action.payload.showStatus;

        const show = state.show!;
        show.watchStatus = showStatus;
        const season = state.show?.seasons?.find((season) => season.id === seasonId);
        if (season) {
          season.watchStatus = seasonStatus;
          season.episodes.forEach((episode) => {
            state.watchedEpisodes[episode.id] =
              seasonStatus === WatchStatus.WATCHED || seasonStatus === WatchStatus.UP_TO_DATE;
          });
        }
      })
      .addCase(updateSeasonWatchStatus.rejected, (state, action) => {
        state.showDetailsError = action.payload || { message: 'Failed to update season watch status' };
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

export const { clearActiveShow, toggleSeasonWatched } = activeShowSlice.actions;

export const selectShow = (state: RootState) => state.activeShow.show;
export const selectSeasons = (state: RootState) => state.activeShow.show?.seasons;
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
