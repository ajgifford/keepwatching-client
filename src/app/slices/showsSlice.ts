import axiosInstance from '../api/axiosInstance';
import { generateGenreFilterValues, generateStreamingServiceFilterValues } from '../constants/filters';
import { Show } from '../model/shows';
import { WatchStatus } from '../model/watchStatus';
import { RootState } from '../store';
import { logout } from './authSlice';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';

interface ShowsState {
  showsByProfile: { [profileId: number]: Show[] };
  genresByProfile: { [profileId: number]: string[] };
  streamingServicesByProfile: { [profileId: number]: string[] };
  loading: boolean;
  error: string | null;
}

const initialState: ShowsState = {
  showsByProfile: {},
  genresByProfile: {},
  streamingServicesByProfile: {},
  loading: false,
  error: null,
};

export const fetchShowsForProfile = createAsyncThunk(
  'shows/fetchShowsForProfile',
  async (profileId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/profiles/${profileId}/shows`);
      const responseShows: Show[] = response.data.results;
      return { profileId, shows: responseShows };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateShowStatus = createAsyncThunk(
  'shows/updateShowStatus',
  async (
    { profileId, showId, status }: { profileId: number; showId: number; status: WatchStatus },
    { rejectWithValue },
  ) => {
    try {
      await axiosInstance.put(`/api/profiles/${profileId}/shows/watchStatus`, {
        show_id: showId,
        status: status,
      });
      return { profileId, showId, status };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const addShowFavorite = createAsyncThunk(
  'shows/addShowFavorite',
  async ({ profileId, showId }: { profileId: number; showId: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/profiles/${profileId}/shows/favorites`, {
        id: showId,
      });
      const show = response.data.results[0];
      return { profileId, show };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const showsSlice = createSlice({
  name: 'shows',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchShowsForProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShowsForProfile.fulfilled, (state, action) => {
        const { profileId, shows } = action.payload;
        state.showsByProfile[profileId] = shows;
        state.genresByProfile[profileId] = generateGenreFilterValues(shows);
        state.streamingServicesByProfile[profileId] = generateStreamingServiceFilterValues(shows);
        state.loading = false;
      })
      .addCase(fetchShowsForProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load shows';
      })
      .addCase(addShowFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addShowFavorite.fulfilled, (state, action) => {
        const { profileId, show } = action.payload;
        if (state.showsByProfile[profileId]) {
          state.showsByProfile[profileId].push(show);
          const shows = state.showsByProfile[profileId];
          state.genresByProfile[profileId] = generateGenreFilterValues(shows);
          state.streamingServicesByProfile[profileId] = generateStreamingServiceFilterValues(shows);
        }
        state.loading = false;
      })
      .addCase(addShowFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add a favorite';
      })
      .addCase(updateShowStatus.fulfilled, (state, action) => {
        const { profileId, showId, status } = action.payload;
        const profileShows = state.showsByProfile[profileId];
        if (profileShows) {
          const show = profileShows.find((m) => m.show_id === showId);
          if (show) {
            show.watch_status = status;
          }
        }
      })
      .addCase(updateShowStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update show status';
      });
  },
});

export const selectShowsByProfile = (state: RootState) => state.shows.showsByProfile;
export const selectShowGenresByProfile = (state: RootState) => state.shows.genresByProfile;
export const selectShowStreamingServicesByProfile = (state: RootState) => state.shows.streamingServicesByProfile;
export const selectShowsLoading = (state: RootState) => state.shows.loading;
export const selectShowsError = (state: RootState) => state.shows.error;

export function selectShowsByProfileId(state: RootState, profile_id: number): Show[] {
  return state.shows.showsByProfile[profile_id] || [];
}

export const makeSelectShowWatchStatusCountsByProfile = () => {
  const selectWatchedAndNotWatchedCount = createSelector(
    [selectShowsByProfile, (state: RootState, profile_id: number) => profile_id],
    (showsByProfile, profile_id): { watched: number; watching: number; notWatched: number } => {
      const shows = showsByProfile[profile_id] || [];
      const watched = shows.filter((show) => show.watch_status === 'WATCHED').length;
      const notWatched = shows.filter((show) => show.watch_status === 'NOT_WATCHED').length;
      const watching = shows.filter((show) => show.watch_status === 'WATCHING').length;
      return { watched, watching, notWatched };
    },
  );
  return selectWatchedAndNotWatchedCount;
};

export default showsSlice.reducer;
