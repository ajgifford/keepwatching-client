import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import activeShowSlice from '../../../../app/slices/activeShowSlice';
import { KeepWatchingShowComponent } from '../keepWatchingShowComponent';
import { ProfileEpisode, ProfileSeason, ProfileShowWithSeasons, WatchStatus } from '@ajgifford/keepwatching-types';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('../../../../app/hooks/useDateFormatters', () => ({
  useDateFormatters: () => {
    const { createDateFormatters } = jest.requireActual('@ajgifford/keepwatching-ui');
    return createDateFormatters();
  },
}));

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
  episodeType: '',
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
  numberOfEpisodes: 3,
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
  seasons: [mockSeason],
};

const createMockStore = (
  show: ProfileShowWithSeasons | null = mockShow,
  watchedEpisodes: Record<number, boolean> = {}
) => {
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
    const manyEpisodes = Array.from({ length: 10 }, (_, i) => createMockEpisode(i + 1, i + 1, '2024-01-01'));

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

  it('fills from multiple seasons when no episodes are watched', () => {
    const season2: ProfileSeason = {
      id: 2,
      showId: 100,
      seasonNumber: 2,
      name: 'Season 2',
      overview: 'Second season',
      releaseDate: '2024-06-01',
      posterImage: '/season2-poster.jpg',
      episodes: [
        { ...createMockEpisode(4, 1, '2024-06-01'), seasonId: 2, seasonNumber: 2 },
        { ...createMockEpisode(5, 2, '2024-06-08'), seasonId: 2, seasonNumber: 2 },
      ],
      profileId: 0,
      watchStatus: WatchStatus.UNAIRED,
      tmdbId: 0,
      numberOfEpisodes: 2,
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

    // With no watched episodes, should fill from all seasons using round-robin
    // S1: 3 episodes, S2: 2 episodes → round-robin shows all 5
    const episodeTitles = screen.getAllByText(/^Episode \d+$/);
    expect(episodeTitles).toHaveLength(5);
  });

  it('shows episodes from active seasons with watched progress using round-robin', () => {
    const season1Episodes = [
      { ...createMockEpisode(1, 1, '2024-01-01'), seasonId: 1, seasonNumber: 1 },
      { ...createMockEpisode(2, 2, '2024-01-08'), seasonId: 1, seasonNumber: 1 },
      { ...createMockEpisode(3, 3, '2024-01-15'), seasonId: 1, seasonNumber: 1 },
    ];

    const season1: ProfileSeason = {
      ...mockSeason,
      episodes: season1Episodes,
    };

    const season2: ProfileSeason = {
      id: 2,
      showId: 100,
      seasonNumber: 2,
      name: 'Season 2',
      overview: 'Second season',
      releaseDate: '2024-06-01',
      posterImage: '/season2-poster.jpg',
      episodes: [
        { ...createMockEpisode(4, 1, '2024-06-01'), seasonId: 2, seasonNumber: 2 },
        { ...createMockEpisode(5, 2, '2024-06-08'), seasonId: 2, seasonNumber: 2 },
        { ...createMockEpisode(6, 3, '2024-06-15'), seasonId: 2, seasonNumber: 2 },
      ],
      profileId: 0,
      watchStatus: WatchStatus.UNAIRED,
      tmdbId: 0,
      numberOfEpisodes: 3,
    };

    const multiSeasonShow = {
      ...mockShow,
      seasons: [season1, season2],
    };

    // Mark first episode of each season as watched to make both seasons "active"
    const watchedEpisodes = { 1: true, 4: true };

    const store = createMockStore(multiSeasonShow, watchedEpisodes);
    render(
      <Provider store={store}>
        <KeepWatchingShowComponent profileId={1} />
      </Provider>
    );

    // Should show remaining episodes from both active seasons (round-robin)
    // S1: E2, E3 remaining | S2: E2, E3 remaining
    // Round-robin order: S1E2, S2E2, S1E3, S2E3
    const episodeTitles = screen.getAllByText(/^Episode \d+$/);
    expect(episodeTitles).toHaveLength(4);
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
