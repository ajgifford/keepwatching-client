import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { Box, Card, CardContent, Chip, Divider, Grid, Typography, useTheme } from '@mui/material';

import { WatchStreakStats } from '@ajgifford/keepwatching-types';

interface WatchStreakCardProps {
  streakData?: WatchStreakStats | null;
  isLoading?: boolean;
}

const WatchStreakCard = ({ streakData, isLoading = false }: WatchStreakCardProps) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Watch Streaks
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            Loading...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!streakData || streakData.longestStreak === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Watch Streaks
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No streaks detected yet. Watch episodes on consecutive days to start building your streak!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const hasCurrentStreak = streakData.currentStreak > 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Watch Streaks</Typography>
          {hasCurrentStreak && (
            <Chip
              icon={<WhatshotIcon />}
              label={`${streakData.currentStreak} Day${streakData.currentStreak !== 1 ? 's' : ''}`}
              color="error"
              size="small"
            />
          )}
        </Box>

        <Grid container spacing={2}>
          {/* Current Streak */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                bgcolor: hasCurrentStreak ? theme.palette.error.main : theme.palette.action.hover,
                color: hasCurrentStreak ? theme.palette.error.contrastText : 'inherit',
                borderRadius: 1,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: hasCurrentStreak ? 700 : 400 }}>
                {streakData.currentStreak}
              </Typography>
              <Typography variant="body2" sx={{ opacity: hasCurrentStreak ? 1 : 0.7 }}>
                Current Streak
              </Typography>
              {hasCurrentStreak && streakData.currentStreakStartDate && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.9 }}>
                  Since {new Date(streakData.currentStreakStartDate).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Longest Streak */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <EmojiEventsIcon color="primary" />
                <Typography variant="h4" color="primary">
                  {streakData.longestStreak}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Longest Streak
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Longest Streak Details */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Longest Streak Period
              </Typography>
              <Typography variant="body2" color="text.primary">
                {new Date(streakData.longestStreakPeriod.startDate).toLocaleDateString()} -{' '}
                {new Date(streakData.longestStreakPeriod.endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({streakData.longestStreakPeriod.days} consecutive days)
              </Typography>
            </Box>
          </Grid>

          {/* Streak Stats */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Streak Statistics
              </Typography>
              <Typography variant="body2" color="text.primary">
                {streakData.streaksOver7Days} week+ streak{streakData.streaksOver7Days !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg: {streakData.averageStreakLength.toFixed(1)} days per streak
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WatchStreakCard;
