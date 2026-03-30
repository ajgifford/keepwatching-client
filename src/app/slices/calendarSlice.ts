import axiosInstance from '../api/axiosInstance';
import { RootState } from '../store';
import {
  CalendarContentResponse,
  ContentReference,
  ProfileMovie,
  RecentUpcomingEpisode,
} from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';

// ---------------------------------------------------------------------------
// Local calendar types
// ---------------------------------------------------------------------------

export interface CalendarEpisodeItem {
  type: 'episode';
  date: string;
  data: RecentUpcomingEpisode;
}

export interface CalendarMovieItem {
  type: 'movie';
  date: string;
  data: ProfileMovie;
}

export type CalendarItem = CalendarEpisodeItem | CalendarMovieItem;

export interface CalendarDay {
  date: string;
  items: CalendarItem[];
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CalendarState {
  episodes: RecentUpcomingEpisode[];
  movieRefs: ContentReference[];
  loading: boolean;
  error: ApiErrorResponse | null;
  lastFetched: string | null;
  fetchedStartDate: string | null;
  fetchedEndDate: string | null;
}

const initialState: CalendarState = {
  episodes: [],
  movieRefs: [],
  loading: false,
  error: null,
  lastFetched: null,
  fetchedStartDate: null,
  fetchedEndDate: null,
};

// ---------------------------------------------------------------------------
// Thunk
// ---------------------------------------------------------------------------

const DEFAULT_PAST_DAYS = 30;
const DEFAULT_FUTURE_DAYS = 60;

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function defaultCalendarStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - DEFAULT_PAST_DAYS);
  return toISODate(d);
}

export function defaultCalendarEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() + DEFAULT_FUTURE_DAYS);
  return toISODate(d);
}

interface CalendarFetchResult extends CalendarContentResponse {
  resolvedStartDate: string;
  resolvedEndDate: string;
}

export const fetchCalendarContent = createAsyncThunk<
  CalendarFetchResult,
  { profileId: number; startDate?: string; endDate?: string },
  { rejectValue: ApiErrorResponse }
>(
  'calendar/fetchContent',
  async ({ profileId, startDate, endDate }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const accountId = state.auth.account?.id;

      if (!accountId) {
        return rejectWithValue({ message: 'No account found' });
      }

      const resolvedStartDate = startDate ?? defaultCalendarStart();
      const resolvedEndDate = endDate ?? defaultCalendarEnd();

      const params: Record<string, string> = {
        startDate: resolvedStartDate,
        endDate: resolvedEndDate,
      };

      const response: AxiosResponse<{ message: string; results: CalendarContentResponse }> =
        await axiosInstance.get(`/accounts/${accountId}/profiles/${profileId}/calendar`, { params });

      return { ...response.data.results, resolvedStartDate, resolvedEndDate };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue({ message: 'An unknown error occurred fetching calendar content' });
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    clearCalendar: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendarContent.fulfilled, (state, action) => {
        state.loading = false;
        state.episodes = action.payload.episodes;
        state.movieRefs = action.payload.movies;
        state.lastFetched = new Date().toISOString();
        state.fetchedStartDate = action.payload.resolvedStartDate;
        state.fetchedEndDate = action.payload.resolvedEndDate;
      })
      .addCase(fetchCalendarContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? { message: 'Unknown error' };
      });
  },
});

export const { clearCalendar } = calendarSlice.actions;
export default calendarSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

const selectCalendarEpisodes = (state: RootState) => state.calendar.episodes;
const selectCalendarMovieRefs = (state: RootState) => state.calendar.movieRefs;
const selectAllProfileMovies = (state: RootState) => state.activeProfile.movies;
export const selectCalendarLoading = (state: RootState) => state.calendar.loading;
export const selectCalendarError = (state: RootState) => state.calendar.error;
export const selectCalendarLastFetched = (state: RootState) => state.calendar.lastFetched;
export const selectCalendarFetchedRange = createSelector(
  (state: RootState) => state.calendar.fetchedStartDate,
  (state: RootState) => state.calendar.fetchedEndDate,
  (startDate, endDate) => ({ startDate, endDate }),
);

function groupByDate(items: CalendarItem[]): CalendarDay[] {
  const map = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const existing = map.get(item.date) ?? [];
    map.set(item.date, [...existing, item]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayItems]) => ({ date, items: dayItems }));
}

export const selectCalendarDays = createSelector(
  [selectCalendarEpisodes, selectCalendarMovieRefs, selectAllProfileMovies],
  (episodes, movieRefs, profileMovies): CalendarDay[] => {
    const items: CalendarItem[] = [];

    for (const ep of episodes) {
      if (ep.airDate) {
        items.push({ type: 'episode', date: ep.airDate, data: ep });
      }
    }

    for (const ref of movieRefs) {
      if (ref.releaseDate) {
        const movie = profileMovies?.find((m: ProfileMovie) => m.id === ref.id);
        if (movie) {
          items.push({ type: 'movie', date: ref.releaseDate, data: movie });
        }
      }
    }

    return groupByDate(items);
  },
);
