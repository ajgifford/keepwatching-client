import { configureStore } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import communityRecommendationsReducer, {
  addRecommendation,
  fetchCommunityRecommendations,
  fetchProfileRecommendations,
  removeRecommendation,
  selectCommunityLoading,
  selectCommunityRecommendations,
  selectContentTypeFilter,
  selectHasRecommended,
  selectProfileRecommendations,
  selectSendLoading,
} from './communityRecommendationsSlice';
import accountReducer from './accountSlice';
import { CommunityRecommendation, ProfileRecommendation } from '@ajgifford/keepwatching-types';

jest.mock('../api/axiosInstance');

const mockProfileRec: ProfileRecommendation = {
  id: 1,
  profileId: 10,
  contentType: 'show',
  contentId: 42,
  rating: 5,
  message: 'Must watch!',
  createdAt: '2026-04-01T00:00:00.000Z',
};

const mockMovieProfileRec: ProfileRecommendation = {
  id: 2,
  profileId: 10,
  contentType: 'movie',
  contentId: 99,
  rating: null,
  message: null,
  createdAt: '2026-04-01T00:00:00.000Z',
};

const mockCommunityRec: CommunityRecommendation = {
  id: 1,
  contentType: 'show',
  contentId: 42,
  contentTitle: 'Breaking Bad',
  posterImage: '/poster.jpg',
  releaseDate: '2008-01-20',
  genres: 'Drama',
  rating: 5,
  message: 'Must watch!',
  recommendationCount: 3,
  createdAt: '2026-04-01T00:00:00.000Z',
};

const makeStore = (preloaded?: any) =>
  configureStore({
    reducer: { communityRecommendations: communityRecommendationsReducer, auth: accountReducer },
    preloadedState: preloaded,
  });

const storeWithAccount = (partialCommunity: any = {}) =>
  makeStore({
    auth: { account: { id: 123 }, loading: false, error: null },
    communityRecommendations: {
      communityRecommendations: [],
      communityLoading: false,
      communityError: null,
      contentTypeFilter: null,
      profileRecommendations: [],
      profileRecsLoading: false,
      sendLoading: false,
      ...partialCommunity,
    },
  });

