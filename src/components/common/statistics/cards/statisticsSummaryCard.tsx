import { Box, Grid, Paper, Typography } from '@mui/material';

import StatisticsProgressBar from '../elements/statisticsProgressBar';

interface StatItem {
  value: number;
  label: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

interface StatisticsSummaryCardProps {
  progressLabel?: string;
  progressValue: number;
  currentCount: number;
  totalCount: number;
  stats: StatItem[];
}

const StatisticsSummaryCard = ({
  progressLabel = 'Overall Progress',
  progressValue,
  currentCount,
  totalCount,
  stats,
}: StatisticsSummaryCardProps) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>
            {progressLabel}
          </Typography>
          <StatisticsProgressBar
            value={progressValue}
            current={currentCount}
            total={totalCount}
            color="success"
            height={10}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            {stats.map((stat, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color={stat.color || 'primary'}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StatisticsSummaryCard;
