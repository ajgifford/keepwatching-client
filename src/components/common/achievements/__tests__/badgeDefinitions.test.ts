import { getBadgeCatalog, getRecentlyUnlockedBadges, getUnlockedBadges } from '../badgeDefinitions';
import { AchievementType, MilestoneStats, getBadgeTier } from '@ajgifford/keepwatching-types';

function buildMilestoneStats(overrides: Partial<MilestoneStats> = {}): MilestoneStats {
  return {
    totalEpisodesWatched: 0,
    totalMoviesWatched: 0,
    totalHoursWatched: 0,
    milestones: [],
    recentAchievements: [],
    allAchievements: [],
    ...overrides,
  };
}

describe('getBadgeTier', () => {
  it('splits a 12-entry threshold list into four roughly-equal quartiles', () => {
    expect(getBadgeTier(0, 12)).toBe('bronze');
    expect(getBadgeTier(2, 12)).toBe('bronze');
    expect(getBadgeTier(3, 12)).toBe('silver');
    expect(getBadgeTier(5, 12)).toBe('silver');
    expect(getBadgeTier(6, 12)).toBe('gold');
    expect(getBadgeTier(8, 12)).toBe('gold');
    expect(getBadgeTier(9, 12)).toBe('platinum');
    expect(getBadgeTier(11, 12)).toBe('platinum');
  });

  it('never returns an out-of-range tier for the last index of a short list', () => {
    expect(getBadgeTier(4, 5)).toBe('platinum');
  });
});

describe('getBadgeCatalog', () => {
  it('returns an empty catalog when there are no milestone stats', () => {
    expect(getBadgeCatalog(null)).toEqual([]);
  });

  it('includes one badge per threshold across all tiered categories, plus the two first-watch badges', () => {
    const catalog = getBadgeCatalog(buildMilestoneStats());

    // episodes(12) + movies(10) + hours(12) + showsCompleted(5) + anniversary(5) + firstWatch(2)
    expect(catalog).toHaveLength(46);
    expect(catalog.filter((b) => b.category === 'episodes')).toHaveLength(12);
    expect(catalog.filter((b) => b.category === 'movies')).toHaveLength(10);
    expect(catalog.filter((b) => b.category === 'hours')).toHaveLength(12);
    expect(catalog.filter((b) => b.category === 'showsCompleted')).toHaveLength(5);
    expect(catalog.filter((b) => b.category === 'anniversary')).toHaveLength(5);
    expect(catalog.filter((b) => b.category === 'firstWatch')).toHaveLength(2);
  });

  it('marks a tiered badge as achieved and carries its progress/unlock date from milestones and allAchievements', () => {
    const stats = buildMilestoneStats({
      milestones: [{ type: 'episodes', threshold: 100, achieved: true, progress: 100 }],
      allAchievements: [
        {
          description: '100 Episodes Watched',
          achievedDate: '2026-01-15T00:00:00.000Z',
          achievementType: AchievementType.EPISODES_WATCHED,
          thresholdValue: 100,
        },
      ],
    });

    const badge = getBadgeCatalog(stats).find((b) => b.id === 'episodes-100');

    expect(badge?.achieved).toBe(true);
    expect(badge?.achievedDate).toBe('2026-01-15T00:00:00.000Z');
  });

  it('marks a tiered badge as locked with progress when its milestone has not been reached', () => {
    const stats = buildMilestoneStats({
      milestones: [{ type: 'movies', threshold: 50, achieved: false, progress: 40 }],
    });

    const badge = getBadgeCatalog(stats).find((b) => b.id === 'movies-50');

    expect(badge?.achieved).toBe(false);
    expect(badge?.progress).toBe(40);
    expect(badge?.achievedDate).toBeUndefined();
  });

  it('derives the first-episode and first-movie badges directly from the watched-at fields', () => {
    const stats = buildMilestoneStats({
      firstEpisodeWatchedAt: '2025-05-01T00:00:00.000Z',
    });

    const catalog = getBadgeCatalog(stats);
    const firstEpisode = catalog.find((b) => b.id === 'firstEpisode');
    const firstMovie = catalog.find((b) => b.id === 'firstMovie');

    expect(firstEpisode?.achieved).toBe(true);
    expect(firstEpisode?.achievedDate).toBe('2025-05-01T00:00:00.000Z');
    expect(firstEpisode?.description).toBe('Watch your first episode');
    expect(firstMovie?.achieved).toBe(false);
    expect(firstMovie?.progress).toBe(0);
  });

  it('describes the first-episode badge with the show/episode title when metadata is available', () => {
    const stats = buildMilestoneStats({
      firstEpisodeWatchedAt: '2025-05-01T00:00:00.000Z',
      firstEpisodeMetadata: { showName: 'Breaking Bad', episodeName: 'Pilot', seasonNumber: 1, episodeNumber: 1 },
    });

    const firstEpisode = getBadgeCatalog(stats).find((b) => b.id === 'firstEpisode');

    expect(firstEpisode?.description).toBe('Breaking Bad — Pilot (S1E1)');
  });

  it('describes the first-movie badge with the movie title when metadata is available', () => {
    const stats = buildMilestoneStats({
      firstMovieWatchedAt: '2025-05-01T00:00:00.000Z',
      firstMovieMetadata: { movieName: 'The Shawshank Redemption' },
    });

    const firstMovie = getBadgeCatalog(stats).find((b) => b.id === 'firstMovie');

    expect(firstMovie?.description).toBe('The Shawshank Redemption');
  });
});