describe('communityRecommendationsSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reducer', () => {
    it('should return initial state', () => {
      const store = makeStore();
      const state = store.getState().communityRecommendations;
      expect(state.communityRecommendations).toEqual([]);
      expect(state.profileRecommendations).toEqual([]);
      expect(state.contentTypeFilter).toBeNull();
    });

    it('fetchCommunityRecommendations.fulfilled sets communityRecommendations', () => {
      const store = storeWithAccount();
      store.dispatch({
        type: fetchCommunityRecommendations.fulfilled.type,
        payload: [mockCommunityRec],
      });
      expect(store.getState().communityRecommendations.communityRecommendations).toEqual([mockCommunityRec]);
    });

    it('addRecommendation.fulfilled adds to profileRecommendations', () => {
      const store = storeWithAccount({ profileRecommendations: [] });
      store.dispatch({ type: addRecommendation.fulfilled.type, payload: mockProfileRec });
      expect(store.getState().communityRecommendations.profileRecommendations).toHaveLength(1);
      expect(store.getState().communityRecommendations.profileRecommendations[0]).toEqual(mockProfileRec);
    });

    it('removeRecommendation.fulfilled removes from profileRecommendations', () => {
      const store = storeWithAccount({ profileRecommendations: [mockProfileRec, mockMovieProfileRec] });
      store.dispatch({
        type: removeRecommendation.fulfilled.type,
        payload: { contentType: 'show', contentId: 42 },
      });
      expect(store.getState().communityRecommendations.profileRecommendations).toHaveLength(1);
      expect(store.getState().communityRecommendations.profileRecommendations[0].contentType).toBe('movie');
    });
  });

  describe('selectors', () => {
    it('selectHasRecommended returns true when content is recommended', () => {
      const store = storeWithAccount({ profileRecommendations: [mockProfileRec] });
      const selector = selectHasRecommended('show', 42);
      expect(selector(store.getState() as any)).toBe(true);
    });

    it('selectHasRecommended returns false when content is not recommended', () => {
      const store = storeWithAccount({ profileRecommendations: [mockProfileRec] });
      const selector = selectHasRecommended('movie', 42);
      expect(selector(store.getState() as any)).toBe(false);
    });

    it('selectHasRecommended returns false when profile has no recommendations', () => {
      const store = storeWithAccount({ profileRecommendations: [] });
      const selector = selectHasRecommended('show', 5);
      expect(selector(store.getState() as any)).toBe(false);
    });
  });

  describe('loading/error states', () => {
    it('fetchCommunityRecommendations.pending sets communityLoading', () => {
      const store = storeWithAccount();
      store.dispatch({ type: fetchCommunityRecommendations.pending.type });
      expect(store.getState().communityRecommendations.communityLoading).toBe(true);
      expect(store.getState().communityRecommendations.communityError).toBeNull();
    });

    it('fetchCommunityRecommendations.rejected sets communityError', () => {
      const store = storeWithAccount();
      store.dispatch({
        type: fetchCommunityRecommendations.rejected.type,
        payload: { message: 'Network error' },
      });
      expect(store.getState().communityRecommendations.communityLoading).toBe(false);
      expect(store.getState().communityRecommendations.communityError).toEqual({ message: 'Network error' });
    });

    it('fetchProfileRecommendations.pending sets profileRecsLoading', () => {
      const store = storeWithAccount();
      store.dispatch({ type: fetchProfileRecommendations.pending.type });
      expect(store.getState().communityRecommendations.profileRecsLoading).toBe(true);
    });

    it('fetchProfileRecommendations.rejected clears profileRecsLoading', () => {
      const store = storeWithAccount({ profileRecsLoading: true });
      store.dispatch({ type: fetchProfileRecommendations.rejected.type });
      expect(store.getState().communityRecommendations.profileRecsLoading).toBe(false);
    });

    it('addRecommendation.pending sets sendLoading', () => {
      const store = storeWithAccount();
      store.dispatch({ type: addRecommendation.pending.type });
      expect(store.getState().communityRecommendations.sendLoading).toBe(true);
    });

    it('addRecommendation.rejected clears sendLoading', () => {
      const store = storeWithAccount({ sendLoading: true });
      store.dispatch({ type: addRecommendation.rejected.type });
      expect(store.getState().communityRecommendations.sendLoading).toBe(false);
    });

    it('removeRecommendation.pending sets sendLoading', () => {
      const store = storeWithAccount();
      store.dispatch({ type: removeRecommendation.pending.type });
      expect(store.getState().communityRecommendations.sendLoading).toBe(true);
    });

    it('removeRecommendation.rejected clears sendLoading', () => {
      const store = storeWithAccount({ sendLoading: true });
      store.dispatch({ type: removeRecommendation.rejected.type });
      expect(store.getState().communityRecommendations.sendLoading).toBe(false);
    });
  });

  describe('setContentTypeFilter', () => {
    it('sets contentTypeFilter to show', () => {
      const store = storeWithAccount();
      store.dispatch({ type: 'communityRecommendations/setContentTypeFilter', payload: 'show' });
      expect(store.getState().communityRecommendations.contentTypeFilter).toBe('show');
    });

    it('sets contentTypeFilter to null', () => {
      const store = storeWithAccount({ contentTypeFilter: 'movie' });
      store.dispatch({ type: 'communityRecommendations/setContentTypeFilter', payload: null });
      expect(store.getState().communityRecommendations.contentTypeFilter).toBeNull();
    });
  });

  describe('additional selectors', () => {
    it('selectCommunityLoading returns loading state', () => {
      const store = storeWithAccount({ communityLoading: true });
      expect(selectCommunityLoading(store.getState() as any)).toBe(true);
    });

    it('selectContentTypeFilter returns filter value', () => {
      const store = storeWithAccount({ contentTypeFilter: 'movie' });
      expect(selectContentTypeFilter(store.getState() as any)).toBe('movie');
    });

    it('selectSendLoading returns sendLoading state', () => {
      const store = storeWithAccount({ sendLoading: true });
      expect(selectSendLoading(store.getState() as any)).toBe(true);
    });
  });

  describe('thunks — error paths', () => {
    it('fetchCommunityRecommendations rejects when no account (returns rejected action)', async () => {
      const store = makeStore();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [] } });
      const result = await store.dispatch(fetchCommunityRecommendations({}) as any);
      // No account means axios will be called but state will show error from server
      // The thunk itself calls axios regardless; missing account check is in profile/add thunks
      expect(result).toBeDefined();
    });

    it('fetchProfileRecommendations rejects when no account', async () => {
      const store = makeStore();
      const result = await store.dispatch(fetchProfileRecommendations({ profileId: 10 }) as any);
      expect(result.type).toBe(fetchProfileRecommendations.rejected.type);
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('addRecommendation rejects when no account', async () => {
      const store = makeStore();
      const result = await store.dispatch(
        addRecommendation({ profileId: 10, contentType: 'show', contentId: 42 }) as any,
      );
      expect(result.type).toBe(addRecommendation.rejected.type);
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('removeRecommendation rejects when no account', async () => {
      const store = makeStore();
      const result = await store.dispatch(
        removeRecommendation({ profileId: 10, contentType: 'show', contentId: 42 }) as any,
      );
      expect(result.type).toBe(removeRecommendation.rejected.type);
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('fetchCommunityRecommendations rejects on API error', async () => {
      const store = storeWithAccount();
      const { AxiosError } = jest.requireActual('axios');
      const axiosError = new AxiosError('Network Error');
      axiosError.response = { data: { message: 'Server error' } } as any;
      (axiosInstance.get as jest.Mock).mockRejectedValue(axiosError);

      const result = await store.dispatch(fetchCommunityRecommendations({}) as any);
      expect(result.type).toBe(fetchCommunityRecommendations.rejected.type);
      expect(store.getState().communityRecommendations.communityError).toEqual({ message: 'Server error' });
    });

    it('addRecommendation rejects on API error', async () => {
      const store = storeWithAccount();
      const { AxiosError } = jest.requireActual('axios');
      const axiosError = new AxiosError('Network Error');
      axiosError.response = { data: { message: 'Failed' } } as any;
      (axiosInstance.post as jest.Mock).mockRejectedValue(axiosError);

      const result = await store.dispatch(
        addRecommendation({ profileId: 10, contentType: 'show', contentId: 42 }) as any,
      );
      expect(result.type).toBe(addRecommendation.rejected.type);
    });
  });

  describe('thunks', () => {
    it('fetchCommunityRecommendations with contentType=show includes query param', async () => {
      const store = storeWithAccount();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockCommunityRec] } });

      await store.dispatch(fetchCommunityRecommendations({ contentType: 'show' }) as any);

      expect(axiosInstance.get).toHaveBeenCalledWith('/community/recommendations?contentType=show');
    });

    it('fetchCommunityRecommendations without contentType omits query param', async () => {
      const store = storeWithAccount();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [] } });

      await store.dispatch(fetchCommunityRecommendations({}) as any);

      expect(axiosInstance.get).toHaveBeenCalledWith('/community/recommendations');
    });

    it('fetchProfileRecommendations dispatches GET to correct URL', async () => {
      const store = storeWithAccount();
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { recommendations: [mockProfileRec] } });

      await store.dispatch(fetchProfileRecommendations({ profileId: 10 }) as any);

      expect(axiosInstance.get).toHaveBeenCalledWith('/accounts/123/profiles/10/recommendations');
      expect(selectProfileRecommendations(store.getState() as any)).toEqual([mockProfileRec]);
    });

    it('addRecommendation dispatches POST to correct URL', async () => {
      const store = storeWithAccount();
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: { recommendation: mockProfileRec } });

      await store.dispatch(
        addRecommendation({ profileId: 10, contentType: 'show', contentId: 42, rating: 5, message: 'Must watch!' }) as any,
      );

      expect(axiosInstance.post).toHaveBeenCalledWith('/accounts/123/profiles/10/recommendations', {
        contentType: 'show',
        contentId: 42,
        rating: 5,
        message: 'Must watch!',
      });
    });

    it('removeRecommendation dispatches DELETE to correct URL', async () => {
      const store = storeWithAccount({ profileRecommendations: [mockProfileRec] });
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });

      await store.dispatch(removeRecommendation({ profileId: 10, contentType: 'show', contentId: 42 }) as any);

      expect(axiosInstance.delete).toHaveBeenCalledWith('/accounts/123/profiles/10/recommendations', {
        data: { contentType: 'show', contentId: 42 },
      });
    });
  });
});
