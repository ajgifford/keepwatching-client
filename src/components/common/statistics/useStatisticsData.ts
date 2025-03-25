import { useMemo } from 'react';

import { AccountStatistics, ProfileStatistics } from '../../../app/model/statistics';
import { ChartDataItem, convertToChartData } from './distributionTypes';
import { WatchStatusDataItem } from './watchStatusChart';

export function useStatisticsData(statistics: AccountStatistics | ProfileStatistics | null | undefined) {
  const watchStatusData = useMemo((): WatchStatusDataItem[] => {
    if (!statistics) return [];

    const showCounts = statistics.showStatistics.watchStatusCounts;
    const movieCounts = statistics.movieStatistics.watchStatusCounts;

    return [
      {
        name: 'Shows',
        watched: showCounts.watched || 0,
        watching: showCounts.watching || 0,
        notWatched: showCounts.notWatched || 0,
      },
      {
        name: 'Movies',
        watched: movieCounts.watched || 0,
        watching: movieCounts.watching || 0,
        notWatched: movieCounts.notWatched || 0,
      },
    ];
  }, [statistics]);

  const genreData = useMemo((): ChartDataItem[] => {
    if (!statistics) return [];

    const showGenres = statistics.showStatistics.genreDistribution;
    const combinedGenres: Record<string, number> = { ...showGenres };

    if (statistics.movieStatistics.genreDistribution) {
      Object.entries(statistics.movieStatistics.genreDistribution).forEach(([genre, count]) => {
        if (genre !== '') {
          combinedGenres[genre] = (combinedGenres[genre] || 0) + count;
        }
      });
    }

    return convertToChartData(combinedGenres);
  }, [statistics]);

  const serviceData = useMemo((): ChartDataItem[] => {
    if (!statistics) return [];

    const showServices = statistics.showStatistics.serviceDistribution;
    const combinedServices: Record<string, number> = { ...showServices };

    if (statistics.movieStatistics.serviceDistribution) {
      Object.entries(statistics.movieStatistics.serviceDistribution).forEach(([service, count]) => {
        combinedServices[service] = (combinedServices[service] || 0) + count;
      });
    }

    return convertToChartData(combinedServices, 8);
  }, [statistics]);

  return { watchStatusData, genreData, serviceData };
}

// Helper functions for statistics processing
export function getTopCategory(statusCounts: Record<string, number | undefined>): string {
  const entries = Object.entries(statusCounts).filter(([_, count]) => count !== undefined);
  if (entries.length === 0) return 'not categorized';

  const topEntry = entries.reduce((max, current) => (current[1]! > (max[1] || 0) ? current : max), ['', undefined]);

  // Convert key to display name
  return topEntry[0] === 'watched'
    ? 'Watched'
    : topEntry[0] === 'watching'
      ? 'Watching'
      : topEntry[0] === 'notWatched'
        ? 'Not Watched'
        : topEntry[0];
}

export function getTopCategoryPercentage(statusCounts: Record<string, number | undefined>, total: number): number {
  if (total === 0) return 0;

  const entries = Object.entries(statusCounts).filter(([_, count]) => count !== undefined);
  if (entries.length === 0) return 0;

  const topEntry = entries.reduce((max, current) => (current[1]! > (max[1] || 0) ? current : max), ['', undefined]);

  return Math.round(((topEntry[1] || 0) / total) * 100);
}
