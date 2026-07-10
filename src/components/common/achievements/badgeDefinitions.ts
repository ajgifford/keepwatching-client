import { ComponentType } from 'react';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CakeIcon from '@mui/icons-material/Cake';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MovieIcon from '@mui/icons-material/Movie';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import TvIcon from '@mui/icons-material/Tv';
import { SvgIconProps } from '@mui/material';

import {
  Achievement,
  AchievementType,
  BadgeTier,
  MILESTONE_THRESHOLDS,
  Milestone,
  MilestoneStats,
  getBadgeTier,
} from '@ajgifford/keepwatching-types';

type SvgIconComponent = ComponentType<SvgIconProps>;

export type BadgeCategory = 'episodes' | 'movies' | 'hours' | 'showsCompleted' | 'anniversary' | 'firstWatch';

export interface BadgeInstance {
  /** Stable key for React lists and routing, e.g. "episodes-100" or "firstEpisode" */
  id: string;
  category: BadgeCategory;
  tier: BadgeTier;
  threshold: number;
  title: string;
  description: string;
  icon: SvgIconComponent;
  achieved: boolean;
  /** 0-100, only meaningful while locked */
  progress: number;
  achievedDate?: string;
}

const CATEGORY_ICON: Record<BadgeCategory, SvgIconComponent> = {
  episodes: TvIcon,
  movies: MovieIcon,
  hours: AccessTimeIcon,
  showsCompleted: CheckCircleIcon,
  anniversary: CakeIcon,
  firstWatch: PlayCircleIcon,
};

const CATEGORY_LABEL: Record<Exclude<BadgeCategory, 'firstWatch'>, string> = {
  episodes: 'Episodes Watched',
  movies: 'Movies Watched',
  hours: 'Hours Watched',
  showsCompleted: 'Shows Completed',
  anniversary: 'Year Anniversary',
};

function tieredBadges(
  category: Exclude<BadgeCategory, 'firstWatch'>,
  milestones: Milestone[],
  allAchievements: Achievement[],
  achievementType: AchievementType
): BadgeInstance[] {
  const thresholds = MILESTONE_THRESHOLDS[category];
  return thresholds.map((threshold, index) => {
    const milestone = milestones.find((m) => m.type === category && m.threshold === threshold);
    const achievement = allAchievements.find(
      (a) => a.achievementType === achievementType && a.thresholdValue === threshold
    );
    return {
      id: `${category}-${threshold}`,
      category,
      tier: getBadgeTier(index, thresholds.length),
      threshold,
      title: `${threshold} ${CATEGORY_LABEL[category]}`,
      description: `Reach ${threshold} ${CATEGORY_LABEL[category].toLowerCase()}`,
      icon: CATEGORY_ICON[category],
      achieved: milestone?.achieved ?? false,
      progress: milestone?.progress ?? 0,
      achievedDate: achievement?.achievedDate,
    };
  });
}

function describeFirstEpisode(metadata: Record<string, unknown> | undefined): string {
  const showName = metadata?.showName;
  const episodeName = metadata?.episodeName;
  if (typeof showName !== 'string' || typeof episodeName !== 'string') {
    return 'Watch your first episode';
  }
  const seasonNumber = metadata?.seasonNumber;
  const episodeNumber = metadata?.episodeNumber;
  const episodeCode =
    typeof seasonNumber === 'number' && typeof episodeNumber === 'number' ? ` (S${seasonNumber}E${episodeNumber})` : '';
  return `${showName} — ${episodeName}${episodeCode}`;
}

function describeFirstMovie(metadata: Record<string, unknown> | undefined): string {
  const movieName = metadata?.movieName;
  return typeof movieName === 'string' ? movieName : 'Watch your first movie';
}

const CATEGORY_ACHIEVEMENT_TYPE: Record<Exclude<BadgeCategory, 'firstWatch'>, AchievementType> = {
  episodes: AchievementType.EPISODES_WATCHED,
  movies: AchievementType.MOVIES_WATCHED,
  hours: AchievementType.HOURS_WATCHED,
  showsCompleted: AchievementType.SHOW_COMPLETED,
  anniversary: AchievementType.PROFILE_ANNIVERSARY,
};

/**
 * Builds the full badge catalog (locked and unlocked) from a profile's milestone stats. Tiered
 * categories (episodes/movies/hours/showsCompleted/anniversary) come from `milestones[]`, which
 * already carries one entry per threshold with `achieved`/`progress` populated regardless of
 * whether it's been reached yet. The two "first watch" badges are one-shot rather than tiered, so
 * they're derived directly from `firstEpisodeWatchedAt`/`firstMovieWatchedAt`.
 */
export function getBadgeCatalog(milestoneStats: MilestoneStats | null): BadgeInstance[] {
  if (!milestoneStats) {
    return [];
  }

  const { milestones, allAchievements } = milestoneStats;

  const badges: BadgeInstance[] = [
    ...tieredBadges('episodes', milestones, allAchievements, CATEGORY_ACHIEVEMENT_TYPE.episodes),
    ...tieredBadges('movies', milestones, allAchievements, CATEGORY_ACHIEVEMENT_TYPE.movies),
    ...tieredBadges('hours', milestones, allAchievements, CATEGORY_ACHIEVEMENT_TYPE.hours),
    ...tieredBadges('showsCompleted', milestones, allAchievements, CATEGORY_ACHIEVEMENT_TYPE.showsCompleted),
    ...tieredBadges('anniversary', milestones, allAchievements, CATEGORY_ACHIEVEMENT_TYPE.anniversary),
    {
      id: 'firstEpisode',
      category: 'firstWatch',
      tier: 'bronze',
      threshold: 1,
      title: 'First Episode Watched',
      description: describeFirstEpisode(milestoneStats.firstEpisodeMetadata),
      icon: CATEGORY_ICON.firstWatch,
      achieved: Boolean(milestoneStats.firstEpisodeWatchedAt),
      progress: milestoneStats.firstEpisodeWatchedAt ? 100 : 0,
      achievedDate: milestoneStats.firstEpisodeWatchedAt,
    },
    {
      id: 'firstMovie',
      category: 'firstWatch',
      tier: 'bronze',
      threshold: 1,
      title: 'First Movie Watched',
      description: describeFirstMovie(milestoneStats.firstMovieMetadata),
      icon: CATEGORY_ICON.firstWatch,
      achieved: Boolean(milestoneStats.firstMovieWatchedAt),
      progress: milestoneStats.firstMovieWatchedAt ? 100 : 0,
      achievedDate: milestoneStats.firstMovieWatchedAt,
    },
  ];

  return badges;
}

export function getUnlockedBadges(milestoneStats: MilestoneStats | null): BadgeInstance[] {
  return getBadgeCatalog(milestoneStats).filter((badge) => badge.achieved);
}

export function getRecentlyUnlockedBadges(milestoneStats: MilestoneStats | null, limit: number = 5): BadgeInstance[] {
  return getUnlockedBadges(milestoneStats)
    .filter((badge) => badge.achievedDate)
    .sort((a, b) => (b.achievedDate as string).localeCompare(a.achievedDate as string))
    .slice(0, limit);
}
