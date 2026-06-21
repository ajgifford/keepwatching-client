import axiosInstance from '../api/axiosInstance';
import { RootState } from '../store';
import { deleteAccount, logout } from './accountSlice';
import { selectMovies, selectShows } from './activeProfileSlice';
import {
  ProfileMovie,
  ProfileShow,
  WatchStatus,
  WatchlistContentType,
  WatchlistItem,
  WatchlistResponse,
} from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';
import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface WizardFilters {
  contentType: WatchlistContentType | 'both';
  genres: string[];
  maxRuntime: number | null;
  epicRuntime: boolean;
}

interface WatchlistState {
  items: WatchlistItem[];
  loading: boolean;
  error: ApiErrorResponse | null;
  wizardOpen: boolean;
  wizardStep: number;
  wizardFilters: WizardFilters;
  wizardResult: WatchlistItem[] | null;
}

const initialState: WatchlistState = {
  items: [],
  loading: false,
  error: null,
  wizardOpen: false,
  wizardStep: 0,
  wizardFilters: {
    contentType: 'both',
    genres: [],
    maxRuntime: null,
    epicRuntime: false,
  },
  wizardResult: null,
};

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

export const fetchWatchlist = createAsyncThunk<
  WatchlistItem[],
  number,
  { state: RootState; rejectValue: ApiErrorResponse }
>('watchlist/fetchWatchlist', async (profileId, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const accountId = state.auth.account?.id;
    if (!accountId) return rejectWithValue({ message: 'No account found' });
    const response: AxiosResponse<WatchlistResponse> = await axiosInstance.get(
      `/accounts/${accountId}/profiles/${profileId}/watchlist`
    );
    return response.data.watchlist;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(axiosError.response?.data ?? { message: 'Failed to fetch watchlist' });
  }
});

export const addToWatchlist = createAsyncThunk<
  WatchlistItem,
  { profileId: number; contentType: WatchlistContentType; contentId: number },
  { state: RootState; rejectValue: ApiErrorResponse }
>('watchlist/addItem', async ({ profileId, contentType, contentId }, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const accountId = state.auth.account?.id;
    if (!accountId) return rejectWithValue({ message: 'No account found' });
    const response: AxiosResponse<{ message: string; item: WatchlistItem }> = await axiosInstance.post(
      `/accounts/${accountId}/profiles/${profileId}/watchlist`,
      { contentType, contentId }
    );
    return response.data.item;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(axiosError.response?.data ?? { message: 'Failed to add to watchlist' });
  }
});

export const removeFromWatchlist = createAsyncThunk<
  number,
  { profileId: number; itemId: number },
  { state: RootState; rejectValue: ApiErrorResponse }
>('watchlist/removeItem', async ({ profileId, itemId }, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const accountId = state.auth.account?.id;
    if (!accountId) return rejectWithValue({ message: 'No account found' });
    await axiosInstance.delete(`/accounts/${accountId}/profiles/${profileId}/watchlist/${itemId}`);
    return itemId;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(axiosError.response?.data ?? { message: 'Failed to remove from watchlist' });
  }
});

export const updateWatchlistPriorities = createAsyncThunk<
  Array<{ id: number; priority: number }>,
  { profileId: number; priorities: Array<{ id: number; priority: number }> },
  { state: RootState; rejectValue: ApiErrorResponse }
