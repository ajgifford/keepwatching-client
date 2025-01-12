import axiosInstance from '../api/axiosInstance';
import { Episode, Season, Show } from '../model/shows';
import { WatchStatus } from '../model/watchStatus';
import { RootState } from '../store';
import { logout } from './authSlice';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface ActiveShowState {
  show: Show | null;
  watchedEpisodes: Record<number, boolean>;
  status: 'none' | 'idle' | 'loading' | 'processing' | 'failed';
  error: string | null;
}

const initialState: ActiveShowState = {
  show: null,
  watchedEpisodes: {},
  status: 'none',
  error: null,
};

export const fetchShowWithDetails = createAsyncThunk(
  'activeShow/fetchShowWithDetails',
  async ({ profileId, showId }: { profileId: string; showId: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`api/profiles/${profileId}/shows/${showId}/details`);
      const results = response.data.results;
      const show: Show = results[0];

      const watchedEpisodes: Record<number, boolean> = {};
      show.seasons!.forEach((season) => {
        season.episodes.forEach((episode) => {
          watchedEpisodes[episode.episode_id] = episode.watch_status === 'WATCHED';
        });
      });

      return { show, watchedEpisodesMap: watchedEpisodes };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
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
      const season_id = season.season_id;
      const seasonStatus: WatchStatus = determineSeasonWatchStatus(season, localWatchedEpisodes);

      const show = state.activeShow.show!;
      const showId = show.show_id;
      const seasons: Season[] = JSON.parse(JSON.stringify(show.seasons));
      const updateSeason = seasons.find((findSeason) => findSeason.season_id === season.season_id)!;
      updateSeason.watch_status = seasonStatus;
      const showStatus: WatchStatus = determineShowWatchStatus(seasons);

      await axiosInstance.put(`/api/profiles/${profileId}/episodes/watchStatus`, {
        episode_id: episode_id,
        status: episodeStatus,
      });
      await axiosInstance.put(`/api/profiles/${profileId}/seasons/watchStatus`, {
        season_id: season_id,
        status: seasonStatus,
        recursive: false,
      });
      await axiosInstance.put(`/api/profiles/${profileId}/shows/watchStatus`, {
        show_id: showId,
        status: showStatus,
        recursive: false,
      });

      return { profileId, episode_id, episodeStatus, season_id, seasonStatus, showId, showStatus };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
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
      await axiosInstance.put(`/api/profiles/${profileId}/seasons/watchStatus`, {
        season_id: season_id,
        status: seasonStatus,
        recursive: true,
      });

      const showId = show.show_id;
      await axiosInstance.put(`/api/profiles/${profileId}/shows/watchStatus`, {
        show_id: showId,
        status: showStatus,
        recursive: false,
      });

      return { profileId, season_id, seasonStatus, showId, showStatus };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
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
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchShowWithDetails.fulfilled, (state, action) => {
        state.show = action.payload.show;
        state.watchedEpisodes = action.payload.watchedEpisodesMap;
        state.status = 'idle';
      })
      .addCase(fetchShowWithDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load show details';
      })
      .addCase(updateEpisodeWatchStatus.pending, (state) => {
        state.status = 'processing';
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
        const season = state.show?.seasons?.find((season) => season.season_id === seasonId)!;
        season.watch_status = seasonStatus;
        const episode = season.episodes.find((episode) => episode.episode_id === episodeId)!;
        episode.watch_status = episodeStatus;
        state.watchedEpisodes[action.payload.episode_id] = episodeStatus === 'WATCHED';
        state.status = 'idle';
      })
      .addCase(updateEpisodeWatchStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update episode watch status';
      })
      .addCase(updateSeasonWatchStatus.pending, (state) => {
        state.status = 'processing';
        state.error = null;
      })
      .addCase(updateSeasonWatchStatus.fulfilled, (state, action) => {
        const seasonId = action.payload.season_id;
        const seasonStatus = action.payload.seasonStatus;
        const showStatus = action.payload.showStatus;

        const show = state.show!;
        show.watch_status = showStatus;
        const season = state.show?.seasons?.find((season) => season.season_id === seasonId)!;
        season.watch_status = seasonStatus;
        season.episodes.forEach((episode) => {
          state.watchedEpisodes[episode.episode_id] = seasonStatus === 'WATCHED';
        });
        state.status = 'idle';
      })
      .addCase(updateSeasonWatchStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update season watch status';
      });
  },
});

export const { clearActiveShow, toggleSeasonWatched } = activeShowSlice.actions;

export const selectShow = (state: RootState) => state.activeShow.show;
export const selectSeasons = (state: RootState) => state.activeShow.show?.seasons;
export const selectWatchedEpisodes = (state: RootState) => state.activeShow.watchedEpisodes;
export const selectShowStatus = (state: RootState) => state.activeShow.status;
export const selectShowError = (state: RootState) => state.activeShow.error;

export default activeShowSlice.reducer;
