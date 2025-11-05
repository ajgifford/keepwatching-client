import React from 'react';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Box, Card, CardContent, Grid, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { SeasonalViewingStats } from '@ajgifford/keepwatching-types';

interface SeasonalViewingCardProps {
  stats: SeasonalViewingStats | null;
}

export const SeasonalViewingCard: React.FC<SeasonalViewingCardProps> = ({ stats }) => {
  const theme = useTheme();

  if (!stats) {
    return null;
  }

  // Prepare seasonal data for chart
  const seasonalData = [
    { name: 'Spring', episodes: stats.viewingBySeason.spring },
    { name: 'Summer', episodes: stats.viewingBySeason.summer },
    { name: 'Fall', episodes: stats.viewingBySeason.fall },
    { name: 'Winter', episodes: stats.viewingBySeason.winter },
  ];

  // Prepare monthly data for chart (sorted by month order)
  const monthOrder = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthlyData = monthOrder.map((month) => ({
    name: month.substring(0, 3), // Abbreviate month names
    episodes: stats.viewingByMonth[month] || 0,
  }));

  // Color mapping for seasons
  const seasonColors: Record<string, string> = {
    Spring: theme.palette.success.main,
    Summer: theme.palette.warning.main,
    Fall: theme.palette.error.main,
    Winter: theme.palette.info.main,
  };

  const hasSeasonalData = seasonalData.some((s) => s.episodes > 0);
  const hasMonthlyData = monthlyData.length > 0;

  // Calculate total episodes for percentage-based fill
  const totalSeasonalEpisodes = seasonalData.reduce((sum, s) => sum + s.episodes, 0);
  const totalMonthlyEpisodes = monthlyData.reduce((sum, m) => sum + m.episodes, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarMonthIcon color="primary" />
            <Typography variant="h6">Seasonal Viewing Patterns</Typography>
          </Box>

          {/* Peak and Slowest Months */}
          {stats.peakViewingMonth !== 'N/A' && (
            <Stack spacing={1}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Peak Viewing Month
                </Typography>
                <Typography variant="h5" color="success.main">
                  {stats.peakViewingMonth}
                </Typography>
              </Box>

              {stats.slowestViewingMonth !== 'N/A' && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Slowest Viewing Month
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {stats.slowestViewingMonth}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}

          {/* Seasonal Heat Map */}
          {hasSeasonalData && (
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Episodes by Season
              </Typography>
              <Grid container spacing={1}>
                {seasonalData.map((season) => (
                  <Grid size={{ xs: 3 }} key={season.name}>
                    <Tooltip
                      title={`${season.episodes} episodes (${totalSeasonalEpisodes > 0 ? ((season.episodes / totalSeasonalEpisodes) * 100).toFixed(1) : 0}%)`}
                      arrow
                    >
                      <Box
                        sx={{
                          height: 100,
                          position: 'relative',
                          border: `2px solid ${seasonColors[season.name]}`,
                          borderRadius: 1,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          transition: 'transform 0.2s',
                          backgroundColor:
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        {/* Fill bar from bottom */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${totalSeasonalEpisodes > 0 ? (season.episodes / totalSeasonalEpisodes) * 100 : 0}%`,
                            backgroundColor: seasonColors[season.name],
                            transition: 'height 0.3s ease-in-out',
                          }}
                        />
                        {/* Content overlay */}
                        <Box
                          sx={{
                            position: 'relative',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            sx={{
                              color: season.episodes === 0 ? theme.palette.text.disabled : theme.palette.text.primary,
                            }}
                          >
                            {season.name}
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                              color: season.episodes === 0 ? theme.palette.text.disabled : theme.palette.text.primary,
                            }}
                          >
                            {season.episodes}
                          </Typography>
                        </Box>
                      </Box>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Monthly Heat Map */}
          {hasMonthlyData && (
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Episodes by Month
              </Typography>
              <Grid container spacing={0.5}>
                {monthlyData.map((month) => (
                  <Grid size={{ xs: 3, sm: 2, md: 1 }} key={month.name}>
                    <Tooltip
                      title={`${month.name}: ${month.episodes} episodes (${totalMonthlyEpisodes > 0 ? ((month.episodes / totalMonthlyEpisodes) * 100).toFixed(1) : 0}%)`}
                      arrow
                    >
                      <Box
                        sx={{
                          aspectRatio: '1',
                          position: 'relative',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 0.5,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          backgroundColor:
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            zIndex: 1,
                            boxShadow: theme.shadows[4],
                          },
                        }}
                      >
                        {/* Fill bar from bottom */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${totalMonthlyEpisodes > 0 ? (month.episodes / totalMonthlyEpisodes) * 100 : 0}%`,
                            backgroundColor: theme.palette.primary.main,
                            transition: 'height 0.3s ease-in-out',
                          }}
                        />
                        {/* Content overlay */}
                        <Box
                          sx={{
                            position: 'relative',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1,
                          }}
                        >
                          <Typography variant="caption" fontSize={10} fontWeight="bold">
                            {month.name}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {month.episodes}
                          </Typography>
                        </Box>
                      </Box>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {!hasSeasonalData && !hasMonthlyData && (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              No viewing data available
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
