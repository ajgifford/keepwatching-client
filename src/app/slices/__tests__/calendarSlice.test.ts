import axiosInstance from '../../api/axiosInstance';
import { createMockStore } from '../../testUtils';
import { logout } from '../accountSlice';
import {
  fetchCalendarContent,
  selectCalendarDays,
  selectCalendarError,
  selectCalendarFetchedRange,
  selectCalendarLastFetched,
  selectCalendarLoading,
} from '../calendarSlice';
import { ContentReference, RecentUpcomingEpisode } from '@ajgifford/keepwatching-types';
import { ApiErrorResponse } from '@ajgifford/keepwatching-ui';
import { AxiosError } from 'axios';

jest.mock('../../api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

const mockEpisode: RecentUpcomingEpisode = {
  profileId: 5,
  showId: 10,
  showName: 'Breaking Bad',
  streamingServices: 'Netflix',
  network: 'AMC',
  episodeTitle: "...and the Bag's in the River",
  airDate: '2026-07-10',
  runtime: 47,
  episodeNumber: 3,
  seasonNumber: 1,
  episodeStillImage: 'https://image.tmdb.org/t/p/w500/episode3-still.jpg',
};

const mockMovieRef: ContentReference = {
  id: 1,
  tmdbId: 27205,
  title: 'Inception',
  releaseDate: '2026-07-20',
};

describe('calendarSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const preloadedAccount = { auth: { account: { id: 1 }, error: null, status: 'idle' } } as any;

  describe('fetchCalendarContent', () => {
    it('sets loading and clears error while pending', () => {
      const store = createMockStore(preloadedAccount);
      store.dispatch({ type: fetchCalendarContent.pending.type });

      const state = store.getState().calendar;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('stores episodes, movies, and the resolved fetched range on success', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { results: { episodes: [mockEpisode], movies: [mockMovieRef] } },
      });

      const store = createMockStore(preloadedAccount);
      await store.dispatch(fetchCalendarContent({ profileId: 5, startDate: '2026-07-09', endDate: '2026-08-08' }));

      const state = store.getState().calendar;
      expect(state.loading).toBe(false);
      expect(state.episodes).toEqual([mockEpisode]);
      expect(state.movieRefs).toEqual([mockMovieRef]);
      expect(state.fetchedStartDate).toBe('2026-07-09');
      expect(state.fetchedEndDate).toBe('2026-08-08');
      expect(state.lastFetched).not.toBeNull();
    });

    it('sets an error when the request fails', async () => {
      const mockError: ApiErrorResponse = { message: 'Failed to fetch calendar content' };
      const axiosError = new AxiosError('Request failed');
      axiosError.response = { data: mockError } as AxiosError['response'];
      mockAxiosInstance.get.mockRejectedValueOnce(axiosError);

      const store = createMockStore(preloadedAccount);
      await store.dispatch(fetchCalendarContent({ profileId: 5 }));

      const state = store.getState().calendar;
      expect(state.loading).toBe(false);
      expect(state.error).toEqual(mockError);
    });
  });

  describe('logout', () => {
    it('clears the persisted date range and resets calendar state', async () => {
      localStorage.setItem('calendarDateRange', JSON.stringify({ preset: 'custom' }));

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { results: { episodes: [mockEpisode], movies: [mockMovieRef] } },
      });
      const store = createMockStore(preloadedAccount);
      await store.dispatch(fetchCalendarContent({ profileId: 5 }));
      expect(store.getState().calendar.episodes).toEqual([mockEpisode]);

      store.dispatch({ type: logout.fulfilled.type });

      expect(localStorage.getItem('calendarDateRange')).toBeNull();
      const state = store.getState().calendar;
      expect(state.episodes).toEqual([]);
      expect(state.movieRefs).toEqual([]);
      expect(state.lastFetched).toBeNull();
      expect(state.fetchedStartDate).toBeNull();
      expect(state.fetchedEndDate).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selects loading, error, and lastFetched', () => {
      const store = createMockStore({
        ...preloadedAccount,
        calendar: {
          episodes: [],
          movieRefs: [],
          loading: true,
          error: { message: 'oops' },
          lastFetched: '2026-07-08T00:00:00.000Z',
          fetchedStartDate: '2026-07-01',
          fetchedEndDate: '2026-07-31',
        },
      });

      const state = store.getState();
      expect(selectCalendarLoading(state)).toBe(true);
      expect(selectCalendarError(state)).toEqual({ message: 'oops' });
      expect(selectCalendarLastFetched(state)).toBe('2026-07-08T00:00:00.000Z');
      expect(selectCalendarFetchedRange(state)).toEqual({ startDate: '2026-07-01', endDate: '2026-07-31' });
    });

    it('groups episodes and matched movies into days, sorted by date', () => {
      const store = createMockStore({
        ...preloadedAccount,
        calendar: {
          episodes: [mockEpisode],
          movieRefs: [mockMovieRef],
          loading: false,
          error: null,
          lastFetched: null,
          fetchedStartDate: null,
          fetchedEndDate: null,
        },
        activeProfile: {
          profile: null,
          shows: [],
          episodes: { upcomingEpisodes: [], recentEpisodes: [], nextUnwatchedEpisodes: [] },
          movies: [{ ...mockMovieRef, profileId: 5, watchStatus: 'NOT_WATCHED' }],
          loading: false,
          error: null,
        } as any,
      });

      const days = selectCalendarDays(store.getState());
      expect(days.map((d) => d.date)).toEqual(['2026-07-10', '2026-07-20']);
      expect(days[0].items[0]).toMatchObject({ type: 'episode', date: '2026-07-10' });
      expect(days[1].items[0]).toMatchObject({ type: 'movie', date: '2026-07-20' });
    });
  });
});
