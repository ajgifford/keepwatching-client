import axiosInstance from '../api/axiosInstance';
import { ApiErrorResponse } from '../model/errors';
import { SearchResult } from '../model/search';
import { Episode, Season, Show } from '../model/shows';
import { ShowWatchStatus } from '../model/watchStatus';
import { RootState } from '../store';
import { logout } from './accountSlice';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

interface ActiveShowState {
  show: Show | null;
  watchedEpisodes: Record<number, boolean>;
  similarShows: SearchResult[];
  recommendedShows: SearchResult[];
  loading: boolean;
  similarShowsLoading: boolean;
  recommendedShowsLoading: boolean;
  error: ApiErrorResponse | null;
  similarShowsError: ApiErrorResponse | null;
  recommendedShowsError: ApiErrorResponse | null;
}

const initialState: ActiveShowState = {
  show: null,
  watchedEpisodes: {},
  similarShows: [],
  recommendedShows: [],
  loading: false,
  similarShowsLoading: false,
  recommendedShowsLoading: false,
  error: null,
  similarShowsError: null,
  recommendedShowsError: null,
};

export const fetchShowWithDetails = createAsyncThunk<
  { show: Show; watchedEpisodesMap: Record<number, boolean> },
  { profileId: string; showId: string },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/fetchShowWithDetails',
  async ({ profileId, showId }: { profileId: string; showId: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response = await axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/shows/${showId}/details`);
      const show: Show = response.data.results;

      const watchedEpisodes: Record<number, boolean> = {};
      if (show.seasons) {
        show.seasons.forEach((season) => {
          season.episodes.forEach((episode) => {
            watchedEpisodes[episode.episode_id] = episode.watch_status === 'WATCHED';
          });
        });

        show.seasons = show.seasons.map((season) => {
          const updatedStatus = determineSeasonWatchStatus(season, watchedEpisodes, show);
          return {
            ...season,
            watch_status: updatedStatus,
          };
        });

        show.watch_status = determineShowWatchStatus(show, show.seasons);
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
  season: Season,
  watchEpisodes: Record<number, boolean>,
  show: Show
): ShowWatchStatus => {
  const now = new Date();
  const isLatestSeason = season.season_number === Math.max(...(show.seasons || []).map((s) => s.season_number));
  const isShowInProduction = show.status === 'Returning Series' || show.status === 'In Production';

  const allAiredEpisodesWatched = season.episodes.every((episode) => {
    if (!episode.air_date || new Date(episode.air_date) > now) {
      return true;
    }
    return watchEpisodes[episode.episode_id];
  });

  const anyAiredEpisodeWatched = season.episodes.some((episode) => {
    if (!episode.air_date || new Date(episode.air_date) > now) {
      return false;
    }
    return watchEpisodes[episode.episode_id];
  });

  const hasFutureEpisodes = season.episodes.some((episode) => episode.air_date && new Date(episode.air_date) > now);

  if (isLatestSeason && isShowInProduction) {
    if (allAiredEpisodesWatched && hasFutureEpisodes) {
      return 'UP_TO_DATE';
    }
    if (allAiredEpisodesWatched && !hasFutureEpisodes) {
      return 'WATCHED';
    }
    if (anyAiredEpisodeWatched) {
      return 'WATCHING';
    }
    return 'NOT_WATCHED';
  } else {
    if (season.episodes.every((episode) => watchEpisodes[episode.episode_id])) {
      return 'WATCHED';
    }
    if (season.episodes.some((episode) => watchEpisodes[episode.episode_id])) {
      return 'WATCHING';
    }
    return 'NOT_WATCHED';
  }
};

const determineShowWatchStatus = (show: Show, seasons: Season[]): ShowWatchStatus => {
  const isInProduction = show.status === 'Returning Series' || show.status === 'In Production';
  const allSeasonsWatchedOrUpToDate = seasons.every(
    (season) => season.watch_status === 'WATCHED' || season.watch_status === 'UP_TO_DATE'
  );
  const anySeasonsWatching = seasons.some((season) => season.watch_status === 'WATCHING');
  const allSeasonsNotWatched = seasons.every((season) => season.watch_status === 'NOT_WATCHED');

  if (allSeasonsWatchedOrUpToDate) {
    return isInProduction ? 'UP_TO_DATE' : 'WATCHED';
  }

  if (anySeasonsWatching) {
    return 'WATCHING';
  }

  if (allSeasonsNotWatched) {
    return 'NOT_WATCHED';
  }

  return 'WATCHING';
};

interface UpdateEpisodeWatchStatusResponse {
  profileId: string | undefined;
  episode_id: number;
  episodeStatus: ShowWatchStatus;
  season_id: number;
  seasonStatus: ShowWatchStatus;
  showId: number;
  showStatus: ShowWatchStatus;
  nextUnwatchedEpisodes?: any; // Replace with actual type if available
}

export const updateEpisodeWatchStatus = createAsyncThunk<
  UpdateEpisodeWatchStatusResponse,
  {
    profileId: string | undefined;
    season: Season;
    episode: Episode;
    episodeStatus: ShowWatchStatus;
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
    }: { profileId: string | undefined; season: Season; episode: Episode; episodeStatus: ShowWatchStatus },
    { getState, rejectWithValue }
  ) => {
    try {
      const episode_id = episode.episode_id;
      const state = getState() as RootState;
      const localWatchedEpisodes = { ...state.activeShow.watchedEpisodes };
      localWatchedEpisodes[episode_id] = episodeStatus === 'WATCHED';

      const accountId = state.auth.account?.id;
      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response = await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/episodes/watchStatus`, {
        episodeId: episode_id,
        status: episodeStatus,
      });
      const result = response.data.result;
      const nextUnwatchedEpisodes = result.nextUnwatchedEpisodes;

      const show = state.activeShow.show!;
      const season_id = season.season_id;

      const newSeasonStatus: ShowWatchStatus = determineSeasonWatchStatus(season, localWatchedEpisodes, show);

      if (season.watch_status !== newSeasonStatus) {
        await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/seasons/watchStatus`, {
          seasonId: season_id,
          status: newSeasonStatus,
          recursive: false,
        });
      }

      const showId = show.show_id;

      const updatedSeasons: Season[] = JSON.parse(JSON.stringify(show.seasons));
      const seasonIndex = updatedSeasons.findIndex((s) => s.season_id === season_id);
      if (seasonIndex >= 0) {
        updatedSeasons[seasonIndex].watch_status = newSeasonStatus;
      }
      const newShowStatus: ShowWatchStatus = determineShowWatchStatus(show, updatedSeasons);

      if (show.watch_status !== newShowStatus) {
        await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/shows/watchStatus`, {
          showId: showId,
          status: newShowStatus,
          recursive: false,
        });
      }

      return {
        profileId,
        episode_id,
        episodeStatus,
        season_id,
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

interface UpdateSeasonWatchStatusResponse {
  profileId: string | undefined;
  season_id: number;
  seasonStatus: ShowWatchStatus;
  showId: number;
  showStatus: ShowWatchStatus;
}

export const updateSeasonWatchStatus = createAsyncThunk<
  UpdateSeasonWatchStatusResponse,
  {
    profileId: string | undefined;
    season: Season;
    seasonStatus: ShowWatchStatus;
  },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/updateSeasonWatchState',
  async (
    {
      profileId,
      season,
      seasonStatus,
    }: { profileId: string | undefined; season: Season; seasonStatus: ShowWatchStatus },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const show = state.activeShow.show!;
      const seasons: Season[] = JSON.parse(JSON.stringify(show.seasons));
      const updateSeason = seasons.find((findSeason) => findSeason.season_id === season.season_id)!;
      updateSeason.watch_status = seasonStatus;
      const showStatus: ShowWatchStatus = determineShowWatchStatus(show, seasons);

      const season_id = season.season_id;
      await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/seasons/watchStatus`, {
        seasonId: season_id,
        status: seasonStatus,
        recursive: true,
      });

      const showId = show.show_id;
      await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/shows/watchStatus`, {
        showId: showId,
        status: showStatus,
        recursive: false,
      });

      return { profileId, season_id, seasonStatus, showId, showStatus };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred while updating a season watch status' });
    }
  }
);

