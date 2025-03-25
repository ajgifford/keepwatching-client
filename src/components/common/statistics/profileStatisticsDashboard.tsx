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
  Paper,
  Typography,
} from '@mui/material';

import { ProfileStatistics } from '../../../app/model/statistics';
import DistributionBarChart from './distributionBarChart';
import DistributionPieChart from './distributionPieChart';
import { ChartDataItem, convertToChartData } from './distributionTypes';
import WatchStatusChart, { WatchStatusDataItem } from './watchStatusChart';

interface ProfileStatisticsDashboardProps {
  statistics?: ProfileStatistics | null;
  isLoading?: boolean;
}

export default function ProfileStatisticsDashboard({ statistics, isLoading = false }: ProfileStatisticsDashboardProps) {
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
        combinedGenres[genre] = (combinedGenres[genre] || 0) + count;
      });
    }

    return convertToChartData(combinedGenres, 6);
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

  // Order shows by completion percentage (descending)
  const sortedShowsProgress = useMemo(() => {
    if (!statistics?.episodeWatchProgress.showsProgress) return [];
    return [...statistics.episodeWatchProgress.showsProgress].sort((a, b) => b.percentComplete - a.percentComplete);
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
        Viewing Statistics
      </Typography>

      {/* Overall Progress */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Overall Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={statistics.episodeWatchProgress.overallProgress}
                  color="success"
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {Math.round(statistics.episodeWatchProgress.overallProgress)}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {statistics.episodeWatchProgress.watchedEpisodes} of {statistics.episodeWatchProgress.totalEpisodes}{' '}
              episodes watched
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {statistics.showStatistics.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Shows
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  {statistics.movieStatistics.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Movies
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {statistics.episodeWatchProgress.totalEpisodes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Episodes
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
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

        {/* Shows Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Currently Watching Progress
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {sortedShowsProgress
                  .filter((show) => show.status === 'WATCHING')
                  .map((show, index) => (
                    <Box key={show.showId} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{show.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {show.watchedEpisodes}/{show.totalEpisodes}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={show.percentComplete}
                        color={show.percentComplete > 75 ? 'success' : show.percentComplete > 25 ? 'warning' : 'error'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      {index < sortedShowsProgress.filter((show) => show.status === 'WATCHING').length - 1 && (
                        <Divider sx={{ mt: 1 }} />
                      )}
                    </Box>
                  ))}
                {sortedShowsProgress.filter((show) => show.status === 'WATCHING').length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    {`You're not currently watching any shows`}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
