import axiosInstance from '../../api/axiosInstance';
import { createMockStore } from '../../testUtils';
import { deleteAccount, logout } from '../accountSlice';
import {
  addToWatchlist,
  clearWizard,
  closeWizard,
  fetchWatchlist,
  openWizard,
  removeFromWatchlist,
  selectFilteredNotWatchedPool,
  selectNotWatchedPool,
  selectWatchlistItems,
  selectWatchlistLoading,
  selectWatchlistMovies,
  selectWatchlistShows,
  selectWizardFilters,
  selectWizardOpen,
  selectWizardResult,
  selectWizardStep,
  setWizardFilters,
  setWizardResult,
  setWizardStep,
  updateWatchlistPriorities,
} from '../watchlistSlice';
import { WatchStatus, WatchlistItem } from '@ajgifford/keepwatching-types';

jest.mock('../../api/axiosInstance');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const mockShow = (overrides = {}) => ({
  id: 1,
  tmdbId: 100,
  title: 'Test Show',
  description: 'desc',
  releaseDate: '2020-01-01',
  posterImage: '/poster.jpg',
  backdropImage: '/backdrop.jpg',
  userRating: 8,
  contentRating: 'TV-14',
  streamingServices: 'Netflix',
  genres: 'Drama',
  seasonCount: 2,
  episodeCount: 20,
  status: 'Continuing',
  type: 'Scripted',
  inProduction: true,
  lastAirDate: null,
  network: null,
  averageEpisodeRuntime: 45,
  profileId: 1,
  watchStatus: WatchStatus.NOT_WATCHED,
  lastEpisode: null,
  nextEpisode: null,
  ...overrides,
});

const mockMovie = (overrides = {}) => ({
  id: 2,
  tmdbId: 200,
  title: 'Test Movie',
  description: 'desc',
  releaseDate: '2020-01-01',
  posterImage: '/movie-poster.jpg',
  backdropImage: '/movie-backdrop.jpg',
  userRating: 7,
  contentRating: 'PG-13',
  streamingServices: 'Prime',
  genres: 'Action',
  runtime: 110,
  profileId: 1,
  watchStatus: WatchStatus.NOT_WATCHED,
  ...overrides,
});

const mockWatchlistItem = (overrides: Partial<WatchlistItem> = {}): WatchlistItem => ({
  id: 1,
  profileId: 1,
  contentType: 'show',
  contentId: 1,
  priority: 0,
  addedAt: '2024-01-01T00:00:00Z',
  title: 'Test Show',
  posterImage: '/poster.jpg',
  genres: 'Drama',
  streamingServices: 'Netflix',
  runtime: 45,
  currentWatchStatus: WatchStatus.NOT_WATCHED,
  ...overrides,
});

const baseState = {
  auth: { account: { id: 10 } },
  activeProfile: {
    profile: { id: 1, name: 'Profile 1' },
    shows: [],
    movies: [],
  },
};