export const fetchRecommendedShows = createAsyncThunk<
  SearchResult[],
  { profileId: string; showId: string },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/fetchRecommendedShows',
  async ({ profileId, showId }: { profileId: string; showId: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }
      const response = await axiosInstance.get(
        `/accounts/${accountId}/profiles/${profileId}/shows/${showId}/recommendations`
      );
      return response.data.results;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || { message: error.message });
      }
      return rejectWithValue({ message: 'An unknown error occurred fetching recommended shows' });
    }
  }
);

export const fetchSimilarShows = createAsyncThunk<
  SearchResult[],
  { profileId: string; showId: string },
  { rejectValue: ApiErrorResponse }
>(
  'activeShow/fetchSimilarShows',
  async ({ profileId, showId }: { profileId: string; showId: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const response = await axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/shows/${showId}/similar`);
      return response.data.results;
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
      const season = action.payload as Season;
      const isFullyWatched = season.episodes.every((episode) => state.watchedEpisodes[episode.episode_id]);

      season.episodes.forEach((episode) => {
        state.watchedEpisodes[episode.episode_id] = !isFullyWatched;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchShowWithDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShowWithDetails.fulfilled, (state, action) => {
        state.show = action.payload.show;
        state.watchedEpisodes = action.payload.watchedEpisodesMap;
        state.loading = false;
      })
      .addCase(fetchShowWithDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to load show details' };
      })
      .addCase(updateEpisodeWatchStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateEpisodeWatchStatus.fulfilled, (state, action) => {
        const seasonId = action.payload.season_id;
        const seasonStatus = action.payload.seasonStatus;
        const episodeId = action.payload.episode_id;
        const episodeStatus = action.payload.episodeStatus;
        const showStatus = action.payload.showStatus;

        const show = state.show!;
        show.watch_status = showStatus;
        const season = state.show?.seasons?.find((season) => season.season_id === seasonId);
        if (season) {
          season.watch_status = seasonStatus;
          const episode = season.episodes.find((episode) => episode.episode_id === episodeId)!;
          episode.watch_status = episodeStatus;
          state.watchedEpisodes[action.payload.episode_id] = episodeStatus === 'WATCHED';
        }
      })
      .addCase(updateEpisodeWatchStatus.rejected, (state, action) => {
        state.error = action.payload || { message: 'Failed to update episode watch status' };
        console.log(action);
      })
      .addCase(updateSeasonWatchStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateSeasonWatchStatus.fulfilled, (state, action) => {
        const seasonId = action.payload.season_id;
        const seasonStatus = action.payload.seasonStatus;
        const showStatus = action.payload.showStatus;

        const show = state.show!;
        show.watch_status = showStatus;
        const season = state.show?.seasons?.find((season) => season.season_id === seasonId);
        if (season) {
          season.watch_status = seasonStatus;
          season.episodes.forEach((episode) => {
            state.watchedEpisodes[episode.episode_id] = seasonStatus === 'WATCHED';
          });
        }
      })
      .addCase(updateSeasonWatchStatus.rejected, (state, action) => {
        state.error = action.payload || { message: 'Failed to update season watch status' };
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
export const selectShowLoading = (state: RootState) => state.activeShow.loading;
export const selectShowError = (state: RootState) => state.activeShow.error;
export const selectSimilarShows = (state: RootState) => state.activeShow.similarShows;
export const selectSimilarShowsLoading = (state: RootState) => state.activeShow.similarShowsLoading;
export const selectSimilarShowsError = (state: RootState) => state.activeShow.similarShowsError;
export const selectRecommendedShows = (state: RootState) => state.activeShow.recommendedShows;
export const selectRecommendedShowsLoading = (state: RootState) => state.activeShow.recommendedShowsLoading;
export const selectRecommendedShowsError = (state: RootState) => state.activeShow.recommendedShowsError;

export default activeShowSlice.reducer;
