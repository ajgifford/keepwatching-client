import React from 'react';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';

import { SeasonalViewingStats } from '@ajgifford/keepwatching-types';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

  const monthlyData = monthOrder
    .filter((month) => stats.viewingByMonth[month] !== undefined)
    .map((month) => ({
      name: month.substring(0, 3), // Abbreviate month names
      episodes: stats.viewingByMonth[month],
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

  return (
    <Card>
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

          {/* Seasonal Bar Chart */}
          {hasSeasonalData && (
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Episodes by Season
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={seasonalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary }} />
                  <YAxis tick={{ fill: theme.palette.text.secondary }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <Bar dataKey="episodes" name="Episodes">
                    {seasonalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={seasonColors[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Monthly Bar Chart */}
          {hasMonthlyData && (
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Episodes by Month
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <YAxis tick={{ fill: theme.palette.text.secondary }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <Bar dataKey="episodes" name="Episodes" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
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
