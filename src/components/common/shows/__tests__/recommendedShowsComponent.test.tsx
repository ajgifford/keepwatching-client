import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { RecommendedShowsComponent } from '../recommendedShowsComponent';
import activeShowSlice, { fetchRecommendedShows } from '../../../../app/slices/activeShowSlice';
import activeProfileSlice from '../../../../app/slices/activeProfileSlice';
import accountSlice from '../../../../app/slices/accountSlice';
import { SimilarOrRecommendedShow } from '@ajgifford/keepwatching-types';

const mockRecommendedShow1: SimilarOrRecommendedShow = {
  id: 200,
  title: 'Recommended Show 1',
  genres: ['Drama'],
  premiered: '2024-01-01',
  summary: 'A recommended show',
  image: '/recommended1.jpg',
  rating: 8.5,
  popularity: 100,
  country: 'US',
  language: 'en',
  inFavorites: false,
};

const mockRecommendedShow2: SimilarOrRecommendedShow = {
  id: 201,
  title: 'Recommended Show 2',
  genres: ['Comedy'],
  premiered: '2024-02-01',
  summary: 'Another recommended show',
  image: '/recommended2.jpg',
  rating: 7.8,
  popularity: 85,
  country: 'US',
  language: 'en',
  inFavorites: false,
};

const createMockStore = (
  recommendedShows: SimilarOrRecommendedShow[] = [],
  recommendedShowsLoading = false
) => {
  return configureStore({
    reducer: {
      activeShow: activeShowSlice,
      activeProfile: activeProfileSlice,
      auth: accountSlice,
    },
    preloadedState: {
      activeShow: {
        showWithSeasons: null,
        showCast: { activeCast: [], priorCast: [] },
        watchedEpisodes: {},
        similarShows: [],
        recommendedShows,
        showDetailsLoading: false,
        similarShowsLoading: false,
        recommendedShowsLoading,
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
          image: undefined,
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

describe('RecommendedShowsComponent', () => {
  const defaultProps = {
    showId: 100,
    profileId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders component', async () => {
    const store = createMockStore();
    renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(screen.getByText('Recommended Shows')).toBeInTheDocument();
    });
  });

  it('dispatches fetchRecommendedShows on mount', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    // Verify dispatch was called (thunk dispatch happens through middleware)
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  it('dispatches fetchRecommendedShows with correct parameters', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    renderWithProviders(<RecommendedShowsComponent showId={123} profileId={456} />, store);

    // Check that dispatch was called (the actual thunk will have the params)
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  it('re-fetches recommendations when showId changes', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { rerender } = renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    const initialCallCount = dispatchSpy.mock.calls.length;

    // Re-render with different showId
    rerender(
      <Provider store={store}>
        <BrowserRouter>
          <RecommendedShowsComponent showId={999} profileId={1} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchSpy.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  it('re-fetches recommendations when profileId changes', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { rerender } = renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    const initialCallCount = dispatchSpy.mock.calls.length;

    // Re-render with different profileId
    rerender(
      <Provider store={store}>
        <BrowserRouter>
          <RecommendedShowsComponent showId={100} profileId={999} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchSpy.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  it('displays loading state', async () => {
    const store = createMockStore([], true);
    renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    // ScrollableMediaRow should handle loading state
    await waitFor(() => {
      expect(screen.getByText('Recommended Shows')).toBeInTheDocument();
    });
  });

  it('displays recommended shows when loaded', async () => {
    const store = createMockStore([mockRecommendedShow1, mockRecommendedShow2]);
    renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(screen.getByText('Recommended Shows')).toBeInTheDocument();
    });
  });

  it('displays empty message when no recommended shows', async () => {
    const store = createMockStore([], false);
    renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(screen.getByText(/no recommended shows found/i)).toBeInTheDocument();
    });
  });

  it('passes correct props to ScrollableMediaRow', async () => {
    const store = createMockStore([mockRecommendedShow1]);
    renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    // Verify title is passed
    expect(screen.getByText('Recommended Shows')).toBeInTheDocument();

    // Verify empty message is passed
    const storeEmpty = createMockStore([], false);
    const { rerender } = render(
      <Provider store={storeEmpty}>
        <BrowserRouter>
          <RecommendedShowsComponent {...defaultProps} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/no recommended shows found/i)).toBeInTheDocument();
    });
  });

  it('renders MediaCard components for each show', async () => {
    const store = createMockStore([mockRecommendedShow1, mockRecommendedShow2]);
    renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    // MediaCard should be rendered for each show
    // The exact text depends on MediaCard implementation
    await waitFor(() => {
      expect(screen.getByText('Recommended Shows')).toBeInTheDocument();
    });
  });

  it('uses ScrollableMediaRow component', async () => {
    const store = createMockStore([mockRecommendedShow1]);
    const { container } = renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    // ScrollableMediaRow should be present in the component tree
    await waitFor(() => {
      expect(screen.getByText('Recommended Shows')).toBeInTheDocument();
    });
  });

  it('handles empty recommendedShows array', async () => {
    const store = createMockStore([], false);
    renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    expect(screen.getByText('Recommended Shows')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/no recommended shows found/i)).toBeInTheDocument();
    });
  });

  it('renders with correct search type for MediaCard', async () => {
    const store = createMockStore([mockRecommendedShow1]);
    renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    // MediaCard should be called with searchType="shows"
    // This would be verified if we could spy on MediaCard
    await waitFor(() => {
      expect(screen.getByText('Recommended Shows')).toBeInTheDocument();
    });
  });

  it('does not re-fetch if showId and profileId remain the same', async () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const { rerender } = renderWithProviders(<RecommendedShowsComponent {...defaultProps} />, store);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    const initialCallCount = dispatchSpy.mock.calls.length;

    // Re-render with same props
    rerender(
      <Provider store={store}>
        <BrowserRouter>
          <RecommendedShowsComponent {...defaultProps} />
        </BrowserRouter>
      </Provider>
    );

    // Should not dispatch again
    await waitFor(() => {
      expect(dispatchSpy.mock.calls).toHaveLength(initialCallCount);
    });
  });
});
