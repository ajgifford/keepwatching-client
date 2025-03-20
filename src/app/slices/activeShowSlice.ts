import axiosInstance from '../api/axiosInstance';
import { Episode, Season, Show } from '../model/shows';
import { WatchStatus } from '../model/watchStatus';
import { RootState } from '../store';
import { logout } from './accountSlice';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

interface ActiveShowState {
  show: Show | null;
  watchedEpisodes: Record<number, boolean>;
  loading: boolean;
  error: string | null;
}

const initialState: ActiveShowState = {
  show: null,
  watchedEpisodes: {},
  loading: false,
  error: null,
};

export const fetchShowWithDetails = createAsyncThunk(
  'activeShow/fetchShowWithDetails',
  async ({ profileId, showId }: { profileId: string; showId: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/profiles/${profileId}/shows/${showId}/details`);
      const show: Show = response.data.results;

      const watchedEpisodes: Record<number, boolean> = {};
      show.seasons!.forEach((season) => {
        season.episodes.forEach((episode) => {
          watchedEpisodes[episode.episode_id] = episode.watch_status === 'WATCHED';
        });
      });

      return { show, watchedEpisodesMap: watchedEpisodes };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

const isSeasonFullyWatched = (season: Season, watchedEpisodes: Record<number, boolean>) =>
  season.episodes.every((episode) => watchedEpisodes[episode.episode_id]);

const isSeasonPartiallyWatched = (season: Season, watchedEpisodes: Record<number, boolean>) =>
  season.episodes.some((episode) => watchedEpisodes[episode.episode_id]) &&
  !isSeasonFullyWatched(season, watchedEpisodes);

const determineSeasonWatchStatus = (season: Season, watchEpisodes: Record<number, boolean>): WatchStatus => {
  if (isSeasonPartiallyWatched(season, watchEpisodes)) {
    return 'WATCHING';
  }
  if (isSeasonFullyWatched(season, watchEpisodes)) {
    return 'WATCHED';
  }
  return 'NOT_WATCHED';
};

const determineShowWatchStatus = (seasons: Season[]): WatchStatus => {
  if (seasons.every((season) => season.watch_status === 'WATCHED')) {
    return 'WATCHED';
  }

  if (seasons.every((season) => season.watch_status === 'NOT_WATCHED')) {
    return 'NOT_WATCHED';
  }

  return 'WATCHING';
};

export const updateEpisodeWatchStatus = createAsyncThunk(
  'activeShow/updateEpisodeWatchState',
  async (
    {
      profileId,
      season,
      episode,
      episodeStatus,
    }: { profileId: string | undefined; season: Season; episode: Episode; episodeStatus: WatchStatus },
    { getState, rejectWithValue },
  ) => {
    try {
      const episode_id = episode.episode_id;
      const state = getState() as RootState;
      const localWatchedEpisodes = { ...state.activeShow.watchedEpisodes };
      localWatchedEpisodes[episode_id] = episodeStatus === 'WATCHED';

      const response = await axiosInstance.put(`/profiles/${profileId}/episodes/watchStatus`, {
        episode_id: episode_id,
        status: episodeStatus,
      });
      const result = response.data.result;
      const nextUnwatchedEpisodes = result.nextUnwatchedEpisodes;

      const season_id = season.season_id;
      let seasonStatus = season.watch_status;
      const newSeasonStatus: WatchStatus = determineSeasonWatchStatus(season, localWatchedEpisodes);
      const seasonStatusChanged = seasonStatus !== newSeasonStatus;

      const show = state.activeShow.show!;
      const showId = show.show_id;
      let showStatus = show.watch_status;

      if (seasonStatusChanged) {
        seasonStatus = newSeasonStatus;
        await axiosInstance.put(`/profiles/${profileId}/seasons/watchStatus`, {
          season_id: season_id,
          status: seasonStatus,
          recursive: false,
        });

        const seasons: Season[] = JSON.parse(JSON.stringify(show.seasons));
        const updateSeason = seasons.find((findSeason) => findSeason.season_id === season.season_id)!;
        updateSeason.watch_status = newSeasonStatus;
        const newShowStatus: WatchStatus = determineShowWatchStatus(seasons);
        const showStatusChanged = showStatus !== newShowStatus;

        if (showStatusChanged) {
          showStatus = newShowStatus;
          await axiosInstance.put(`/profiles/${profileId}/shows/watchStatus`, {
            show_id: showId,
            status: showStatus,
            recursive: false,
          });
        }
      }

      return {
        profileId,
        episode_id,
        episodeStatus,
        season_id,
        seasonStatus,
        showId,
        showStatus,
        nextUnwatchedEpisodes,
      };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
);

export const updateSeasonWatchStatus = createAsyncThunk(
  'activeShow/updateSeasonWatchState',
  async (
    { profileId, season, seasonStatus }: { profileId: string | undefined; season: Season; seasonStatus: WatchStatus },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as RootState;
      const show = state.activeShow.show!;
      const seasons: Season[] = JSON.parse(JSON.stringify(show.seasons));
      const updateSeason = seasons.find((findSeason) => findSeason.season_id === season.season_id)!;
      updateSeason.watch_status = seasonStatus;
      const showStatus: WatchStatus = determineShowWatchStatus(seasons);

      const season_id = season.season_id;
      await axiosInstance.put(`/profiles/${profileId}/seasons/watchStatus`, {
        season_id: season_id,
        status: seasonStatus,
        recursive: true,
      });

      const showId = show.show_id;
      await axiosInstance.put(`/profiles/${profileId}/shows/watchStatus`, {
        show_id: showId,
        status: showStatus,
        recursive: false,
      });

      return { profileId, season_id, seasonStatus, showId, showStatus };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
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
        state.error = action.error.message || 'Failed to load show details';
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
        state.error = action.error.message || 'Failed to update episode watch status';
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
        state.error = action.error.message || 'Failed to update season watch status';
      });
  },
});

export const { clearActiveShow, toggleSeasonWatched } = activeShowSlice.actions;

export const selectShow = (state: RootState) => state.activeShow.show;
export const selectSeasons = (state: RootState) => state.activeShow.show?.seasons;
export const selectWatchedEpisodes = (state: RootState) => state.activeShow.watchedEpisodes;
export const selectShowLoading = (state: RootState) => state.activeShow.loading;
export const selectShowError = (state: RootState) => state.activeShow.error;

export default activeShowSlice.reducer;
