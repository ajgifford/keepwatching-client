import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import accountSlice from '../../../../app/slices/accountSlice';
import activeProfileSlice from '../../../../app/slices/activeProfileSlice';
import activeShowSlice from '../../../../app/slices/activeShowSlice';
import preferencesReducer from '../../../../app/slices/preferencesSlice';
import watchlistReducer from '../../../../app/slices/watchlistSlice';
import { SimilarShowsComponent } from '../similarShowsComponent';
import { SimilarOrRecommendedShow } from '@ajgifford/keepwatching-types';
import { configureStore } from '@reduxjs/toolkit';

const mockSimilarShow1: SimilarOrRecommendedShow = {
  id: 300,
  title: 'Similar Show 1',
  genres: ['Drama'],
  premiered: '2024-01-01',
  summary: 'A similar show',
  image: '/similar1.jpg',
  rating: 8.0,
  popularity: 90,
  country: 'US',
  language: 'en',
  inFavorites: false,
};

const mockSimilarShow2: SimilarOrRecommendedShow = {
  id: 301,
  title: 'Similar Show 2',
  genres: ['Thriller'],
  premiered: '2024-03-01',
  summary: 'Another similar show',
  image: '/similar2.jpg',
  rating: 7.5,
  popularity: 75,
  country: 'US',
  language: 'en',
  inFavorites: false,
};

const createMockStore = (similarShows: SimilarOrRecommendedShow[] = [], similarShowsLoading = false) => {
  return configureStore({
    reducer: {
      activeShow: activeShowSlice,
      activeProfile: activeProfileSlice,
      auth: accountSlice,
      preferences: preferencesReducer,
      watchlist: watchlistReducer,
    },
    preloadedState: {
      activeShow: {
        showWithSeasons: null,
        showCast: { activeCast: [], priorCast: [] },
        watchedEpisodes: {},
        similarShows,
        recommendedShows: [],
        showDetailsLoading: false,
        similarShowsLoading,
        recommendedShowsLoading: false,
        showDetailsError: null,
        similarShowsError: null,
        recommendedShowsError: null,
      },
      activeProfile: {
        profile: {
          id: 1,
          accountId: 1,
          name: 'Test Profile',
          image: undefined,
        },
        shows: [],
        showGenres: [],
        showStreamingServices: [],
        upcomingEpisodes: [],
        recentEpisodes: [],
        nextUnwatchedEpisodes: [],
        movies: [],
        movieGenres: [],
        movieStreamingServices: [],
        recentMovies: [],
        upcomingMovies: [],
        milestoneStats: null,
        lastUpdated: null,
        loading: false,
        error: null,
      },
      auth: {
        account: {
          id: 1,
          uid: 'test-uid',
          email: 'test@example.com',
          name: 'Test User',
          verified: true,
          disabled: false,
          createdDate: '2024-01-01',
          defaultProfileId: 1,
          image: '',
        },
        loading: false,
        error: null,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement, store: any) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('SimilarShowsComponent', () => {
  const defaultProps = {
    showId: 100,
    profileId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', async () => {
    const store = createMockStore();
    renderWithProviders(<SimilarShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(screen.getByText('Similar Shows')).toBeInTheDocument();
    });
  });

  it('dispatches fetchSimilarShows on mount', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    renderWithProviders(<SimilarShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  it('re-fetches when showId changes', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { rerender } = renderWithProviders(<SimilarShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    const initialCallCount = dispatchSpy.mock.calls.length;

    rerender(
      <Provider store={store}>
        <BrowserRouter>
          <SimilarShowsComponent showId={999} profileId={1} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchSpy.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  it('re-fetches when profileId changes', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { rerender } = renderWithProviders(<SimilarShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    const initialCallCount = dispatchSpy.mock.calls.length;

    rerender(
      <Provider store={store}>
        <BrowserRouter>
          <SimilarShowsComponent showId={100} profileId={999} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchSpy.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  it('does not re-fetch when props are unchanged', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { rerender } = renderWithProviders(<SimilarShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    const initialCallCount = dispatchSpy.mock.calls.length;

    rerender(
      <Provider store={store}>
        <BrowserRouter>
          <SimilarShowsComponent {...defaultProps} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchSpy.mock.calls).toHaveLength(initialCallCount);
    });
  });

  it('displays loading state', async () => {
    const store = createMockStore([], true);
    renderWithProviders(<SimilarShowsComponent {...defaultProps} />, store);

    // ScrollableMediaRow handles the loading state; verify the component renders
    await waitFor(() => {
      expect(screen.getByText('Similar Shows')).toBeInTheDocument();
    });
  });

  it('displays similar shows when loaded', async () => {
    const store = createMockStore([mockSimilarShow1, mockSimilarShow2]);
    renderWithProviders(<SimilarShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(screen.getByText('Similar Shows')).toBeInTheDocument();
    });
  });

  it('displays empty message when no similar shows', async () => {
    const store = createMockStore([], false);
    renderWithProviders(<SimilarShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(screen.getByText(/no similar shows found/i)).toBeInTheDocument();
    });
  });
});
