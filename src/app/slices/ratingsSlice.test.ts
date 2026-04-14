import { configureStore } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import ratingsReducer, {
  deleteRating,
  fetchRatings,
  selectRatingForContent,
  selectRatings,
  selectRatingsLoading,
  upsertRating,
} from './ratingsSlice';
import accountReducer from './accountSlice';
import { ContentRating } from '@ajgifford/keepwatching-types';

jest.mock('../api/axiosInstance');

const mockRating: ContentRating = {
  id: 1,
  profileId: 10,
  contentType: 'show',
  contentId: 42,
  contentTitle: 'Breaking Bad',
  posterImage: '/poster.jpg',
  rating: 5,
  note: 'Amazing!',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const mockMovieRating: ContentRating = {
  id: 2,
  profileId: 10,
  contentType: 'movie',
  contentId: 99,
  contentTitle: 'Inception',
  posterImage: '/inception.jpg',
  rating: 4,
  note: null,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const makeStore = (preloaded?: any) =>
  configureStore({
    reducer: { ratings: ratingsReducer, auth: accountReducer },
    preloadedState: preloaded,
  });

const storeWithAccount = (ratings: ContentRating[] = []) =>
  makeStore({
    auth: { account: { id: 123 }, loading: false, error: null },
    ratings: { ratings, loading: false, error: null },
  });

describe('ratingsSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reducer', () => {
    it('should return initial state', () => {
      const store = makeStore();
      expect(store.getState().ratings).toEqual({ ratings: [], loading: false, error: null });
    });

    it('fetchRatings.pending sets loading to true', () => {
      const store = makeStore();
      store.dispatch({ type: fetchRatings.pending.type });
      expect(store.getState().ratings.loading).toBe(true);
      expect(store.getState().ratings.error).toBeNull();
    });

    it('fetchRatings.rejected sets error and clears ratings', () => {
      const store = storeWithAccount([mockRating]);
      store.dispatch({ type: fetchRatings.rejected.type, payload: { message: 'Failed' } });
      expect(store.getState().ratings.ratings).toEqual([]);
      expect(store.getState().ratings.error).toEqual({ message: 'Failed' });
    });

    it('upsertRating.fulfilled adds new rating when not present', () => {
      const store = storeWithAccount([]);
      store.dispatch({ type: upsertRating.fulfilled.type, payload: mockRating });
      expect(store.getState().ratings.ratings).toHaveLength(1);
      expect(store.getState().ratings.ratings[0]).toEqual(mockRating);
    });

    it('upsertRating.fulfilled replaces existing rating for same content', () => {
      const updated = { ...mockRating, rating: 3, note: 'Revised' };
      const store = storeWithAccount([mockRating]);
      store.dispatch({ type: upsertRating.fulfilled.type, payload: updated });
      expect(store.getState().ratings.ratings).toHaveLength(1);
      expect(store.getState().ratings.ratings[0].rating).toBe(3);
    });

    it('deleteRating.fulfilled removes rating by id', () => {
      const store = storeWithAccount([mockRating, mockMovieRating]);
      store.dispatch({ type: deleteRating.fulfilled.type, payload: 1 });
      expect(store.getState().ratings.ratings).toHaveLength(1);
      expect(store.getState().ratings.ratings[0].id).toBe(2);
    });
  });

  describe('selectors', () => {
    it('selectRatingForContent returns matching rating', () => {
      const store = storeWithAccount([mockRating, mockMovieRating]);
      const selector = selectRatingForContent('show', 42);
      expect(selector(store.getState() as any)).toEqual(mockRating);
    });

    it('selectRatingForContent returns undefined when not found', () => {
      const store = storeWithAccount([mockRating]);
      const selector = selectRatingForContent('movie', 42);
      expect(selector(store.getState() as any)).toBeUndefined();
    });

    it('selectRatingForContent returns undefined when ratings is empty', () => {
      const store = storeWithAccount([]);
      const selector = selectRatingForContent('show', 5);
      expect(selector(store.getState() as any)).toBeUndefined();
    });
  });

  describe('loading/error states', () => {
    it('upsertRating.pending sets loading', () => {
      const store = makeStore();
      store.dispatch({ type: upsertRating.pending.type });
      expect(store.getState().ratings.loading).toBe(true);
      expect(store.getState().ratings.error).toBeNull();
    });

    it('upsertRating.rejected sets error', () => {
      const store = makeStore();
      store.dispatch({ type: upsertRating.rejected.type, payload: { message: 'Failed to save' } });
      expect(store.getState().ratings.loading).toBe(false);
      expect(store.getState().ratings.error).toEqual({ message: 'Failed to save' });
    });

    it('deleteRating.pending sets loading', () => {
      const store = makeStore();
      store.dispatch({ type: deleteRating.pending.type });
      expect(store.getState().ratings.loading).toBe(true);
      expect(store.getState().ratings.error).toBeNull();
    });

    it('deleteRating.rejected sets error', () => {
      const store = makeStore();
      store.dispatch({ type: deleteRating.rejected.type, payload: { message: 'Failed to delete' } });
      expect(store.getState().ratings.loading).toBe(false);
      expect(store.getState().ratings.error).toEqual({ message: 'Failed to delete' });
    });
  });

  describe('additional selectors', () => {
    it('selectRatingsLoading returns loading state', () => {
      const store = makeStore({ ratings: { ratings: [], loading: true, error: null } } as any);
      expect(selectRatingsLoading(store.getState() as any)).toBe(true);
    });
  });

  describe('thunks — error paths', () => {
    it('fetchRatings rejects when no account', async () => {
      const store = makeStore();
      const result = await store.dispatch(fetchRatings({ profileId: 10 }) as any);
      expect(result.type).toBe(fetchRatings.rejected.type);
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('upsertRating rejects when no account', async () => {
      const store = makeStore();
      const result = await store.dispatch(
        upsertRating({ profileId: 10, contentType: 'show', contentId: 42, rating: 5, contentTitle: 'Test', posterImage: '/img.jpg' }) as any,
      );
      expect(result.type).toBe(upsertRating.rejected.type);
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('deleteRating rejects when no account', async () => {
      const store = makeStore();
      const result = await store.dispatch(deleteRating({ profileId: 10, ratingId: 1 }) as any);
      expect(result.type).toBe(deleteRating.rejected.type);
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('fetchRatings rejects on API error', async () => {
      const store = storeWithAccount();
      const { AxiosError } = jest.requireActual('axios');
      const axiosError = new AxiosError('Network Error');
      axiosError.response = { data: { message: 'Server error' } } as any;
      (axiosInstance.get as jest.Mock).mockRejectedValue(axiosError);

      const result = await store.dispatch(fetchRatings({ profileId: 10 }) as any);
      expect(result.type).toBe(fetchRatings.rejected.type);
      expect(store.getState().ratings.error).toEqual({ message: 'Server error' });
      expect(store.getState().ratings.ratings).toEqual([]);
    });

    it('upsertRating rejects on API error', async () => {
      const store = storeWithAccount();
      const { AxiosError } = jest.requireActual('axios');
      const axiosError = new AxiosError('Network Error');
      axiosError.response = { data: { message: 'Save failed' } } as any;
      (axiosInstance.post as jest.Mock).mockRejectedValue(axiosError);

      const result = await store.dispatch(
        upsertRating({ profileId: 10, contentType: 'show', contentId: 42, rating: 5, contentTitle: 'Test', posterImage: '/img.jpg' }) as any,
      );
      expect(result.type).toBe(upsertRating.rejected.type);
      expect(store.getState().ratings.error).toEqual({ message: 'Save failed' });
    });
  });

  describe('thunks', () => {
    it('fetchRatings dispatches GET to correct URL', async () => {
      const store = storeWithAccount();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { ratings: [mockRating] } });

      await store.dispatch(fetchRatings({ profileId: 10 }) as any);

      expect(axiosInstance.get).toHaveBeenCalledWith('/accounts/123/profiles/10/ratings');
      expect(selectRatings(store.getState() as any)).toEqual([mockRating]);
    });

    it('upsertRating dispatches POST to correct URL with body', async () => {
      const store = storeWithAccount();
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: { rating: mockRating } });

      await store.dispatch(
        upsertRating({
          profileId: 10,
          contentType: 'show',
          contentId: 42,
          rating: 5,
          note: 'Amazing!',
          contentTitle: 'Breaking Bad',
          posterImage: '/poster.jpg',
        }) as any,
      );

      expect(axiosInstance.post).toHaveBeenCalledWith('/accounts/123/profiles/10/ratings', {
        contentType: 'show',
        contentId: 42,
        rating: 5,
        note: 'Amazing!',
        contentTitle: 'Breaking Bad',
        posterImage: '/poster.jpg',
      });
    });

    it('deleteRating dispatches DELETE to correct URL', async () => {
      const store = storeWithAccount([mockRating]);
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });

      await store.dispatch(deleteRating({ profileId: 10, ratingId: 1 }) as any);

      expect(axiosInstance.delete).toHaveBeenCalledWith('/accounts/123/profiles/10/ratings/1');
    });
  });
});