describe('watchlistSlice — async thunks', () => {
  it('fetchWatchlist sets items on fulfilled', async () => {
    const items = [mockWatchlistItem()];
    mockedAxios.get = jest.fn().mockResolvedValue({ data: { watchlist: items } });
    const store = createMockStore(baseState as any);
    await store.dispatch(fetchWatchlist(1) as any);
    expect(selectWatchlistItems(store.getState())).toEqual(items);
    expect(selectWatchlistLoading(store.getState())).toBe(false);
  });

  it('fetchWatchlist sets error on rejected', async () => {
    mockedAxios.get = jest.fn().mockRejectedValue({ response: { data: { message: 'fail' } } });
    const store = createMockStore(baseState as any);
    await store.dispatch(fetchWatchlist(1) as any);
    expect(store.getState().watchlist.error).toEqual({ message: 'fail' });
  });

  it('addToWatchlist appends item on fulfilled', async () => {
    const newItem = mockWatchlistItem({ id: 2, priority: 1 });
    mockedAxios.post = jest.fn().mockResolvedValue({ data: { item: newItem } });
    const store = createMockStore({ ...baseState, watchlist: { items: [mockWatchlistItem()] } } as any);
    await store.dispatch(addToWatchlist({ profileId: 1, contentType: 'show', contentId: 2 }) as any);
    const items = selectWatchlistItems(store.getState());
    expect(items).toHaveLength(2);
    expect(items[1].id).toBe(2);
  });

  it('removeFromWatchlist filters item on fulfilled', async () => {
    mockedAxios.delete = jest.fn().mockResolvedValue({ data: { message: 'ok' } });
    const store = createMockStore({
      ...baseState,
      watchlist: { items: [mockWatchlistItem({ id: 5 })] },
    } as any);
    await store.dispatch(removeFromWatchlist({ profileId: 1, itemId: 5 }) as any);
    expect(selectWatchlistItems(store.getState())).toHaveLength(0);
  });

  it('updateWatchlistPriorities updates priorities on fulfilled', async () => {
    mockedAxios.put = jest.fn().mockResolvedValue({ data: { message: 'ok' } });
    const items = [mockWatchlistItem({ id: 1, priority: 0 }), mockWatchlistItem({ id: 2, priority: 1 })];
    const store = createMockStore({ ...baseState, watchlist: { items } } as any);
    await store.dispatch(
      updateWatchlistPriorities({
        profileId: 1,
        priorities: [
          { id: 1, priority: 1 },
          { id: 2, priority: 0 },
        ],
      }) as any
    );
    const updated = selectWatchlistItems(store.getState());
    expect(updated[0].id).toBe(2);
    expect(updated[1].id).toBe(1);
  });
});

describe('watchlistSlice — wizard reducers', () => {
  it('openWizard sets wizardOpen to true and resets state', () => {
    const store = createMockStore({
      ...baseState,
      watchlist: {
        wizardOpen: false,
        wizardStep: 2,
        wizardFilters: { contentType: 'show', genres: ['Drama'], maxRuntime: 90, epicRuntime: false },
        wizardResult: [],
      },
    } as any);
    store.dispatch(openWizard());
    expect(selectWizardOpen(store.getState())).toBe(true);
    expect(selectWizardStep(store.getState())).toBe(0);
    expect(selectWizardFilters(store.getState()).genres).toEqual([]);
    expect(selectWizardResult(store.getState())).toBeNull();
  });

  it('closeWizard sets wizardOpen to false', () => {
    const store = createMockStore({ ...baseState, watchlist: { wizardOpen: true } } as any);
    store.dispatch(closeWizard());
    expect(selectWizardOpen(store.getState())).toBe(false);
  });

  it('setWizardStep updates step', () => {
    const store = createMockStore(baseState as any);
    store.dispatch(setWizardStep(2));
    expect(selectWizardStep(store.getState())).toBe(2);
  });

  it('setWizardFilters merges filters', () => {
    const store = createMockStore(baseState as any);
    store.dispatch(setWizardFilters({ genres: ['Action'] }));
    expect(selectWizardFilters(store.getState()).genres).toEqual(['Action']);
    expect(selectWizardFilters(store.getState()).contentType).toBe('both');
  });

  it('setWizardResult sets result', () => {
    const store = createMockStore(baseState as any);
    const results = [mockWatchlistItem()];
    store.dispatch(setWizardResult(results));
    expect(selectWizardResult(store.getState())).toEqual(results);
  });

  it('clearWizard resets all wizard state', () => {
    const store = createMockStore({
      ...baseState,
      watchlist: { wizardOpen: true, wizardStep: 2, wizardFilters: { genres: ['Drama'] }, wizardResult: [] },
    } as any);
    store.dispatch(clearWizard());
    expect(selectWizardOpen(store.getState())).toBe(false);
    expect(selectWizardStep(store.getState())).toBe(0);
    expect(selectWizardFilters(store.getState()).genres).toEqual([]);
    expect(selectWizardResult(store.getState())).toBeNull();
  });
});

describe('watchlistSlice — reset on logout/deleteAccount', () => {
  it('resets to initial state on logout.fulfilled', async () => {
    const store = createMockStore({
      ...baseState,
      watchlist: { items: [mockWatchlistItem()], wizardOpen: true },
    } as any);
    store.dispatch({ type: logout.fulfilled.type });
    expect(selectWatchlistItems(store.getState())).toHaveLength(0);
    expect(selectWizardOpen(store.getState())).toBe(false);
  });

  it('resets to initial state on deleteAccount.fulfilled', async () => {
    const store = createMockStore({
      ...baseState,
      watchlist: { items: [mockWatchlistItem()], wizardOpen: true },
    } as any);
    store.dispatch({ type: deleteAccount.fulfilled.type });
    expect(selectWatchlistItems(store.getState())).toHaveLength(0);
  });
});

