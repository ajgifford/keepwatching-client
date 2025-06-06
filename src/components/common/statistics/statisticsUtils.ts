import { AccountStatisticsResponse, ProfileStatisticsResponse } from '@ajgifford/keepwatching-types';

export interface SummaryCardProps {
  progressLabel: string;
  progressValue: number;
  currentCount: number;
  totalCount: number;
  stats: Array<{
    value: number;
    label: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  }>;
}

export function getAccountSummaryProps(stats: AccountStatisticsResponse | null | undefined): SummaryCardProps | null {
  if (!stats) return null;

  return {
    progressLabel: 'Episode Watch Progress',
    progressValue: stats.episodeStatistics.watchProgress,
    currentCount: stats.episodeStatistics.watchedEpisodes,
    totalCount: stats.episodeStatistics.totalEpisodes,
    stats: [
      { value: stats.profileCount, label: 'Profiles', color: 'primary' },
      { value: stats.uniqueContent.showCount, label: 'Unique Shows', color: 'secondary' },
      { value: stats.uniqueContent.movieCount, label: 'Unique Movies', color: 'info' },
    ],
  };
}

export function getProfileSummaryProps(stats: ProfileStatisticsResponse | null | undefined): SummaryCardProps | null {
  if (!stats) return null;

  return {
    progressLabel: 'Overall Progress',
    progressValue: stats.episodeWatchProgress.overallProgress,
    currentCount: stats.episodeWatchProgress.watchedEpisodes,
    totalCount: stats.episodeWatchProgress.totalEpisodes,
    stats: [
      { value: stats.showStatistics.total, label: 'Shows', color: 'primary' },
      { value: stats.movieStatistics.total, label: 'Movies', color: 'secondary' },
      { value: stats.episodeWatchProgress.totalEpisodes, label: 'Episodes', color: 'success' },
    ],
  };
}

export function isAccountStatistics(
  stats: AccountStatisticsResponse | ProfileStatisticsResponse | null | undefined
): stats is AccountStatisticsResponse {
  return stats !== null && stats !== undefined && 'profileCount' in stats;
}

export function isProfileStatistics(
  stats: AccountStatisticsResponse | ProfileStatisticsResponse | null | undefined
): stats is ProfileStatisticsResponse {
  return (
    stats !== null &&
    stats !== undefined &&
    'episodeWatchProgress' in stats &&
    'showsProgress' in stats.episodeWatchProgress
  );
}
