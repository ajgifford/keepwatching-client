import { ReactNode } from 'react';

import { Box, Card, CardContent, CircularProgress, Container, Grid, Typography } from '@mui/material';

import DistributionBarChart from './distributionBarChart';
import DistributionPieChart from './distributionPieChart';
import StatisticsSummaryCard from './statisticsSummaryCard';
import { useStatisticsData } from './useStatisticsData';
import WatchStatusChart from './watchStatusChart';
import { AccountStatisticsResponse, ProfileStatisticsResponse } from '@ajgifford/keepwatching-types';

export interface BaseStatisticsDashboardProps {
  statistics?: AccountStatisticsResponse | ProfileStatisticsResponse | null;
  isLoading?: boolean;
  dashboardTitle: string;
  summaryCardProps: {
    progressLabel: string;
    progressValue: number;
    currentCount: number;
    totalCount: number;
    stats: Array<{
      value: number;
      label: string;
      color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    }>;
  } | null;
  contentSections?: ReactNode;
}

export default function BaseStatisticsDashboard({
  statistics,
  isLoading = false,
  dashboardTitle,
  summaryCardProps,
  contentSections,
}: BaseStatisticsDashboardProps) {
  const { watchStatusData, genreData, serviceData } = useStatisticsData(statistics);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No statistics available
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {dashboardTitle}
      </Typography>

      {summaryCardProps && <StatisticsSummaryCard {...summaryCardProps} />}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Watch Status
              </Typography>
              <WatchStatusChart data={watchStatusData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Genres
              </Typography>
              {genreData.length > 0 ? (
                <DistributionPieChart data={genreData} />
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No genre data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Streaming Services
              </Typography>
              {serviceData.length > 0 ? (
                <DistributionBarChart data={serviceData} />
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No streaming service data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Custom content sections */}
        {contentSections}
      </Grid>
    </Container>
  );
}
