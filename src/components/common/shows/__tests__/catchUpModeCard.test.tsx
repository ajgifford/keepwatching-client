import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import activeShowSlice from '../../../../app/slices/activeShowSlice';
import { CatchUpModeCard } from '../catchUpModeCard';
import { ProfileEpisode, ProfileSeason, ProfileShowWithSeasons, WatchStatus } from '@ajgifford/keepwatching-types';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@ajgifford/keepwatching-ui', () => ({
  parseLocalDate: jest.fn((dateString: string) => {
    if (!dateString) return new Date(NaN);
    return new Date(dateString);
  }),
}));

jest.mock('../../../../app/hooks/useDateFormatters', () => ({
  useDateFormatters: () => ({
    contentDate: (date: string | Date | null | undefined) => (date ? new Date(date).toISOString().slice(0, 10) : ''),
  }),
}));

const createMockEpisode = (overrides: Partial<ProfileEpisode> = {}): ProfileEpisode => ({
  id: 1,
  tmdbId: 0,
  seasonId: 1,
  showId: 100,
  seasonNumber: 1,
  episodeNumber: 1,
  episodeType: 'regular',
  title: 'Episode',
  overview: '',
  runtime: 30,
  airDate: '2024-01-01',
  stillImage: '',
  profileId: 0,
  watchStatus: WatchStatus.NOT_WATCHED,
  ...overrides,
});

const createMockSeason = (overrides: Partial<ProfileSeason> = {}): ProfileSeason => ({
  id: 1,
  showId: 100,
  seasonNumber: 1,
  name: 'Season 1',
  overview: '',
  releaseDate: '2024-01-01',
  posterImage: '',
  episodes: [],
  profileId: 0,
  watchStatus: WatchStatus.NOT_WATCHED,
  tmdbId: 0,
  numberOfEpisodes: 0,
  ...overrides,
});

const createMockShow = (seasons: ProfileSeason[] | undefined): ProfileShowWithSeasons =>
  ({
    id: 100,
    title: 'Test Show',
    description: '',
    posterImage: '',
    backdropImage: '',
    releaseDate: '2024-01-01',
    status: 'Returning Series',
    network: '',
    streamingServices: '',
    genres: '',
    profileId: 0,
    watchStatus: WatchStatus.WATCHING,
    lastEpisode: null,
    nextEpisode: null,
    tmdbId: 0,
    userRating: 0,
    contentRating: '',
    seasonCount: seasons?.length ?? 0,
    episodeCount: seasons?.reduce((sum, s) => sum + s.episodes.length, 0) ?? 0,
    type: '',
    inProduction: false,
    lastAirDate: null,
    averageEpisodeRuntime: null,
    seasons,
  }) as ProfileShowWithSeasons;

const createMockStore = (show: ProfileShowWithSeasons | null) => {
  return configureStore({
    reducer: {
      activeShow: activeShowSlice,
    },
    preloadedState: {
      activeShow: {
        showWithSeasons: show,
        showCast: { activeCast: [], priorCast: [] },
        watchedEpisodes: {},
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

const renderWithStore = (show: ProfileShowWithSeasons | null) => {
  const store = createMockStore(show);
  return render(
    <Provider store={store}>
      <CatchUpModeCard />
    </Provider>
  );
};

describe('CatchUpModeCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-01').getTime());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when there is no show', () => {
    const { container } = renderWithStore(null);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the show has no remaining aired, unwatched episodes', () => {
    const season = createMockSeason({
      episodes: [createMockEpisode({ id: 1, watchStatus: WatchStatus.WATCHED, airDate: '2024-01-01' })],
    });
    const { container } = renderWithStore(createMockShow([season]));
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there are only 1-2 remaining episodes (below the catch-up threshold)', () => {
    const season = createMockSeason({
      episodes: [
        createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01' }),
        createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08' }),
      ],
    });
    const { container } = renderWithStore(createMockShow([season]));
    expect(container).toBeEmptyDOMElement();
  });

  it('renders remaining episode count and runtime', () => {
    const season = createMockSeason({
      episodes: [
        createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01', runtime: 45 }),
        createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08', runtime: 45 }),
        createMockEpisode({ id: 3, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-15', runtime: 45 }),
      ],
    });
    renderWithStore(createMockShow([season]));

    expect(screen.getByText(/3 episodes left/i)).toBeInTheDocument();
    expect(screen.getAllByText(/2 hours, 15 minutes/i).length).toBeGreaterThan(0);
  });

  it('shows a fallback message when pace cannot be estimated', () => {
    const season = createMockSeason({
      episodes: [
        createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01' }),
        createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08' }),
        createMockEpisode({ id: 3, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-15' }),
      ],
    });
    renderWithStore(createMockShow([season]));

    expect(screen.getByText(/not enough recent activity to estimate your pace/i)).toBeInTheDocument();
  });

  it('shows an estimated pace and completion date when there is enough recent activity', () => {
    const season = createMockSeason({
      episodes: [
        createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01' }),
        createMockEpisode({ id: 4, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08' }),
        createMockEpisode({ id: 5, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-15' }),
        createMockEpisode({
          id: 2,
          watchStatus: WatchStatus.WATCHED,
          airDate: '2023-12-01',
          watchedAt: '2024-05-18T00:00:00.000Z',
        }),
        createMockEpisode({
          id: 3,
          watchStatus: WatchStatus.WATCHED,
          airDate: '2023-12-08',
          watchedAt: '2024-05-25T00:00:00.000Z',
        }),
      ],
    });
    renderWithStore(createMockShow([season]));

    expect(screen.getByText(/at your recent pace/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.0 eps\/week/i)).toBeInTheDocument();
  });

  it('flags an incomplete runtime estimate when an episode is missing runtime', () => {
    const season = createMockSeason({
      episodes: [
        createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01', runtime: 0 }),
        createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08', runtime: 30 }),
        createMockEpisode({ id: 3, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-15', runtime: 30 }),
      ],
    });
    renderWithStore(createMockShow([season]));

    expect(screen.getByText(/estimate incomplete/i)).toBeInTheDocument();
  });
});
