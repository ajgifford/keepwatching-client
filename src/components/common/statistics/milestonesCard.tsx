import { useMemo } from 'react';

import {
  LocalMovies as MovieIcon,
  AccessTime as TimeIcon,
  EmojiEvents as TrophyIcon,
  Tv as TvIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { MILESTONE_THRESHOLDS, Milestone, MilestoneStats } from '@ajgifford/keepwatching-types';

interface MilestonesCardProps {
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
      return <TimeIcon />;
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

export default function MilestonesCard({ stats, isLoading = false }: MilestonesCardProps) {
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
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.success.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
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
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
