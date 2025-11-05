import React from 'react';

import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';

import { UnairedContentStats } from '@ajgifford/keepwatching-types';

interface UnairedContentCardProps {
  stats: UnairedContentStats | null;
}

export const UnairedContentCard: React.FC<UnairedContentCardProps> = ({ stats }) => {
  if (!stats) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Unaired Content
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const totalUnaired =
    stats.unairedShowCount + stats.unairedSeasonCount + stats.unairedMovieCount + stats.unairedEpisodeCount;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Unaired Content Awaiting Release
        </Typography>

        {totalUnaired === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">All content has aired - nothing to wait for!</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {/* Shows */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <TvIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats.unairedShowCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Shows
                </Typography>
              </Box>
            </Grid>

            {/* Seasons */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <VideoLibraryIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" color="secondary">
                  {stats.unairedSeasonCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seasons
                </Typography>
              </Box>
            </Grid>

            {/* Episodes */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <TvIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info">
                  {stats.unairedEpisodeCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Episodes
                </Typography>
              </Box>
            </Grid>

            {/* Movies */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <MovieIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning">
                  {stats.unairedMovieCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Movies
                </Typography>
              </Box>
            </Grid>

            {/* Summary */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  You&apos;re tracking {totalUnaired} pieces of content awaiting release
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