describe('watchlistSlice — selectors', () => {
  it('selectWatchlistShows returns only shows', () => {
    const items = [
      mockWatchlistItem({ id: 1, contentType: 'show' }),
      mockWatchlistItem({ id: 2, contentType: 'movie' }),
    ];
    const store = createMockStore({ ...baseState, watchlist: { items } } as any);
    expect(selectWatchlistShows(store.getState())).toHaveLength(1);
    expect(selectWatchlistShows(store.getState())[0].contentType).toBe('show');
  });

  it('selectWatchlistMovies returns only movies', () => {
    const items = [
      mockWatchlistItem({ id: 1, contentType: 'show' }),
      mockWatchlistItem({ id: 2, contentType: 'movie' }),
    ];
    const store = createMockStore({ ...baseState, watchlist: { items } } as any);
    expect(selectWatchlistMovies(store.getState())).toHaveLength(1);
    expect(selectWatchlistMovies(store.getState())[0].contentType).toBe('movie');
  });

  it('selectNotWatchedPool includes NOT_WATCHED shows and movies', () => {
    const store = createMockStore({
      ...baseState,
      activeProfile: {
        profile: { id: 1 },
        shows: [mockShow(), mockShow({ id: 99, watchStatus: WatchStatus.WATCHED })],
        movies: [mockMovie()],
      },
    } as any);
    const pool = selectNotWatchedPool(store.getState());
    expect(pool.filter((i) => i.contentType === 'show')).toHaveLength(1);
    expect(pool.filter((i) => i.contentType === 'movie')).toHaveLength(1);
  });

  it('selectNotWatchedPool excludes UP_TO_DATE shows even with a nextEpisode', () => {
    const store = createMockStore({
      ...baseState,
      activeProfile: {
        profile: { id: 1 },
        shows: [
          mockShow({
            watchStatus: WatchStatus.UP_TO_DATE,
            nextEpisode: { title: 'S2E1', airDate: '2025-01-01', seasonNumber: 2, episodeNumber: 1 },
          }),
        ],
        movies: [],
      },
    } as any);
    expect(selectNotWatchedPool(store.getState())).toHaveLength(0);
  });

  it('selectNotWatchedPool excludes WATCHING shows', () => {
    const store = createMockStore({
      ...baseState,
      activeProfile: {
        profile: { id: 1 },
        shows: [mockShow({ watchStatus: WatchStatus.WATCHING })],
        movies: [],
      },
    } as any);
    expect(selectNotWatchedPool(store.getState())).toHaveLength(0);
  });

  it('selectNotWatchedPool items always report currentWatchStatus as NOT_WATCHED', () => {
    const store = createMockStore({
      ...baseState,
      activeProfile: {
        profile: { id: 1 },
        shows: [mockShow()],
        movies: [mockMovie()],
      },
    } as any);
    const pool = selectNotWatchedPool(store.getState());
    expect(pool.every((i) => i.currentWatchStatus === WatchStatus.NOT_WATCHED)).toBe(true);
  });

  it('selectFilteredNotWatchedPool excludes items already on the watchlist', () => {
    const store = createMockStore({
      ...baseState,
      activeProfile: {
        profile: { id: 1 },
        shows: [mockShow({ id: 1 }), mockShow({ id: 2 })],
        movies: [mockMovie({ id: 3 })],
      },
      watchlist: {
        items: [mockWatchlistItem({ id: 10, contentType: 'show', contentId: 1 })],
      },
    } as any);
    const pool = selectFilteredNotWatchedPool(store.getState());
    expect(pool.some((p) => p.contentType === 'show' && p.contentId === 1)).toBe(false);
    expect(pool.some((p) => p.contentType === 'show' && p.contentId === 2)).toBe(true);
    expect(pool.some((p) => p.contentType === 'movie' && p.contentId === 3)).toBe(true);
  });
});
