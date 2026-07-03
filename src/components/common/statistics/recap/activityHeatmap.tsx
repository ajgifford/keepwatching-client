import { Box, Typography, alpha, useTheme } from '@mui/material';

import { RecapActivityBucket, RecapPeriodType } from '@ajgifford/keepwatching-types';

const MONTH_ABBREVIATIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function intensityOpacity(value: number, max: number): number {
  if (value === 0 || max === 0) {
    return 0.14;
  }
  const ratio = value / max;
  if (ratio >= 0.66) return 0.95;
  if (ratio >= 0.33) return 0.55;
  return 0.3;
}

interface ActivityHeatmapProps {
  activityBreakdown: RecapActivityBucket[];
  period: RecapPeriodType;
  periodLabel: string;
}

export function ActivityHeatmap({ activityBreakdown, period, periodLabel }: ActivityHeatmapProps) {
  const theme = useTheme();

  if (activityBreakdown.length === 0 || activityBreakdown.every((b) => b.episodesWatched === 0)) {
    return null;
  }

  const max = Math.max(...activityBreakdown.map((b) => b.episodesWatched));
  const columns = period === 'month' ? 7 : 6;

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ opacity: 0.75, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.75 }}
      >
        {periodLabel} activity
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 0.5 }}>
        {activityBreakdown.map((bucket) => {
          const label =
            period === 'month'
              ? `Day ${bucket.period}: ${bucket.episodesWatched} episode${bucket.episodesWatched === 1 ? '' : 's'}`
              : `${MONTH_ABBREVIATIONS[bucket.period - 1]}: ${bucket.episodesWatched} episode${bucket.episodesWatched === 1 ? '' : 's'}`;
          return (
            <Box
              key={bucket.period}
              title={label}
              aria-label={label}
              sx={{
                aspectRatio: '1',
                borderRadius: 0.75,
                backgroundColor: alpha(theme.palette.common.white, intensityOpacity(bucket.episodesWatched, max)),
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
