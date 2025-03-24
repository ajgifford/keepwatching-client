import { Box, LinearProgress, Typography } from '@mui/material';

interface StatisticsProgressBarProps {
  value: number;
  current: number;
  total: number;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  height?: number;
}

const StatisticsProgressBar = ({
  value,
  current,
  total,
  label,
  color = 'primary',
  height = 10,
}: StatisticsProgressBarProps) => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        {label && <Typography variant="body2">{label}</Typography>}
        <Typography variant="body2" color="text.secondary">
          {current}/{total}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={value}
            color={color}
            sx={{ height: height, borderRadius: height / 2 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {Math.round(value)}%
        </Typography>
      </Box>
    </>
  );
};

export default StatisticsProgressBar;
