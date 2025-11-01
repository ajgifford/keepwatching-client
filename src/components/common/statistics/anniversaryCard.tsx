import { useMemo } from 'react';

import { Cake as CakeIcon, CalendarToday as CalendarIcon, Celebration as PartyIcon } from '@mui/icons-material';
import { Box, Card, CardContent, Stack, Typography, alpha, useTheme } from '@mui/material';

interface AnniversaryCardProps {
  profileCreatedAt?: string;
  firstEpisodeWatchedAt?: string;
  firstMovieWatchedAt?: string;
  totalEpisodesWatched: number;
  totalMoviesWatched: number;
}

interface AnniversaryEvent {
  label: string;
  date: Date;
  daysAgo: number;
  icon: React.ReactNode;
  color: string;
}

function calculateDaysAgo(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDuration(days: number): string {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (remainingDays > 0 || parts.length === 0) {
    parts.push(`${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`);
  }

  return parts.join(', ');
}

export default function AnniversaryCard({
  profileCreatedAt,
  firstEpisodeWatchedAt,
  firstMovieWatchedAt,
  totalEpisodesWatched,
  totalMoviesWatched,
}: AnniversaryCardProps) {
  const theme = useTheme();

  const anniversaryEvents = useMemo((): AnniversaryEvent[] => {
    const events: AnniversaryEvent[] = [];

    if (profileCreatedAt) {
      const createdDate = new Date(profileCreatedAt);
      events.push({
        label: 'Profile Created',
        date: createdDate,
        daysAgo: calculateDaysAgo(createdDate),
        icon: <CakeIcon />,
        color: theme.palette.primary.main,
      });
    }

    if (firstEpisodeWatchedAt) {
      const firstEpisodeDate = new Date(firstEpisodeWatchedAt);
      events.push({
        label: 'First Episode',
        date: firstEpisodeDate,
        daysAgo: calculateDaysAgo(firstEpisodeDate),
        icon: <PartyIcon />,
        color: theme.palette.success.main,
      });
    }

    if (firstMovieWatchedAt) {
      const firstMovieDate = new Date(firstMovieWatchedAt);
      events.push({
        label: 'First Movie',
        date: firstMovieDate,
        daysAgo: calculateDaysAgo(firstMovieDate),
        icon: <PartyIcon />,
        color: theme.palette.info.main,
      });
    }

    return events.sort((a, b) => b.daysAgo - a.daysAgo);
  }, [profileCreatedAt, firstEpisodeWatchedAt, firstMovieWatchedAt, theme]);

  const memberSince = useMemo(() => {
    if (!profileCreatedAt) return null;
    const createdDate = new Date(profileCreatedAt);
    const daysAgo = calculateDaysAgo(createdDate);
    return {
      date: createdDate,
      daysAgo,
      formatted: formatDuration(daysAgo),
    };
  }, [profileCreatedAt]);

  if (!profileCreatedAt && !firstEpisodeWatchedAt && !firstMovieWatchedAt) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Milestones & Anniversary
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No anniversary data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarIcon color="primary" />
          <Typography variant="h6">Milestones & Anniversary</Typography>
        </Box>

        <Stack spacing={2}>
          {/* Member Since */}
          {memberSince && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Member Since
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {memberSince.date.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {memberSince.formatted} ago
              </Typography>
            </Box>
          )}

          {/* Watching Stats */}
          {(totalEpisodesWatched > 0 || totalMoviesWatched > 0) && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Watching Journey
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                {totalEpisodesWatched > 0 && (
                  <Box>
                    <Typography variant="h5" color="success.main">
                      {totalEpisodesWatched.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Episodes
                    </Typography>
                  </Box>
                )}
                {totalMoviesWatched > 0 && (
                  <Box>
                    <Typography variant="h5" color="success.main">
                      {totalMoviesWatched.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Movies
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Anniversary Events */}
          {anniversaryEvents.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Key Milestones
              </Typography>
              <Stack spacing={1}>
                {anniversaryEvents.map((event, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: alpha(event.color, 0.05),
                      border: `1px solid ${alpha(event.color, 0.2)}`,
                    }}
                  >
                    <Box sx={{ color: event.color, display: 'flex', alignItems: 'center' }}>{event.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {event.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDuration(event.daysAgo)} ago
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Average Rate */}
          {memberSince && memberSince.daysAgo > 0 && (totalEpisodesWatched > 0 || totalMoviesWatched > 0) && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Average Viewing Rate
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                {totalEpisodesWatched > 0 && (
                  <Box>
                    <Typography variant="h6" color="info.main">
                      {(totalEpisodesWatched / memberSince.daysAgo).toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Episodes/Day
                    </Typography>
                  </Box>
                )}
                {totalMoviesWatched > 0 && (
                  <Box>
                    <Typography variant="h6" color="info.main">
                      {(totalMoviesWatched / (memberSince.daysAgo / 30)).toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Movies/Month
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
