import { MilestoneStats, Profile, WatchStatus } from '@ajgifford/keepwatching-types';

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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

import axiosInstance from '../../api/axiosInstance';
import { createMockStore } from '../../testUtils';
import { deleteAccount, logout } from '../accountSlice';
import {
  addMovieFavorite,
  addShowFavorite,
  fetchMilestoneStats,
  reloadActiveProfile,
  reloadProfileEpisodes,
  removeMovieFavorite,
  removeShowFavorite,
  selectActiveProfile,
  selectActiveProfileError,
  selectActiveProfileLoading,
  selectMilestoneStats,
  selectMovieGenres,
  selectMovies,
  selectMovieStreamingServices,
  selectNextUnwatchedEpisodes,
  selectRecentEpisodes,
  selectRecentMovies,
  selectShowGenres,
  selectShows,
  selectShowStreamingServices,
  selectUpcomingEpisodes,
  selectUpcomingMovies,
  setActiveProfile,
  updateMovieWatchStatus,
  updateNextEpisodeWatchStatus,
  updateShowWatchStatus,
} from '../activeProfileSlice';

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('activeProfileSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  const mockProfile: Profile = {
    id: 1,
    accountId: 1,
    name: 'Test Profile',
    avatar: null,
  };

  const mockProfileWithContent = {
    profile: mockProfile,
    shows: [],
    episodes: {
      upcomingEpisodes: [],
      recentEpisodes: [],
      nextUnwatchedEpisodes: [],
    },
    movies: [],
    recentUpcomingMovies: {
      recentMovies: [],
      upcomingMovies: [],
    },
  };

  describe('setActiveProfile', () => {
    it('should set active profile successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { profileWithContent: mockProfileWithContent },
      });

      const store = createMockStore();
      await store.dispatch(setActiveProfile({ accountId: 1, profileId: 1 }));

      const state = store.getState().activeProfile;
      expect(state.loading).toBe(false);
      expect(selectActiveProfile(store.getState())).toEqual(mockProfile);
      expect(state.error).toBeNull();
    });

    it('should save active profile to localStorage', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { profileWithContent: mockProfileWithContent },
      });

      const store = createMockStore();
      await store.dispatch(setActiveProfile({ accountId: 1, profileId: 1 }));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeProfile', expect.any(String));
    });

    it('should handle error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: { message: 'Failed to load profile' } },
      });

      const store = createMockStore();
      await store.dispatch(setActiveProfile({ accountId: 1, profileId: 1 }));

      const state = store.getState().activeProfile;
      expect(state.loading).toBe(false);
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe('reloadActiveProfile', () => {
    it('should reload active profile successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { profileWithContent: mockProfileWithContent },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(reloadActiveProfile());

      expect(selectActiveProfile(store.getState())).toEqual(mockProfile);
    });

    it('should handle error when no account or profile found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(reloadActiveProfile());

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account or active profile found' });
    });
  });

  describe('reloadProfileEpisodes', () => {
    it('should reload profile episodes successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          episodes: {
            upcomingEpisodes: [],
            recentEpisodes: [],
            nextUnwatchedEpisodes: [],
          },
        },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(reloadProfileEpisodes());

      expect(selectUpcomingEpisodes(store.getState())).toEqual([]);
      expect(selectRecentEpisodes(store.getState())).toEqual([]);
      expect(selectNextUnwatchedEpisodes(store.getState())).toEqual([]);
    });

    it('should handle error when no account or profile found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(reloadProfileEpisodes());

      expect(result.meta.requestStatus).toBe('rejected');
    });
  });

  describe('fetchMilestoneStats', () => {
    it('should fetch milestone stats successfully', async () => {
      const mockStats: MilestoneStats = {
        totalEpisodesWatched: 100,
        totalMoviesWatched: 50,
        totalHoursWatched: 200,
        favoriteGenres: ['Drama', 'Action'],
        favoriteStreamingService: 'Netflix',
      };

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { results: mockStats },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchMilestoneStats());

      expect(selectMilestoneStats(store.getState())).toEqual(mockStats);
    });

    it('should handle error when no account or profile found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(fetchMilestoneStats());

      expect(result.meta.requestStatus).toBe('rejected');
    });
  });

  describe('addShowFavorite', () => {
    it('should add show as favorite successfully', async () => {
      const mockShow: any = {
        id: 1,
        tmdbId: 123,
        title: 'Test Show',
        isFavorite: true,
        genres: 'Drama',
        streamingServices: 'Netflix',
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          addedShow: mockShow,
          episodes: {
            upcomingEpisodes: [],
            recentEpisodes: [],
            nextUnwatchedEpisodes: [],
          },
        },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(addShowFavorite({ profileId: 1, showId: 123 }));

      const shows = selectShows(store.getState());
      expect(shows).toHaveLength(1);
      expect(shows[0].isFavorite).toBe(true);
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(addShowFavorite({ profileId: 1, showId: 123 }));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('should handle server error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: 'Show not found' } },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(addShowFavorite({ profileId: 1, showId: 123 }));

      expect(result.meta.requestStatus).toBe('rejected');
    });
  });

  describe('removeShowFavorite', () => {
    it('should remove show from favorites successfully', async () => {
      const mockShowRef: any = {
        id: 1,
        title: 'Test Show',
      };

      mockAxiosInstance.delete.mockResolvedValueOnce({
        data: {
          removedShowReference: mockShowRef,
          episodes: {
            upcomingEpisodes: [],
            recentEpisodes: [],
            nextUnwatchedEpisodes: [],
          },
        },
      });

      const initialShow: any = {
        id: 1,
        tmdbId: 123,
        title: 'Test Show',
        isFavorite: true,
        genres: 'Drama',
        streamingServices: 'Netflix',
      };

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [initialShow],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(removeShowFavorite({ profileId: 1, showId: 1 }));

      const shows = selectShows(store.getState());
      expect(shows).toHaveLength(0);
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(removeShowFavorite({ profileId: 1, showId: 1 }));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });
  });

  describe('updateShowWatchStatus', () => {
    it('should update show watch status successfully', async () => {
      const updatedShow: any = {
        id: 1,
        tmdbId: 123,
        title: 'Test Show',
        watchStatus: WatchStatus.WATCHED,
        genres: 'Drama',
        streamingServices: 'Netflix',
      };

      const mockShowWithSeasons: any = {
        ...updatedShow,
        seasons: [],
      };

      mockAxiosInstance.put.mockResolvedValueOnce({
        data: {
          statusData: {
            show: updatedShow,
            showWithSeasons: mockShowWithSeasons,
            nextUnwatchedEpisodes: [],
          },
        },
      });

      const initialShow: any = {
        id: 1,
        tmdbId: 123,
        title: 'Test Show',
        watchStatus: WatchStatus.WATCHING,
        genres: 'Drama',
        streamingServices: 'Netflix',
      };

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [initialShow],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(updateShowWatchStatus({ profileId: 1, showId: 1, status: WatchStatus.WATCHED }));

      const shows = selectShows(store.getState());
      expect(shows[0].watchStatus).toBe(WatchStatus.WATCHED);
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(updateShowWatchStatus({ profileId: 1, showId: 1, status: WatchStatus.WATCHED }));

      expect(result.meta.requestStatus).toBe('rejected');
    });
  });

  describe('addMovieFavorite', () => {
    it('should add movie as favorite successfully', async () => {
      const mockMovie: any = {
        id: 1,
        tmdbId: 456,
        title: 'Test Movie',
        isFavorite: true,
        genres: 'Action',
        streamingServices: 'Disney+',
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          favoritedMovie: mockMovie,
          recentUpcomingMovies: {
            recentMovies: [],
            upcomingMovies: [],
          },
        },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(addMovieFavorite({ profileId: 1, movieId: 456 }));

      const movies = selectMovies(store.getState());
      expect(movies).toHaveLength(1);
      expect(movies[0].isFavorite).toBe(true);
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(addMovieFavorite({ profileId: 1, movieId: 456 }));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });
  });

  describe('removeMovieFavorite', () => {
    it('should remove movie from favorites successfully', async () => {
      const mockMovieRef: any = {
        id: 1,
        title: 'Test Movie',
      };

      mockAxiosInstance.delete.mockResolvedValueOnce({
        data: {
          removedMovieReference: mockMovieRef,
          recentUpcomingMovies: {
            recentMovies: [],
            upcomingMovies: [],
          },
        },
      });

      const initialMovie: any = {
        id: 1,
        tmdbId: 456,
        title: 'Test Movie',
        isFavorite: true,
        genres: 'Action',
        streamingServices: 'Disney+',
      };

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [initialMovie],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(removeMovieFavorite({ profileId: 1, movieId: 1 }));

      const movies = selectMovies(store.getState());
      expect(movies).toHaveLength(0);
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(removeMovieFavorite({ profileId: 1, movieId: 1 }));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });
  });

  describe('updateMovieWatchStatus', () => {
    it('should update movie watch status successfully', async () => {
      const updatedMovie: any = {
        id: 1,
        tmdbId: 456,
        title: 'Test Movie',
        watchStatus: WatchStatus.WATCHED,
        genres: 'Action',
        streamingServices: 'Disney+',
      };

      mockAxiosInstance.put.mockResolvedValueOnce({
        data: {
          movie: updatedMovie,
        },
      });

      const initialMovie: any = {
        id: 1,
        tmdbId: 456,
        title: 'Test Movie',
        watchStatus: WatchStatus.UNWATCHED,
        genres: 'Action',
        streamingServices: 'Disney+',
      };

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [initialMovie],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(updateMovieWatchStatus({ profileId: 1, movieId: 1, status: WatchStatus.WATCHED }));

      const movies = selectMovies(store.getState());
      expect(movies[0].watchStatus).toBe(WatchStatus.WATCHED);
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(updateMovieWatchStatus({ profileId: 1, movieId: 1, status: WatchStatus.WATCHED }));

      expect(result.meta.requestStatus).toBe('rejected');
    });
  });

  describe('updateNextEpisodeWatchStatus', () => {
    it('should update next episode watch status successfully', async () => {
      const mockShowWithSeasons: any = {
        id: 1,
        tmdbId: 123,
        title: 'Test Show',
        seasons: [],
      };

      mockAxiosInstance.put.mockResolvedValueOnce({
        data: {
          statusData: {
            showWithSeasons: mockShowWithSeasons,
            nextUnwatchedEpisodes: [],
          },
        },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: null,
          loading: false,
          error: null,
        },
      });

      await store.dispatch(updateNextEpisodeWatchStatus({ profileId: 1, showId: 1, status: WatchStatus.WATCHED }));

      const nextUnwatched = selectNextUnwatchedEpisodes(store.getState());
      expect(nextUnwatched).toEqual([]);
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(updateNextEpisodeWatchStatus({ profileId: 1, showId: 1, status: WatchStatus.WATCHED }));

      expect(result.meta.requestStatus).toBe('rejected');
    });
  });

  describe('reducers', () => {
    it('should reset state on logout', () => {
      const store = createMockStore({
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: '2023-01-01',
          loading: false,
          error: null,
        },
      });

      store.dispatch({ type: logout.fulfilled.type });

      expect(selectActiveProfile(store.getState())).toBeNull();
    });

    it('should reset state on deleteAccount', () => {
      const store = createMockStore({
        activeProfile: {
          profile: mockProfile,
          shows: [],
          showGenres: [],
          showStreamingServices: [],
          movies: [],
          movieGenres: [],
          movieStreamingServices: [],
          upcomingEpisodes: [],
          recentEpisodes: [],
          nextUnwatchedEpisodes: [],
          recentMovies: [],
          upcomingMovies: [],
          milestoneStats: null,
          lastUpdated: '2023-01-01',
          loading: false,
          error: null,
        },
      });

      store.dispatch({ type: deleteAccount.fulfilled.type });

      expect(selectActiveProfile(store.getState())).toBeNull();
    });
  });

  describe('selectors', () => {
    const mockState = {
      activeProfile: {
        profile: mockProfile,
        shows: [],
        showGenres: ['Drama', 'Comedy'],
        showStreamingServices: ['Netflix', 'Hulu'],
        movies: [],
        movieGenres: ['Action', 'Thriller'],
        movieStreamingServices: ['Disney+', 'HBO Max'],
        upcomingEpisodes: [],
        recentEpisodes: [],
        nextUnwatchedEpisodes: [],
        recentMovies: [],
        upcomingMovies: [],
        milestoneStats: null,
        lastUpdated: '2023-01-01',
        loading: false,
        error: null,
      },
    };

    it('should select active profile', () => {
      const store = createMockStore(mockState);
      expect(selectActiveProfile(store.getState())).toEqual(mockProfile);
    });

    it('should select shows', () => {
      const store = createMockStore(mockState);
      expect(selectShows(store.getState())).toEqual([]);
    });

    it('should select show genres', () => {
      const store = createMockStore(mockState);
      expect(selectShowGenres(store.getState())).toEqual(['Drama', 'Comedy']);
    });

    it('should select show streaming services', () => {
      const store = createMockStore(mockState);
      expect(selectShowStreamingServices(store.getState())).toEqual(['Netflix', 'Hulu']);
    });

    it('should select movies', () => {
      const store = createMockStore(mockState);
      expect(selectMovies(store.getState())).toEqual([]);
    });

    it('should select movie genres', () => {
      const store = createMockStore(mockState);
      expect(selectMovieGenres(store.getState())).toEqual(['Action', 'Thriller']);
    });

    it('should select movie streaming services', () => {
      const store = createMockStore(mockState);
      expect(selectMovieStreamingServices(store.getState())).toEqual(['Disney+', 'HBO Max']);
    });

    it('should select upcoming episodes', () => {
      const store = createMockStore(mockState);
      expect(selectUpcomingEpisodes(store.getState())).toEqual([]);
    });

    it('should select recent episodes', () => {
      const store = createMockStore(mockState);
      expect(selectRecentEpisodes(store.getState())).toEqual([]);
    });

    it('should select next unwatched episodes', () => {
      const store = createMockStore(mockState);
      expect(selectNextUnwatchedEpisodes(store.getState())).toEqual([]);
    });

    it('should select recent movies', () => {
      const store = createMockStore(mockState);
      expect(selectRecentMovies(store.getState())).toEqual([]);
    });

    it('should select upcoming movies', () => {
      const store = createMockStore(mockState);
      expect(selectUpcomingMovies(store.getState())).toEqual([]);
    });

    it('should select loading state', () => {
      const store = createMockStore(mockState);
      expect(selectActiveProfileLoading(store.getState())).toBe(false);
    });

    it('should select error state', () => {
      const store = createMockStore(mockState);
      expect(selectActiveProfileError(store.getState())).toBeNull();
    });
  });
});
