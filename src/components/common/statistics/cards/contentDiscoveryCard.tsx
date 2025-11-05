import React from 'react';

import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';

import { ContentDiscoveryStats } from '@ajgifford/keepwatching-types';

interface ContentDiscoveryCardProps {
  stats: ContentDiscoveryStats | null;
}

export const ContentDiscoveryCard: React.FC<ContentDiscoveryCardProps> = ({ stats }) => {
  if (!stats) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Content Discovery Patterns
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getRatioStatus = (ratio: number) => {
    if (ratio > 1) return { label: 'Backlog Shrinking', color: 'success', icon: <TrendingDownIcon /> };
    if (ratio < 0.8) return { label: 'Backlog Growing', color: 'warning', icon: <TrendingUpIcon /> };
    return { label: 'Balanced', color: 'info', icon: <TrendingFlatIcon /> };
  };

  const showRatioStatus = getRatioStatus(stats.watchToAddRatio.shows);
  const movieRatioStatus = getRatioStatus(stats.watchToAddRatio.movies);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Content Discovery Patterns
        </Typography>

        <Grid container spacing={3}>
          {/* Days Since Last Added */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="h3" color={stats.daysSinceLastContentAdded > 30 ? 'error' : 'primary'}>
                {stats.daysSinceLastContentAdded}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days Since Last Content Added
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.daysSinceLastContentAdded > 30
                  ? 'Time to discover new content!'
                  : 'Actively discovering content'}
              </Typography>
            </Box>
          </Grid>

          {/* Addition Rate */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Shows Added Per Month
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.contentAdditionRate.showsPerMonth.toFixed(1)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Movies Added Per Month
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.contentAdditionRate.moviesPerMonth.toFixed(1)}
              </Typography>
            </Box>
          </Grid>

          {/* Watch-to-Add Ratio */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              Watch-to-Add Ratio
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Values &gt; 1.0 mean your backlog is shrinking
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Shows</Typography>
                <Chip
                  label={showRatioStatus.label}
                  color={showRatioStatus.color as any}
                  size="small"
                  icon={showRatioStatus.icon}
                />
              </Box>
              <Typography variant="h4">{stats.watchToAddRatio.shows.toFixed(2)}</Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Movies</Typography>
                <Chip
                  label={movieRatioStatus.label}
                  color={movieRatioStatus.color as any}
                  size="small"
                  icon={movieRatioStatus.icon}
                />
              </Box>
              <Typography variant="h4">{stats.watchToAddRatio.movies.toFixed(2)}</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
