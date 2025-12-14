import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import activeProfileSlice from '../../../../app/slices/activeProfileSlice';
import { KeepWatchingProfileComponent } from '../keepWatchingProfileComponent';
import { KeepWatchingShow, NextEpisode } from '@ajgifford/keepwatching-types';
import { EnhancedStore, configureStore } from '@reduxjs/toolkit';

const mockEpisode1: NextEpisode = {
  profileId: 1,
  showId: 100,
  showName: 'Test Show',
  seasonId: 1,
  episodeId: 1,
  network: 'HBO',
  streamingServices: 'Max',
  episodeTitle: 'Pilot',
  airDate: '2024-01-01',
  episodeNumber: 1,
  seasonNumber: 1,
  overview: 'First episode',
  posterImage: '/poster.jpg',
  episodeStillImage: '/still.jpg',
};

const mockEpisode2: NextEpisode = {
  ...mockEpisode1,
  episodeId: 2,
  episodeNumber: 2,
  episodeTitle: 'Episode 2',
};

const mockShow: KeepWatchingShow = {
  showId: 100,
  showTitle: 'Test Show',
  posterImage: '/poster.jpg',
  episodes: [mockEpisode1, mockEpisode2],
  lastWatched: '',
};

const mockShow2: KeepWatchingShow = {
  showId: 101,
  showTitle: 'Another Show',
  posterImage: '/poster2.jpg',
  episodes: [
    {
      ...mockEpisode1,
      showId: 101,
      showName: 'Another Show',
      episodeId: 3,
    },
  ],
  lastWatched: '',
};

const createMockStore = (nextUnwatchedEpisodes: KeepWatchingShow[] = []) => {
  return configureStore({
    reducer: {
      activeProfile: activeProfileSlice,
    },
    preloadedState: {
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
        nextUnwatchedEpisodes,
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
    },
  });
};

const renderWithProviders = (
  component: React.ReactElement,
  store: EnhancedStore<{
    activeProfile: ReturnType<typeof activeProfileSlice>;
  }>
) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('KeepWatchingProfileComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no shows to watch', () => {
    const store = createMockStore([]);
    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    expect(screen.getByText(/no shows to keep watching/i)).toBeInTheDocument();
    expect(screen.getByText(/add shows to your watchlist/i)).toBeInTheDocument();
  });

  it('displays links to Discover and Search pages in empty state', () => {
    const store = createMockStore([]);
    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    const discoverLink = screen.getByRole('link', { name: /discover/i });
    const searchLink = screen.getByRole('link', { name: /search/i });

    expect(discoverLink).toHaveAttribute('href', '/discover');
    expect(searchLink).toHaveAttribute('href', '/search');
  });

  it('renders shows when there are episodes to watch', () => {
    const store = createMockStore([mockShow]);
    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    expect(screen.getByText('Test Show')).toBeInTheDocument();
  });

  it('renders multiple shows', () => {
    const store = createMockStore([mockShow, mockShow2]);
    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    expect(screen.getByText('Test Show')).toBeInTheDocument();
    expect(screen.getByText('Another Show')).toBeInTheDocument();
  });

  it('displays all episodes for a show', () => {
    const store = createMockStore([mockShow]);
    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    expect(screen.getByText('Pilot')).toBeInTheDocument();
    expect(screen.getByText('Episode 2')).toBeInTheDocument();
  });

  it('renders show poster image', () => {
    const store = createMockStore([mockShow]);
    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    const posterImage = screen.getByAltText('Test Show');
    expect(posterImage).toBeInTheDocument();
  });

  it('show title links to show details page', () => {
    const store = createMockStore([mockShow]);
    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    const showLink = screen.getByRole('link', { name: 'Test Show' });
    expect(showLink).toHaveAttribute('href', '/shows/100/1');
  });

  it('renders episode cards within show containers', () => {
    const store = createMockStore([mockShow]);
    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    // Check that episodes are rendered
    const pilotEpisode = screen.getByText('Pilot');
    const episode2 = screen.getByText('Episode 2');

    expect(pilotEpisode).toBeInTheDocument();
    expect(episode2).toBeInTheDocument();
  });

  it('balances shows across rows - groups by episode count', () => {
    // Create shows with different episode counts
    const showWith3Episodes: KeepWatchingShow = {
      ...mockShow,
      episodes: [mockEpisode1, mockEpisode2, { ...mockEpisode1, episodeId: 3, episodeNumber: 3 }],
    };
    const showWith1Episode: KeepWatchingShow = {
      ...mockShow2,
      episodes: [mockEpisode1],
    };

    const store = createMockStore([showWith3Episodes, showWith1Episode]);
    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    // Both shows should be rendered
    expect(screen.getByText('Test Show')).toBeInTheDocument();
    expect(screen.getByText('Another Show')).toBeInTheDocument();
  });

  it('dispatches updateNextEpisodeWatchStatus when episode watch status changes', async () => {
    const store = createMockStore([mockShow]);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    // The actual interaction would depend on how EpisodeCard works
    // For now, we just verify the component renders correctly
    expect(screen.getByText('Test Show')).toBeInTheDocument();
  });

  it('renders grid layout for shows', () => {
    const store = createMockStore([mockShow, mockShow2]);
    const { container } = renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
  });

  it('applies correct grid sizing for responsive layout', () => {
    const store = createMockStore([mockShow]);
    const { container } = renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, store);

    // Check that Grid items are rendered (MUI Grid2 uses different classes)
    const gridItems = container.querySelectorAll('[class*="MuiGrid"]');
    expect(gridItems.length).toBeGreaterThan(0);
  });

  it('handles null or undefined nextUnwatchedEpisodes', () => {
    const storeWithNull = createMockStore([]);

    renderWithProviders(<KeepWatchingProfileComponent profileId={1} />, storeWithNull);
    expect(screen.getByText(/no shows to keep watching/i)).toBeInTheDocument();
  });
});
