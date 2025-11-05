import { useMemo } from 'react';

import {
  Cake as CakeIcon,
  CalendarToday as CalendarIcon,
  LocalMovies as MovieIcon,
  Celebration as PartyIcon,
  EmojiEvents as TrophyIcon,
  Tv as TvIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { MILESTONE_THRESHOLDS, Milestone, MilestoneStats } from '@ajgifford/keepwatching-types';

interface MilestonesAndAnniversaryCardProps {
  stats: MilestoneStats | null;
  isLoading?: boolean;
}

// Fallback thresholds in case import fails
const FALLBACK_THRESHOLDS = {
  episodes: [100, 500, 1000, 5000],
  movies: [25, 50, 100, 500],
  hours: [100, 500, 1000, 5000],
};

// Use imported thresholds or fallback
const THRESHOLDS = MILESTONE_THRESHOLDS || FALLBACK_THRESHOLDS;

function getMilestoneIcon(type: 'episodes' | 'movies' | 'hours') {
  switch (type) {
    case 'episodes':
      return <TvIcon />;
    case 'movies':
      return <MovieIcon />;
    case 'hours':
      return <CalendarIcon />;
  }
}

function getMilestoneLabel(type: 'episodes' | 'movies' | 'hours'): string {
  switch (type) {
    case 'episodes':
      return 'Episodes';
    case 'movies':
      return 'Movies';
    case 'hours':
      return 'Hours';
  }
}

function calculateMilestones(
  current: number,
  thresholds: number[]
): { milestones: Milestone[]; nextMilestone: Milestone | null } {
  const milestones: Milestone[] = [];
  let nextMilestone: Milestone | null = null;

  for (const threshold of thresholds) {
    const achieved = current >= threshold;
    const progress = Math.min((current / threshold) * 100, 100);

    const milestone: Milestone = {
      type: 'episodes', // Will be set by caller
      threshold,
      achieved,
      progress,
    };

    milestones.push(milestone);

    if (!achieved && !nextMilestone) {
      nextMilestone = milestone;
    }
  }

  return { milestones, nextMilestone };
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

function MilestoneProgressBar({ milestone }: { milestone: Milestone }) {
  const theme = useTheme();
  const label = getMilestoneLabel(milestone.type);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: milestone.achieved ? theme.palette.success.main : theme.palette.text.secondary }}>
            {getMilestoneIcon(milestone.type)}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {milestone.threshold.toLocaleString()} {label}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {milestone.achieved && <TrophyIcon sx={{ color: theme.palette.warning.main, fontSize: '1.2rem' }} />}
          <Typography variant="body2" fontWeight={milestone.achieved ? 600 : 400}>
            {milestone.progress.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={milestone.progress}
        sx={{
          height: 8,
          borderRadius: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          '& .MuiLinearProgress-bar': {
            backgroundColor: milestone.achieved ? theme.palette.success.main : theme.palette.primary.main,
            borderRadius: 1,
          },
        }}
      />
    </Box>
  );
}