describe('getUnlockedBadges', () => {
  it('returns only achieved badges', () => {
    const stats = buildMilestoneStats({
      milestones: [
        { type: 'episodes', threshold: 10, achieved: true, progress: 100 },
        { type: 'episodes', threshold: 25, achieved: false, progress: 40 },
      ],
    });

    const unlocked = getUnlockedBadges(stats);

    expect(unlocked.every((b) => b.achieved)).toBe(true);
    expect(unlocked.some((b) => b.id === 'episodes-10')).toBe(true);
    expect(unlocked.some((b) => b.id === 'episodes-25')).toBe(false);
  });
});

describe('getRecentlyUnlockedBadges', () => {
  it('sorts unlocked badges by achieved date, most recent first, and respects the limit', () => {
    const stats = buildMilestoneStats({
      milestones: [
        { type: 'episodes', threshold: 10, achieved: true, progress: 100 },
        { type: 'movies', threshold: 5, achieved: true, progress: 100 },
      ],
      allAchievements: [
        {
          description: '10 Episodes Watched',
          achievedDate: '2026-01-01T00:00:00.000Z',
          achievementType: AchievementType.EPISODES_WATCHED,
          thresholdValue: 10,
        },
        {
          description: '5 Movies Watched',
          achievedDate: '2026-02-01T00:00:00.000Z',
          achievementType: AchievementType.MOVIES_WATCHED,
          thresholdValue: 5,
        },
      ],
    });

    const recent = getRecentlyUnlockedBadges(stats, 1);

    expect(recent).toHaveLength(1);
    expect(recent[0].id).toBe('movies-5');
  });

  it('excludes unlocked badges without a known achieved date', () => {
    const stats = buildMilestoneStats({
      firstEpisodeWatchedAt: '2025-01-01T00:00:00.000Z',
      firstMovieWatchedAt: undefined,
      milestones: [{ type: 'episodes', threshold: 10, achieved: true, progress: 100 }],
    });

    const recent = getRecentlyUnlockedBadges(stats, 10);

    // episodes-10 has no matching allAchievements entry in this fixture, so it has no
    // achievedDate and should be excluded even though it's unlocked; firstEpisode has a date.
    expect(recent.map((b) => b.id)).toEqual(['firstEpisode']);
  });
});
