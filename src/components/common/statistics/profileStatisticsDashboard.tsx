import { useMemo } from 'react';

import { Grid } from '@mui/material';

import BaseStatisticsDashboard from './baseStatisticsDashboard';
import ShowProgressCard from './showProgressCard';
import { getProfileSummaryProps } from './statisticsUtils';
import { ProfileStatisticsResponse } from '@ajgifford/keepwatching-types';

interface ProfileStatisticsDashboardProps {
  statistics?: ProfileStatisticsResponse | null;
  isLoading?: boolean;
}

export default function ProfileStatisticsDashboard({ statistics, isLoading = false }: ProfileStatisticsDashboardProps) {
  const summaryCardProps = useMemo(() => {
    return getProfileSummaryProps(statistics);
  }, [statistics]);

  const contentSections = useMemo(() => {
    if (!statistics) return null;

    return (
      <Grid item xs={12} md={6}>
        <ShowProgressCard
          title="Currently Watching Progress"
          shows={statistics.episodeWatchProgress.showsProgress}
          filter="WATCHING"
          maxHeight={300}
        />
      </Grid>
    );
  }, [statistics]);

  return (
    <BaseStatisticsDashboard
      statistics={statistics}
      isLoading={isLoading}
      dashboardTitle="Viewing Statistics"
      summaryCardProps={summaryCardProps}
      contentSections={contentSections}
    />
  );
}
