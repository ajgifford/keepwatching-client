import React from 'react';

import { Box, Card, CardContent, Grid, Typography } from '@mui/material';

import DistributionBarChart from '../elements/distributionBarChart';
import DistributionPieChart from '../elements/distributionPieChart';
import { convertToChartData } from '../utils/distributionTypes';
import { ContentDepthStats } from '@ajgifford/keepwatching-types';

interface ContentDepthCardProps {
  stats: ContentDepthStats | null;
}

export const ContentDepthCard: React.FC<ContentDepthCardProps> = ({ stats }) => {
  if (!stats) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Content Depth Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const releaseYearData = convertToChartData(stats.releaseYearDistribution, 10);
  const maturityData = convertToChartData(stats.contentMaturityDistribution, 10);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Content Depth Analysis
        </Typography>

        <Grid container spacing={3}>
          {/* Average Episode Count */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="primary">
                {stats.averageEpisodeCountPerShow.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Episodes Per Show
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.averageEpisodeCountPerShow < 20
                  ? 'Preference for shorter series'
                  : stats.averageEpisodeCountPerShow > 50
                    ? 'Preference for long-running series'
                    : 'Balanced series length'}
              </Typography>
            </Box>
          </Grid>

          {/* Average Movie Runtime */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="primary">
                {stats.averageMovieRuntime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Movie Runtime (min)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.averageMovieRuntime < 90
                  ? 'Preference for shorter films'
                  : stats.averageMovieRuntime > 150
                    ? 'Preference for longer films'
                    : 'Standard length films'}
              </Typography>
            </Box>
          </Grid>

          {/* Release Year Distribution */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              Release Year Distribution
            </Typography>
            <DistributionBarChart data={releaseYearData} height={200} color="#4caf50" />
          </Grid>

          {/* Content Maturity Distribution */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              Content Maturity Ratings
            </Typography>
            <DistributionPieChart data={maturityData} height={300} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