>('watchlist/updatePriorities', async ({ profileId, priorities }, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const accountId = state.auth.account?.id;
    if (!accountId) return rejectWithValue({ message: 'No account found' });
    await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}/watchlist/priorities`, { priorities });
    return priorities;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return rejectWithValue(axiosError.response?.data ?? { message: 'Failed to update watchlist priorities' });
  }
});

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    openWizard(state) {
      state.wizardOpen = true;
      state.wizardStep = 0;
      state.wizardFilters = { contentType: 'both', genres: [], maxRuntime: null, epicRuntime: false };
      state.wizardResult = null;
    },
    closeWizard(state) {
      state.wizardOpen = false;
    },
    setWizardStep(state, action: PayloadAction<number>) {
      state.wizardStep = action.payload;
    },
    setWizardFilters(state, action: PayloadAction<Partial<WizardFilters>>) {
      state.wizardFilters = { ...state.wizardFilters, ...action.payload };
    },
    setWizardResult(state, action: PayloadAction<WatchlistItem[] | null>) {
      state.wizardResult = action.payload;
    },
    clearWizard(state) {
      state.wizardOpen = false;
      state.wizardStep = 0;
      state.wizardFilters = { contentType: 'both', genres: [], maxRuntime: null, epicRuntime: false };
      state.wizardResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [...action.payload].sort((a, b) => a.priority - b.priority);
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? { message: 'Failed to fetch watchlist' };
      })
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.items = [...state.items, action.payload].sort((a, b) => a.priority - b.priority);
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(updateWatchlistPriorities.fulfilled, (state, action) => {
        const map = new Map(action.payload.map(({ id, priority }) => [id, priority]));
        state.items = state.items
          .map((item) => (map.has(item.id) ? { ...item, priority: map.get(item.id)! } : item))
          .sort((a, b) => a.priority - b.priority);
      })
      .addCase(logout.fulfilled, () => initialState)
      .addCase(deleteAccount.fulfilled, () => initialState);
  },
});

export const { openWizard, closeWizard, setWizardStep, setWizardFilters, setWizardResult, clearWizard } =
  watchlistSlice.actions;

export default watchlistSlice.reducer;

// ---------------------------------------------------------------------------
// Helpers for selectNotWatchedPool
// ---------------------------------------------------------------------------

function toWatchlistItemFromShow(show: ProfileShow): WatchlistItem {
  return {
    id: -show.id,
    profileId: show.profileId,
    contentType: 'show',
    contentId: show.id,
    priority: 0,
    addedAt: '',
    title: show.title,
    posterImage: show.posterImage,
    genres: show.genres,
    streamingServices: show.streamingServices,
    runtime: show.averageEpisodeRuntime ?? null,
    hasNewSeason: show.watchStatus === WatchStatus.UP_TO_DATE && show.nextEpisode !== null,
  };
}

function toWatchlistItemFromMovie(movie: ProfileMovie): WatchlistItem {
  return {
    id: -(movie.id + 1_000_000),
    profileId: movie.profileId,
    contentType: 'movie',
    contentId: movie.id,
    priority: 0,
    addedAt: '',
    title: movie.title,
    posterImage: movie.posterImage,
    genres: movie.genres,
    streamingServices: movie.streamingServices,
    runtime: movie.runtime ?? null,
    hasNewSeason: false,
  };
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectWatchlistItems = (state: RootState) => state.watchlist.items;
export const selectWatchlistLoading = (state: RootState) => state.watchlist.loading;
export const selectWatchlistError = (state: RootState) => state.watchlist.error;
export const selectWizardOpen = (state: RootState) => state.watchlist.wizardOpen;
export const selectWizardStep = (state: RootState) => state.watchlist.wizardStep;
export const selectWizardFilters = (state: RootState) => state.watchlist.wizardFilters;
export const selectWizardResult = (state: RootState) => state.watchlist.wizardResult;

export const selectWatchlistShows = createSelector([selectWatchlistItems], (items) =>
  items.filter((i) => i.contentType === 'show')
);

export const selectWatchlistMovies = createSelector([selectWatchlistItems], (items) =>
  items.filter((i) => i.contentType === 'movie')
);

export const selectNotWatchedPool = createSelector([selectShows, selectMovies], (shows, movies) => {
  const poolShows: WatchlistItem[] = (shows ?? [])
    .filter(
      (s: ProfileShow) =>
        s.watchStatus === WatchStatus.NOT_WATCHED ||
        (s.watchStatus === WatchStatus.UP_TO_DATE && s.nextEpisode !== null)
    )
    .map(toWatchlistItemFromShow);

  const poolMovies: WatchlistItem[] = (movies ?? [])
    .filter((m: ProfileMovie) => m.watchStatus === WatchStatus.NOT_WATCHED)
    .map(toWatchlistItemFromMovie);

  return [...poolShows, ...poolMovies];
});

export const selectFilteredNotWatchedPool = createSelector(
  [selectNotWatchedPool, selectWatchlistItems],
  (pool, watchlistItems) =>
    pool
      .filter((p) => !watchlistItems.some((w) => w.contentType === p.contentType && w.contentId === p.contentId))
      .sort((a, b) => a.title.localeCompare(b.title))
);
