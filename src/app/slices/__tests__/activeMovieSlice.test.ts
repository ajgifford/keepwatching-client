import {
  CastMember,
  MovieDetailsResponse,
  ProfileMovieWithDetails,
  SimilarOrRecommendedMovie,
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

import axiosInstance from '../../api/axiosInstance';
import { createMockStore } from '../../testUtils';
import { deleteAccount, logout } from '../accountSlice';
import { updateMovieWatchStatus } from '../activeProfileSlice';
import {
  clearActiveMovie,
  fetchMovieWithDetails,
  selectCastMembers,
  selectMovie,
  selectMovieError,
  selectMovieLoading,
  selectRecommendedMovies,
  selectSimilarMovies,
} from '../activeMovieSlice';

const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('activeMovieSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMovie: ProfileMovieWithDetails = {
    id: 1,
    tmdbId: 550,
    title: 'Fight Club',
    overview: 'An insomniac office worker...',
    releaseDate: '1999-10-15',
    runtime: 139,
    posterPath: 'poster.jpg',
    backdropPath: 'backdrop.jpg',
    voteAverage: 8.4,
    watchStatus: 'Unwatched',
    isFavorite: false,
    genres: [{ id: 1, name: 'Drama' }],
    streamingServices: [],
  };

  const mockCastMembers: CastMember[] = [
    {
      id: 1,
      name: 'Brad Pitt',
      character: 'Tyler Durden',
      profilePath: 'brad.jpg',
      order: 0,
    },
    {
      id: 2,
      name: 'Edward Norton',
      character: 'The Narrator',
      profilePath: 'edward.jpg',
      order: 1,
    },
  ];

  const mockSimilarMovies: SimilarOrRecommendedMovie[] = [
    {
      id: 2,
      tmdbId: 680,
      title: 'Pulp Fiction',
      posterPath: 'pulp.jpg',
      voteAverage: 8.5,
      releaseDate: '1994-10-14',
    },
  ];

  const mockRecommendedMovies: SimilarOrRecommendedMovie[] = [
    {
      id: 3,
      tmdbId: 13,
      title: 'Forrest Gump',
      posterPath: 'forrest.jpg',
      voteAverage: 8.8,
      releaseDate: '1994-07-06',
    },
  ];

  const mockMovieDetailsResponse: MovieDetailsResponse = {
    movie: mockMovie,
    castMembers: mockCastMembers,
    similarMovies: mockSimilarMovies,
    recommendedMovies: mockRecommendedMovies,
  };

  describe('fetchMovieWithDetails', () => {
    it('should fetch movie with details successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockMovieDetailsResponse,
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchMovieWithDetails({ profileId: 1, movieId: 1 }));

      const state = store.getState().activeMovie;
      expect(state.movieDetailsLoading).toBe(false);
      expect(selectMovie(store.getState())).toEqual(mockMovie);
      expect(selectCastMembers(store.getState())).toEqual(mockCastMembers);
      expect(selectSimilarMovies(store.getState())).toEqual(mockSimilarMovies);
      expect(selectRecommendedMovies(store.getState())).toEqual(mockRecommendedMovies);
      expect(state.movieDetailsError).toBeNull();
    });

    it('should handle error when no account found', async () => {
      const store = createMockStore({
        auth: {
          account: null,
          loading: false,
          error: null,
        },
      });

      const result = await store.dispatch(fetchMovieWithDetails({ profileId: 1, movieId: 1 }));

      expect(result.meta.requestStatus).toBe('rejected');
      expect(result.payload).toEqual({ message: 'No account found' });
    });

    it('should handle fetch error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { data: { message: 'Failed to fetch movie' } },
      });

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      await store.dispatch(fetchMovieWithDetails({ profileId: 1, movieId: 1 }));

      const state = store.getState().activeMovie;
      expect(state.movieDetailsLoading).toBe(false);
      expect(state.movieDetailsError?.message).toBeTruthy();
    });

    it('should set loading state during fetch', async () => {
      mockAxiosInstance.get.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: mockMovieDetailsResponse }), 100);
          })
      );

      const store = createMockStore({
        auth: {
          account: { id: 1, email: 'test@test.com' },
          loading: false,
          error: null,
        },
      });

      const promise = store.dispatch(fetchMovieWithDetails({ profileId: 1, movieId: 1 }));

      // Check loading state before promise resolves
      expect(selectMovieLoading(store.getState())).toBe(true);

      await promise;

      expect(selectMovieLoading(store.getState())).toBe(false);
    });
  });

  describe('reducers', () => {
    it('should clear active movie', () => {
      const store = createMockStore({
        activeMovie: {
          movie: mockMovie,
          castMembers: mockCastMembers,
          similarMovies: mockSimilarMovies,
          recommendedMovies: mockRecommendedMovies,
          movieDetailsLoading: false,
          movieDetailsError: null,
        },
      });

      store.dispatch(clearActiveMovie());

      const state = store.getState().activeMovie;
      expect(selectMovie(store.getState())).toBeNull();
      expect(selectCastMembers(store.getState())).toHaveLength(0);
      expect(selectSimilarMovies(store.getState())).toHaveLength(0);
      expect(selectRecommendedMovies(store.getState())).toHaveLength(0);
      expect(state.movieDetailsError).toBeNull();
    });

    it('should reset state on logout', () => {
      const store = createMockStore({
        activeMovie: {
          movie: mockMovie,
          castMembers: mockCastMembers,
          similarMovies: mockSimilarMovies,
          recommendedMovies: mockRecommendedMovies,
          movieDetailsLoading: false,
          movieDetailsError: null,
        },
      });

      store.dispatch({ type: logout.fulfilled.type });

      const state = store.getState().activeMovie;
      expect(selectMovie(store.getState())).toBeNull();
      expect(selectCastMembers(store.getState())).toHaveLength(0);
    });

    it('should reset state on deleteAccount', () => {
      const store = createMockStore({
        activeMovie: {
          movie: mockMovie,
          castMembers: mockCastMembers,
          similarMovies: mockSimilarMovies,
          recommendedMovies: mockRecommendedMovies,
          movieDetailsLoading: false,
          movieDetailsError: null,
        },
      });

      store.dispatch({ type: deleteAccount.fulfilled.type });

      const state = store.getState().activeMovie;
      expect(selectMovie(store.getState())).toBeNull();
      expect(selectCastMembers(store.getState())).toHaveLength(0);
    });

    it('should update movie watch status when movie matches', () => {
      const store = createMockStore({
        activeMovie: {
          movie: mockMovie,
          castMembers: mockCastMembers,
          similarMovies: mockSimilarMovies,
          recommendedMovies: mockRecommendedMovies,
          movieDetailsLoading: false,
          movieDetailsError: null,
        },
      });

      store.dispatch({
        type: updateMovieWatchStatus.fulfilled.type,
        payload: { movieId: 1, status: 'Watched' },
      });

      const movie = selectMovie(store.getState());
      expect(movie?.watchStatus).toBe('Watched');
    });

    it('should not update movie watch status when movie does not match', () => {
      const store = createMockStore({
        activeMovie: {
          movie: mockMovie,
          castMembers: mockCastMembers,
          similarMovies: mockSimilarMovies,
          recommendedMovies: mockRecommendedMovies,
          movieDetailsLoading: false,
          movieDetailsError: null,
        },
      });

      store.dispatch({
        type: updateMovieWatchStatus.fulfilled.type,
        payload: { movieId: 999, status: 'Watched' },
      });

      const movie = selectMovie(store.getState());
      expect(movie?.watchStatus).toBe('Unwatched');
    });

    it('should not crash when updating watch status with no active movie', () => {
      const store = createMockStore();

      store.dispatch({
        type: updateMovieWatchStatus.fulfilled.type,
        payload: { movieId: 1, status: 'Watched' },
      });

      expect(selectMovie(store.getState())).toBeNull();
    });
  });

  describe('selectors', () => {
    const mockState = {
      activeMovie: {
        movie: mockMovie,
        castMembers: mockCastMembers,
        similarMovies: mockSimilarMovies,
        recommendedMovies: mockRecommendedMovies,
        movieDetailsLoading: false,
        movieDetailsError: { message: 'Test error' },
      },
    };

    it('should select movie', () => {
      const store = createMockStore(mockState);
      expect(selectMovie(store.getState())).toEqual(mockMovie);
    });

    it('should select loading', () => {
      const store = createMockStore(mockState);
      expect(selectMovieLoading(store.getState())).toBe(false);
    });

    it('should select error', () => {
      const store = createMockStore(mockState);
      expect(selectMovieError(store.getState())).toEqual({ message: 'Test error' });
    });

    it('should select similar movies', () => {
      const store = createMockStore(mockState);
      expect(selectSimilarMovies(store.getState())).toEqual(mockSimilarMovies);
    });

    it('should select cast members', () => {
      const store = createMockStore(mockState);
      expect(selectCastMembers(store.getState())).toEqual(mockCastMembers);
    });

    it('should select recommended movies', () => {
      const store = createMockStore(mockState);
      expect(selectRecommendedMovies(store.getState())).toEqual(mockRecommendedMovies);
    });
  });
});
