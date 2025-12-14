import axiosInstance from '../../api/axiosInstance';
import { createMockStore } from '../../testUtils';
import { deleteAccount, logout } from '../accountSlice';
import { updateNextEpisodeWatchStatus, updateShowWatchStatus } from '../activeProfileSlice';
import {
  clearActiveShow,
  fetchRecommendedShows,
  fetchShowWithDetails,
  fetchSimilarShows,
  selectRecommendedShows,
  selectRecommendedShowsError,
  selectRecommendedShowsLoading,
  selectSeasons,
  selectShow,
  selectShowCast,
  selectShowError,
  selectShowLoading,
  selectSimilarShows,
  selectSimilarShowsError,
  selectSimilarShowsLoading,
  selectWatchedEpisodes,
  toggleSeasonWatched,
  updateEpisodeWatchStatus,
  updateSeasonWatchStatus,
} from '../activeShowSlice';
import {
  ProfileEpisode,
  ProfileSeason,
  ProfileShowWithSeasons,
  ShowCast,
  SimilarOrRecommendedShow,
  WatchStatus,
} from '@ajgifford/keepwatching-types';

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

describe('activeShowSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockEpisode: ProfileEpisode = {
    id: 1,
    seasonNumber: 1,
    episodeNumber: 1,
    name: 'Pilot',
    airDate: '2020-01-01',
    overview: 'First episode',
    stillPath: 'still.jpg',
    watchStatus: WatchStatus.UNWATCHED,
  };

  const mockSeason: ProfileSeason = {
    id: 1,
    seasonNumber: 1,
    name: 'Season 1',
    overview: 'First season',
    airDate: '2020-01-01',
    posterPath: 'poster.jpg',
    episodes: [mockEpisode, { ...mockEpisode, id: 2, episodeNumber: 2 }],
  };

  const mockShow: ProfileShowWithSeasons = {
    id: 1,
    tmdbId: 123,
    name: 'Test Show',
    overview: 'A test show',
    firstAirDate: '2020-01-01',
    posterPath: 'poster.jpg',
    backdropPath: 'backdrop.jpg',
    voteAverage: 8.5,
    isFavorite: false,
    watchStatus: WatchStatus.WATCHING,
    genres: [{ id: 1, name: 'Drama' }],
    streamingServices: [],
    seasons: [mockSeason],
  };

  const mockShowCast: ShowCast = {
    activeCast: [
      {
        id: 1,
        name: 'Actor One',
        character: 'Character One',
        profilePath: 'actor1.jpg',
        order: 0,
        seasons: [1],
      },
    ],
    priorCast: [],
  };

  const mockSimilarShows: SimilarOrRecommendedShow[] = [
    {
      id: 2,
      tmdbId: 456,
      name: 'Similar Show',
      posterPath: 'similar.jpg',
      voteAverage: 8.0,
      firstAirDate: '2021-01-01',
    },
  ];

  const mockRecommendedShows: SimilarOrRecommendedShow[] = [
    {
      id: 3,
      tmdbId: 789,
      name: 'Recommended Show',
      posterPath: 'recommended.jpg',
      voteAverage: 8.2,
      firstAirDate: '2021-06-01',
    },
  ];

  describe('fetchShowWithDetails', () => {
    it('should fetch show with details successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          showWithSeasons: mockShow,
          showCast: mockShowCast,
        },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchShowWithDetails({ profileId: 1, showId: 1 }));

      const state = store.getState().activeShow;
      expect(state.showDetailsLoading).toBe(false);
      expect(selectShow(store.getState())).toEqual(mockShow);
      expect(selectShowCast(store.getState())).toEqual(mockShowCast);
      expect(selectWatchedEpisodes(store.getState())).toEqual({ 1: false, 2: false });
      expect(state.showDetailsError).toBeNull();
    });

    it('should build watched episodes map correctly', async () => {
      const watchedShow = {
        ...mockShow,
        seasons: [
          {
            ...mockSeason,
            episodes: [
              { ...mockEpisode, id: 1, watchStatus: WatchStatus.WATCHED },
              { ...mockEpisode, id: 2, watchStatus: WatchStatus.UNWATCHED },
            ],
          },
        ],
      };

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          showWithSeasons: watchedShow,
          showCast: mockShowCast,
        },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchShowWithDetails({ profileId: 1, showId: 1 }));

      expect(selectWatchedEpisodes(store.getState())).toEqual({ 1: true, 2: false });
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(fetchShowWithDetails({ profileId: 1, showId: 1 }));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('should handle fetch error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: { message: 'Failed to fetch show' } },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchShowWithDetails({ profileId: 1, showId: 1 }));

      const state = store.getState().activeShow;
      expect(state.showDetailsLoading).toBe(false);
      expect(state.showDetailsError?.message).toBeTruthy();
    });
  });

  describe('updateEpisodeWatchStatus', () => {
    it('should update episode watch status successfully', async () => {
      mockAxiosInstance.put.mockResolvedValueOnce({
        data: {
          statusData: {
            showWithSeasons: mockShow,
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
      });

      await store.dispatch(
        updateEpisodeWatchStatus({ profileId: 1, episodeId: 1, episodeStatus: WatchStatus.WATCHED })
      );

      const state = store.getState().activeShow;
      expect(selectShow(store.getState())).toEqual(mockShow);
      expect(state.showDetailsError).toBeNull();
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(
        updateEpisodeWatchStatus({ profileId: 1, episodeId: 1, episodeStatus: WatchStatus.WATCHED })
      );

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('should handle update error', async () => {
      mockAxiosInstance.put.mockRejectedValueOnce({
        response: { data: { message: 'Failed to update' } },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(
        updateEpisodeWatchStatus({ profileId: 1, episodeId: 1, episodeStatus: WatchStatus.WATCHED })
      );

      const state = store.getState().activeShow;
      expect(state.showDetailsError?.message).toBeTruthy();
    });
  });

  describe('updateSeasonWatchStatus', () => {
    it('should update season watch status successfully', async () => {
      mockAxiosInstance.put.mockResolvedValueOnce({
        data: {
          statusData: {
            showWithSeasons: mockShow,
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
      });

      await store.dispatch(updateSeasonWatchStatus({ profileId: 1, seasonId: 1, seasonStatus: WatchStatus.WATCHED }));

      const state = store.getState().activeShow;
      expect(selectShow(store.getState())).toEqual(mockShow);
      expect(state.showDetailsError).toBeNull();
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(
        updateSeasonWatchStatus({ profileId: 1, seasonId: 1, seasonStatus: WatchStatus.WATCHED })
      );

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('should handle update error', async () => {
      mockAxiosInstance.put.mockRejectedValueOnce({
        response: { data: { message: 'Failed to update season' } },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(updateSeasonWatchStatus({ profileId: 1, seasonId: 1, seasonStatus: WatchStatus.WATCHED }));

      const state = store.getState().activeShow;
      expect(state.showDetailsError?.message).toBeTruthy();
    });
  });

  describe('fetchSimilarShows', () => {
    it('should fetch similar shows successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { shows: mockSimilarShows },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchSimilarShows({ profileId: 1, showId: 1 }));

      const state = store.getState().activeShow;
      expect(state.similarShowsLoading).toBe(false);
      expect(selectSimilarShows(store.getState())).toEqual(mockSimilarShows);
      expect(state.similarShowsError).toBeNull();
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(fetchSimilarShows({ profileId: 1, showId: 1 }));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('should handle fetch error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: { message: 'Failed to fetch' } },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchSimilarShows({ profileId: 1, showId: 1 }));

      const state = store.getState().activeShow;
      expect(state.similarShowsLoading).toBe(false);
      expect(state.similarShowsError?.message).toBeTruthy();
    });
  });

  describe('fetchRecommendedShows', () => {
    it('should fetch recommended shows successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { shows: mockRecommendedShows },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchRecommendedShows({ profileId: 1, showId: 1 }));

      const state = store.getState().activeShow;
      expect(state.recommendedShowsLoading).toBe(false);
      expect(selectRecommendedShows(store.getState())).toEqual(mockRecommendedShows);
      expect(state.recommendedShowsError).toBeNull();
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(fetchRecommendedShows({ profileId: 1, showId: 1 }));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('should handle fetch error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: { message: 'Failed to fetch' } },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchRecommendedShows({ profileId: 1, showId: 1 }));

      const state = store.getState().activeShow;
      expect(state.recommendedShowsLoading).toBe(false);
      expect(state.recommendedShowsError?.message).toBeTruthy();
    });
  });

  describe('reducers', () => {
    it('should clear active show', () => {
      const store = createMockStore({
        activeShow: {
          showWithSeasons: mockShow,
          showCast: mockShowCast,
          watchedEpisodes: { 1: true },
          similarShows: mockSimilarShows,
          recommendedShows: mockRecommendedShows,
          showDetailsLoading: false,
          similarShowsLoading: false,
          recommendedShowsLoading: false,
          showDetailsError: null,
          similarShowsError: null,
          recommendedShowsError: null,
        },
      });

      store.dispatch(clearActiveShow());

      const state = store.getState().activeShow;
      expect(selectShow(store.getState())).toBeNull();
      expect(selectShowCast(store.getState())).toEqual({ activeCast: [], priorCast: [] });
      expect(selectWatchedEpisodes(store.getState())).toEqual({});
    });

    it('should toggle season watched when all episodes are unwatched', () => {
      const store = createMockStore({
        activeShow: {
          showWithSeasons: mockShow,
          showCast: mockShowCast,
          watchedEpisodes: { 1: false, 2: false },
          similarShows: [],
          recommendedShows: [],
          showDetailsLoading: false,
          similarShowsLoading: false,
          recommendedShowsLoading: false,
          showDetailsError: null,
          similarShowsError: null,
          recommendedShowsError: null,
        },
      });

      store.dispatch(toggleSeasonWatched(mockSeason));

      const watchedEpisodes = selectWatchedEpisodes(store.getState());
      expect(watchedEpisodes[1]).toBe(true);
      expect(watchedEpisodes[2]).toBe(true);
    });

    it('should toggle season unwatched when all episodes are watched', () => {
      const store = createMockStore({
        activeShow: {
          showWithSeasons: mockShow,
          showCast: mockShowCast,
          watchedEpisodes: { 1: true, 2: true },
          similarShows: [],
          recommendedShows: [],
          showDetailsLoading: false,
          similarShowsLoading: false,
          recommendedShowsLoading: false,
          showDetailsError: null,
          similarShowsError: null,
          recommendedShowsError: null,
        },
      });

      store.dispatch(toggleSeasonWatched(mockSeason));

      const watchedEpisodes = selectWatchedEpisodes(store.getState());
      expect(watchedEpisodes[1]).toBe(false);
      expect(watchedEpisodes[2]).toBe(false);
    });

    it('should toggle season to watched when partially watched', () => {
      const store = createMockStore({
        activeShow: {
          showWithSeasons: mockShow,
          showCast: mockShowCast,
          watchedEpisodes: { 1: true, 2: false },
          similarShows: [],
          recommendedShows: [],
          showDetailsLoading: false,
          similarShowsLoading: false,
          recommendedShowsLoading: false,
          showDetailsError: null,
          similarShowsError: null,
          recommendedShowsError: null,
        },
      });

      store.dispatch(toggleSeasonWatched(mockSeason));

      const watchedEpisodes = selectWatchedEpisodes(store.getState());
      expect(watchedEpisodes[1]).toBe(true);
      expect(watchedEpisodes[2]).toBe(true);
    });

    it('should reset state on logout', () => {
      const store = createMockStore({
        activeShow: {
          showWithSeasons: mockShow,
          showCast: mockShowCast,
          watchedEpisodes: { 1: true },
          similarShows: [],
          recommendedShows: [],
          showDetailsLoading: false,
          similarShowsLoading: false,
          recommendedShowsLoading: false,
          showDetailsError: null,
          similarShowsError: null,
          recommendedShowsError: null,
        },
      });

      store.dispatch({ type: logout.fulfilled.type });

      expect(selectShow(store.getState())).toBeNull();
    });

    it('should reset state on deleteAccount', () => {
      const store = createMockStore({
        activeShow: {
          showWithSeasons: mockShow,
          showCast: mockShowCast,
          watchedEpisodes: { 1: true },
          similarShows: [],
          recommendedShows: [],
          showDetailsLoading: false,
          similarShowsLoading: false,
          recommendedShowsLoading: false,
          showDetailsError: null,
          similarShowsError: null,
          recommendedShowsError: null,
        },
      });

      store.dispatch({ type: deleteAccount.fulfilled.type });

      expect(selectShow(store.getState())).toBeNull();
    });

    it('should update show when updateShowWatchStatus matches', () => {
      const updatedShow = { ...mockShow, watchStatus: WatchStatus.WATCHED };
      const store = createMockStore({
        activeShow: {
          showWithSeasons: mockShow,
          showCast: mockShowCast,
          watchedEpisodes: { 1: false, 2: false },
          similarShows: [],
          recommendedShows: [],
          showDetailsLoading: false,
          similarShowsLoading: false,
          recommendedShowsLoading: false,
          showDetailsError: null,
          similarShowsError: null,
          recommendedShowsError: null,
        },
      });

      store.dispatch({
        type: updateShowWatchStatus.fulfilled.type,
        payload: { showWithSeasons: updatedShow },
      });

      const show = selectShow(store.getState());
      expect(show?.watchStatus).toBe(WatchStatus.WATCHED);
    });

    it('should not update show when updateShowWatchStatus does not match', () => {
      const differentShow = { ...mockShow, id: 999 };
      const store = createMockStore({
        activeShow: {
          showWithSeasons: mockShow,
          showCast: mockShowCast,
          watchedEpisodes: { 1: false, 2: false },
          similarShows: [],
          recommendedShows: [],
          showDetailsLoading: false,
          similarShowsLoading: false,
          recommendedShowsLoading: false,
          showDetailsError: null,
          similarShowsError: null,
          recommendedShowsError: null,
        },
      });

      store.dispatch({
        type: updateShowWatchStatus.fulfilled.type,
        payload: { showWithSeasons: differentShow },
      });

      const show = selectShow(store.getState());
      expect(show?.id).toBe(1);
    });

    it('should update show when updateNextEpisodeWatchStatus matches', () => {
      const updatedShow = { ...mockShow, watchStatus: WatchStatus.WATCHING };
      const store = createMockStore({
        activeShow: {
          showWithSeasons: mockShow,
          showCast: mockShowCast,
          watchedEpisodes: { 1: false, 2: false },
          similarShows: [],
          recommendedShows: [],
          showDetailsLoading: false,
          similarShowsLoading: false,
          recommendedShowsLoading: false,
          showDetailsError: null,
          similarShowsError: null,
          recommendedShowsError: null,
        },
      });

      store.dispatch({
        type: updateNextEpisodeWatchStatus.fulfilled.type,
        payload: { showWithSeasons: updatedShow },
      });

      const show = selectShow(store.getState());
      expect(show?.watchStatus).toBe(WatchStatus.WATCHING);
    });
  });

  describe('selectors', () => {
    const mockState = {
      activeShow: {
        showWithSeasons: mockShow,
        showCast: mockShowCast,
        watchedEpisodes: { 1: true, 2: false },
        similarShows: mockSimilarShows,
        recommendedShows: mockRecommendedShows,
        showDetailsLoading: true,
        similarShowsLoading: false,
        recommendedShowsLoading: true,
        showDetailsError: { message: 'Test error' },
        similarShowsError: null,
        recommendedShowsError: { message: 'Recommended error' },
      },
    };

    it('should select show', () => {
      const store = createMockStore(mockState);
      expect(selectShow(store.getState())).toEqual(mockShow);
    });

    it('should select seasons', () => {
      const store = createMockStore(mockState);
      expect(selectSeasons(store.getState())).toEqual([mockSeason]);
    });

    it('should select show cast', () => {
      const store = createMockStore(mockState);
      expect(selectShowCast(store.getState())).toEqual(mockShowCast);
    });

    it('should select watched episodes', () => {
      const store = createMockStore(mockState);
      expect(selectWatchedEpisodes(store.getState())).toEqual({ 1: true, 2: false });
    });

    it('should select show loading', () => {
      const store = createMockStore(mockState);
      expect(selectShowLoading(store.getState())).toBe(true);
    });

    it('should select show error', () => {
      const store = createMockStore(mockState);
      expect(selectShowError(store.getState())).toEqual({ message: 'Test error' });
    });

    it('should select similar shows', () => {
      const store = createMockStore(mockState);
      expect(selectSimilarShows(store.getState())).toEqual(mockSimilarShows);
    });

    it('should select similar shows loading', () => {
      const store = createMockStore(mockState);
      expect(selectSimilarShowsLoading(store.getState())).toBe(false);
    });

    it('should select similar shows error', () => {
      const store = createMockStore(mockState);
      expect(selectSimilarShowsError(store.getState())).toBeNull();
    });

    it('should select recommended shows', () => {
      const store = createMockStore(mockState);
      expect(selectRecommendedShows(store.getState())).toEqual(mockRecommendedShows);
    });

    it('should select recommended shows loading', () => {
      const store = createMockStore(mockState);
      expect(selectRecommendedShowsLoading(store.getState())).toBe(true);
    });

    it('should select recommended shows error', () => {
      const store = createMockStore(mockState);
      expect(selectRecommendedShowsError(store.getState())).toEqual({ message: 'Recommended error' });
    });
  });
});
