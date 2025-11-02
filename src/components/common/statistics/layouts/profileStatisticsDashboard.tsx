import { useMemo } from 'react';

import Grid from '@mui/material/Grid2';

import ShowProgressCard from '../cards/showProgressCard';
import { getProfileSummaryProps } from '../utils/statisticsUtils';
import BaseStatisticsDashboard from './baseStatisticsDashboard';
import { ProfileStatisticsResponse, WatchStatus } from '@ajgifford/keepwatching-types';

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
      <Grid size={{ xs: 12, md: 6 }}>
        <ShowProgressCard
          title="Active Shows Progress"
          shows={statistics.episodeWatchProgress.showsProgress}
          filters={[WatchStatus.WATCHING, WatchStatus.UP_TO_DATE]}
          maxHeight={300}
          maxItems={10}
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
