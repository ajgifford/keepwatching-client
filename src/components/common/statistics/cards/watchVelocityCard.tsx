import { useMemo } from 'react';

import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Card, CardContent, Chip, Divider, Grid, Typography, useTheme } from '@mui/material';

import { WatchingVelocityStats } from '@ajgifford/keepwatching-types';

interface WatchVelocityCardProps {
  velocityData?: WatchingVelocityStats | null;
  isLoading?: boolean;
}

const WatchVelocityCard = ({ velocityData, isLoading = false }: WatchVelocityCardProps) => {
  const theme = useTheme();

  const trendIcon = useMemo(() => {
    if (!velocityData?.velocityTrend) return null;

    switch (velocityData.velocityTrend) {
      case 'increasing':
        return <TrendingUpIcon color="success" />;
      case 'decreasing':
        return <TrendingDownIcon color="error" />;
      case 'stable':
        return <TrendingFlatIcon color="info" />;
      default:
        return null;
    }
  }, [velocityData?.velocityTrend]);

  const trendColor = useMemo(() => {
    if (!velocityData?.velocityTrend) return 'default';

    switch (velocityData.velocityTrend) {
      case 'increasing':
        return 'success';
      case 'decreasing':
        return 'error';
      case 'stable':
        return 'info';
      default:
        return 'default';
    }
  }, [velocityData?.velocityTrend]);

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Watching Velocity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            Loading...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!velocityData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Watching Velocity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No velocity data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Watching Velocity</Typography>
          {velocityData.velocityTrend && (
            <Chip
              icon={trendIcon || undefined}
              label={velocityData.velocityTrend.charAt(0).toUpperCase() + velocityData.velocityTrend.slice(1)}
              color={trendColor}
              size="small"
            />
          )}
        </Box>

        <Grid container spacing={2}>
          {/* Episodes Per Period */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
              <Typography variant="h4" color="primary">
                {velocityData.averageEpisodesPerDay.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Episodes / Day
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
              <Typography variant="h4" color="primary">
                {velocityData.episodesPerWeek.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Episodes / Week
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
              <Typography variant="h4" color="primary">
                {velocityData.episodesPerMonth.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Episodes / Month
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Peak Activity Patterns */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Most Active Day
              </Typography>
              <Typography variant="h6" color="text.primary">
                {velocityData.mostActiveDay || 'N/A'}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Most Active Hour
              </Typography>
              <Typography variant="h6" color="text.primary">
                {velocityData.mostActiveHour !== null
                  ? `${velocityData.mostActiveHour}:00 - ${velocityData.mostActiveHour + 1}:00`
                  : 'N/A'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WatchVelocityCard;
