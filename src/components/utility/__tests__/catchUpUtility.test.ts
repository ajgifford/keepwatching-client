import { calculateCatchUpStats } from '../catchUpUtility';
import { ProfileEpisode, ProfileSeason, ProfileShowWithSeasons, WatchStatus } from '@ajgifford/keepwatching-types';

jest.mock('@ajgifford/keepwatching-ui', () => ({
  parseLocalDate: jest.fn((dateString: string) => {
    if (!dateString) return new Date(NaN);
    return new Date(dateString);
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

describe('catchUpUtility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-01').getTime());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('calculateCatchUpStats', () => {
    it('returns null when show is null', () => {
      expect(calculateCatchUpStats(null)).toBeNull();
    });

    it('returns null when show has no seasons', () => {
      expect(calculateCatchUpStats(createMockShow(undefined))).toBeNull();
    });

    it('returns null when there are no remaining aired, unwatched episodes', () => {
      const season = createMockSeason({
        episodes: [
          createMockEpisode({ id: 1, watchStatus: WatchStatus.WATCHED, airDate: '2024-01-01' }),
          createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2099-01-01' }),
        ],
      });
      expect(calculateCatchUpStats(createMockShow([season]))).toBeNull();
    });

    it('returns null when there are only 1-2 remaining episodes (below the catch-up threshold)', () => {
      const season = createMockSeason({
        episodes: [
          createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01' }),
          createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08' }),
        ],
      });
      expect(calculateCatchUpStats(createMockShow([season]))).toBeNull();
    });

    it('returns stats once there are 3 or more remaining episodes (at the catch-up threshold)', () => {
      const season = createMockSeason({
        episodes: [
          createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01' }),
          createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08' }),
          createMockEpisode({ id: 3, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-15' }),
        ],
      });
      const stats = calculateCatchUpStats(createMockShow([season]));
      expect(stats?.totalEpisodesRemaining).toBe(3);
    });

    it('excludes unaired episodes from remaining counts', () => {
      const season = createMockSeason({
        episodes: [
          createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01', runtime: 40 }),
          createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08', runtime: 40 }),
          createMockEpisode({ id: 3, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-15', runtime: 40 }),
          createMockEpisode({ id: 4, watchStatus: WatchStatus.UNAIRED, airDate: '2099-01-01', runtime: 40 }),
        ],
      });
      const stats = calculateCatchUpStats(createMockShow([season]));
      expect(stats?.totalEpisodesRemaining).toBe(3);
      expect(stats?.totalRuntimeRemaining).toBe(120);
    });

    it('sums remaining episodes and runtime across seasons', () => {
      const seasonOne = createMockSeason({
        id: 1,
        seasonNumber: 1,
        episodes: [
          createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01', runtime: 45 }),
          createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08', runtime: 45 }),
        ],
      });
      const seasonTwo = createMockSeason({
        id: 2,
        seasonNumber: 2,
        episodes: [
          createMockEpisode({ id: 3, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-02-01', runtime: 50 }),
        ],
      });

      const stats = calculateCatchUpStats(createMockShow([seasonOne, seasonTwo]));
      expect(stats?.totalEpisodesRemaining).toBe(3);
      expect(stats?.totalRuntimeRemaining).toBe(140);
      expect(stats?.seasons).toHaveLength(2);
      expect(stats?.seasons[0]).toMatchObject({ seasonNumber: 1, episodesRemaining: 2, runtimeRemaining: 90 });
      expect(stats?.seasons[1]).toMatchObject({ seasonNumber: 2, episodesRemaining: 1, runtimeRemaining: 50 });
    });

    it('excludes skipped seasons from the backlog even when their episodes are unwatched and aired', () => {
      const skippedSeason = createMockSeason({
        id: 1,
        seasonNumber: 1,
        watchStatus: WatchStatus.SKIPPED,
        episodes: [
          createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01', runtime: 45 }),
          createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08', runtime: 45 }),
        ],
      });
      const activeSeason = createMockSeason({
        id: 2,
        seasonNumber: 2,
        episodes: [
          createMockEpisode({ id: 3, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-02-01', runtime: 30 }),
          createMockEpisode({ id: 4, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-02-08', runtime: 30 }),
          createMockEpisode({ id: 5, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-02-15', runtime: 30 }),
        ],
      });

      const stats = calculateCatchUpStats(createMockShow([skippedSeason, activeSeason]));

      expect(stats?.seasons).toHaveLength(1);
      expect(stats?.seasons[0].seasonNumber).toBe(2);
      expect(stats?.totalEpisodesRemaining).toBe(3);
      expect(stats?.totalRuntimeRemaining).toBe(90);
    });

    it('flags missing runtime and treats it as zero minutes', () => {
      const season = createMockSeason({
        episodes: [
          createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01', runtime: 0 }),
          createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08', runtime: 30 }),
          createMockEpisode({ id: 3, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-15', runtime: 20 }),
        ],
      });
      const stats = calculateCatchUpStats(createMockShow([season]));
      expect(stats?.hasMissingRuntime).toBe(true);
      expect(stats?.totalRuntimeRemaining).toBe(50);
      expect(stats?.seasons[0].hasMissingRuntime).toBe(true);
    });

    it('omits seasons with nothing remaining from the breakdown', () => {
      const finishedSeason = createMockSeason({
        id: 1,
        seasonNumber: 1,
        episodes: [createMockEpisode({ id: 1, watchStatus: WatchStatus.WATCHED, airDate: '2024-01-01' })],
      });
      const activeSeason = createMockSeason({
        id: 2,
        seasonNumber: 2,
        episodes: [
          createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-02-01' }),
          createMockEpisode({ id: 3, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-02-08' }),
          createMockEpisode({ id: 4, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-02-15' }),
        ],
      });
      const stats = calculateCatchUpStats(createMockShow([finishedSeason, activeSeason]));
      expect(stats?.seasons).toHaveLength(1);
      expect(stats?.seasons[0].seasonNumber).toBe(2);
    });

    it('returns null pace when there is not enough recent watch activity', () => {
      const season = createMockSeason({
        episodes: [
          createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01' }),
          createMockEpisode({ id: 5, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08' }),
          createMockEpisode({ id: 6, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-15' }),
          createMockEpisode({
            id: 2,
            watchStatus: WatchStatus.WATCHED,
            airDate: '2023-12-01',
            watchedAt: '2024-05-30T00:00:00.000Z',
          }),
        ],
      });
      const stats = calculateCatchUpStats(createMockShow([season]));
      expect(stats?.pace).toBeNull();
    });

    it('excludes prior-watch marks from the pace calculation', () => {
      const season = createMockSeason({
        episodes: [
          createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01' }),
          createMockEpisode({ id: 5, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08' }),
          createMockEpisode({ id: 6, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-15' }),
          createMockEpisode({
            id: 2,
            watchStatus: WatchStatus.WATCHED,
            airDate: '2023-12-01',
            watchedAt: '2024-05-20T00:00:00.000Z',
            isPriorWatch: true,
          }),
          createMockEpisode({
            id: 3,
            watchStatus: WatchStatus.WATCHED,
            airDate: '2023-12-08',
            watchedAt: '2024-05-25T00:00:00.000Z',
            isPriorWatch: true,
          }),
        ],
      });
      const stats = calculateCatchUpStats(createMockShow([season]));
      expect(stats?.pace).toBeNull();
    });

    it('computes episodes-per-week pace and an estimated completion date', () => {
      const season = createMockSeason({
        episodes: [
          createMockEpisode({ id: 1, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-01' }),
          createMockEpisode({ id: 2, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-08' }),
          createMockEpisode({ id: 3, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-15' }),
          createMockEpisode({ id: 4, watchStatus: WatchStatus.NOT_WATCHED, airDate: '2024-01-22' }),
          createMockEpisode({
            id: 5,
            watchStatus: WatchStatus.WATCHED,
            airDate: '2023-12-01',
            watchedAt: '2024-05-18T00:00:00.000Z',
          }),
          createMockEpisode({
            id: 6,
            watchStatus: WatchStatus.WATCHED,
            airDate: '2023-12-08',
            watchedAt: '2024-05-25T00:00:00.000Z',
          }),
        ],
      });
      // 2 episodes watched over a 7 day span => 2 episodes/week
      const stats = calculateCatchUpStats(createMockShow([season]));
      expect(stats?.totalEpisodesRemaining).toBe(4);
      expect(stats?.pace?.episodesPerWeek).toBeCloseTo(2, 5);
      expect(stats?.pace?.estimatedCompletionDate).not.toBeNull();

      // 4 remaining episodes at 2 eps/week => 2 weeks => 2024-06-15
      const estimated = new Date(stats!.pace!.estimatedCompletionDate as string);
      expect(estimated.toISOString().slice(0, 10)).toBe('2024-06-15');
    });
  });
});
