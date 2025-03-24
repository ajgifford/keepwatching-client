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
  useTheme,
} from '@mui/material';

import { ProfileStatistics } from '../../../app/model/statistics';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ProfileStatisticsDashboardProps {
  statistics?: ProfileStatistics | null;
  isLoading?: boolean;
}

const COLORS = ['#4CAF50', '#FFC107', '#F44336', '#2196F3', '#9C27B0', '#FF9800'];
const WATCH_STATUS_COLORS = {
  watched: '#4CAF50',
  watching: '#FFC107',
  notWatched: '#F44336',
};

export default function ProfileStatisticsDashboard({ statistics, isLoading = false }: ProfileStatisticsDashboardProps) {
  const theme = useTheme();

  const watchStatusData = useMemo(() => {
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

  const genreData = useMemo(() => {
    if (!statistics) return [];

    const showGenres = statistics.showStatistics.genreDistribution;
    const combinedGenres: Record<string, number> = { ...showGenres };

    // Combine with movie genres
    Object.entries(statistics.movieStatistics.genreDistribution).forEach(([genre, count]) => {
      combinedGenres[genre] = (combinedGenres[genre] || 0) + count;
    });

    return Object.entries(combinedGenres)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Take top 6 genres
  }, [statistics]);

  const serviceData = useMemo(() => {
    if (!statistics) return [];

    const showServices = statistics.showStatistics.serviceDistribution;
    const combinedServices: Record<string, number> = { ...showServices };

    // Combine with movie services
    Object.entries(statistics.movieStatistics.serviceDistribution).forEach(([service, count]) => {
      combinedServices[service] = (combinedServices[service] || 0) + count;
    });

    return Object.entries(combinedServices)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Take top 6 services
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={watchStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="watched" stackId="a" fill={WATCH_STATUS_COLORS.watched} name="Watched" />
                  <Bar dataKey="watching" stackId="a" fill={WATCH_STATUS_COLORS.watching} name="Watching" />
                  <Bar dataKey="notWatched" stackId="a" fill={WATCH_STATUS_COLORS.notWatched} name="Not Watched" />
                </BarChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceData} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="value" fill={theme.palette.primary.main} name="Count" />
                </BarChart>
              </ResponsiveContainer>
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
                      {index < sortedShowsProgress.length - 1 && <Divider sx={{ mt: 1 }} />}
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