export default function MilestonesAndAnniversaryCard({ stats, isLoading = false }: MilestonesAndAnniversaryCardProps) {
  const theme = useTheme();

  const milestoneData = useMemo(() => {
    if (!stats) return null;

    const episodeMilestones = calculateMilestones(stats.totalEpisodesWatched, THRESHOLDS.episodes);
    episodeMilestones.milestones.forEach((m) => (m.type = 'episodes'));
    if (episodeMilestones.nextMilestone) episodeMilestones.nextMilestone.type = 'episodes';

    const movieMilestones = calculateMilestones(stats.totalMoviesWatched, THRESHOLDS.movies);
    movieMilestones.milestones.forEach((m) => (m.type = 'movies'));
    if (movieMilestones.nextMilestone) movieMilestones.nextMilestone.type = 'movies';

    const hourMilestones = calculateMilestones(stats.totalHoursWatched, THRESHOLDS.hours);
    hourMilestones.milestones.forEach((m) => (m.type = 'hours'));
    if (hourMilestones.nextMilestone) hourMilestones.nextMilestone.type = 'hours';

    return {
      episodes: episodeMilestones,
      movies: movieMilestones,
      hours: hourMilestones,
    };
  }, [stats]);

  const memberSince = useMemo(() => {
    if (!stats?.createdAt) return null;
    const createdDate = new Date(stats.createdAt);
    const daysAgo = calculateDaysAgo(createdDate);
    return {
      date: createdDate,
      daysAgo,
      formatted: formatDuration(daysAgo),
    };
  }, [stats?.createdAt]);

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Milestones & Achievements
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <LinearProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!stats || !milestoneData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Milestones & Achievements
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No milestone data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const nextMilestones = [
    milestoneData.episodes.nextMilestone,
    milestoneData.movies.nextMilestone,
    milestoneData.hours.nextMilestone,
  ].filter((m): m is Milestone => m !== null);

  const totalAchieved = [
    ...milestoneData.episodes.milestones,
    ...milestoneData.movies.milestones,
    ...milestoneData.hours.milestones,
  ].filter((m) => m.achieved).length;

  const achievedMilestones = [
    ...milestoneData.episodes.milestones,
    ...milestoneData.movies.milestones,
    ...milestoneData.hours.milestones,
  ].filter((m) => m.achieved);

  const buildFirstEpisodeMetadata = (metadata: Record<string, unknown>) => {
    return `${metadata.showName} - S${metadata.seasonNumber}E${metadata.episodeNumber}: ${metadata.episodeName}`;
  };

  const buildProfileNameLine = (metadata: Record<string, unknown> | undefined) => {
    return metadata?.profileName ? (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {String(metadata.profileName)}
      </Typography>
    ) : (
      <></>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Milestones & Achievements</Typography>
          <Tooltip
            title={
              achievedMilestones.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Unlocked Achievements:
                  </Typography>
                  {achievedMilestones.map((milestone, index) => (
                    <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem' }}>
                      • {milestone.threshold.toLocaleString()} {getMilestoneLabel(milestone.type)}
                    </Typography>
                  ))}
                </Box>
              ) : (
                'No achievements unlocked yet'
              )
            }
            arrow
          >
            <Chip icon={<TrophyIcon />} label={`${totalAchieved} Unlocked`} color="primary" size="small" />
          </Tooltip>
        </Box>

        <Grid container spacing={2}>
          {/* Left Column - Milestones */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              {/* Current Progress Summary */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Progress
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Box>
                    <Typography variant="h6" color="primary">
                      {stats.totalEpisodesWatched.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Episodes
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="primary">
                      {stats.totalMoviesWatched.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Movies
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="primary">
                      {stats.totalHoursWatched.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hours
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Next Milestones */}
              {nextMilestones.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Next Milestones
                  </Typography>
                  {nextMilestones.map((milestone, index) => (
                    <MilestoneProgressBar key={index} milestone={milestone} />
                  ))}
                </Box>
              )}

              {/* Recent Achievements */}
              {stats.recentAchievements && stats.recentAchievements.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Recent Achievements
                  </Typography>
                  <Stack spacing={1}>
                    {stats.recentAchievements.map((achievement, index) => (
                      <Tooltip
                        key={index}
                        title={
                          achievement.metadata ? (
                            <Box>
                              {achievement.profileName && (
                                <Typography variant="body2">{achievement.profileName}</Typography>
                              )}
                              {achievement.metadata.showName && (
                                <>
                                  <Typography variant="body2">{achievement.metadata.showName}</Typography>
                                  <Typography variant="body2">
                                    S{achievement.metadata.seasonNumber}E{achievement.metadata.episodeNumber}:{' '}
                                    {achievement.metadata.episodeName}
                                  </Typography>
                                </>
                              )}
                              {achievement.metadata.movieName && (
                                <Typography variant="body2">Movie: {achievement.metadata.movieName}</Typography>
                              )}
                              {achievement.metadata.streakDays && (
                                <Typography variant="body2">Streak: {achievement.metadata.streakDays} days</Typography>
                              )}
                              {achievement.metadata.episodeCount && (
                                <Typography variant="body2">Episodes: {achievement.metadata.episodeCount}</Typography>
                              )}
                            </Box>
                          ) : null
                        }
                        arrow
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: alpha(theme.palette.success.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            cursor: achievement.metadata ? 'pointer' : 'default',
                          }}
                        >
                          <TrophyIcon sx={{ color: theme.palette.warning.main, fontSize: '1.2rem' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {achievement.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(achievement.achievedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Tooltip>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Anniversary & Firsts */}
          <Grid size={{ xs: 12, md: 6 }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CakeIcon sx={{ color: theme.palette.primary.main, fontSize: '1.2rem' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Member Since
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary" gutterBottom>
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

              {/* First Episode */}
              {stats.firstEpisodeWatchedAt && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PartyIcon sx={{ color: theme.palette.success.main, fontSize: '1.2rem' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      First Episode Watched
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {stats.firstEpisodeMetadata
                      ? buildFirstEpisodeMetadata(stats.firstEpisodeMetadata)
                      : 'Unknown Show'}
                  </Typography>
                  {buildProfileNameLine(stats.firstEpisodeMetadata)}
                  <Typography variant="caption" color="text.secondary">
                    {new Date(stats.firstEpisodeWatchedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    • {formatDuration(calculateDaysAgo(new Date(stats.firstEpisodeWatchedAt)))} ago
                  </Typography>
                </Box>
              )}

              {/* First Movie */}
              {stats.firstMovieWatchedAt && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MovieIcon sx={{ color: theme.palette.info.main, fontSize: '1.2rem' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      First Movie Watched
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {stats.firstMovieMetadata ? String(stats.firstMovieMetadata.movieName) : 'Unknown Movie'}
                  </Typography>
                  {buildProfileNameLine(stats.firstEpisodeMetadata)}
                  <Typography variant="caption" color="text.secondary">
                    {new Date(stats.firstMovieWatchedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    • {formatDuration(calculateDaysAgo(new Date(stats.firstMovieWatchedAt)))} ago
                  </Typography>
                </Box>
              )}

              {/* Average Viewing Rate */}
              {memberSince &&
                memberSince.daysAgo > 0 &&
                (stats.totalEpisodesWatched > 0 || stats.totalMoviesWatched > 0) && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Average Viewing Rate
                    </Typography>
                    <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                      {stats.totalEpisodesWatched > 0 && (
                        <Box>
                          <Typography variant="h6" color="secondary.main">
                            {(stats.totalEpisodesWatched / memberSince.daysAgo).toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Episodes/Day
                          </Typography>
                        </Box>
                      )}
                      {stats.totalMoviesWatched > 0 && (
                        <Box>
                          <Typography variant="h6" color="secondary.main">
                            {(stats.totalMoviesWatched / (memberSince.daysAgo / 30)).toFixed(1)}
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
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
