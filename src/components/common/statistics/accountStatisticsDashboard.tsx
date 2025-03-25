import { useMemo } from 'react';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Typography,
} from '@mui/material';

import { AccountStatistics } from '../../../app/model/statistics';
import DistributionBarChart from './distributionBarChart';
import DistributionPieChart from './distributionPieChart';
import { ChartDataItem, convertToChartData } from './distributionTypes';
import StatisticsSummaryCard from './statisticsSummaryCard';
import WatchStatusChart, { WatchStatusDataItem } from './watchStatusChart';

interface AccountStatisticsDashboardProps {
  statistics?: AccountStatistics | null;
  isLoading?: boolean;
}

export default function AccountStatisticsDashboard({ statistics, isLoading = false }: AccountStatisticsDashboardProps) {
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!statistics || (statistics.showStatistics.total === 0 && statistics.movieStatistics.total === 0)) {
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
        Account Statistics
      </Typography>

      {/* Overall Account Summary */}
      <StatisticsSummaryCard
        progressLabel="Episode Watch Progress"
        progressValue={statistics.episodeStatistics.watchProgress}
        currentCount={statistics.episodeStatistics.watchedEpisodes}
        totalCount={statistics.episodeStatistics.totalEpisodes}
        stats={[
          { value: statistics.profileCount, label: 'Profiles', color: 'primary' },
          { value: statistics.uniqueContent.showCount, label: 'Unique Shows', color: 'secondary' },
          { value: statistics.uniqueContent.movieCount, label: 'Unique Movies', color: 'info' },
        ]}
      />

      <Grid container spacing={4}>
        {/* Content Totals */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Content Breakdown
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body1">Shows</Typography>
                    <Typography variant="body1">{statistics.showStatistics.total}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={statistics.showStatistics.watchProgress}
                    color="primary"
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body1">Movies</Typography>
                    <Typography variant="body1">{statistics.movieStatistics.total}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={statistics.movieStatistics.watchProgress}
                    color="secondary"
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body1">Episodes</Typography>
                    <Typography variant="body1">{statistics.episodeStatistics.totalEpisodes}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={statistics.episodeStatistics.watchProgress}
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Watch Status Chart */}
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

        {/* Genre Distribution */}
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

        {/* Streaming Services */}
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

        {/* Profile Distribution */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Content Distribution Across Profiles
              </Typography>
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
                {getTopCategoryPercentage(
                  statistics.movieStatistics.watchStatusCounts,
                  statistics.movieStatistics.total
                )}
                %).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

// Helper functions
function getTopCategory(statusCounts: Record<string, number | undefined>): string {
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

function getTopCategoryPercentage(statusCounts: Record<string, number | undefined>, total: number): number {
  if (total === 0) return 0;

  const entries = Object.entries(statusCounts).filter(([_, count]) => count !== undefined);
  if (entries.length === 0) return 0;

  const topEntry = entries.reduce((max, current) => (current[1]! > (max[1] || 0) ? current : max), ['', undefined]);

  return Math.round(((topEntry[1] || 0) / total) * 100);
}
