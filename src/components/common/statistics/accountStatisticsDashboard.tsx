import { useMemo } from 'react';

import { Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import BaseStatisticsDashboard from './baseStatisticsDashboard';
import ContentBreakdownCard from './contentBreakdownCard';
import ContentSummaryCard from './contentSummaryCard';
import { getAccountSummaryProps } from './statisticsUtils';
import { getTopCategory, getTopCategoryPercentage } from './useStatisticsData';
import { AccountStatisticsResponse } from '@ajgifford/keepwatching-types';

interface AccountStatisticsDashboardProps {
  statistics?: AccountStatisticsResponse | null;
  isLoading?: boolean;
}

export default function AccountStatisticsDashboard({ statistics, isLoading = false }: AccountStatisticsDashboardProps) {
  const summaryCardProps = useMemo(() => {
    return getAccountSummaryProps(statistics);
  }, [statistics]);

  const contentSections = useMemo(() => {
    if (!statistics) return null;

    return (
      <>
        <Grid size={{ xs: 12, md: 6 }}>
          <ContentBreakdownCard
            title="Content Breakdown"
            items={[
              {
                label: 'Shows',
                total: statistics.showStatistics.total,
                progress: statistics.showStatistics.watchProgress,
                color: 'primary',
              },
              {
                label: 'Movies',
                total: statistics.movieStatistics.total,
                progress: statistics.movieStatistics.watchProgress,
                color: 'secondary',
              },
              {
                label: 'Episodes',
                total: statistics.episodeStatistics.totalEpisodes,
                progress: statistics.episodeStatistics.watchProgress,
                color: 'success',
              },
            ]}
          />
        </Grid>

        <Grid size={12}>
          <ContentSummaryCard title="Content Distribution Across Profiles">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {statistics.profileCount} active profiles with {statistics.uniqueContent.showCount} unique shows and{' '}
              {statistics.uniqueContent.movieCount} unique movies
            </Typography>
            <Typography variant="body2" paragraph>
              The account has an overall watch progress of{' '}
              <strong>{Math.round(statistics.episodeStatistics.watchProgress)}%</strong> across all content, with{' '}
              <strong>{statistics.episodeStatistics.watchedEpisodes}</strong> episodes watched out of{' '}
              <strong>{statistics.episodeStatistics.totalEpisodes}</strong> total episodes.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" paragraph>
              Shows are most often categorized as {getTopCategory(statistics.showStatistics.watchStatusCounts)} (
              {getTopCategoryPercentage(statistics.showStatistics.watchStatusCounts, statistics.showStatistics.total)}
              %), while movies are predominantly {getTopCategory(statistics.movieStatistics.watchStatusCounts)} (
              {getTopCategoryPercentage(statistics.movieStatistics.watchStatusCounts, statistics.movieStatistics.total)}
              %).
            </Typography>
          </ContentSummaryCard>
        </Grid>
      </>
    );
  }, [statistics]);

  return (
    <BaseStatisticsDashboard
      statistics={statistics}
      isLoading={isLoading}
      dashboardTitle="Account Statistics"
      summaryCardProps={summaryCardProps}
      contentSections={contentSections}
    />
  );
}
