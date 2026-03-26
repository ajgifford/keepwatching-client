import axiosInstance from '../../api/axiosInstance';
import { createMockStore } from '../../testUtils';
import {
  clearHistory,
  fetchWatchHistory,
  recordEpisodeRewatch,
  selectWatchHistoryError,
  selectWatchHistoryItems,
  selectWatchHistoryLoading,
  selectWatchHistoryPage,
  selectWatchHistoryPageSize,
  selectWatchHistoryTotalCount,
  startMovieRewatch,
  startSeasonRewatch,
  startShowRewatch,
} from '../watchHistorySlice';
import { WatchHistoryItem, WatchStatus } from '@ajgifford/keepwatching-types';

// Mock axios
jest.mock('../../api/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

const mockHistoryItem: WatchHistoryItem = {
  historyId: 1,
  contentType: 'episode',
  contentId: 101,
  title: 'Pilot',
  parentTitle: 'Test Show',
  seasonNumber: 1,
  episodeNumber: 1,
  posterImage: '/poster.jpg',
  watchedAt: '2024-01-15T20:00:00Z',
  watchNumber: 1,
  isPriorWatch: false,
  runtime: 45,
};

const mockMovieHistoryItem: WatchHistoryItem = {
  historyId: 2,
  contentType: 'movie',
  contentId: 200,
  title: 'Test Movie',
  posterImage: '/movie-poster.jpg',
  watchedAt: '2024-02-10T20:00:00Z',
  watchNumber: 1,
  isPriorWatch: false,
  runtime: 120,
};

const mockShowWithSeasons = {
  id: 10,
  tmdbId: 999,
  title: 'Test Show',
  description: 'A test show',
  releaseDate: '2020-01-01',
  posterImage: '/poster.jpg',
  backdropImage: '/backdrop.jpg',
  userRating: 8.5,
  contentRating: 'TV-MA',
  streamingServices: 'Netflix',
  genres: 'Drama',
  seasonCount: 2,
  episodeCount: 20,
  status: 'Ended',
  type: 'Scripted',
  inProduction: false,
  lastAirDate: '2022-12-01',
  network: 'Netflix',
  profileId: 1,
  watchStatus: WatchStatus.NOT_WATCHED,
  lastEpisode: null,
  nextEpisode: null,
  seasons: [],
};

const mockProfileMovie = {
  id: 200,
  tmdbId: 888,
  title: 'Test Movie',
  description: 'A test movie',
  releaseDate: '2023-06-15',
  posterImage: '/movie-poster.jpg',
  backdropImage: '/movie-backdrop.jpg',
  userRating: 7.5,
  contentRating: 'PG-13',
  streamingServices: 'Netflix',
  genres: 'Action',
  runtime: 120,
  profileId: 1,
  watchStatus: WatchStatus.NOT_WATCHED,
};

const mockUpdateWatchStatusResponse = {
  message: 'Rewatch started',
  statusData: {
    showWithSeasons: mockShowWithSeasons,
    nextUnwatchedEpisodes: [],
  },
};

describe('watchHistorySlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const accountState = {
    auth: {
      account: { id: 1, email: 'test@example.com', name: 'Test User', defaultProfileId: 1 },
      loading: false,
      error: null,
    },
  };

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = createMockStore();
      const state = store.getState().watchHistory;

      expect(state.items).toEqual([]);
      expect(state.totalCount).toBe(0);
      expect(state.page).toBe(1);
      expect(state.pageSize).toBe(20);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('clearHistory', () => {
    it('should reset items, totalCount, and page', () => {
      const store = createMockStore({
        ...accountState,
        watchHistory: {
          items: [mockHistoryItem],
          totalCount: 1,
          page: 3,
          pageSize: 20,
          loading: false,
          error: null,
        },
      });

      store.dispatch(clearHistory());

      const state = store.getState().watchHistory;
      expect(state.items).toEqual([]);
      expect(state.totalCount).toBe(0);
      expect(state.page).toBe(1);
      expect(state.pageSize).toBe(20); // pageSize should not be reset
    });
  });

  describe('fetchWatchHistory', () => {
    it('should set loading true when pending', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { items: [], totalCount: 0, message: 'OK' },
      });

      const store = createMockStore(accountState);
      const promise = store.dispatch(fetchWatchHistory({ profileId: 1 }));

      expect(store.getState().watchHistory.loading).toBe(true);
      await promise;
    });

    it('should populate items on fulfilled', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { items: [mockHistoryItem, mockMovieHistoryItem], totalCount: 2, message: 'OK' },
      });

      const store = createMockStore(accountState);
      await store.dispatch(fetchWatchHistory({ profileId: 1 }));

      const state = store.getState().watchHistory;
      expect(state.items).toHaveLength(2);
      expect(state.items[0]).toEqual(mockHistoryItem);
      expect(state.totalCount).toBe(2);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should use default pagination values', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { items: [], totalCount: 0, message: 'OK' },
      });

      const store = createMockStore(accountState);
      await store.dispatch(fetchWatchHistory({ profileId: 1 }));

      const state = store.getState().watchHistory;
      expect(state.page).toBe(1);
      expect(state.pageSize).toBe(20);
    });

    it('should use provided pagination values', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { items: [], totalCount: 50, message: 'OK' },
      });

      const store = createMockStore(accountState);
      await store.dispatch(fetchWatchHistory({ profileId: 1, page: 3, pageSize: 10 }));

      const state = store.getState().watchHistory;
      expect(state.page).toBe(3);
      expect(state.pageSize).toBe(10);
    });

    it('should call the correct API endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { items: [], totalCount: 0, message: 'OK' },
      });

      const store = createMockStore(accountState);
      await store.dispatch(fetchWatchHistory({ profileId: 5, page: 2, pageSize: 10, contentType: 'episode' }));

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/accounts/1/profiles/5/watchHistory', {
        params: { page: 2, pageSize: 10, contentType: 'episode' },
      });
    });

    it('should set error on rejected', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: { message: 'Not found' } },
      });

      const store = createMockStore(accountState);
      await store.dispatch(fetchWatchHistory({ profileId: 1 }));

      const state = store.getState().watchHistory;
      expect(state.loading).toBe(false);
      expect(state.error).not.toBeNull();
    });

    it('should reject with message when no account', async () => {
      const store = createMockStore(); // no account in state

      await store.dispatch(fetchWatchHistory({ profileId: 1 }));

      const state = store.getState().watchHistory;
      expect(state.error).toEqual({ message: 'No account found' });
    });
  });

  describe('startShowRewatch', () => {
    it('should set loading true when pending', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockUpdateWatchStatusResponse });

      const store = createMockStore(accountState);
      const promise = store.dispatch(startShowRewatch({ profileId: 1, showId: 10 }));

      expect(store.getState().watchHistory.loading).toBe(true);
      await promise;
    });

    it('should clear loading and error on fulfilled', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockUpdateWatchStatusResponse });

      const store = createMockStore(accountState);
      const result = await store.dispatch(startShowRewatch({ profileId: 1, showId: 10 }));

      const state = store.getState().watchHistory;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      // Payload should contain show, showWithSeasons, nextUnwatchedEpisodes
      expect((result as any).payload).toMatchObject({
        showWithSeasons: mockShowWithSeasons,
        nextUnwatchedEpisodes: [],
      });
    });

    it('should call the correct API endpoint', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockUpdateWatchStatusResponse });

      const store = createMockStore(accountState);
      await store.dispatch(startShowRewatch({ profileId: 5, showId: 10 }));

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/accounts/1/profiles/5/shows/10/rewatch');
    });

    it('should set error on rejected', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Server error' } },
      });

      const store = createMockStore(accountState);
      await store.dispatch(startShowRewatch({ profileId: 1, showId: 10 }));

      const state = store.getState().watchHistory;
      expect(state.loading).toBe(false);
      expect(state.error).not.toBeNull();
    });

    it('should reject with message when no account', async () => {
      const store = createMockStore();

      await store.dispatch(startShowRewatch({ profileId: 1, showId: 10 }));

      const state = store.getState().watchHistory;
      expect(state.error).toEqual({ message: 'No account found' });
    });
  });

  describe('startSeasonRewatch', () => {
    it('should call the correct API endpoint', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockUpdateWatchStatusResponse });

      const store = createMockStore(accountState);
      await store.dispatch(startSeasonRewatch({ profileId: 5, seasonId: 20 }));

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/accounts/1/profiles/5/seasons/20/rewatch');
    });

    it('should clear loading and error on fulfilled', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockUpdateWatchStatusResponse });

      const store = createMockStore(accountState);
      await store.dispatch(startSeasonRewatch({ profileId: 1, seasonId: 20 }));

      const state = store.getState().watchHistory;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error on rejected', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Season not found' } },
      });

      const store = createMockStore(accountState);
      await store.dispatch(startSeasonRewatch({ profileId: 1, seasonId: 20 }));

      const state = store.getState().watchHistory;
      expect(state.loading).toBe(false);
      expect(state.error).not.toBeNull();
    });

    it('should reject with message when no account', async () => {
      const store = createMockStore();

      await store.dispatch(startSeasonRewatch({ profileId: 1, seasonId: 20 }));

      const state = store.getState().watchHistory;
      expect(state.error).toEqual({ message: 'No account found' });
    });
  });

  describe('startMovieRewatch', () => {
    it('should call the correct API endpoint', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { message: 'Rewatch started', movie: mockProfileMovie } });

      const store = createMockStore(accountState);
      await store.dispatch(startMovieRewatch({ profileId: 5, movieId: 200 }));

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/accounts/1/profiles/5/movies/200/rewatch');
    });

    it('should return the movie on fulfilled', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { message: 'Rewatch started', movie: mockProfileMovie } });

      const store = createMockStore(accountState);
      const result = await store.dispatch(startMovieRewatch({ profileId: 1, movieId: 200 }));

      expect((result as any).payload).toEqual(mockProfileMovie);
    });

    it('should clear loading and error on fulfilled', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { message: 'Rewatch started', movie: mockProfileMovie } });

      const store = createMockStore(accountState);
      await store.dispatch(startMovieRewatch({ profileId: 1, movieId: 200 }));

      const state = store.getState().watchHistory;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error on rejected', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Movie not found' } },
      });

      const store = createMockStore(accountState);
      await store.dispatch(startMovieRewatch({ profileId: 1, movieId: 200 }));

      const state = store.getState().watchHistory;
      expect(state.loading).toBe(false);
      expect(state.error).not.toBeNull();
    });

    it('should reject with message when no account', async () => {
      const store = createMockStore();

      await store.dispatch(startMovieRewatch({ profileId: 1, movieId: 200 }));

      const state = store.getState().watchHistory;
      expect(state.error).toEqual({ message: 'No account found' });
    });
  });

  describe('recordEpisodeRewatch', () => {
    const mockEpisodeRewatchResponse = {
      message: 'Successfully recorded episode rewatch',
      episodeId: 101,
      watchCount: 2,
      watchedAt: '2026-03-20T12:00:00.000Z',
    };

    it('should set loading true when pending', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockEpisodeRewatchResponse });

      const store = createMockStore(accountState);
      const promise = store.dispatch(recordEpisodeRewatch({ profileId: 1, episodeId: 101 }));

      expect(store.getState().watchHistory.loading).toBe(true);
      await promise;
    });

    it('should return episodeId, watchCount, and watchedAt on fulfilled', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockEpisodeRewatchResponse });

      const store = createMockStore(accountState);
      const result = await store.dispatch(recordEpisodeRewatch({ profileId: 1, episodeId: 101 }));

      expect((result as any).payload).toEqual({
        episodeId: 101,
        watchCount: 2,
        watchedAt: '2026-03-20T12:00:00.000Z',
      });
    });

    it('should clear loading and error on fulfilled', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockEpisodeRewatchResponse });

      const store = createMockStore(accountState);
      await store.dispatch(recordEpisodeRewatch({ profileId: 1, episodeId: 101 }));

      const state = store.getState().watchHistory;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should call the correct API endpoint', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockEpisodeRewatchResponse });

      const store = createMockStore(accountState);
      await store.dispatch(recordEpisodeRewatch({ profileId: 5, episodeId: 101 }));

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/accounts/1/profiles/5/episodes/101/rewatch');
    });

    it('should set error on rejected', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Episode not found' } },
      });

      const store = createMockStore(accountState);
      await store.dispatch(recordEpisodeRewatch({ profileId: 1, episodeId: 101 }));

      const state = store.getState().watchHistory;
      expect(state.loading).toBe(false);
      expect(state.error).not.toBeNull();
    });

    it('should reject with message when no account', async () => {
      const store = createMockStore();

      await store.dispatch(recordEpisodeRewatch({ profileId: 1, episodeId: 101 }));

      const state = store.getState().watchHistory;
      expect(state.error).toEqual({ message: 'No account found' });
    });
  });

  describe('selectors', () => {
    const stateWithData = {
      ...accountState,
      watchHistory: {
        items: [mockHistoryItem, mockMovieHistoryItem],
        totalCount: 42,
        page: 2,
        pageSize: 10,
        loading: true,
        error: { message: 'Something went wrong' },
      },
    };

    it('selectWatchHistoryItems returns items', () => {
      const store = createMockStore(stateWithData);
      expect(selectWatchHistoryItems(store.getState())).toEqual([mockHistoryItem, mockMovieHistoryItem]);
    });

    it('selectWatchHistoryTotalCount returns totalCount', () => {
      const store = createMockStore(stateWithData);
      expect(selectWatchHistoryTotalCount(store.getState())).toBe(42);
    });

    it('selectWatchHistoryPage returns page', () => {
      const store = createMockStore(stateWithData);
      expect(selectWatchHistoryPage(store.getState())).toBe(2);
    });

    it('selectWatchHistoryPageSize returns pageSize', () => {
      const store = createMockStore(stateWithData);
      expect(selectWatchHistoryPageSize(store.getState())).toBe(10);
    });

    it('selectWatchHistoryLoading returns loading', () => {
      const store = createMockStore(stateWithData);
      expect(selectWatchHistoryLoading(store.getState())).toBe(true);
    });

    it('selectWatchHistoryError returns error', () => {
      const store = createMockStore(stateWithData);
      expect(selectWatchHistoryError(store.getState())).toEqual({ message: 'Something went wrong' });
    });
  });
});
