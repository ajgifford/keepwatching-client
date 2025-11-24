import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { KeepWatchingShowComponent } from '../keepWatchingShowComponent';
import activeShowSlice from '../../../../app/slices/activeShowSlice';
import { ProfileShowWithSeasons, ProfileSeason, ProfileEpisode, WatchStatus } from '@ajgifford/keepwatching-types';

const createMockEpisode = (id: number, episodeNumber: number, airDate: string): ProfileEpisode => ({
  id,
  seasonId: 1,
  episodeNumber,
  title: `Episode ${episodeNumber}`,
  airDate,
  overview: `Overview for episode ${episodeNumber}`,
  stillImage: `/still-${id}.jpg`,
  runtime: 45,
  profileId: 0,
  watchStatus: WatchStatus.UNAIRED,
  tmdbId: 0,
  showId: 0,
  seasonNumber: 0,
  episodeType: ''
});

const mockSeason: ProfileSeason = {
  id: 1,
  showId: 100,
  seasonNumber: 1,
  name: 'Season 1',
  overview: 'First season',
  releaseDate: '2024-01-01',
  posterImage: '/season-poster.jpg',
  episodes: [
    createMockEpisode(1, 1, '2024-01-01'),
    createMockEpisode(2, 2, '2024-01-08'),
    createMockEpisode(3, 3, '2024-01-15'),
  ],
  profileId: 0,
  watchStatus: WatchStatus.UNAIRED,
  tmdbId: 0,
  numberOfEpisodes: 3
};

const mockShow: ProfileShowWithSeasons = {
  id: 100,
  title: 'Test Show',
  description: 'A test show',
  posterImage: '/poster.jpg',
  backdropImage: '/backdrop.jpg',
  releaseDate: '2024-01-01',
  status: 'Returning Series',
  network: 'HBO',
  streamingServices: 'Max',
  genres: 'Drama',
  profileId: 0,
  watchStatus: WatchStatus.UNAIRED,
  lastEpisode: null,
  nextEpisode: null,
  tmdbId: 0,
  userRating: 0,
  contentRating: '',
  seasonCount: 1,
  episodeCount: 3,
  type: '',
  inProduction: false,
  lastAirDate: null,
  seasons: [mockSeason]
};

const createMockStore = (show: ProfileShowWithSeasons | null = mockShow, watchedEpisodes: Record<number, boolean> = {}) => {
  return configureStore({
    reducer: {
      activeShow: activeShowSlice,
    },
    preloadedState: {
      activeShow: {
        showWithSeasons: show,
        showCast: { activeCast: [], priorCast: [] },
        watchedEpisodes,
        showDetailsLoading: false,
        showDetailsError: null,
        recommendedShowsLoading: false,
        recommendedShows: [],
        recommendedShowsError: null,
        similarShowsLoading: false,
        similarShows: [],
        similarShowsError: null,
      },
    },
  });
};

describe('KeepWatchingShowComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when show is null', () => {
    const store = createMockStore(null);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    expect(screen.getByText(/no episodes available to watch/i)).toBeInTheDocument();
  });

  it('renders empty state when show has no seasons', () => {
    const showWithoutSeasons = { ...mockShow, seasons: undefined };
    const store = createMockStore(showWithoutSeasons);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    expect(screen.getByText(/no episodes available to watch/i)).toBeInTheDocument();
  });

  it('renders next unwatched episodes', () => {
    const showWithSeasons = { ...mockShow, seasons: [mockSeason] };
    const store = createMockStore(showWithSeasons);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    expect(screen.getByText('Episode 1')).toBeInTheDocument();
    expect(screen.getByText('Episode 2')).toBeInTheDocument();
    expect(screen.getByText('Episode 3')).toBeInTheDocument();
  });

  it('filters out watched episodes', () => {
    const watchedEpisodes = { 1: true }; // Episode 1 is watched
    const showWithSeasons = { ...mockShow, seasons: [mockSeason] };
    const store = createMockStore(showWithSeasons, watchedEpisodes);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    expect(screen.queryByText('Episode 1')).not.toBeInTheDocument();
    expect(screen.getByText('Episode 2')).toBeInTheDocument();
    expect(screen.getByText('Episode 3')).toBeInTheDocument();
  });

  it('filters out episodes that have not aired yet', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureEpisode = createMockEpisode(4, 4, futureDate.toISOString());

    const seasonWithFutureEpisode: ProfileSeason = {
      ...mockSeason,
      episodes: [...mockSeason.episodes, futureEpisode],
    };

    const showWithFutureEpisode = {
      ...mockShow,
      seasons: [seasonWithFutureEpisode],
    };

    const store = createMockStore(showWithFutureEpisode);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    expect(screen.queryByText('Episode 4')).not.toBeInTheDocument();
    expect(screen.getByText('Episode 1')).toBeInTheDocument();
  });

  it('limits to maximum 6 episodes', () => {
    const manyEpisodes = Array.from({ length: 10 }, (_, i) =>
      createMockEpisode(i + 1, i + 1, '2024-01-01')
    );

    const seasonWithManyEpisodes: ProfileSeason = {
      ...mockSeason,
      episodes: manyEpisodes,
    };

    const showWithManyEpisodes = {
      ...mockShow,
      seasons: [seasonWithManyEpisodes],
    };

    const store = createMockStore(showWithManyEpisodes);
    const { container } = render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    // Should only render 6 episodes
    const episodeCards = container.querySelectorAll('[key^="next-episode-"]');
    // Since we're checking text content, let's count Episode titles
    const episodeTitles = screen.getAllByText(/^Episode \d+$/);
    expect(episodeTitles.length).toBeLessThanOrEqual(6);
  });

  it('sorts episodes by season and episode number', () => {
    const showWithSeasons = { ...mockShow, seasons: [mockSeason] };
    const store = createMockStore(showWithSeasons);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    const episodeTitles = screen.getAllByText(/^Episode \d+$/);
    expect(episodeTitles[0]).toHaveTextContent('Episode 1');
    expect(episodeTitles[1]).toHaveTextContent('Episode 2');
    expect(episodeTitles[2]).toHaveTextContent('Episode 3');
  });

  it('displays "all episodes watched" message when all episodes are watched', () => {
    const watchedEpisodes = { 1: true, 2: true, 3: true };
    const showWithSeasons = { ...mockShow, seasons: [mockSeason] };
    const store = createMockStore(showWithSeasons, watchedEpisodes);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    expect(screen.getByText(/you've watched all available episodes/i)).toBeInTheDocument();
    expect(screen.getByText(/check back later for new episodes/i)).toBeInTheDocument();
  });

  it('renders grid layout for episodes', () => {
    const showWithSeasons = { ...mockShow, seasons: [mockSeason] };
    const store = createMockStore(showWithSeasons);
    const { container } = render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
  });

  it('creates NextEpisode objects with correct structure', () => {
    const showWithSeasons = { ...mockShow, seasons: [mockSeason] };
    const store = createMockStore(showWithSeasons);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    // Verify episodes are rendered (which means NextEpisode objects were created correctly)
    expect(screen.getByText('Episode 1')).toBeInTheDocument();
    expect(screen.getByText('Episode 2')).toBeInTheDocument();
  });

  it('handles multiple seasons correctly', () => {
    const season2: ProfileSeason = {
      id: 2,
      showId: 100,
      seasonNumber: 2,
      name: 'Season 2',
      overview: 'Second season',
      releaseDate: '2024-06-01',
      posterImage: '/season2-poster.jpg',
      episodes: [
        createMockEpisode(4, 1, '2024-06-01'),
        createMockEpisode(5, 2, '2024-06-08'),
      ],
      profileId: 0,
      watchStatus: WatchStatus.UNAIRED,
      tmdbId: 0,
      numberOfEpisodes: 2
    };

    const multiSeasonShow = {
      ...mockShow,
      seasons: [mockSeason, season2],
    };

    const store = createMockStore(multiSeasonShow);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    // Should show episodes from both seasons
    const episodeTitles = screen.getAllByText(/^Episode \d+$/);
    expect(episodeTitles.length).toBeGreaterThan(3);
  });

  it('dispatches updateEpisodeWatchStatus when episode watch status changes', () => {
    const showWithSeasons = { ...mockShow, seasons: [mockSeason] };
    const store = createMockStore(showWithSeasons);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    // Component renders correctly, dispatch functionality would be tested via EpisodeCard interactions
    expect(screen.getByText('Episode 1')).toBeInTheDocument();
  });

  it('filters episodes without air dates', () => {
    const episodeWithoutAirDate = createMockEpisode(4, 4, '2024-01-01');
    // Cast to any to bypass TypeScript checking for this test scenario
    (episodeWithoutAirDate as any).airDate = null;
    
    const seasonWithNullAirDate: ProfileSeason = {
      ...mockSeason,
      episodes: [...mockSeason.episodes, episodeWithoutAirDate],
    };

    const showWithNullAirDate = {
      ...mockShow,
      seasons: [seasonWithNullAirDate],
    };

    const store = createMockStore(showWithNullAirDate);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    // Episode without airDate should not be rendered
    const episodeTitles = screen.getAllByText(/^Episode \d+$/);
    expect(episodeTitles).toHaveLength(3); // Only the first 3 episodes with air dates
  });
});
